import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    CheckCircle2,
    MapPin,
    Package,
    Truck,
    Clock,
    ShoppingBag
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    products: {
        image: string;
    } | null;
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

const OrderTracking = () => {
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products (
                            image
                        )
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setOrder(data);
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { label: 'Placed', icon: <ShoppingBag size={18} />, date: order?.created_at },
        { label: 'Paid', icon: <CheckCircle2 size={18} />, date: order?.created_at }, // Usually instantaneous
        { label: 'Shipped', icon: <Truck size={18} />, date: null },
        { label: 'Delivered', icon: <Package size={18} />, date: null },
    ];

    const getCurrentStep = () => {
        if (!order) return 0;
        switch (order.status.toLowerCase()) {
            case 'pending': return 0;
            case 'paid': return 1;
            case 'processing': return 1;
            case 'shipped': return 2;
            case 'delivered': return 3;
            default: return 0;
        }
    };

    const currentStepIndex = getCurrentStep();

    if (loading) {
        return (
            <div className="layout-with-sidebar">
                <Sidebar />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <div className="loader" />
                </div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="layout-with-sidebar">
            <Sidebar />
            <div className="tracking-page-content">
                <div className="tracking-container">
                    <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', textDecoration: 'none', fontWeight: 700, fontSize: '13px', marginBottom: '24px' }}>
                        <ChevronLeft size={14} /> Back to Orders
                    </Link>

                    <div className="order-header-section">
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Order {order.order_number}</h1>
                            <p style={{ color: '#64748B' }}>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="order-total-block">
                            <p style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', textAlign: 'right' }}>GH₵ {order.total_amount.toFixed(2)}</p>
                            <span style={{
                                display: 'inline-block',
                                padding: '6px 12px',
                                background: '#EFF6FF',
                                color: '#2563EB',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                marginTop: '4px',
                                float: 'right'
                            }}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    {/* TRACKING TIMELINE */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="tracking-card"
                    >
                        <div className="stepper-container">
                            {/* Connecting Line */}
                            <div className="stepper-line-bg">
                                <div style={{
                                    height: '100%',
                                    width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                                    background: '#5544ff',
                                    transition: 'width 0.5s ease',
                                    borderRadius: '2px'
                                }} />
                            </div>

                            {steps.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                return (
                                    <div key={step.label} className="stepper-item">
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            background: isCompleted ? '#5544ff' : '#fff',
                                            border: `2px solid ${isCompleted ? '#5544ff' : '#E2E8F0'}`,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isCompleted ? '#fff' : '#94A3B8',
                                            margin: '0 auto 16px',
                                            transition: 'all 0.3s ease',
                                            zIndex: 2,
                                            position: 'relative' // Ensure icon is above line
                                        }}>
                                            {step.icon}
                                        </div>
                                        <p className="step-label" style={{ color: isCompleted ? '#0F172A' : '#94A3B8' }}>{step.label}</p>
                                        {step.date && idx <= currentStepIndex && (
                                            <p className="step-date">
                                                {new Date(step.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>

                    <div className="details-grid">
                        {/* ITEMS LIST */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="items-card"
                        >
                            <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px', color: '#0F172A' }}>Items</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {order.order_items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '64px', height: '64px', background: '#F8FAFC', borderRadius: '12px', padding: '8px', border: '1px solid #F1F5F9', flexShrink: 0 }}>
                                            {item.products?.image ? (
                                                <img src={item.products.image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <ShoppingBag size={24} color="#CBD5E1" />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product_name}</p>
                                            <p style={{ fontSize: '12px', color: '#64748B' }}>Qty: {item.quantity}</p>
                                        </div>
                                        <p style={{ fontWeight: 800, fontSize: '14px' }}>GH₵ {item.price.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* SHIPPING INFO */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="shipping-card"
                        >
                            <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px', color: '#0F172A' }}>Delivery</h3>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ color: '#5544ff', flexShrink: 0 }}><MapPin size={20} /></div>
                                <div>
                                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Address</p>
                                    <p style={{ fontSize: '14px', color: '#0F172A', fontWeight: 600, lineHeight: 1.5 }}>
                                        {order.shipping_address}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ color: '#5544ff', flexShrink: 0 }}><Clock size={20} /></div>
                                <div>
                                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Estimated Arrival</p>
                                    <p style={{ fontSize: '14px', color: '#0F172A', fontWeight: 600 }}>
                                        {currentStepIndex === 3 ? 'Delivered' : 'Within 3-5 days'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>

            <style>{`
                .tracking-page-content {
                    flex: 1;
                    background: #F8FAFC;
                    min-height: 100vh;
                    padding: 40px;
                }
                .tracking-container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .order-header-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 32px;
                }
                
                .tracking-card {
                    background: #fff;
                    border-radius: 24px;
                    padding: 40px;
                    border: 1px solid #E2E8F0;
                    margin-bottom: 24px;
                }
                
                .stepper-container {
                    position: relative;
                    display: flex;
                    justify-content: space-between;
                }
                
                .stepper-line-bg {
                    position: absolute;
                    top: 24px;
                    left: 30px;
                    right: 30px;
                    height: 2px;
                    background: #E2E8F0;
                    z-index: 0;
                }
                
                .stepper-item {
                    position: relative;
                    z-index: 1;
                    text-align: center;
                    width: 100px;
                }
                
                .step-label {
                    font-weight: 800;
                    font-size: 14px;
                    margin-bottom: 4px;
                }
                .step-date {
                    font-size: 11px;
                    color: #64748B;
                }
                
                .details-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                }
                
                .items-card, .shipping-card {
                    background: #fff;
                    border-radius: 24px;
                    padding: 24px;
                    border: 1px solid #E2E8F0;
                }
                .shipping-card { height: fit-content; }

                @media (max-width: 768px) {
                    .tracking-page-content {
                        padding: 20px 16px;
                    }
                    .order-header-section {
                        flex-direction: column;
                        gap: 16px;
                    }
                    .order-total-block {
                        width: 100%;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .order-total-block p {
                        text-align: left !important;
                        font-size: 20px !important;
                    }
                    .order-total-block span {
                        float: none !important;
                        margin-top: 0 !important;
                    }
                    
                    .tracking-card {
                        padding: 24px 16px;
                        overflow-x: auto; /* Allow scroll if needed, though we shrink items */
                    }
                    
                    .stepper-container {
                        /* On very small screens, maybe stack? but stepper is hard to stack. Let's shrink. */
                        min-width: 320px; /* Force min width to keep layout intact, scroll if simpler */
                    }
                    
                    .stepper-item {
                        width: auto;
                        flex: 1;
                    }
                    
                    .step-label {
                        font-size: 11px;
                    }
                    
                    .details-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default OrderTracking;
