import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingBag,
    ArrowRight,
    Package
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import ReviewModal from '../components/ReviewModal';

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    // Join result
    products?: {
        id: string;
        image: string;
    };
}

interface Order {
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    shipping_address: string;
    order_items: OrderItem[];
}

const Orders = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewOrder, setReviewOrder] = useState<{ id: string, products: any[] } | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (user) {
            fetchOrders();
        } else {
            navigate('/auth');
        }
    }, [user, authLoading, navigate]);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products (
                            id,
                            image
                        )
                    )
                `)
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return { bg: '#FEF3C7', text: '#D97706', label: 'Processing' };
            case 'paid': return { bg: '#DBEAFE', text: '#2563EB', label: 'Processing' };
            case 'processing': return { bg: '#E0E7FF', text: '#4338CA', label: 'Processing' };
            case 'shipped': return { bg: '#F3E8FF', text: '#7E22CE', label: 'Shipped' };
            case 'delivered': return { bg: '#D1FAE5', text: '#059669', label: 'Delivered' };
            case 'cancelled': return { bg: '#FEE2E2', text: '#DC2626', label: 'Cancelled' };
            default: return { bg: '#F1F5F9', text: '#64748B', label: status };
        }
    };

    if (loading) {
        return (
            <div className="layout-with-sidebar">
                <Sidebar />
                <div style={{ flex: 1, padding: '40px' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '12px' }} />
                        <div className="skeleton" style={{ height: '20px', width: '300px', marginBottom: '32px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '24px' }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="layout-with-sidebar">
            <Sidebar />
            <div className="orders-page-content">
                <div className="orders-container">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                        <div>
                            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.04em' }}>My Orders</h1>
                            <p style={{ color: '#64748B', fontWeight: 600 }}>Track and manage your recent purchases</p>
                        </div>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5544ff', textDecoration: 'none', fontWeight: 800 }}>
                            <ShoppingBag size={20} /> <span className="hide-mobile">Continue Shopping</span>
                        </Link>
                    </div>

                    {orders.length === 0 ? (
                        <div style={{ background: '#fff', borderRadius: '32px', padding: '80px 40px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                            <div style={{ width: '80px', height: '80px', background: '#F8FAFC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#94A3B8' }}>
                                <ShoppingBag size={40} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginBottom: '12px' }}>No orders found</h2>
                            <p style={{ color: '#64748B', marginBottom: '32px' }}>You haven't placed any orders yet. Start shopping to see them here!</p>
                            <button onClick={() => navigate('/')} style={{ background: '#5544ff', color: '#fff', padding: '16px 32px', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Shop Now</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {orders.map((order) => {
                                const statusStyle = getStatusStyle(order.status);
                                return (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="order-card-row"
                                        whileHover={{ boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                    >
                                        {/* Column 1: ID & Date */}
                                        <div className="order-info-col">
                                            <p className="order-number">{order.order_number}</p>
                                            <p className="order-date">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>

                                        {/* Column 2: Thumbnails */}
                                        <div className="order-thumbnails">
                                            {order.order_items.map((item, idx) => (
                                                <div
                                                    key={item.id}
                                                    className="thumbnail-box"
                                                    style={{ display: idx > 2 ? 'none' : 'flex' }}
                                                >
                                                    {item.products?.image ? (
                                                        <img src={item.products.image} alt="" />
                                                    ) : (
                                                        <Package size={16} color="#CBD5E1" />
                                                    )}
                                                </div>
                                            ))}
                                            {order.order_items.length > 3 && (
                                                <div className="more-items-count">
                                                    +{order.order_items.length - 3}
                                                </div>
                                            )}
                                        </div>

                                        {/* Column 3: Status & Amount */}
                                        <div className="order-status-col">
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '4px 10px',
                                                background: statusStyle.bg,
                                                color: statusStyle.text,
                                                borderRadius: '8px',
                                                fontSize: '11px',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                marginBottom: '6px'
                                            }}>
                                                {statusStyle.label}
                                            </div>
                                            <p className="order-total">GH₵ {order.total_amount.toFixed(2)}</p>
                                        </div>

                                        {/* Column 4: Action */}
                                        <div className="order-action-col" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            {order.status === 'delivered' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setReviewOrder({
                                                            id: order.id,
                                                            products: order.order_items.map(item => ({
                                                                id: item.products?.id || '',
                                                                name: item.product_name,
                                                                image: item.products?.image || ''
                                                            }))
                                                        });
                                                    }}
                                                    style={{
                                                        padding: '8px 16px',
                                                        background: '#5544ff10',
                                                        color: '#5544ff',
                                                        border: 'none',
                                                        borderRadius: '10px',
                                                        fontSize: '13px',
                                                        fontWeight: 800,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Review
                                                </button>
                                            )}
                                            <button className="arrow-btn" onClick={() => navigate(`/orders/${order.id}`)}>
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {reviewOrder && (
                <ReviewModal
                    isOpen={!!reviewOrder}
                    onClose={() => setReviewOrder(null)}
                    orderId={reviewOrder.id}
                    products={reviewOrder.products}
                    onSuccess={() => fetchOrders()}
                />
            )}

            <style>{`
                .orders-page-content {
                    flex: 1;
                    background: #F8FAFC;
                    min-height: 100vh;
                    padding: 40px;
                }
                .orders-container {
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .order-card-row {
                    background: #fff;
                    border-radius: 20px;
                    padding: 24px;
                    border: 1px solid #E2E8F0;
                    display: grid;
                    grid-template-columns: 1fr 2fr 1fr auto;
                    align-items: center;
                    gap: 24px;
                    transition: box-shadow 0.2s;
                    cursor: pointer;
                }
                .order-number { font-size: 14px; font-weight: 900; color: #0F172A; margin: 0; }
                .order-date { font-size: 12px; color: #64748B; margin: 4px 0 0 0; }
                
                .order-thumbnails { display: flex; align-items: center; gap: 8px; }
                .thumbnail-box {
                    width: 48px; height: 48px;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 10px;
                    padding: 4px;
                    display: flex; align-items: center; justifyContent: center;
                }
                .thumbnail-box img { width: 100%; height: 100%; object-fit: contain; }
                .more-items-count { font-size: 12px; font-weight: 700; color: #64748B; margin-left: 4px; }

                .order-total { font-size: 15px; font-weight: 900; color: #0F172A; margin: 0; }
                
                .arrow-btn {
                    background: #F1F5F9; color: #0F172A;
                    border: none; width: 40px; height: 40px;
                    border-radius: 12px; cursor: pointer;
                    display: flex; align-items: center; justifyContent: center;
                }

                @media (max-width: 768px) {
                    .orders-page-content {
                        padding: 20px 16px;
                    }
                    .hide-mobile { display: none; }
                    
                    .order-card-row {
                        grid-template-columns: 1fr auto;
                        grid-template-areas: 
                            "info action"
                            "thumbs thumbs"
                            "status status";
                        gap: 16px;
                        padding: 16px;
                    }
                    
                    .order-info-col { grid-area: info; }
                    .order-action-col { grid-area: action; }
                    .order-thumbnails { grid-area: thumbs; }
                    .order-status-col { 
                        grid-area: status; 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: center;
                        padding-top: 12px;
                        border-top: 1px dashed #E2E8F0;
                    }
                    
                    /* Adjust elements for mobile */
                    .order-number { font-size: 16px; }
                    .thumbnail-box { width: 40px; height: 40px; }
                }
            `}</style>
        </div>
    );
};

export default Orders;
