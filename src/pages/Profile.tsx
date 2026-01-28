import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Shield,
    Clock,
    Smartphone,
    Globe,
    Save,
    Camera,
    CreditCard,
    MapPin,
    Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';

const Profile = () => {
    const { user, profile, loading } = useAuth();
    const [activeTab, setActiveTab] = useState<'account' | 'security' | 'orders'>('account');

    if (loading) return null;
    if (!user) return <div style={{ padding: '100px', textAlign: 'center' }}>Please sign in to view your profile.</div>;

    const sections = {
        account: [
            { icon: <User size={20} />, label: 'Full Name', value: profile?.email?.split('@')[0] || 'User', editable: true },
            { icon: <Mail size={20} />, label: 'Email Address', value: user.email, editable: false },
            { icon: <MapPin size={20} />, label: 'Shipping Address', value: 'Not set yet', editable: true },
            { icon: <Globe size={20} />, label: 'Language', value: 'English (US)', editable: true },
        ],
        security: [
            { icon: <Shield size={20} />, label: 'Role', value: profile?.role?.toUpperCase() || 'USER', editable: false },
            { icon: <Smartphone size={20} />, label: 'Two-Factor Auth', value: 'Disabled', editable: true },
            { icon: <Clock size={20} />, label: 'Last Login', value: new Date(user.last_sign_in_at || '').toLocaleDateString(), editable: false },
        ]
    };

    return (
        <div className="layout-with-sidebar">
            <Sidebar />

            <div style={{ flex: 1, padding: '40px 60px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
                        <div>
                            <h1 style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '12px' }}>Account Settings</h1>
                            <p style={{ color: '#aaa', fontWeight: 600, fontSize: '15px' }}>Manage your profile, security and preferences</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button style={{
                                padding: '12px 24px',
                                background: '#f5f5f7',
                                border: 'none',
                                borderRadius: '14px',
                                fontWeight: 800,
                                fontSize: '13px',
                                cursor: 'pointer'
                            }}>Cancel</button>
                            <button style={{
                                padding: '12px 24px',
                                background: 'black',
                                color: 'white',
                                border: 'none',
                                borderRadius: '14px',
                                fontWeight: 800,
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                            }}><Save size={16} /> Save Changes</button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '60px' }}>
                        {/* Sidebar Navigation */}
                        <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { id: 'account', label: 'General', icon: <User size={18} /> },
                                { id: 'security', label: 'Security', icon: <Shield size={18} /> },
                                { id: 'orders', label: 'Order History', icon: <Clock size={18} /> },
                                { id: 'payment', label: 'Payment Methods', icon: <CreditCard size={18} /> },
                                { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '14px 16px',
                                        borderRadius: '16px',
                                        border: 'none',
                                        background: activeTab === tab.id ? 'black' : 'transparent',
                                        color: activeTab === tab.id ? 'white' : '#666',
                                        fontWeight: 800,
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                background: 'white',
                                border: '1px solid #f0f0f0',
                                borderRadius: '32px',
                                padding: '40px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                            }}>
                                {activeTab === 'account' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '48px' }}>
                                            <div style={{ position: 'relative' }}>
                                                <div style={{ width: '100px', height: '100px', borderRadius: '40px', overflow: 'hidden', background: '#f5f5f7' }}>
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" style={{ width: '100%' }} />
                                                </div>
                                                <button style={{
                                                    position: 'absolute',
                                                    bottom: '-4px',
                                                    right: '-4px',
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '12px',
                                                    background: 'black',
                                                    color: 'white',
                                                    border: '4px solid white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer'
                                                }}>
                                                    <Camera size={14} />
                                                </button>
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '4px' }}>Profile Picture</h3>
                                                <p style={{ fontSize: '13px', color: '#aaa', fontWeight: 600 }}>JPG, GIF or PNG. 1MB max.</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                            {sections.account.map((item, i) => (
                                                <div key={i}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                                        <span style={{ color: '#aaa' }}>{item.icon}</span>
                                                        <label style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', letterSpacing: '0.05em' }}>{item.label.toUpperCase()}</label>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        readOnly={!item.editable}
                                                        defaultValue={item.value || ''}
                                                        style={{
                                                            width: '100%',
                                                            padding: '16px 20px',
                                                            borderRadius: '16px',
                                                            border: '2px solid #f5f5f7',
                                                            background: item.editable ? 'white' : '#f9f9fb',
                                                            fontWeight: 700,
                                                            fontSize: '14px',
                                                            outline: 'none',
                                                            color: item.editable ? 'black' : '#888'
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'security' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                        <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '32px' }}>Security & Privacy</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            {sections.security.map((item, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderRadius: '16px', background: '#f9f9fb' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                                            {item.icon}
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', letterSpacing: '0.05em' }}>{item.label}</p>
                                                            <p style={{ fontSize: '15px', fontWeight: 800 }}>{item.value}</p>
                                                        </div>
                                                    </div>
                                                    {item.editable && (
                                                        <button style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>Manage</button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'orders' && (
                                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '24px', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ccc' }}>
                                            <Clock size={32} />
                                        </div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '8px' }}>No orders found</h3>
                                        <p style={{ color: '#aaa', fontWeight: 600, fontSize: '14px' }}>Your shopping history will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
