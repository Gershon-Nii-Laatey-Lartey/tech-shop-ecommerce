import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Package, Truck, Check, Clock, MapPin, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

interface OrderItem {
    id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
    total: number;
}

interface Order {
    id: string;
    status: string;
    total: number;
    subtotal: number;
    shipping_cost: number;
    tax: number;
    created_at: string;
    updated_at: string;
    tracking_number?: string;
    payment_method?: string;
    payment_status?: string;
    shipping_address: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
}

const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Check }
];

const getStatusIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return statusSteps.findIndex(s => s.key === status);
};

const OrderDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && id) fetchOrder();
    }, [user, id]);

    const fetchOrder = async () => {
        setLoading(true);

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (orderData && !orderError) {
            setOrder(orderData);

            const { data: itemsData } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', id);

            if (itemsData) setItems(itemsData);
        }

        setLoading(false);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #f0f0f0', borderTop: '4px solid black', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px' }}>Order Not Found</h1>
                    <Link to="/orders" style={{ color: 'var(--primary-color)', fontWeight: 700 }}>View All Orders</Link>
                </div>
            </div>
        );
    }

    const currentStep = getStatusIndex(order.status);

    return (
        <div style={{ minHeight: '100vh', background: '#fafafa', padding: '40px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontWeight: 700, fontSize: '13px', textDecoration: 'none', marginBottom: '16px' }}>
                        <ChevronLeft size={16} /> Back to Orders
                    </Link>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '8px' }}>
                                Order #{order.id.slice(0, 8).toUpperCase()}
                            </h1>
                            <p style={{ color: '#888', fontWeight: 600, fontSize: '14px' }}>
                                Placed on {new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                        <div style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            background: order.status === 'cancelled' ? '#fef2f2' : order.status === 'delivered' ? '#ecfdf5' : '#f5f5f7',
                            color: order.status === 'cancelled' ? '#ef4444' : order.status === 'delivered' ? '#10b981' : '#333'
                        }}>
                            {order.status}
                        </div>
                    </div>
                </div>

                {/* Order Status Timeline */}
                {order.status !== 'cancelled' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: 'white',
                            borderRadius: '24px',
                            padding: '32px',
                            marginBottom: '24px',
                            border: '1px solid #eee'
                        }}
                    >
                        <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '32px' }}>Order Status</h2>

                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                            {/* Progress Line */}
                            <div style={{
                                position: 'absolute',
                                top: '24px',
                                left: '48px',
                                right: '48px',
                                height: '4px',
                                background: '#f0f0f0',
                                borderRadius: '2px',
                                zIndex: 0
                            }}>
                                <div style={{
                                    height: '100%',
                                    background: '#10b981',
                                    borderRadius: '2px',
                                    width: `${Math.max(0, (currentStep / (statusSteps.length - 1)) * 100)}%`,
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>

                            {statusSteps.map((step, idx) => {
                                const isComplete = idx <= currentStep;
                                const isCurrent = idx === currentStep;
                                const Icon = step.icon;

                                return (
                                    <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            background: isComplete ? '#10b981' : '#f0f0f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isComplete ? 'white' : '#aaa',
                                            marginBottom: '12px',
                                            border: isCurrent ? '3px solid #10b981' : 'none',
                                            boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none'
                                        }}>
                                            <Icon size={20} />
                                        </div>
                                        <p style={{ fontSize: '13px', fontWeight: 700, color: isComplete ? '#333' : '#aaa', textAlign: 'center' }}>
                                            {step.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {order.tracking_number && (
                            <div style={{ marginTop: '32px', padding: '16px', background: '#f9f9fb', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Truck size={20} color="#888" />
                                <div>
                                    <p style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>Tracking Number</p>
                                    <p style={{ fontSize: '14px', fontWeight: 800 }}>{order.tracking_number}</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {order.status === 'cancelled' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: '#fef2f2',
                            borderRadius: '24px',
                            padding: '32px',
                            marginBottom: '24px',
                            border: '1px solid #fecaca',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}
                    >
                        <AlertCircle size={24} color="#ef4444" />
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ef4444', marginBottom: '4px' }}>Order Cancelled</h3>
                            <p style={{ fontSize: '14px', color: '#991b1b' }}>This order has been cancelled. If you have any questions, please contact support.</p>
                        </div>
                    </motion.div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                    {/* Order Items */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{
                            background: 'white',
                            borderRadius: '24px',
                            padding: '32px',
                            border: '1px solid #eee'
                        }}
                    >
                        <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '24px' }}>Order Items ({items.length})</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {items.map(item => (
                                <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: '#f9f9fb', borderRadius: '16px' }}>
                                    <div style={{ width: '72px', height: '72px', background: 'white', borderRadius: '12px', padding: '8px' }}>
                                        <img src={item.product_image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 800, fontSize: '15px', marginBottom: '4px' }}>{item.product_name}</p>
                                        <p style={{ color: '#888', fontSize: '13px' }}>Quantity: {item.quantity}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 900, fontSize: '16px' }}>${item.total.toLocaleString()}</p>
                                        <p style={{ color: '#888', fontSize: '12px' }}>${item.price.toLocaleString()} each</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Order Details Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                background: 'white',
                                borderRadius: '24px',
                                padding: '32px',
                                border: '1px solid #eee'
                            }}
                        >
                            <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px' }}>Order Summary</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#888' }}>Subtotal</span>
                                    <span style={{ fontWeight: 700 }}>${order.subtotal.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#888' }}>Shipping</span>
                                    <span style={{ fontWeight: 700 }}>{order.shipping_cost === 0 ? 'FREE' : `$${order.shipping_cost}`}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#888' }}>Tax</span>
                                    <span style={{ fontWeight: 700 }}>${order.tax.toFixed(2)}</span>
                                </div>
                                <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 800 }}>Total</span>
                                    <span style={{ fontWeight: 900, fontSize: '20px' }}>${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Shipping Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                background: 'white',
                                borderRadius: '24px',
                                padding: '32px',
                                border: '1px solid #eee'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <MapPin size={18} />
                                <h3 style={{ fontSize: '16px', fontWeight: 900 }}>Shipping Address</h3>
                            </div>

                            <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.8 }}>
                                {order.shipping_address.firstName} {order.shipping_address.lastName}<br />
                                {order.shipping_address.address}<br />
                                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}<br />
                                {order.shipping_address.country}
                            </p>
                            {order.shipping_address.phone && (
                                <p style={{ fontSize: '13px', color: '#888', marginTop: '12px' }}>{order.shipping_address.phone}</p>
                            )}
                        </motion.div>

                        {/* Payment Method */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            style={{
                                background: 'white',
                                borderRadius: '24px',
                                padding: '32px',
                                border: '1px solid #eee'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <CreditCard size={18} />
                                <h3 style={{ fontSize: '16px', fontWeight: 900 }}>Payment</h3>
                            </div>

                            <p style={{ fontSize: '14px', color: '#666' }}>
                                {order.payment_method === 'card' ? 'Credit/Debit Card' : order.payment_method === 'paypal' ? 'PayPal' : order.payment_method || 'Card'}
                            </p>
                            <div style={{
                                marginTop: '12px',
                                padding: '8px 12px',
                                background: order.payment_status === 'paid' ? '#ecfdf5' : '#fef3cd',
                                borderRadius: '8px',
                                display: 'inline-block'
                            }}>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    color: order.payment_status === 'paid' ? '#10b981' : '#856404'
                                }}>
                                    {order.payment_status || 'Paid'}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;