import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    CheckCircle2,
    Clock,
    Truck,
    Package,
    AlertCircle,
    X,
    Filter,
    MapPin,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    shipping_address: string;
    payment_ref: string;
    order_items: OrderItem[];
}

const AdminOrders = () => {
    const { isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/');
        }
    }, [isAdmin, authLoading, navigate]);

    useEffect(() => {
        if (isAdmin) {
            fetchOrders();
        }
    }, [isAdmin]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (*)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching admin orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const getStatusStyles = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'delivered') return { bg: '#F0FDF4', text: '#16A34A', icon: <CheckCircle2 size={14} /> };
        if (s === 'shipped') return { bg: '#F0F9FF', text: '#0284C7', icon: <Truck size={14} /> };
        if (s === 'processing') return { bg: '#EEF2FF', text: '#4F46E5', icon: <Clock size={14} /> };
        if (s === 'cancelled') return { bg: '#FEF2F2', text: '#DC2626', icon: <AlertCircle size={14} /> };
        return { bg: '#FFFBEB', text: '#D97706', icon: <Clock size={14} /> };
    };

    const filteredOrders = orders.filter(o =>
        o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.payment_ref?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || !isAdmin) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            <AdminSidebar activeTab="Orders" />

            <main style={{ flex: 1, padding: '40px', marginLeft: '260px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>Orders Management</h1>
                            <p style={{ color: '#64748B', fontWeight: 600 }}>Manage fulfillment and track store revenue</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ position: 'relative' }}>
                                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by order ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: '12px 12px 12px 40px',
                                        borderRadius: '12px',
                                        border: '1px solid #E2E8F0',
                                        fontSize: '14px',
                                        width: '300px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '14px', fontWeight: 700 }}>
                                <Filter size={16} /> Filters
                            </button>
                        </div>
                    </div>

                    <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC' }}>
                                    <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Order Details</th>
                                    <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Items</th>
                                    <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Amount</th>
                                    <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>Loading orders...</td></tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>No orders found</td></tr>
                                ) : filteredOrders.map((order) => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <p style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>#{order.order_number}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                <Calendar size={12} color="#94A3B8" />
                                                <span style={{ fontSize: '12px', color: '#64748B' }}>{new Date(order.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '24px', height: '24px', background: '#F1F5F9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                                                    {order.order_items?.length || 0}
                                                </div>
                                                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Products</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>GH₵ {order.total_amount.toFixed(2)}</span>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 14px',
                                                background: getStatusStyles(order.status).bg,
                                                color: getStatusStyles(order.status).text,
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 800
                                            }}>
                                                {getStatusStyles(order.status).icon}
                                                {order.status}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                style={{ border: 'none', background: 'none', color: '#5544ff', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                Details <ArrowUpRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }} />
                        <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }} style={{ position: 'relative', width: '500px', background: '#fff', borderRadius: '32px', height: '90vh', overflow: 'hidden' }}>
                            <div style={{ padding: '32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 900 }}>Order Detail</h2>
                                <button onClick={() => setSelectedOrder(null)} style={{ color: '#64748B', background: '#F8FAFC', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <div style={{ padding: '32px', overflowY: 'auto', height: 'calc(90vh - 100px)' }}>
                                {/* Status Management Section */}
                                <div style={{ marginBottom: '32px', background: '#F8FAFC', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>

                                    {/* Visual Stepper */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', position: 'relative' }}>
                                        {/* Line */}
                                        <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', background: '#E2E8F0', zIndex: 0 }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${(['processing', 'shipped', 'delivered'].indexOf(selectedOrder.status.toLowerCase()) / 2) * 100}%`,
                                                background: '#5544ff',
                                                transition: 'width 0.3s'
                                            }} />
                                        </div>

                                        {['Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                                            const currentIdx = ['processing', 'shipped', 'delivered'].indexOf(selectedOrder.status.toLowerCase());
                                            const isCompleted = currentIdx >= idx;
                                            const isCurrent = currentIdx === idx;

                                            // Icons
                                            let Icon = Clock;
                                            if (step === 'Shipped') Icon = Truck;
                                            if (step === 'Delivered') Icon = Package;

                                            return (
                                                <div key={step} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: isCompleted ? '#5544ff' : '#fff',
                                                        border: `2px solid ${isCompleted ? '#5544ff' : '#E2E8F0'}`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: isCompleted ? '#fff' : '#94A3B8',
                                                        marginBottom: '8px',
                                                        transition: 'all 0.2s'
                                                    }}>
                                                        <Icon size={14} />
                                                    </div>
                                                    <span style={{
                                                        fontSize: '11px',
                                                        fontWeight: 800,
                                                        color: isCurrent ? '#0F172A' : '#94A3B8'
                                                    }}>{step}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <p style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '12px' }}>Update Status</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        {['Processing', 'Shipped', 'Delivered'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => updateOrderStatus(selectedOrder.id, s.toLowerCase())}
                                                style={{
                                                    padding: '12px',
                                                    borderRadius: '12px',
                                                    border: '1px solid',
                                                    borderColor: selectedOrder.status.toLowerCase() === s.toLowerCase() ? '#5544ff' : '#E2E8F0',
                                                    background: selectedOrder.status.toLowerCase() === s.toLowerCase() ? '#5544ff' : '#fff',
                                                    color: selectedOrder.status.toLowerCase() === s.toLowerCase() ? '#fff' : '#64748B',
                                                    fontWeight: 800,
                                                    fontSize: '13px',
                                                    cursor: 'pointer',
                                                    boxShadow: selectedOrder.status.toLowerCase() === s.toLowerCase() ? '0 4px 12px rgba(85, 68, 255, 0.2)' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '1px solid #FECACA',
                                                background: selectedOrder.status.toLowerCase() === 'cancelled' ? '#FEF2F2' : '#fff',
                                                color: '#DC2626',
                                                fontWeight: 800,
                                                fontSize: '13px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancelled
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '32px' }}>
                                    <p style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '12px' }}>Shipping Address</p>
                                    <div style={{ display: 'flex', gap: '12px', background: '#F8FAFC', padding: '20px', borderRadius: '20px' }}>
                                        <MapPin size={20} color="#5544ff" />
                                        <p style={{ margin: 0, fontSize: '14px', color: '#475569', fontWeight: 600, lineHeight: 1.5 }}>{selectedOrder.shipping_address}</p>
                                    </div>
                                </div>

                                <div>
                                    <p style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '12px' }}>Items</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {selectedOrder.order_items?.map(item => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 800, fontSize: '14px' }}>{item.product_name}</p>
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>Qty: {item.quantity}</p>
                                                </div>
                                                <span style={{ fontWeight: 900 }}>GH₵ {(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                        <div style={{ height: '1px', background: '#F1F5F9', margin: '8px 0' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900 }}>
                                            <span>Total</span>
                                            <span>GH₵ {selectedOrder.total_amount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminOrders;
