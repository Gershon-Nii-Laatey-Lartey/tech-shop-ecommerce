import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Sidebar from '../components/Sidebar';

const Cart = () => {
    const { items, updateQuantity, removeFromCart, total, count } = useCart();

    const shipping = total > 500 ? 0 : 25;
    const tax = total * 0.08;
    const grandTotal = total + shipping + tax;

    return (
        <div className="layout-with-sidebar">
            <Sidebar />

            <div style={{ flex: 1, padding: '40px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
                        <div>
                            <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontWeight: 700, fontSize: '12px', textDecoration: 'none', marginBottom: '16px', textTransform: 'uppercase' }}>
                                <ChevronLeft size={16} /> Continue Shopping
                            </Link>
                            <h1 style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-0.04em' }}>Your Basket</h1>
                            <p style={{ color: '#aaa', fontWeight: 600 }}>{count} items ready for checkout</p>
                        </div>
                    </div>

                    {items.length === 0 ? (
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
                                <ShoppingBag size={40} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '12px' }}>Your basket is empty</h2>
                            <p style={{ color: '#aaa', fontWeight: 600, marginBottom: '32px' }}>Looks like you haven't added anything yet.</p>
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
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '48px', alignItems: 'start' }}>
                            {/* Items List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <AnimatePresence>
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            style={{
                                                display: 'flex',
                                                gap: '24px',
                                                padding: '24px',
                                                background: 'white',
                                                borderRadius: '24px',
                                                border: '1px solid #f0f0f0',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div style={{ width: '100px', height: '100px', background: '#f5f5f7', borderRadius: '16px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '4px' }}>{item.name}</h3>
                                                <p style={{ fontSize: '13px', color: '#aaa', fontWeight: 700, textTransform: 'uppercase' }}>{item.variant_id ? 'Custom Spec' : 'Standard Spec'}</p>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f7', borderRadius: '12px', padding: '4px' }}>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            style={{ width: '32px', height: '32px', borderRadius: '10px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span style={{ width: '32px', textAlign: 'center', fontSize: '14px', fontWeight: 800 }}>{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            style={{ width: '32px', height: '32px', borderRadius: '10px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800 }}
                                                    >
                                                        <Trash2 size={16} /> REMOVE
                                                    </button>
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '20px', fontWeight: 900 }}>${(item.price * item.quantity).toLocaleString()}</p>
                                                <p style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>${item.price.toLocaleString()} ea.</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Summary Card */}
                            <div style={{ position: 'sticky', top: '40px' }}>
                                <div style={{
                                    background: 'black',
                                    color: 'white',
                                    borderRadius: '32px',
                                    padding: '40px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                                }}>
                                    <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '32px' }}>Order Summary</h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontWeight: 700, fontSize: '14px' }}>
                                            <span>Subtotal</span>
                                            <span style={{ color: 'white' }}>${total.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontWeight: 700, fontSize: '14px' }}>
                                            <span>Shipping</span>
                                            <span style={{ color: 'white' }}>{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontWeight: 700, fontSize: '14px' }}>
                                            <span>Estimated Tax (8%)</span>
                                            <span style={{ color: 'white' }}>${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>

                                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '32px' }}></div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#888' }}>Total Amount</span>
                                        <span style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em' }}>${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>

                                    <button style={{
                                        width: '100%',
                                        height: '64px',
                                        background: 'white',
                                        color: 'black',
                                        borderRadius: '20px',
                                        fontSize: '16px',
                                        fontWeight: 900,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        Checkout <ArrowRight size={20} />
                                    </button>

                                    <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                                        <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }}></div>
                                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secure Checkout Guaranteed</p>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '24px',
                                    padding: '24px',
                                    background: '#f9f9fb',
                                    borderRadius: '24px',
                                    border: '1px solid #f0f0f0'
                                }}>
                                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#666', lineHeight: 1.5 }}>
                                        <span style={{ color: 'black', fontWeight: 900 }}>Free shipping</span> on orders over $500. Add more items to qualify.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cart;
