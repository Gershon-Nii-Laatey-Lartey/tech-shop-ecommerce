import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Truck,
    Clock,
    Zap,
    CheckCircle2,
    ShieldCheck,
    ArrowRight,
    MapPin,
    Plus,
    X,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';

interface Address {
    id: string;
    full_name: string;
    phone: string;
    address_line: string;
    city: string;
    is_default: boolean;
    zone_id?: string;
    sub_zone_id?: string;
    area_id?: string;
}

const DELIVERY_METHODS = [
    { id: 'normal', label: 'Normal', price: 0, icon: <Clock size={18} />, desc: '3-5 business days' },
    { id: 'express', label: 'Express', price: 10, icon: <Truck size={18} />, desc: '1-2 business days' },
    { id: 'same-day', label: 'Same-day', price: 15, icon: <Zap size={18} />, desc: 'Delivery today' },
];

const Checkout = () => {
    const { selectedItems: items, total, clearCart } = useCart();
    const { user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fulfillmentStatus, setFulfillmentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [deliveryMethod, setDeliveryMethod] = useState('normal');
    const [isAddingNew, setIsAddingNew] = useState(false);

    // Discount State
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountError, setDiscountError] = useState('');

    const [newAddress, setNewAddress] = useState({
        full_name: profile?.full_name || '',
        phone: '',
        address_line: '',
        city: '',
        is_default: false,
        zone_id: null as string | null,
        sub_zone_id: null as string | null,
        area_id: null as string | null
    });

    const [logisticsSettings, setLogisticsSettings] = useState<any>(null);
    const [zones, setZones] = useState<any[]>([]);
    const [subZones, setSubZones] = useState<any[]>([]);
    const [areas, setAreas] = useState<any[]>([]);
    const [fetchingLogistics, setFetchingLogistics] = useState(false);
    const [customDeliveryFee, setCustomDeliveryFee] = useState<number | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate('/auth?redirect=checkout');
            return;
        }
        fetchAddresses();
        fetchLogisticsConfig();
    }, [user, navigate, authLoading]);

    const fetchLogisticsConfig = async () => {
        const { data } = await supabase
            .from('admin_settings')
            .select('*')
            .eq('key', 'logistics_config')
            .single();
        if (data) setLogisticsSettings(data.value);

        // Fetch root zones
        const { data: rootZones } = await supabase
            .from('logistics_zones')
            .select('*')
            .is('parent_id', null);
        if (rootZones) setZones(rootZones);
    };

    const fetchSubZones = async (parentId: string) => {
        const { data } = await supabase
            .from('logistics_zones')
            .select('*')
            .eq('parent_id', parentId);
        return data || [];
    };

    const handleZoneChange = async (zoneId: string) => {
        setNewAddress({ ...newAddress, zone_id: zoneId, sub_zone_id: null, area_id: null });
        const data = await fetchSubZones(zoneId);
        setSubZones(data);
        setAreas([]);
    };

    const handleSubZoneChange = async (subZoneId: string) => {
        setNewAddress({ ...newAddress, sub_zone_id: subZoneId, area_id: null });
        const data = await fetchSubZones(subZoneId);
        setAreas(data);
    };

    const handleAreaChange = (areaId: string, areaName: string) => {
        setNewAddress({ ...newAddress, area_id: areaId, city: areaName });
    };

    const calculateDynamicFee = async (address: any) => {
        if (!logisticsSettings?.is_enabled || !logisticsSettings?.api_endpoint) {
            setCustomDeliveryFee(null);
            return;
        }

        setFetchingLogistics(true);
        try {
            let zName = address.zone_name;
            let szName = address.sub_zone_name;
            let aName = address.area_name;

            // If names aren't in the object, fetch them by ID
            if (!zName || !szName || !aName) {
                const { data: zoneData } = await supabase
                    .from('logistics_zones')
                    .select('id, name')
                    .in('id', [address.zone_id, address.sub_zone_id, address.area_id]);

                if (zoneData) {
                    zName = zoneData.find(z => z.id === address.zone_id)?.name;
                    szName = zoneData.find(z => z.id === address.sub_zone_id)?.name;
                    aName = zoneData.find(z => z.id === address.area_id)?.name;
                }
            }

            const response = await fetch(logisticsSettings.api_endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location: { zone: zName, sub_zone: szName, area: aName },
                    cart_total: total,
                    items_weight: items.reduce((acc, item) => acc + (item.weight || 0) * item.quantity, 0)
                })
            });
            const data = await response.json();
            if (data.delivery_fee !== undefined) {
                setCustomDeliveryFee(data.delivery_fee);
            }
        } catch (err) {
            console.error('Error fetching delivery fee:', err);
            setCustomDeliveryFee(null);
        } finally {
            setFetchingLogistics(false);
        }
    };

    // Auto-calculate fee when selected address changes
    useEffect(() => {
        if (selectedAddress && logisticsSettings) {
            calculateDynamicFee(selectedAddress);
        }
    }, [selectedAddress, logisticsSettings]);

    const fetchAddresses = async () => {
        const { data, error } = await supabase
            .from('shipping_addresses')
            .select('*')
            .order('is_default', { ascending: false });

        if (!error && data) {
            setAddresses(data);
            if (data.length > 0) setSelectedAddress(data[0]);
        }
    };

    const toggleDefaultAddress = async (addressId: string) => {
        try {
            // Unset all as default for this user
            await supabase
                .from('shipping_addresses')
                .update({ is_default: false })
                .eq('user_id', user?.id);

            // Set the target as default
            const { error } = await supabase
                .from('shipping_addresses')
                .update({ is_default: true })
                .eq('id', addressId);

            if (!error) {
                fetchAddresses();
            }
        } catch (err) {
            console.error('Error toggling default address:', err);
        }
    };

    const handleAddAddress = async () => {
        if (!newAddress.address_line || !newAddress.phone || !newAddress.city || !newAddress.zone_id) {
            alert('Please fill in all address details and select a location');
            return;
        }

        setLoading(true);
        try {
            // If new address is default, unset others first
            if (newAddress.is_default) {
                await supabase
                    .from('shipping_addresses')
                    .update({ is_default: false })
                    .eq('user_id', user?.id);
            }

            const { data, error } = await supabase
                .from('shipping_addresses')
                .insert([{ ...newAddress, user_id: user?.id }])
                .select()
                .single();

            if (!error && data) {
                setAddresses([data, ...addresses.map(a => newAddress.is_default ? { ...a, is_default: false } : a)]);
                setSelectedAddress(data);
                setIsAddingNew(false);
                setNewAddress({
                    full_name: profile?.full_name || '',
                    phone: '',
                    address_line: '',
                    city: '',
                    is_default: false,
                    zone_id: null,
                    sub_zone_id: null,
                    area_id: null
                });
            }
        } catch (err) {
            console.error('Error adding address:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;
        setDiscountLoading(true);
        setDiscountError('');
        try {
            const { data, error } = await supabase
                .from('discounts')
                .select('*')
                .eq('code', discountCode.toUpperCase())
                .eq('is_active', true)
                .single();

            if (error || !data) throw new Error('Invalid code');

            // Validate limits
            if (data.max_uses && data.used_count >= data.max_uses) throw new Error('Usage limit reached');
            if (data.expires_at && new Date(data.expires_at) < new Date()) throw new Error('Code expired');

            setAppliedDiscount(data);
        } catch (err: any) {
            setDiscountError(err.message || 'Invalid code');
            setAppliedDiscount(null);
        } finally {
            setDiscountLoading(false);
        }
    };

    const baseLogisticsFee = customDeliveryFee !== null ? customDeliveryFee : 0;
    const speedPremium = DELIVERY_METHODS.find(m => m.id === deliveryMethod)?.price || 0;
    const deliveryPrice = baseLogisticsFee + speedPremium;

    // Calculate totals
    const subtotal = total;
    let discountAmount = 0;
    if (appliedDiscount) {
        if (appliedDiscount.type === 'percentage') {
            discountAmount = subtotal * (appliedDiscount.value / 100);
        } else {
            discountAmount = appliedDiscount.value;
        }
    }
    const grandTotal = Math.max(0, subtotal + deliveryPrice - discountAmount);

    // DIRECT PAYSTACK IMPLEMENTATION using window.PaystackPop
    const payWithPaystack = () => {
        const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

        if (!publicKey) {
            alert('Payment configuration error: Missing Public Key');
            return;
        }

        setLoading(true);

        // @ts-ignore
        if (!window.PaystackPop) {
            alert('Payment provider failed to load. Please refresh and try again.');
            setLoading(false);
            return;
        }

        const Reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

        // @ts-ignore
        const handler = window.PaystackPop.setup({
            key: publicKey,
            email: user?.email || 'customer@example.com',
            amount: Math.round((grandTotal) * 100), // in pesewas
            currency: 'GHS',
            ref: Reference,
            metadata: {
                custom_fields: [
                    { display_name: "Delivery Method", variable_name: "delivery_method", value: deliveryMethod }
                ]
            },
            onClose: function () {
                console.log('Payment window closed');
                setLoading(false);
            },
            callback: function (response: any) {
                console.log('Payment complete! Reference:', response.reference);
                handlePaymentSuccess(response);
            }
        });

        handler.openIframe();
    };


    const handlePaymentSuccess = async (response: any) => {
        setLoading(true);
        setFulfillmentStatus('processing');

        try {
            console.log('Verifying payment on server with reference:', response.reference);

            // Server-side verification
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) throw new Error('User session not found');

            const { data, error } = await supabase.functions.invoke('verify_payment', {
                body: {
                    reference: response.reference,
                    deliveryMethodId: deliveryMethod,
                    addressId: selectedAddress?.id || null,
                    discountCode: appliedDiscount?.code || null,
                    selectedItemIds: items.map(i => i.id) // Pass selected IDs to backend if needed
                },
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });

            if (error) {
                console.error('SERVER ERROR:', error);
                throw new Error('Server connection failed: ' + error.message);
            }

            if (!data || data.error) {
                console.error('VERIFICATION ERROR:', data?.error);
                throw new Error(data?.error || 'Payment could not be verified.');
            }

            console.log('Order created successfully:', data);

            await clearCart();
            setFulfillmentStatus('success');

        } catch (error: any) {
            console.error('Checkout Error:', error);
            setErrorMessage(error.message);
            setFulfillmentStatus('error');
        } finally {
            setLoading(false);
        }
    };

    // UI for different states
    if (fulfillmentStatus === 'processing' || fulfillmentStatus === 'success' || fulfillmentStatus === 'error') {
        return (
            <div className="layout-with-sidebar" style={{ background: '#fff' }}>
                <Sidebar />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px' }}>
                    <AnimatePresence mode="wait">
                        {fulfillmentStatus === 'processing' && (
                            <motion.div key="proc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
                                <Loader2 className="animate-spin" size={60} style={{ color: '#5544ff', margin: '0 auto 24px' }} />
                                <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '16px', color: '#0F172A' }}>Verifying Payment</h1>
                                <p style={{ color: '#64748B', fontSize: '16px' }}>Securely verifying transaction with Paystack server...</p>
                            </motion.div>
                        )}

                        {fulfillmentStatus === 'success' && (
                            <motion.div key="succ" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', maxWidth: '450px' }}>
                                <div style={{ width: '100px', height: '100px', background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#10B981' }}>
                                    <CheckCircle2 size={50} />
                                </div>
                                <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', marginBottom: '16px' }}>Payment Successful!</h1>
                                <p style={{ color: '#64748B', fontSize: '16px', lineHeight: 1.6, marginBottom: '32px' }}>Your transaction has been verified and your order is confirmed.</p>
                                <button onClick={() => navigate('/orders')} style={{ width: '100%', padding: '18px', background: '#5544ff', color: '#fff', borderRadius: '16px', fontSize: '16px', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(85, 68, 255, 0.2)' }}>Track My Order</button>
                            </motion.div>
                        )}

                        {fulfillmentStatus === 'error' && (
                            <motion.div key="err" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', maxWidth: '500px' }}>
                                <div style={{ width: '100px', height: '100px', background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#EF4444' }}>
                                    <AlertTriangle size={50} />
                                </div>
                                <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', marginBottom: '16px' }}>Verification Failed</h1>
                                <p style={{ color: '#64748B', fontSize: '15px', lineHeight: 1.6, marginBottom: '12px' }}>We received a signal from the payment provider, but our server could not verify the transaction details.</p>
                                <div style={{ background: '#FFF5F5', padding: '20px', borderRadius: '16px', fontSize: '14px', color: '#EF4444', fontWeight: 700, marginBottom: '32px', textAlign: 'left', border: '1px solid #FEE2E2' }}>
                                    Error: {errorMessage}
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setFulfillmentStatus('idle')} style={{ flex: 1, padding: '16px', background: '#F1F5F9', color: '#64748B', borderRadius: '14px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>Try Again</button>
                                    <button onClick={() => navigate('/orders')} style={{ flex: 1, padding: '16px', background: '#0F172A', color: '#fff', borderRadius: '14px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>View Orders</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    return (
        <div className="layout-with-sidebar">
            <Sidebar />

            <div style={{ flex: 1, background: '#fff', minHeight: '100vh', padding: '20px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                    <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', textDecoration: 'none', fontWeight: 700, fontSize: '13px', marginBottom: '24px' }}>
                        <ChevronLeft size={14} /> Back to Bag
                    </Link>

                    <div className="checkout-grid" style={{ display: 'flex', gap: '40px' }}>

                        <div style={{ width: '340px' }} className="order-summary-col">
                            <div style={{ background: '#F8FAFC', borderRadius: '32px', padding: '32px', border: '1px solid #F1F5F9' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginBottom: '24px' }}>Summary</h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                    {items.map(item => (
                                        <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '12px', border: '1px solid #eee', padding: '4px' }}>
                                                <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{item.quantity}x {item.name}</p>
                                                <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>GH₵ {item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Discount Section */}
                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Discount Code</h3>
                                    <div className="discount-input-container" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <input
                                            type="text"
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                            placeholder="Enter code"
                                            disabled={!!appliedDiscount}
                                            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 700, outline: 'none', textTransform: 'uppercase' }}
                                        />
                                        {!appliedDiscount ? (
                                            <button
                                                onClick={handleApplyDiscount}
                                                disabled={discountLoading || !discountCode}
                                                style={{ padding: '0 16px', borderRadius: '10px', background: '#0F172A', color: 'white', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer', opacity: discountLoading ? 0.7 : 1 }}
                                            >
                                                {discountLoading ? '...' : 'Apply'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => { setAppliedDiscount(null); setDiscountCode(''); }}
                                                style={{ padding: '0 12px', borderRadius: '10px', background: '#EF4444', color: 'white', border: 'none', cursor: 'pointer' }}
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                    {discountError && <p style={{ fontSize: '11px', color: '#EF4444', fontWeight: 600, marginTop: '4px' }}>{discountError}</p>}
                                    {appliedDiscount && <p style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, marginTop: '4px' }}>Code applied: -GH₵ {discountAmount.toFixed(2)}</p>}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#64748B' }}>
                                        <span>Subtotal</span>
                                        <span>GH₵ {total.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#64748B' }}>
                                        <span>Shipping</span>
                                        <span style={{ color: '#10B981' }}>+ GH₵ {deliveryPrice.toFixed(2)}</span>
                                    </div>
                                    {appliedDiscount && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>
                                            <span>Discount</span>
                                            <span>- GH₵ {discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 900, color: '#0F172A', marginTop: '12px' }}>
                                        <span>Total</span>
                                        <span>GH₵ {grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (!selectedAddress) {
                                            setShowAddressModal(true);
                                            return;
                                        }
                                        payWithPaystack();
                                    }}
                                    disabled={loading || items.length === 0}
                                    style={{
                                        width: '100%',
                                        background: (loading || items.length === 0) ? '#94A3B8' : '#0F172A',
                                        color: '#fff',
                                        height: '60px',
                                        borderRadius: '20px',
                                        fontSize: '15px',
                                        fontWeight: 800,
                                        marginTop: '32px',
                                        cursor: (loading || items.length === 0) ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    {loading ? 'Processing...' : `Pay GH₵ ${grandTotal.toFixed(2)}`}
                                    {!loading && <ArrowRight size={18} />}
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px', padding: '0 16px', opacity: 0.6 }}>
                                <ShieldCheck size={16} />
                                <span style={{ fontSize: '12px', fontWeight: 700 }}>Secure checkout powered by Paystack</span>
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.04em', marginBottom: '32px' }}>Checkout</h1>

                            <div style={{ marginBottom: '40px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '24px', height: '24px', background: '#F1F5F9', color: '#0F172A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>1</div>
                                        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Shipping Address</h2>
                                    </div>
                                    <button onClick={() => setShowAddressModal(true)} style={{ color: '#5544ff', fontSize: '13px', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>Change</button>
                                </div>

                                {selectedAddress ? (
                                    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '20px', display: 'flex', gap: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5544ff' }}>
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 800, fontSize: '14px', color: '#0F172A' }}>{selectedAddress.full_name}</p>
                                            <p style={{ margin: '4px 0', fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{selectedAddress.address_line}, {selectedAddress.city}</p>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{selectedAddress.phone}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowAddressModal(true)}
                                        style={{ width: '100%', border: '2px dashed #E2E8F0', borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', background: '#fff' }}
                                    >
                                        <div style={{ width: '48px', height: '48px', background: '#F8FAFC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                                            <Plus size={24} />
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#94A3B8' }}>Select or Add Shipping Address</span>
                                    </button>
                                )}
                            </div>

                            <div style={{ marginBottom: '40px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ width: '24px', height: '24px', background: '#F1F5F9', color: '#0F172A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>2</div>
                                    <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Delivery Speed</h2>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                    {DELIVERY_METHODS.map(method => (
                                        <button
                                            key={method.id}
                                            onClick={() => setDeliveryMethod(method.id)}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px',
                                                padding: '16px',
                                                borderRadius: '20px',
                                                border: '1px solid',
                                                borderColor: deliveryMethod === method.id ? '#5544ff' : '#E2E8F0',
                                                background: deliveryMethod === method.id ? '#F5F5FF' : '#fff',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', color: deliveryMethod === method.id ? '#5544ff' : '#64748B' }}>
                                                {method.icon}
                                                <span style={{ fontSize: '12px', fontWeight: 900 }}>
                                                    GH₵ {(baseLogisticsFee + method.price).toFixed(2)}
                                                </span>
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{method.label}</p>
                                                <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>{method.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showAddressModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddressModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }} />
                        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} style={{ position: 'relative', width: '450px', background: '#fff', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 900 }}>{isAddingNew ? 'Add New Address' : 'Select Address'}</h2>
                                <button onClick={() => { setShowAddressModal(false); setIsAddingNew(false); }} style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <div style={{ padding: '24px', maxHeight: '400px', overflowY: 'auto' }}>
                                {!isAddingNew ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {addresses.map(addr => (
                                            <div
                                                key={addr.id}
                                                style={{
                                                    padding: '16px',
                                                    borderRadius: '20px',
                                                    border: '1px solid',
                                                    borderColor: selectedAddress?.id === addr.id ? '#5544ff' : '#E2E8F0',
                                                    background: selectedAddress?.id === addr.id ? '#F5F5FF' : '#fff',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    position: 'relative'
                                                }}
                                                onClick={() => {
                                                    setSelectedAddress(addr);
                                                    setShowAddressModal(false);
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: 800, fontSize: '14px', color: '#0F172A' }}>{addr.full_name}</p>
                                                        {addr.is_default && (
                                                            <span style={{ fontSize: '10px', background: '#5544ff', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, marginTop: '4px', display: 'inline-block' }}>DEFAULT</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleDefaultAddress(addr.id); }}
                                                        style={{
                                                            fontSize: '11px',
                                                            fontWeight: 800,
                                                            color: addr.is_default ? '#64748B' : '#5544ff',
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: addr.is_default ? 'default' : 'pointer'
                                                        }}
                                                        disabled={addr.is_default}
                                                    >
                                                        {addr.is_default ? 'Default Address' : 'Make Default'}
                                                    </button>
                                                </div>
                                                <p style={{ margin: '4px 0', fontSize: '12px', color: '#64748B', fontWeight: 500 }}>{addr.address_line}</p>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: 500 }}>{addr.city}, {addr.phone}</p>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setIsAddingNew(true)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#5544ff', fontWeight: 800, fontSize: '14px', padding: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            <Plus size={16} /> Add a new address
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div className="modal-input">
                                            <label>Full Name</label>
                                            <input type="text" value={newAddress.full_name} onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })} placeholder="Recepient Name" />
                                        </div>
                                        <div className="modal-input">
                                            <label>Phone Number</label>
                                            <input type="tel" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} placeholder="+233..." />
                                        </div>
                                        <div className="modal-input">
                                            <label>Address Line</label>
                                            <input type="text" value={newAddress.address_line} onChange={e => setNewAddress({ ...newAddress, address_line: e.target.value })} placeholder="House No, Street Name" />
                                        </div>
                                        <div className="modal-input">
                                            <label>Zone / Region</label>
                                            <select
                                                value={newAddress.zone_id || ''}
                                                onChange={e => handleZoneChange(e.target.value)}
                                                style={{ width: '100%', height: '48px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0 16px', fontSize: '14px', fontWeight: 700, outline: 'none' }}
                                            >
                                                <option value="">Select Zone</option>
                                                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="modal-input" style={{ opacity: newAddress.zone_id ? 1 : 0.5 }}>
                                            <label>Sub-Zone / District</label>
                                            <select
                                                disabled={!newAddress.zone_id}
                                                value={newAddress.sub_zone_id || ''}
                                                onChange={e => handleSubZoneChange(e.target.value)}
                                                style={{ width: '100%', height: '48px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0 16px', fontSize: '14px', fontWeight: 700, outline: 'none' }}
                                            >
                                                <option value="">Select Sub-Zone</option>
                                                {subZones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="modal-input" style={{ opacity: newAddress.sub_zone_id ? 1 : 0.5 }}>
                                            <label>Area / Neighborhood</label>
                                            <select
                                                disabled={!newAddress.sub_zone_id}
                                                value={newAddress.area_id || ''}
                                                onChange={e => {
                                                    const selected = areas.find(a => a.id === e.target.value);
                                                    if (selected) {
                                                        handleAreaChange(selected.id, selected.name);
                                                        calculateDynamicFee({ ...newAddress, area_id: selected.id });
                                                    }
                                                }}
                                                style={{ width: '100%', height: '48px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0 16px', fontSize: '14px', fontWeight: 700, outline: 'none' }}
                                            >
                                                <option value="">Select Area</option>
                                                {areas.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                                            </select>
                                        </div>

                                        {fetchingLogistics && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5544ff', fontSize: '12px', fontWeight: 700 }}>
                                                <Loader2 className="animate-spin" size={14} /> Calculating delivery rates...
                                            </div>
                                        )}

                                        {customDeliveryFee !== null && (
                                            <div style={{ background: '#F5F5FF', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Truck size={16} color="#5544ff" />
                                                    <span style={{ fontSize: '13px', fontWeight: 700 }}>Logistics Fee</span>
                                                </div>
                                                <span style={{ fontSize: '14px', fontWeight: 900, color: '#5544ff' }}>GH₵ {customDeliveryFee.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 4px' }}>
                                            <input
                                                type="checkbox"
                                                id="set-default"
                                                checked={newAddress.is_default}
                                                onChange={e => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <label htmlFor="set-default" style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}>Set as default address</label>
                                        </div>

                                        <button onClick={handleAddAddress} style={{ width: '100%', height: '52px', background: '#0F172A', color: '#fff', borderRadius: '16px', fontWeight: 800, marginTop: '8px', border: 'none', cursor: 'pointer' }}>Save Address</button>
                                        <button onClick={() => setIsAddingNew(false)} style={{ width: '100%', height: '52px', color: '#64748B', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .modal-input label { display: block; font-size: 11px; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin-bottom: 6px; }
                .modal-input input { width: 100%; height: 48px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 0 16px; font-size: 14px; font-weight: 700; outline: none; }
                .modal-input input:focus { border-color: #5544ff; background: #fff; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (max-width: 800px) {
                    .checkout-grid { flex-direction: column-reverse; }
                    .order-summary-col { width: 100% !important; }
                    .discount-input-container input { min-width: 120px !important; }
                    .discount-input-container button { flex: 1 !important; }
                }
            `}</style>
        </div>
    );
};

export default Checkout;
