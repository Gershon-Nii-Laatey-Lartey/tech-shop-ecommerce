import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CreditCard, Truck, Shield, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

interface ShippingAddress {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

const Checkout = () => {
    const navigate = useNavigate();
    const { items, total, clearCart } = useCart();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
    });

    const [paymentMethod, setPaymentMethod] = useState('card');

    const shipping = total > 500 ? 0 : 25;
    const tax = total * 0.08;
    const grandTotal = total + shipping + tax;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setShippingAddress(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmitOrder = async () => {
        if (!user) {
            navigate('/auth');
            return;
        }

        setLoading(true);

        try {
            // Create order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    status: 'pending',
                    total: grandTotal,
                    subtotal: total,
                    shipping_cost: shipping,
                    tax: tax,
                    shipping_address: shippingAddress,
                    payment_method: paymentMethod,
                    payment_status: 'paid' // Simulating payment success
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Create order items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                variant_id: item.variant_id || null,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
                product_name: item.name,
                product_image: item.image
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Clear cart in database
            await supabase.from('cart_items').delete().eq('user_id', user.id);
            clearCart();

            setOrderId(order.id);
            setOrderComplete(true);
        } catch (error) {
            console.error('Error creating order:', error);
            alert('There was an error processing your order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (orderComplete && orderId) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', maxWidth: '500px' }}
                >
                    <div style={{
                        width: '100px',
                        height: '100px',
                        background: '#10b981',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 32px'
                    }}>
                        <Check size={50} color="white" />
                    </div>
                    <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '16px' }}>Order Confirmed!</h1>
                    <p style={{ color: '#666', fontSize: '16px', marginBottom: '24px' }}>
                        Thank you for your purchase. Your order has been placed successfully.
                    </p>
                    <p style={{ fontSize: '14px', color: '#888', marginBottom: '32px' }}>
                        Order ID: <strong style={{ color: '#333' }}>{orderId.slice(0, 8).toUpperCase()}</strong>
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <Link
                            to={`/orders/${orderId}`}
                            style={{
                                padding: '16px 32px',
                                background: 'black',
                                color: 'white',
                                borderRadius: '14px',
                                fontWeight: 800,
                                textDecoration: 'none'
                            }}
                        >
                            Track Order
                        </Link>
                        <Link
                            to="/products"
                            style={{
                                padding: '16px 32px',
                                background: '#f5f5f7',
                                color: '#333',
                                borderRadius: '14px',
                                fontWeight: 800,
                                textDecoration: 'none'
                            }}
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px' }}>Your cart is empty</h1>
                    <Link to="/products" style={{ color: 'var(--primary-color)', fontWeight: 700 }}>Browse Products</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#fafafa', padding: '40px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontWeight: 700, fontSize: '13px', textDecoration: 'none', marginBottom: '16px' }}>
                        <ChevronLeft size={16} /> Back to Cart
                    </Link>
                    <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.03em' }}>Checkout</h1>
                </div>

                {/* Progress Steps */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '48px' }}>
                    {['Shipping', 'Payment', 'Review'].map((label, idx) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: step > idx ? '#10b981' : step === idx + 1 ? 'black' : '#e5e5e5',
                                color: step >= idx + 1 ? 'white' : '#888',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '13px'
                            }}>
                                {step > idx ? <Check size={16} /> : idx + 1}
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '14px', color: step === idx + 1 ? 'black' : '#888' }}>{label}</span>
                            {idx < 2 && <div style={{ width: '60px', height: '2px', background: step > idx + 1 ? '#10b981' : '#e5e5e5' }} />}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '48px' }}>
                    {/* Main Content */}
                    <div>
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                                        <Truck size={24} />
                                        <h2 style={{ fontSize: '20px', fontWeight: 900 }}>Shipping Information</h2>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={shippingAddress.firstName}
                                                onChange={handleInputChange}
                                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600 }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={shippingAddress.lastName}
                                                onChange={handleInputChange}
                                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600 }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={shippingAddress.email}
                                                onChange={handleInputChange}
                                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600 }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={shippingAddress.phone}
                                                onChange={handleInputChange}
                                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600 }}
                                            />
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Address</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={shippingAddress.address}
                                                onChange={handleInputChange}
                                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600 }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={shippingAddress.city}
                                                onChange={handleInputChange}
                                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600 }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>State</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={shippingAddress.state}
                                                onChange={handleInputChange}
                                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600 }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>ZIP Code</label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={shippingAddress.zipCode}
                                                onChange={handleInputChange}
                                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600 }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Country</label>
                                            <select
                                                name="country"
                                                value={shippingAddress.country}
                                                onChange={handleInputChange}
                                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600, background: 'white' }}
                                            >
                                                <option>United States</option>
                                                <option>Canada</option>
                                                <option>United Kingdom</option>
                                                <option>Germany</option>
                                                <option>France</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        style={{
                                            marginTop: '32px',
                                            width: '100%',
                                            padding: '18px',
                                            background: 'black',
                                            color: 'white',
                                            borderRadius: '14px',
                                            fontWeight: 800,
                                            fontSize: '15px',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Continue to Payment
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                                        <CreditCard size={24} />
                                        <h2 style={{ fontSize: '20px', fontWeight: 900 }}>Payment Method</h2>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {[
                                            { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
                                            { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                                            { id: 'apple', label: 'Apple Pay', icon: '🍎' }
                                        ].map(method => (
                                            <div
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id)}
                                                style={{
                                                    padding: '20px',
                                                    borderRadius: '16px',
                                                    border: paymentMethod === method.id ? '2px solid black' : '1px solid #eee',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '16px',
                                                    cursor: 'pointer',
                                                    background: paymentMethod === method.id ? '#f9f9fb' : 'white'
                                                }}
                                            >
                                                <span style={{ fontSize: '24px' }}>{method.icon}</span>
                                                <span style={{ fontWeight: 700, fontSize: '15px' }}>{method.label}</span>
                                                {paymentMethod === method.id && (
                                                    <div style={{ marginLeft: 'auto', width: '24px', height: '24px', background: 'black', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Check size={14} color="white" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {paymentMethod === 'card' && (
                                        <div style={{ marginTop: '32px', display: 'grid', gap: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Card Number</label>
                                                <input
                                                    type="text"
                                                    placeholder="1234 5678 9012 3456"
                                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600 }}
                                                />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Expiry Date</label>
                                                    <input
                                                        type="text"
                                                        placeholder="MM/YY"
                                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600 }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>CVC</label>
                                                    <input
                                                        type="text"
                                                        placeholder="123"
                                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                                        <button
                                            onClick={() => setStep(1)}
                                            style={{
                                                flex: 1,
                                                padding: '18px',
                                                background: '#f5f5f7',
                                                color: '#333',
                                                borderRadius: '14px',
                                                fontWeight: 800,
                                                fontSize: '15px',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => setStep(3)}
                                            style={{
                                                flex: 2,
                                                padding: '18px',
                                                background: 'black',
                                                color: 'white',
                                                borderRadius: '14px',
                                                fontWeight: 800,
                                                fontSize: '15px',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Review Order
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                                        <Shield size={24} />
                                        <h2 style={{ fontSize: '20px', fontWeight: 900 }}>Review Your Order</h2>
                                    </div>

                                    {/* Shipping Summary */}
                                    <div style={{ padding: '20px', background: '#f9f9fb', borderRadius: '16px', marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '14px' }}>Shipping Address</span>
                                            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Edit</button>
                                        </div>
                                        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
                                            {shippingAddress.firstName} {shippingAddress.lastName}<br />
                                            {shippingAddress.address}<br />
                                            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                                            {shippingAddress.country}
                                        </p>
                                    </div>

                                    {/* Payment Summary */}
                                    <div style={{ padding: '20px', background: '#f9f9fb', borderRadius: '16px', marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '14px' }}>Payment Method</span>
                                            <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Edit</button>
                                        </div>
                                        <p style={{ fontSize: '14px', color: '#666' }}>
                                            {paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'paypal' ? 'PayPal' : 'Apple Pay'}
                                        </p>
                                    </div>

                                    {/* Order Items */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontWeight: 800, fontSize: '14px', marginBottom: '16px' }}>Order Items ({items.length})</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {items.map(item => (
                                                <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                    <div style={{ width: '60px', height: '60px', background: '#f5f5f7', borderRadius: '12px', padding: '8px' }}>
                                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontWeight: 700, fontSize: '14px' }}>{item.name}</p>
                                                        <p style={{ color: '#888', fontSize: '13px' }}>Qty: {item.quantity}</p>
                                                    </div>
                                                    <p style={{ fontWeight: 800 }}>${(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <button
                                            onClick={() => setStep(2)}
                                            style={{
                                                flex: 1,
                                                padding: '18px',
                                                background: '#f5f5f7',
                                                color: '#333',
                                                borderRadius: '14px',
                                                fontWeight: 800,
                                                fontSize: '15px',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleSubmitOrder}
                                            disabled={loading}
                                            style={{
                                                flex: 2,
                                                padding: '18px',
                                                background: loading ? '#ccc' : '#10b981',
                                                color: 'white',
                                                borderRadius: '14px',
                                                fontWeight: 800,
                                                fontSize: '15px',
                                                border: 'none',
                                                cursor: loading ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {loading ? 'Processing...' : `Place Order • $${grandTotal.toFixed(2)}`}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div style={{ position: 'sticky', top: '40px' }}>
                        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #eee' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '24px' }}>Order Summary</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                                {items.slice(0, 3).map(item => (
                                    <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ width: '48px', height: '48px', background: '#f5f5f7', borderRadius: '10px', padding: '6px', position: 'relative' }}>
                                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', background: 'black', color: 'white', borderRadius: '50%', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {item.quantity}
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                                        </div>
                                        <p style={{ fontSize: '13px', fontWeight: 800 }}>${(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                                {items.length > 3 && (
                                    <p style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>+{items.length - 3} more items</p>
                                )}
                            </div>

                            <div style={{ borderTop: '1px solid #eee', paddingTop: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                                    <span style={{ color: '#888' }}>Subtotal</span>
                                    <span style={{ fontWeight: 700 }}>${total.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                                    <span style={{ color: '#888' }}>Shipping</span>
                                    <span style={{ fontWeight: 700 }}>{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '14px' }}>
                                    <span style={{ color: '#888' }}>Tax (8%)</span>
                                    <span style={{ fontWeight: 700 }}>${tax.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                                    <span style={{ fontWeight: 800, fontSize: '16px' }}>Total</span>
                                    <span style={{ fontWeight: 900, fontSize: '24px' }}>${grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;