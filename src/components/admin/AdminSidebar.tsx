import { LayoutDashboard, Package, Settings, BarChart3, ChevronRight, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export type AdminView = 'dashboard' | 'inventory' | 'analytics' | 'settings';

interface AdminSidebarProps {
    currentView: AdminView;
    onViewChange: (view: AdminView) => void;
}

const menuItems: { id: AdminView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'inventory', label: 'Inventory', icon: <Package size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

const AdminSidebar = ({ currentView, onViewChange }: AdminSidebarProps) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/auth');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '220px',
            height: '100vh',
            padding: '24px',
            borderRight: '1px solid #f0f0f0',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100
        }}>
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '-0.02em', color: '#111' }}>Admin Panel</h2>
                <p style={{ fontSize: '11px', color: '#888', fontWeight: 600 }}>Tech Shop Management</p>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                {menuItems.map((item) => (
                    <motion.button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: 'none',
                            background: currentView === item.id ? '#111' : 'transparent',
                            color: currentView === item.id ? 'white' : '#666',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        {item.icon}
                        {item.label}
                    </motion.button>
                ))}
            </nav>

            {/* Profile Card Section */}
            <div style={{ position: 'relative', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                <AnimatePresence>
                    {isProfileOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            style={{
                                position: 'absolute',
                                bottom: 'calc(100% + 8px)',
                                left: 0,
                                right: 0,
                                background: '#ffffff',
                                border: '1px solid #eee',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 25px rgba(0,0,0,0.1)',
                                zIndex: 100
                            }}
                        >
                            <div style={{ padding: '8px' }}>
                                <Link to="/profile" style={{ textDecoration: 'none' }}>
                                    <button
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: '#555',
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f7')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <User size={16} /> Account
                                    </button>
                                </Link>
                                <div style={{ height: '1px', background: '#eee', margin: '4px 0' }}></div>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: '#ff4444',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fff5f5')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        background: '#f5f5f7',
                        borderRadius: '12px'
                    }}
                >
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', overflow: 'hidden' }}>
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                            alt="Profile"
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '12px', fontWeight: 800, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {profile?.email?.split('@')[0] || user?.email?.split('@')[0] || 'Admin'}
                        </p>
                        <p style={{ fontSize: '9px', color: '#888', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                            ADMINISTRATOR
                        </p>
                    </div>
                    <motion.div animate={{ rotate: isProfileOpen ? -90 : 0 }}>
                        <ChevronRight size={14} color="#aaa" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;
