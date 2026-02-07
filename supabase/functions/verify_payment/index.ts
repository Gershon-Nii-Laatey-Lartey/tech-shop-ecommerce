import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeliveryMethod {
    id: string;
    price: number;
}

const DELIVERY_METHODS: Record<string, number> = {
    'same-day': 50,
    'express': 30,
    'normal': 15
};

serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // Verify User from Token
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization Header')
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

        if (userError || !user) {
            console.error('Auth Error:', userError)
            throw new Error('Unauthorized: Invalid Token')
        }

        // Get Request Body
        const { reference, deliveryMethodId, addressId, discountCode } = await req.json()

        if (!reference || !deliveryMethodId || !addressId) {
            throw new Error('Missing required fields: reference, deliveryMethodId, or addressId')
        }

        // 1. Verify Transaction with Paystack
        const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY')
        if (!paystackSecret) throw new Error('Server misconfigured: missing Paystack keys')

        console.log(`Verifying reference: ${reference}`)

        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${paystackSecret}` }
        })
        const verifyData = await verifyRes.json()

        if (!verifyData.status || verifyData.data.status !== 'success') {
            console.error('Paystack Verify Failed:', verifyData)
            throw new Error('Paystack verification failed: Transaction not successful')
        }

        const paidAmountGHS = verifyData.data.amount / 100 // Convert pesewas to GHS
        const paystackRef = verifyData.data.reference

        // 1.5. Handle Discount Usage
        if (discountCode) {
            console.log(`Processing discount code: ${discountCode}`)
            const { data: discount, error: discError } = await supabaseClient
                .from('discounts')
                .select('*')
                .eq('code', discountCode.toUpperCase())
                .eq('is_active', true)
                .single()

            if (!discError && discount) {
                // Validate if it's still usable
                const isExpired = discount.expires_at && new Date(discount.expires_at) < new Date()
                const isLimitReached = discount.max_uses && discount.used_count >= discount.max_uses

                if (!isExpired && !isLimitReached) {
                    // Increment usage
                    await supabaseClient
                        .from('discounts')
                        .update({ used_count: discount.used_count + 1 })
                        .eq('id', discount.id)
                    console.log(`Discount ${discountCode} usage incremented`)
                } else {
                    console.warn(`Discount ${discountCode} found but invalid: Expired=${isExpired}, LimitReached=${isLimitReached}`)
                }
            } else {
                console.error(`Error fetching discount ${discountCode}:`, discError)
            }
        }

        // 2. Log Transaction
        const { data: transaction, error: trxError } = await supabaseClient
            .from('payment_transactions')
            .insert({
                user_id: user.id,
                amount: paidAmountGHS,
                reference: paystackRef,
                status: 'success',
                provider: 'paystack',
                provider_response: verifyData.data
            })
            .select()
            .single()

        if (trxError) {
            console.error('Error logging transaction:', trxError)
            // Proceeding but warning: Order will not have transaction ID if this fails.
        }

        // 3. Create Order logic...
        // Fetch cart
        const { data: cartItems, error: cartError } = await supabaseClient
            .from('cart_items')
            .select(`
                *,
                products(price, name, image),
                product_variants(name, value, price_modifier)
            `)
            .eq('user_id', user.id)

        if (cartError || !cartItems || cartItems.length === 0) {
            console.error('Cart empty for user:', user.id)
        }

        // 4. Create Order
        let addressString = 'Address not found'
        if (addressId) {
            const { data: addressData } = await supabaseClient
                .from('shipping_addresses')
                .select('*')
                .eq('id', addressId)
                .single()
            if (addressData) {
                addressString = `${addressData.address_line}, ${addressData.city}`
            }
        }

        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .insert({
                user_id: user.id,
                total_amount: paidAmountGHS,
                status: 'paid', // Verified!
                shipping_address_id: addressId,
                payment_method: 'Paystack',
                shipping_address: addressString,
                order_number: `ORD-${Date.now()}`,
                items_count: cartItems ? cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0) : 0,
                payment_transaction_id: transaction?.id, // LINKING THE TRANSACTION HERE
                discount_code: discountCode // STORE THE CODE USED
            })
            .select()
            .single()

        if (orderError) throw orderError

        // 5. Create Order Items
        if (cartItems && cartItems.length > 0) {
            const orderItemsData = cartItems.map((item: any) => {
                const basePrice = parseFloat(item.products.price);
                const modifier = item.product_variants ? parseFloat(item.product_variants.price_modifier) : 0;
                const totalItemPrice = basePrice + modifier;

                return {
                    order_id: order.id,
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    variant_name: item.product_variants ? `${item.product_variants.name}: ${item.product_variants.value}` : null,
                    product_name: item.products.name,
                    quantity: item.quantity,
                    price: totalItemPrice
                };
            })

            const { error: itemsError } = await supabaseClient
                .from('order_items')
                .insert(orderItemsData)

            if (itemsError) throw itemsError

            // 6. Clear Cart
            await supabaseClient
                .from('cart_items')
                .delete()
                .eq('user_id', user.id)
        }

        return new Response(
            JSON.stringify({ success: true, orderId: order.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('Function Error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
