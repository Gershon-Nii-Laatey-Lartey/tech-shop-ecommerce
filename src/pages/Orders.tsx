import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Truck, Check, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';

interface Order {
    id: string;
    status: string;
    total: number;
    created_at: string;
    tracking_number?: string;
    shipping_address: {
        firstName: string;
        lastName: string;
        city: string;
        state: string;
    };
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return '#f59e0b';
        case 'processing': return '#3b82f6';
        case 'shipped': return '#8b5cf6';
        case 'delivered': return '#10b981';
        case 'cancelled': return '#ef4444';
        default: return '#888';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'pending': return <Clock size={16} />;
        case 'processing': return <Package size={16} />;
        case 'shipped': return <Truck size={16} />;
        case 'delivered': return <Check size={16} />;
        case 'cancelled': return <AlertCircle size={16} />;
        default: return <Clock size={16} />;
    }
};

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });

        if (data && !error) {
            setOrders(data);
        }
        setLoading(false);
    };

    if (!user) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px' }}>Please Sign In</h1>
                    <Link to="/auth" style={{ color: 'var(--primary-color)', fontWeight: 700 }}>Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="layout-with-sidebar">
            <Sidebar />

            <div style={{ flex: 1, padding: '40px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '48px' }}>
                        <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '8px' }}>Your Orders</h1>
                        <p style={{ color: '#888', fontWeight: 600 }}>Track and manage your purchases</p>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                            <div style={{ width: '40px', height: '40px', border: '4px solid #f0f0f0', borderTop: '4px solid black', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : orders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                textAlign: 'center',
                                padding: '100px 0',
                                background: '#f9f9fb',
                                borderRadius: '32px',
                                border: '2px dashed #eee'
                            }}
                        >
                            <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#ccc' }}>
                                <Package size={40} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '12px' }}>No orders yet</h2>
                            <p style={{ color: '#aaa', fontWeight: 600, marginBottom: '32px' }}>Start shopping to see your orders here.</p>
                            <Link to="/products" style={{
                                padding: '16px 32px',
                                background: 'black',
                                color: 'white',
                                borderRadius: '16px',
                                fontWeight: 800,
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}>
                                Browse Products
                            </Link>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {orders.map((order, idx) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Link
                                        to={`/orders/${order.id}`}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <div style={{
                                            background: 'white',
                                            borderRadius: '20px',
                                            padding: '24px',
                                            border: '1px solid #eee',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '24px',
                                            transition: 'all 0.2s',
                                            cursor: 'pointer'
                                        }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.borderColor = '#ddd';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.borderColor = '#eee';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                background: '#f5f5f7',
                                                borderRadius: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: getStatusColor(order.status)
                                            }}>
                                                {getStatusIcon(order.status)}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                                    <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '11px',
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase',
                                                        background: `${getStatusColor(order.status)}15`,
                                                        color: getStatusColor(order.status)
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>
                                                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    {order.shipping_address && ` • ${order.shipping_address.city}, ${order.shipping_address.state}`}
                                                </p>
                                            </div>

                                            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div>
                                                    <p style={{ fontSize: '20px', fontWeight: 900 }}>${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                                    {order.tracking_number && (
                                                        <p style={{ fontSize: '11px', color: '#888', fontWeight: 600 }}>Tracking: {order.tracking_number}</p>
                                                    )}
                                                </div>
                                                <ChevronRight size={20} color="#ccc" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Orders;