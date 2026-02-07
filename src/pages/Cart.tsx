import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ChevronLeft, ShieldCheck, Truck, MapPin } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';

const Cart = () => {
    const { items, total, removeFromCart, updateQuantity, selectedIds, toggleSelection, toggleSelectAll } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [shipping, setShipping] = useState<number | null>(null);
    const [defaultAddress, setDefaultAddress] = useState<any>(null);
    const [loadingShipping, setLoadingShipping] = useState(false);

    useEffect(() => {
        if (user) {
            fetchDefaultAddress();
        }
    }, [user]);

    useEffect(() => {
        if (defaultAddress && items.length > 0) {
            calculateShipping();
        }
    }, [defaultAddress, items]);

    const fetchDefaultAddress = async () => {
        const { data } = await supabase
            .from('shipping_addresses')
            .select('*')
            .eq('user_id', user?.id)
            .eq('is_default', true)
            .maybeSingle();

        if (data) setDefaultAddress(data);
    };

    const calculateShipping = async () => {
        try {
            setLoadingShipping(true);
            const { data: settingsData } = await supabase
                .from('admin_settings')
                .select('value')
                .eq('key', 'logistics_config')
                .single();

            const config = settingsData?.value;
            if (!config?.is_enabled || !config?.api_endpoint) {
                setShipping(0);
                return;
            }

            // Fetch zone names
            const { data: zone } = await supabase.from('logistics_zones').select('name').eq('id', defaultAddress.zone_id).single();
            const { data: subZone } = await supabase.from('logistics_zones').select('name').eq('id', defaultAddress.sub_zone_id).single();
            const { data: area } = await supabase.from('logistics_zones').select('name').eq('id', defaultAddress.area_id).single();

            const response = await fetch(config.api_endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location: { zone: zone?.name, sub_zone: subZone?.name, area: area?.name },
                    cart_total: total,
                    items_weight: items
                        .filter(item => selectedIds.includes(item.id))
                        .reduce((acc, item) => acc + (item.weight || 0) * item.quantity, 0)
                })
            });
            const data = await response.json();
            setShipping(data.delivery_fee ?? 0);
        } catch (err) {
            console.error('Error calculating shipping:', err);
            setShipping(0);
        } finally {
            setLoadingShipping(false);
        }
    };

    const grandTotal = total + (shipping || 0);

    return (
        <div className="layout-with-sidebar">
            <Sidebar />

            <div className="cart-main-content" style={{
                flex: 1,
                background: '#fff',
                minHeight: '100vh',
                padding: '24px 32px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%'
            }}>

                {/* Header */}
                <div className="cart-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.04em' }}>
                            Your Shopping Bag
                        </h1>
                        <p style={{ color: '#6B7280', marginTop: '4px', fontWeight: 500 }}>
                            {items.length === 0 ? 'Your cart is empty' : `You have ${items.length} unique items in your bag`}
                        </p>
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#5544ff',
                                fontWeight: 700,
                                fontSize: '14px'
                            }}
                        >
                            <ChevronLeft size={18} />
                            Continue Shopping
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="empty-cart-banner"
                        style={{
                            textAlign: 'center',
                            padding: '80px 40px',
                            background: '#F9FAFB',
                            borderRadius: '24px',
                            border: '2px dashed #E2E8F0',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#fff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
                        }}>
                            <ShoppingCart size={32} color="#D1D5DB" />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Your bag is empty</h2>
                        <p style={{ color: '#6B7280', marginBottom: '32px' }}>Looks like you haven't added anything to your bag yet.</p>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                background: '#5544ff',
                                color: '#fff',
                                padding: '14px 32px',
                                borderRadius: '12px',
                                border: 'none',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(85, 68, 255, 0.2)'
                            }}
                        >
                            Start Shopping
                        </button>
                    </motion.div>
                ) : (
                    <div className="cart-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: '32px',
                        alignItems: 'start'
                    }}>

                        {/* Items List */}
                        <div className="items-column" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {items.length > 0 && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    paddingBottom: '12px',
                                    borderBottom: '1px solid #F1F5F9'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === items.length && items.length > 0}
                                        onChange={() => toggleSelectAll()}
                                        style={{
                                            cursor: 'pointer',
                                            accentColor: '#5544ff'
                                        }}
                                    />
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748B' }}>
                                        Select All ({items.length})
                                    </span>
                                </div>
                            )}
                            <AnimatePresence mode='popLayout'>
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="cart-item-row"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            paddingBottom: '20px',
                                            borderBottom: '1px solid #F1F5F9'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => toggleSelection(item.id)}
                                            style={{
                                                cursor: 'pointer',
                                                accentColor: '#5544ff'
                                            }}
                                        />
                                        <div className="item-image-box" style={{
                                            width: '90px',
                                            height: '100px',
                                            background: '#F8FAFC',
                                            border: '1px solid #F1F5F9',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '12px',
                                            flexShrink: 0
                                        }}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                        </div>

                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                                            <div>
                                                <div className="item-info-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2px', gap: '12px' }}>
                                                    <Link to={`/product/${item.product_id}`} style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
                                                        <h3 className="item-name" style={{
                                                            fontSize: '16px',
                                                            fontWeight: 700,
                                                            color: '#0F172A',
                                                            margin: 0,
                                                            wordBreak: 'break-word',
                                                            overflow: 'hidden',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            lineHeight: 1.4
                                                        }}>{item.name}</h3>
                                                    </Link>
                                                    <p className="item-total-price" style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, whiteSpace: 'nowrap' }}>
                                                        GH₵ {(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                                {item.variant_name && (
                                                    <p style={{ fontSize: '13px', color: '#5544ff', fontWeight: 700, margin: '2px 0' }}>
                                                        {item.variant_name}
                                                    </p>
                                                )}
                                                <p className="item-unit-price" style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>GH₵ {item.price.toFixed(2)} unit price</p>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div className="qty-picker" style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    background: '#F1F5F9',
                                                    borderRadius: '12px',
                                                    padding: '4px',
                                                    border: '1px solid #E2E8F0'
                                                }}>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span style={{ width: '30px', textAlign: 'center', fontWeight: 800, fontSize: '15px' }}>{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="remove-btn"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#EF4444',
                                                        fontSize: '13px',
                                                        fontWeight: 800,
                                                        cursor: 'pointer',
                                                        padding: '8px'
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                    <span>Remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary */}
                        <div className="summary-column" style={{ position: 'sticky', top: '40px' }}>
                            <div className="summary-card" style={{
                                background: '#ffffff',
                                borderRadius: '32px',
                                padding: '32px',
                                border: '1px solid #F1F5F9',
                                boxShadow: '0 4px 30px rgba(0,0,0,0.03)'
                            }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginBottom: '24px', letterSpacing: '-0.02em' }}>Order Summary</h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748B', fontWeight: 600 }}>Subtotal</span>
                                        <span style={{ fontWeight: 800, color: '#0F172A' }}>GH₵ {total.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#64748B', fontWeight: 600 }}>Estimated Shipping</span>
                                        <span style={{ fontWeight: 800, color: shipping === 0 ? '#10B981' : '#0F172A' }}>
                                            {loadingShipping ? (
                                                <div className="skeleton" style={{ width: '80px', height: '18px' }} />
                                            ) : (
                                                shipping !== null ? `GH₵ ${shipping.toFixed(2)}` : (
                                                    defaultAddress ? (
                                                        <div className="skeleton" style={{ width: '60px', height: '18px' }} />
                                                    ) : 'Not calculated'
                                                )
                                            )}
                                        </span>
                                    </div>
                                    {defaultAddress && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                            <MapPin size={12} color="#94A3B8" />
                                            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                                                Shipping to {defaultAddress.city}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    height: '1px',
                                    background: '#F1F5F9',
                                    margin: '0 0 24px 0'
                                }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>Total</span>
                                    <span style={{ fontSize: '24px', fontWeight: 900, color: '#5544ff', letterSpacing: '-0.03em' }}>GH₵ {grandTotal.toFixed(2)}</span>
                                </div>

                                <button
                                    onClick={() => {
                                        if (!user) {
                                            navigate('/auth?redirect=checkout');
                                        } else {
                                            navigate('/checkout');
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        background: '#0F172A',
                                        color: '#fff',
                                        padding: '20px',
                                        borderRadius: '20px',
                                        border: 'none',
                                        fontSize: '16px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    Checkout Now
                                    <ArrowRight size={20} strokeWidth={2.5} />
                                </button>

                                <p style={{
                                    fontSize: '12px',
                                    color: '#94A3B8',
                                    marginTop: '20px',
                                    textAlign: 'center',
                                    fontWeight: 600
                                }}>
                                    Calculated at next step
                                </p>
                            </div>

                            {/* Trust Icons */}
                            <div className="cart-trust-badges" style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', padding: '0 8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ background: '#F0FDF4', padding: '8px', borderRadius: '10px' }}>
                                        <ShieldCheck size={16} color="#10B981" />
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>Secure</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ background: '#F0FDF4', padding: '8px', borderRadius: '10px' }}>
                                        <Truck size={16} color="#10B981" />
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>Fast Delivery</span>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                <style>{`
                                .cart-trust-badges {
                                    grid-template-columns: 1fr 1fr !important;
                                }
                            }

                            .cart-main-content {
                                flex: 1;
                                background: #fff;
                                min-height: 100vh;
                                padding: 40px;
                            }
                            .cart-container {
                                max-width: 1200px;
                                margin: 0 auto;
                                width: 100%;
                            }

                            @media (max-width: 900px) {
                                .cart-main-content {
                                    padding: 24px 16px !important;
                                }
                            }

                            @media (max-width: 768px) {
                                .cart-header {
                                flex-direction: column;
                                align-items: flex-start !important;
                                gap: 16px;
                                margin-bottom: 32px !important;
                            }
                            .cart-grid {
                                grid-template-columns: 1fr !important;
                                gap: 32px !important;
                            }
                            .cart-item-row {
                                gap: 16px !important;
                                position: relative;
                            }
                            .item-image-box {
                                width: 100px !important;
                                height: 120px !important;
                                border-radius: 20px !important;
                            }
                            .item-info-header {
                                flex-direction: column !important;
                                gap: 4px !important;
                            }
                            .item-name {
                                font-size: 15px !important;
                                -webkit-line-clamp: 3 !important;
                                margin-bottom: 4px !important;
                            }
                            .item-total-price {
                                font-size: 15px !important;
                            }
                            .item-unit-price {
                                font-size: 12px !important;
                            }
                            .qty-picker {
                                height: 40px;
                            }
                            .remove-btn span {
                                display: none;
                            }
                            .remove-btn {
                                padding: 8px !important;
                                background: #FEF2F2 !important;
                                border-radius: 10px !important;
                            }
                            .summary-column {
                                position: static !important;
                            }
                            .summary-card {
                                padding: 24px !important;
                                border-radius: 24px !important;
                            }
                            .cart-trust-badges {
                                grid-template-columns: 1fr 1fr !important;
                            }
                        }

                        input[type="checkbox"] {
                            appearance: none;
                            -webkit-appearance: none;
                            width: 18px;
                            height: 18px;
                            border: 2px solid #E2E8F0;
                            border-radius: 6px;
                            background-color: #fff;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                            position: relative;
                        }

                        input[type="checkbox"]:checked {
                            background-color: #5544ff;
                            border-color: #5544ff;
                            box-shadow: 0 4px 12px rgba(85, 68, 255, 0.3);
                        }

                        input[type="checkbox"]:checked::after {
                            content: '✓';
                            color: white;
                            font-size: 11px;
                            font-weight: 900;
                        }

                        input[type="checkbox"]:hover {
                            border-color: #5544ff;
                        }
                    `}</style>

            </div>
        </div>
    );
};

export default Cart;
