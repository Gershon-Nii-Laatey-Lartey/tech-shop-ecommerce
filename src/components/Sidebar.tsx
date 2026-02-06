import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Settings, User, LogOut, ChevronRight, ShoppingBag, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../contexts/CategoryContext';

const CategoryItem = ({ name, description }: { name: string, description?: string | null }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleCategoryClick = (_e: React.MouseEvent) => {
        // Stop bubbling so clicking the text navigates, but clicking the arrow toggles
        navigate(`/search?category=${encodeURIComponent(name)}`);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    color: isOpen ? 'var(--primary-color)' : '#aaa',
                    fontWeight: 700,
                    fontSize: '14px',
                    background: isOpen ? 'rgba(85, 68, 255, 0.05)' : 'transparent'
                }}
            >
                <div
                    onClick={handleCategoryClick}
                    style={{ flex: 1 }}
                >
                    {name}
                </div>
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ padding: '0 4px', display: 'flex', alignItems: 'center' }}
                >
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                        <ChevronDown size={14} />
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && description && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', paddingLeft: '12px' }}
                    >
                        <span
                            style={{
                                display: 'block',
                                padding: '8px 12px',
                                fontSize: '13px',
                                color: '#888',
                                fontWeight: 600,
                                lineHeight: 1.4
                            }}
                        >
                            {description}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Sidebar = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { categories } = useCategories();
    const { user, profile, signOut, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        setIsProfileOpen(false);
    };

    const handleSignIn = () => {
        navigate('/auth');
    };

    return (
        <aside className="sticky-sidebar">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Link to="/" style={{ color: 'var(--primary-color)', fontSize: '18px', fontWeight: 900, letterSpacing: '-0.03em', textDecoration: 'none', marginBottom: '10px' }}>
                    COLLECTIONS
                </Link>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {categories.map((cat) => (
                        <CategoryItem key={cat.id} name={cat.name} description={cat.description} />
                    ))}
                </div>

                {/* Admin Dashboard Link */}
                {isAdmin && (
                    <Link
                        to="/admin"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            background: '#fafafa',
                            color: '#1a1a1a',
                            border: '1px solid #f0f0f0',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: 800,
                            marginTop: '12px',
                            transition: 'all 0.2s',
                            letterSpacing: '0.02em'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f5f5f7';
                            e.currentTarget.style.borderColor = '#e0e0e0';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fafafa';
                            e.currentTarget.style.borderColor = '#f0f0f0';
                        }}
                    >
                        <Settings size={14} />
                        ADMIN
                    </Link>
                )}

            </div>

            {/* Profile Card Section - Always Visible */}
            <div style={{ position: 'relative', marginTop: 'auto' }}>
                {user && (
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ width: 0, x: -10 }}
                                animate={{ width: 180, x: 0 }}
                                exit={{ width: 0, x: -10 }}
                                style={{
                                    position: 'absolute',
                                    left: 'calc(100% + 12px)',
                                    bottom: 0,
                                    background: '#ffffff',
                                    border: '1px solid #eee',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 25px rgba(0,0,0,0.1)',
                                    zIndex: 100,
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <div style={{ padding: '8px', minWidth: '180px' }}>
                                    <div style={{ padding: '8px 12px', marginBottom: '4px' }}>
                                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#aaa', letterSpacing: '0.05em' }}>PREFERENCES</p>
                                    </div>
                                    <button
                                        onClick={() => { navigate('/orders'); setIsProfileOpen(false); }}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#555', transition: 'background 0.2s', border: 'none', background: 'transparent', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f7')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <ShoppingBag size={16} /> My Orders
                                    </button>
                                    <button
                                        onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#555', transition: 'background 0.2s', border: 'none', background: 'transparent', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f7')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <User size={16} /> Account
                                    </button>
                                    <button
                                        onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#555', transition: 'background 0.2s', border: 'none', background: 'transparent', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f7')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <Settings size={16} /> Settings
                                    </button>
                                    <button
                                        onClick={() => { navigate('/support'); setIsProfileOpen(false); }}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#555', transition: 'background 0.2s', border: 'none', background: 'transparent', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f7')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <HelpCircle size={16} /> Support
                                    </button>
                                    <div style={{ height: '1px', background: '#eee', margin: '4px 0' }}></div>
                                    <button
                                        onClick={handleLogout}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#ff4444', transition: 'background 0.2s', border: 'none', background: 'transparent', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#fff5f5')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                <div
                    className="profile-card"
                    onClick={user ? () => setIsProfileOpen(!isProfileOpen) : handleSignIn}
                    style={{
                        cursor: 'pointer',
                        margin: 0,
                        position: 'relative',
                        zIndex: 101,
                        padding: '8px 10px',
                        background: '#ffffff',
                        border: '1px solid #eee',
                        borderRadius: '16px',
                        transition: 'all 0.2s'
                    }}
                >
                    {user ? (
                        <>
                            <div className="profile-avatar" style={{ width: '32px', height: '32px' }}>
                                <img
                                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                                    alt="Profile"
                                    style={{ width: '100%', borderRadius: '10px' }}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {profile?.full_name || user.email?.split('@')[0] || 'User'}
                                </p>
                                <p style={{ fontSize: '9px', color: '#999', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                                    MEMBER
                                </p>
                            </div>
                            <motion.div animate={{ rotate: isProfileOpen ? 90 : 0 }}>
                                <ChevronRight size={14} color="#aaa" />
                            </motion.div>
                        </>
                    ) : (
                        <>
                            <div className="profile-avatar" style={{ width: '32px', height: '32px', background: '#f5f5f7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={18} color="#999" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    Sign In
                                </p>
                                <p style={{ fontSize: '9px', color: '#999', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                                    GET STARTED
                                </p>
                            </div>
                            <ChevronRight size={14} color="#aaa" />
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

