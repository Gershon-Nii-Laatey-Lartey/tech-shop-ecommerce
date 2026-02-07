import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    image?: string;
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
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/');
        }
    }, [isAdmin, authLoading, navigate]);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            
            .admin-orders-main {
                margin-left: 260px;
                padding: 40px;
                transition: all 0.3s;
            }

            .orders-grid {
                display: none;
            }

            .orders-table-container {
                display: block;
            }

            @media (max-width: 1024px) {
                .admin-orders-main {
                    margin-left: 0;
                    padding: 0 24px 40px 24px;
                    margin-top: 60px;
                }
            }

            @media (max-width: 768px) {
                .admin-orders-main {
                    padding: 0 20px 100px 20px;
                    margin-top: 60px;
                }
                .orders-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 12px;
                }
                .orders-table-container {
                    display: none;
                }
                .hide-mobile {
                    display: none !important;
                }
                .orders-header {
                    flex-direction: column;
                    align-items: flex-start !important;
                    gap: 16px;
                }
                .search-filters {
                    width: 100%;
                    flex-direction: column;
                }
                .search-filters input {
                    width: 100% !important;
                }
            }

            .order-card-mobile {
                background: white;
                border: 1px solid #E2E8F0;
                border-radius: 16px;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                transition: all 0.2s;
            }
            
            .order-card-mobile:hover {
                box-shadow: 0 4px 16px rgba(0,0,0,0.08);
                transform: translateY(-2px);
            }

            @media (max-width: 768px) {
                .order-detail-modal {
                    border-radius: 24px !important;
                    max-height: 85vh !important;
                    display: flex !important;
                    flex-direction: column !important;
                }
                .modal-header {
                    padding: 20px 24px !important;
                    flex-shrink: 0 !important;
                }
                .modal-grid {
                    display: flex !important;
                    flex-direction: column !important;
                    grid-template-columns: 1fr !important;
                    gap: 0 !important;
                    height: auto !important;
                    flex: 1 !important;
                    overflow-y: auto !important;
                    padding: 0 !important;
                }
                .modal-col {
                    padding: 24px !important;
                    border-right: none !important;
                    border-bottom: 1px solid #F1F5F9;
                    height: auto !important;
                    overflow: visible !important;
                }
                .modal-col:last-child {
                    border-bottom: none;
                }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

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
                    order_items (
                        *,
                        products (image)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formatted = data?.map((o: any) => ({
                ...o,
                order_items: o.order_items.map((oi: any) => {
                    // Handle both object and array response for the product join
                    const prod = Array.isArray(oi.products) ? oi.products[0] : oi.products;
                    return {
                        ...oi,
                        image: prod?.image || ''
                    };
                })
            }));
            setOrders(formatted || []);
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

            <main className="admin-orders-main" style={{ flex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="orders-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>Orders Management</h1>
                            <p className="hide-mobile" style={{ color: '#64748B', fontWeight: 600 }}>Manage fulfillment and track store revenue</p>
                        </div>
                        <div className="search-filters" style={{ display: 'flex', gap: '12px' }}>
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
                                {searchTerm && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        background: 'white',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                        zIndex: 50,
                                        marginTop: '4px',
                                        border: '1px solid #E2E8F0',
                                        maxHeight: '300px',
                                        overflowY: 'auto'
                                    }}>
                                        {filteredOrders.slice(0, 5).map(order => (
                                            <div
                                                key={order.id}
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setSearchTerm('');
                                                }}
                                                style={{
                                                    padding: '12px 16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #F1F5F9'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                            >
                                                <div>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>#{order.order_number}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748B' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                                                </div>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                                                    GH₵ {order.total_amount}
                                                </div>
                                            </div>
                                        ))}
                                        {filteredOrders.length === 0 && (
                                            <div style={{ padding: '12px 16px', color: '#64748B', fontSize: '14px' }}>No orders found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '14px', fontWeight: 700 }}>
                                <Filter size={16} /> Filters
                            </button>
                        </div>
                    </div>

                    {/* Mobile Grid View */}
                    <div className="orders-grid">
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading orders...</div>
                        ) : filteredOrders.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No orders found</div>
                        ) : (
                            filteredOrders.map((order) => {
                                const statusStyle = getStatusStyles(order.status);
                                return (
                                    <div key={order.id} className="order-card-mobile" onClick={() => setSelectedOrder(order)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>#{order.order_number}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                    <Calendar size={12} color="#94A3B8" />
                                                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{new Date(order.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: statusStyle.bg, borderRadius: '10px' }}>
                                                {statusStyle.icon}
                                                <span style={{ fontSize: '12px', fontWeight: 800, color: statusStyle.text }}>{order.status}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Package size={16} color="#64748B" />
                                                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>{order.order_items?.length || 0} items</span>
                                            </div>
                                            <span style={{ fontSize: '18px', fontWeight: 900, color: '#5544ff' }}>GH₵ {order.total_amount.toFixed(2)}</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                                            style={{ width: '100%', padding: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', color: '#5544ff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                        >
                                            View Details <ArrowUpRight size={14} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="orders-table-container" style={{ background: '#fff', borderRadius: '24px', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
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
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="order-detail-modal"
                            style={{
                                position: 'relative',
                                width: '100%',
                                maxWidth: '860px',
                                background: '#fff',
                                borderRadius: '32px',
                                maxHeight: '90vh',
                                overflow: 'hidden',
                                boxShadow: '0 25px 70px -12px rgba(0, 0, 0, 0.3)'
                            }}
                        >
                            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Order Detail</h2>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Invoice #{selectedOrder.order_number}</p>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} style={{ color: '#64748B', background: '#F8FAFC', border: 'none', borderRadius: '14px', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}><X size={20} /></button>
                            </div>

                            <div className="modal-content modal-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', height: 'calc(90vh - 88px)', overflowY: 'auto', overflowX: 'hidden' }}>
                                {/* Left Column: Line Items */}
                                <div className="modal-col" style={{ padding: '32px', borderRight: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <p style={{ fontSize: '12px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Order Summary</p>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#5544ff', background: '#EEF2FF', padding: '4px 10px', borderRadius: '8px' }}>{selectedOrder.order_items?.length} Items</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {selectedOrder.order_items?.map(item => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: '#fff', padding: '16px', borderRadius: '20px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                                <div style={{ width: '56px', height: '64px', background: '#F8FAFC', borderRadius: '12px', overflow: 'hidden', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #F1F5F9', flexShrink: 0 }}>
                                                    <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.product_name}>{item.product_name}</p>
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Qty: {item.quantity} × GH₵ {item.price.toFixed(2)}</p>
                                                </div>
                                                <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '14px', flexShrink: 0 }}>GH₵ {(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '24px', background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                        {(() => {
                                            const subtotal = selectedOrder.order_items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
                                            const shipping = Math.max(0, selectedOrder.total_amount - subtotal);
                                            return (
                                                <>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                        <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>Subtotal</span>
                                                        <span style={{ fontSize: '14px', color: '#0F172A', fontWeight: 700 }}>GH₵ {subtotal.toFixed(2)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                        <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>Shipping</span>
                                                        <span style={{ fontSize: '14px', color: shipping > 0 ? '#0F172A' : '#10B981', fontWeight: 700 }}>
                                                            {shipping > 0 ? `GH₵ ${shipping.toFixed(2)}` : 'Free'}
                                                        </span>
                                                    </div>
                                                    <div style={{ height: '1px', background: '#F1F5F9', marginBottom: '16px' }} />
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Grand Total</span>
                                                        <span style={{ fontSize: '24px', fontWeight: 900, color: '#5544ff' }}>GH₵ {selectedOrder.total_amount.toFixed(2)}</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Right Column: Details & Actions */}
                                <div className="modal-col" style={{ padding: '32px', background: '#fff' }}>
                                    {/* Status Tracker */}
                                    <div style={{ marginBottom: '32px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <p style={{ fontSize: '12px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Order Tracking</p>
                                        </div>

                                        <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
                                            {/* Visual Stepper */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', position: 'relative', padding: '0 4px' }}>
                                                <div style={{ position: 'absolute', top: '16px', left: '30px', right: '30px', height: '2.5px', background: '#F1F5F9', borderRadius: '4px', zIndex: 0 }}>
                                                    {!['cancelled'].includes(selectedOrder.status.toLowerCase()) && (
                                                        <div style={{
                                                            height: '100%',
                                                            width: `${(['processing', 'shipped', 'delivered'].indexOf(selectedOrder.status.toLowerCase()) / 2) * 100}%`,
                                                            background: '#5544ff',
                                                            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                                                        }} />
                                                    )}
                                                </div>

                                                {['Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                                                    const statusList = ['processing', 'shipped', 'delivered'];
                                                    const currentIdx = statusList.indexOf(selectedOrder.status.toLowerCase());
                                                    const isCancelled = selectedOrder.status.toLowerCase() === 'cancelled';
                                                    const isCompleted = !isCancelled && currentIdx >= idx;
                                                    const isCurrent = !isCancelled && currentIdx === idx;

                                                    let Icon = Clock;
                                                    if (step === 'Shipped') Icon = Truck;
                                                    if (step === 'Delivered') Icon = Package;

                                                    return (
                                                        <div key={step} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                                                            <div style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '10px',
                                                                background: isCompleted ? '#5544ff' : '#fff',
                                                                border: `2px solid ${isCompleted ? '#5544ff' : '#F1F5F9'}`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: isCompleted ? '#fff' : '#94A3B8',
                                                                marginBottom: '8px',
                                                                boxShadow: isCurrent ? '0 4px 12px rgba(85, 68, 255, 0.2)' : 'none'
                                                            }}>
                                                                <Icon size={14} strokeWidth={2.5} />
                                                            </div>
                                                            <span style={{ fontSize: '10px', fontWeight: 800, color: isCurrent ? '#0F172A' : '#94A3B8' }}>{step}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Action Button */}
                                            {selectedOrder.status.toLowerCase() === 'processing' && (
                                                <button onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#5544ff', color: '#fff', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 16px rgba(85, 68, 255, 0.15)' }}>
                                                    <Truck size={18} strokeWidth={2.5} /> Mark as Shipped
                                                </button>
                                            )}
                                            {selectedOrder.status.toLowerCase() === 'shipped' && (
                                                <button onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#16A34A', color: '#fff', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 16px rgba(22, 163, 74, 0.15)' }}>
                                                    <CheckCircle2 size={18} strokeWidth={2.5} /> Confirm Delivery
                                                </button>
                                            )}
                                            {(selectedOrder.status.toLowerCase() === 'delivered' || selectedOrder.status.toLowerCase() === 'cancelled') && (
                                                <div style={{ padding: '14px', borderRadius: '14px', background: selectedOrder.status.toLowerCase() === 'delivered' ? '#F0FDF4' : '#FEF2F2', border: `1.5px dashed ${selectedOrder.status.toLowerCase() === 'delivered' ? '#BBF7D0' : '#FECACA'}`, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    {selectedOrder.status.toLowerCase() === 'delivered' ? <CheckCircle2 size={18} color="#16A34A" /> : <AlertCircle size={18} color="#DC2626" />}
                                                    <span style={{ fontSize: '14px', fontWeight: 800, color: selectedOrder.status.toLowerCase() === 'delivered' ? '#16A34A' : '#DC2626' }}>Order {selectedOrder.status.toUpperCase()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Shipping Info */}
                                    <div style={{ marginBottom: '32px' }}>
                                        <p style={{ fontSize: '12px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Shipping Address</p>
                                        <div style={{ display: 'flex', gap: '16px', background: '#fff', padding: '20px', borderRadius: '24px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#EEF2FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <MapPin size={20} color="#5544ff" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: 700 }}>Delivery Location</p>
                                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B', fontWeight: 500, lineHeight: 1.5 }}>{selectedOrder.shipping_address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin Override */}
                                    <div style={{ paddingTop: '24px', borderTop: '1px solid #F1F5F9' }}>
                                        <p style={{ fontSize: '10px', fontWeight: 900, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>System Override</p>
                                        <div style={{ position: 'relative' }}>
                                            <select
                                                value={selectedOrder.status.toLowerCase()}
                                                onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #F1F5F9', background: '#F8FAFC', color: '#64748B', fontWeight: 700, fontSize: '13px', outline: 'none', cursor: 'pointer', appearance: 'none' }}
                                            >
                                                <option value="processing">Set status to Processing</option>
                                                <option value="shipped">Set status to Shipped</option>
                                                <option value="delivered">Set status to Delivered</option>
                                                <option value="cancelled">Cancel Order</option>
                                            </select>
                                            <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94A3B8' }}><Filter size={14} /></div>
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
