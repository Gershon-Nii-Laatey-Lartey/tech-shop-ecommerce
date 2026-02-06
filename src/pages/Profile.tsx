import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    LogOut,
    ShoppingBag,
    Settings,
    ChevronRight,
    Package,
    Clock,
    CheckCircle,
    Mail,
    Phone,
    MapPin,
    Trash2,
    Plus,
    X,
    Home
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    order_items: {
        product_name: string;
        quantity: number;
        price: number;
    }[];
}

interface Address {
    id: string;
    full_name: string;
    phone: string;
    address_line: string;
    city: string;
    is_default: boolean;
}

const Profile = () => {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'orders' | 'settings' | 'addresses'>('orders');
    const [orders, setOrders] = useState<Order[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddingAddress, setIsAddingAddress] = useState(false);

    // New Address Form State
    const [newAddress, setNewAddress] = useState({
        full_name: '',
        phone: '',
        address_line: '',
        city: '',
        is_default: false
    });

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        fetchOrders();
        fetchAddresses();

        // Pre-fill name if profile loaded
        if (profile?.full_name) {
            setNewAddress(prev => ({ ...prev, full_name: profile.full_name || '' }));
        }
    }, [user, navigate, profile]);

    const fetchOrders = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    created_at,
                    total_amount,
                    status,
                    order_items (
                        product_name,
                        quantity,
                        price
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('shipping_addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false });

        if (!error && data) {
            setAddresses(data);
        }
    };

    const handleAddAddress = async () => {
        if (!newAddress.address_line || !newAddress.city || !newAddress.phone) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('shipping_addresses')
                .insert([{
                    user_id: user?.id,
                    ...newAddress
                }])
                .select()
                .single();

            if (error) throw error;

            setAddresses([data, ...addresses]);
            setIsAddingAddress(false);
            // Reset form
            setNewAddress({
                full_name: profile?.full_name || '',
                phone: '',
                address_line: '',
                city: '',
                is_default: false
            });
        } catch (error) {
            console.error('Error adding address:', error);
            alert('Failed to save address');
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const { error } = await supabase
                .from('shipping_addresses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setAddresses(addresses.filter(addr => addr.id !== id));
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="layout-with-sidebar">
            <Sidebar />

            <div className="profile-main-content">
                <div className="profile-container">
                    {/* Hero Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="profile-hero"
                    >
                        <div className="profile-info-section">
                            <div className="profile-avatar-large">
                                <img
                                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                                    alt="avatar"
                                />
                                <div className="status-indicator" />
                            </div>
                            <div className="profile-text-details">
                                <h1>{profile?.full_name || 'Tech Enthusiast'}</h1>
                                <p className="email-meta"><Mail size={14} /> {user.email}</p>
                                <div className="profile-badges">
                                    <span className="badge-premium">Premium Member</span>
                                    {profile?.role === 'admin' && <span className="badge-admin">Admin</span>}
                                </div>
                            </div>
                        </div>
                        <button onClick={handleSignOut} className="sign-out-btn">
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </motion.div>

                    {/* Content Section */}
                    <div className="profile-content-grid">
                        {/* Sidebar Navigation */}
                        <div className="profile-nav-card shadow-sm">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                            >
                                <div className="nav-icon-box"><ShoppingBag size={18} /></div>
                                <span>Order History</span>
                                <ChevronRight size={16} className="arrow" />
                            </button>
                            <button
                                onClick={() => setActiveTab('addresses')}
                                className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                            >
                                <div className="nav-icon-box"><MapPin size={18} /></div>
                                <span>Shipping Addresses</span>
                                <ChevronRight size={16} className="arrow" />
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                            >
                                <div className="nav-icon-box"><Settings size={18} /></div>
                                <span>Account Settings</span>
                                <ChevronRight size={16} className="arrow" />
                            </button>
                        </div>

                        {/* Main View */}
                        <div className="profile-view-area">
                            <AnimatePresence mode="wait">
                                {activeTab === 'orders' ? (
                                    <motion.div
                                        key="orders"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="orders-list"
                                    >
                                        <div className="section-header">
                                            <h2>Recent Orders</h2>
                                            <span className="order-count">{orders.length} orders total</span>
                                        </div>

                                        {loading ? (
                                            <div className="order-skeleton-list">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="skeleton order-skeleton" />
                                                ))}
                                            </div>
                                        ) : orders.length > 0 ? (
                                            <div className="order-cards-container">
                                                {orders.map((order) => (
                                                    <div
                                                        key={order.id}
                                                        className="order-card shadow-sm"
                                                        onClick={() => navigate(`/orders/${order.id}`)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div className="order-header">
                                                            <div className="order-id-block">
                                                                <Package size={16} />
                                                                <span>Order #{order.id.slice(0, 8)}</span>
                                                            </div>
                                                            <div className={`status-pill ${order.status.toLowerCase()}`}>
                                                                {order.status === 'Delivered' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                                {order.status}
                                                            </div>
                                                        </div>
                                                        <div className="order-body">
                                                            <div className="item-previews">
                                                                {order.order_items.map((item, idx) => (
                                                                    <div key={idx} className="order-item-row">
                                                                        <span className="item-name">{item.product_name}</span>
                                                                        <span className="item-qty">x{item.quantity}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="order-footer">
                                                            <div className="order-date">
                                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </div>
                                                            <div className="order-total">GH₵ {order.total_amount.toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="empty-state">
                                                <div className="empty-icon-box"><ShoppingBag size={48} /></div>
                                                <h3>No orders yet</h3>
                                                <p>When you buy items, they'll show up here.</p>
                                                <button onClick={() => navigate('/')} className="shop-now-btn">Start Shopping</button>
                                            </div>
                                        )}
                                    </motion.div>
                                ) : activeTab === 'addresses' ? (
                                    <motion.div
                                        key="addresses"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <div className="section-header">
                                            <h2>Shipping Addresses</h2>
                                            <button onClick={() => setIsAddingAddress(true)} className="add-btn">
                                                <Plus size={16} /> Add New
                                            </button>
                                        </div>

                                        {/* New Address Form */}
                                        <AnimatePresence>
                                            {isAddingAddress && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    style={{ overflow: 'hidden', marginBottom: 20 }}
                                                >
                                                    <div className="address-form-card">
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                                            <h3>New Address</h3>
                                                            <button onClick={() => setIsAddingAddress(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                                                        </div>
                                                        <div className="form-grid">
                                                            <input
                                                                placeholder="Full Name"
                                                                value={newAddress.full_name}
                                                                onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })}
                                                            />
                                                            <input
                                                                placeholder="Phone Number"
                                                                value={newAddress.phone}
                                                                onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                                            />
                                                            <input
                                                                placeholder="City"
                                                                value={newAddress.city}
                                                                onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                                            />
                                                            <input
                                                                placeholder="Address Line / Street"
                                                                className="full-width"
                                                                value={newAddress.address_line}
                                                                onChange={e => setNewAddress({ ...newAddress, address_line: e.target.value })}
                                                            />
                                                        </div>
                                                        <button onClick={handleAddAddress} className="save-btn">Save Address</button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="addresses-grid">
                                            {addresses.length === 0 && !isAddingAddress && (
                                                <div className="empty-state">
                                                    <div className="empty-icon-box"><MapPin size={48} /></div>
                                                    <h3>No addresses details</h3>
                                                    <p>Add a shipping address for faster checkout.</p>
                                                    <button onClick={() => setIsAddingAddress(true)} className="shop-now-btn">Add Address</button>
                                                </div>
                                            )}

                                            {addresses.map(addr => (
                                                <div key={addr.id} className="address-card">
                                                    <div className="address-icon"><Home size={20} /></div>
                                                    <div className="address-details">
                                                        <h4>{addr.city}</h4>
                                                        <p>{addr.address_line}</p>
                                                        <p className="sub-text">{addr.full_name} • {addr.phone}</p>
                                                    </div>
                                                    <button onClick={() => handleDeleteAddress(addr.id)} className="delete-icon-btn">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="settings"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="settings-view"
                                    >
                                        <div className="section-header">
                                            <h2>Account Settings</h2>
                                        </div>

                                        <div className="settings-form shadow-sm">
                                            <div className="input-group">
                                                <label>Full Name</label>
                                                <div className="input-wrapper">
                                                    <User size={18} />
                                                    <input type="text" defaultValue={profile?.full_name || ''} placeholder="Your Name" />
                                                </div>
                                            </div>
                                            <div className="input-group">
                                                <label>Email Address</label>
                                                <div className="input-wrapper disabled">
                                                    <Mail size={18} />
                                                    <input type="email" value={user.email || ''} disabled />
                                                </div>
                                            </div>
                                            <div className="input-group">
                                                <label>Phone Number</label>
                                                <div className="input-wrapper">
                                                    <Phone size={18} />
                                                    <input type="tel" placeholder="+1 (555) 000-0000" />
                                                </div>
                                            </div>
                                            <button className="save-settings-btn">Save Changes</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .profile-main-content {
                    flex: 1;
                    background: #f8fafc;
                    min-height: 100vh;
                    padding: 40px;
                }

                .profile-container {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .profile-hero {
                    background: white;
                    border-radius: 32px;
                    padding: 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    border: 1px solid #f1f5f9;
                }

                .profile-info-section {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }

                .profile-avatar-large {
                    position: relative;
                    width: 100px;
                    height: 100px;
                }

                .profile-avatar-large img {
                    width: 100%;
                    height: 100%;
                    border-radius: 28px;
                    object-fit: cover;
                    background: #F1F5F9;
                }

                .status-indicator {
                    position: absolute;
                    bottom: -4px;
                    right: -4px;
                    width: 20px;
                    height: 20px;
                    background: #10B981;
                    border: 4px solid white;
                    border-radius: 50%;
                }

                .profile-text-details h1 {
                    font-size: 28px;
                    font-weight: 900;
                    color: #0F172A;
                    letter-spacing: -0.04em;
                    margin-bottom: 4px;
                }

                .email-meta {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                    color: #64748B;
                    font-weight: 500;
                    margin-bottom: 12px;
                }

                .profile-badges {
                    display: flex;
                    gap: 8px;
                }

                .badge-premium {
                    padding: 4px 12px;
                    background: #F0FDF4;
                    color: #166534;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    border: 1px solid #DCFCE7;
                }

                .badge-admin {
                    padding: 4px 12px;
                    background: #EFF6FF;
                    color: #1E40AF;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    border: 1px solid #DBEAFE;
                }

                .sign-out-btn {
                    padding: 12px 20px;
                    background: #FEF2F2;
                    color: #991B1B;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    cursor: pointer;
                    border: none;
                }

                .sign-out-btn:hover {
                    background: #FEE2E2;
                }

                .profile-content-grid {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 32px;
                    align-items: start;
                }

                .profile-nav-card {
                    background: white;
                    border-radius: 24px;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    border: 1px solid #f1f5f9;
                }

                .nav-item {
                    width: 100%;
                    padding: 14px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-radius: 16px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #64748B;
                    transition: all 0.2s;
                    text-align: left;
                    background: none;
                    border: none;
                    cursor: pointer;
                }

                .nav-item:hover {
                    background: #F8FAFC;
                    color: #0F172A;
                }

                .nav-item.active {
                    background: #5544ff;
                    color: white;
                }

                .nav-icon-box {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .nav-item.active .nav-icon-box {
                    background: rgba(255,255,255,0.2);
                    border-radius: 8px;
                }

                .arrow {
                    margin-left: auto;
                    opacity: 0.5;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-left: 4px;
                }

                .section-header h2 {
                    font-size: 22px;
                    font-weight: 800;
                    color: #0F172A;
                    letter-spacing: -0.03em;
                }

                .order-count {
                    font-size: 13px;
                    color: #94A3B8;
                    font-weight: 600;
                }

                .order-cards-container, .addresses-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                }

                .order-card, .address-card {
                    background: white;
                    border-radius: 20px;
                    padding: 24px;
                    border: 1px solid #f1f5f9;
                    transition: transform 0.2s;
                }
                
                .address-card {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .order-card:hover {
                    transform: translateY(-2px);
                }

                .order-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    padding-bottom: 16px;
                    border-bottom: 1px dashed #E2E8F0;
                }

                .order-id-block {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 700;
                    font-size: 15px;
                    color: #0F172A;
                }

                .status-pill {
                    padding: 4px 10px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    text-transform: uppercase;
                }

                .status-pill.delivered { background: #ECFDF5; color: #059669; }
                .status-pill.pending { background: #FFFBEB; color: #D97706; }

                .order-item-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }

                .item-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #475569;
                }

                .item-qty {
                    font-size: 13px;
                    font-weight: 700;
                    color: #94A3B8;
                }

                .order-footer {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid #F1F5F9;
                }

                .order-date {
                    font-size: 13px;
                    color: #94A3B8;
                    font-weight: 600;
                }

                .order-total {
                    font-size: 18px;
                    font-weight: 900;
                    color: #0F172A;
                }

                .settings-form {
                    background: white;
                    border-radius: 24px;
                    padding: 32px;
                    border: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .input-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 700;
                    color: #0F172A;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #F8FAFC;
                    padding: 0 16px;
                    border-radius: 12px;
                    border: 2px solid #F1F5F9;
                    transition: all 0.2s;
                }

                .input-wrapper:focus-within {
                    border-color: #5544ff;
                    background: white;
                }

                .input-wrapper.disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .input-wrapper input {
                    flex: 1;
                    height: 48px;
                    background: none;
                    border: none;
                    outline: none;
                    font-size: 14px;
                    font-weight: 600;
                    color: #0F172A;
                }

                .save-settings-btn {
                    margin-top: 12px;
                    background: #5544ff;
                    color: white;
                    height: 52px;
                    border-radius: 14px;
                    font-size: 15px;
                    font-weight: 800;
                    box-shadow: 0 4px 12px rgba(85, 68, 255, 0.2);
                    border: none;
                    cursor: pointer;
                }


                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    background: white;
                    border-radius: 32px;
                    border: 1px dashed #CBD5E1;
                }

                .empty-icon-box {
                    width: 80px;
                    height: 80px;
                    background: #F8FAFC;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    color: #94A3B8;
                }

                .shop-now-btn {
                    margin-top: 24px;
                    padding: 12px 32px;
                    background: #5544ff;
                    color: white;
                    border-radius: 12px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                }

                .shadow-sm {
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                
                .add-btn {
                    background: #F1F5F9;
                    color: #0F172A;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 13px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .address-form-card {
                    background: white;
                    padding: 24px;
                    border-radius: 20px;
                    border: 1px solid #E2E8F0;
                }
                
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 20px;
                }
                
                .form-grid input {
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    padding: 12px 16px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 500;
                    outline: none;
                }
                
                .form-grid input.full-width {
                    grid-column: span 2;
                }
                
                .save-btn {
                    background: #0F172A;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 14px;
                }
                
                .address-icon {
                    width: 48px;
                    height: 48px;
                    background: #F8FAFC;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748B;
                }
                
                .address-details {
                    flex: 1;
                }
                
                .address-details h4 {
                    font-size: 16px;
                    font-weight: 800;
                    color: #0F172A;
                    margin-bottom: 4px;
                }
                
                .address-details p {
                    font-size: 14px;
                    color: #475569;
                    margin-bottom: 2px;
                } 
                
                .address-details p.sub-text {
                    font-size: 13px;
                    color: #94A3B8;
                    font-weight: 600;
                }
                
                .delete-icon-btn {
                    background: none;
                    border: none;
                    color: #CBD5E1;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                
                .delete-icon-btn:hover {
                    background: #FEF2F2;
                    color: #EF4444;
                }

                @media (max-width: 900px) {
                    .profile-main-content {
                        padding: 16px 8px;
                    }
                    .profile-hero {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                        padding: 20px;
                    }
                    .profile-content-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                    .profile-nav-card {
                        flex-direction: row;
                        overflow-x: auto;
                        padding: 4px;
                        background: transparent;
                        border: none;
                        box-shadow: none;
                        gap: 8px;
                        margin: 0 -16px;
                        padding: 4px 16px;
                    }
                    .profile-nav-card::-webkit-scrollbar { display: none; }
                    .nav-item {
                        white-space: nowrap;
                        padding: 10px 16px;
                        width: auto;
                        flex-shrink: 0;
                        background: white;
                        border: 1px solid #f1f5f9;
                    }
                    .nav-item.active {
                        background: #5544ff;
                        border-color: #5544ff;
                    }
                    .arrow { display: none; }
                }

                @media (max-width: 600px) {
                    .profile-avatar-large {
                        width: 80px;
                        height: 80px;
                    }
                    .profile-text-details h1 {
                        font-size: 22px;
                    }
                    .profile-info-section {
                        gap: 16px;
                    }
                    .sign-out-btn {
                        width: 100%;
                        justify-content: center;
                    }
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .form-grid input.full-width {
                        grid-column: span 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default Profile;
