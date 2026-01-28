import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, Settings, User, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const categories = [
    { name: 'Laptops', sub: ['MacBook', 'Blade', 'Surface'] },
    { name: 'Audio', sub: ['Headphones', 'Earset', 'Speakers'] },
    { name: 'Wearables', sub: ['Watches', 'Bands'] },
    { name: 'Vision', sub: ['Goggles', 'Glasses'] }
];

const CategoryItem = ({ name, sub }: { name: string, sub?: string[] }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
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
                onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = '#f5f5f7'; }}
                onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
            >
                {name}
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDown size={14} />
                </motion.div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', paddingLeft: '12px' }}
                    >
                        {sub?.map(item => (
                            <Link
                                key={item}
                                to="/products"
                                style={{
                                    display: 'block',
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    color: '#888',
                                    fontWeight: 600,
                                    textDecoration: 'none'
                                }}
                            >
                                {item}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Sidebar = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/auth');
    };

    if (!user) {
        return (
            <aside className="sticky-sidebar">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Link to="/" style={{ color: 'var(--primary-color)', fontSize: '18px', fontWeight: 900, letterSpacing: '-0.03em', textDecoration: 'none', marginBottom: '10px' }}>
                        COLLECTIONS
                    </Link>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Link to="/products" style={{ padding: '10px 12px', fontSize: '14px', fontWeight: 800, color: '#333', textDecoration: 'none', background: '#f5f5f7', borderRadius: '12px' }}>
                            All Products
                        </Link>
                        {categories.map((cat) => (
                            <CategoryItem key={cat.name} name={cat.name} sub={cat.sub} />
                        ))}
                    </div>
                </div>
                <div style={{ marginTop: 'auto', padding: '20px' }}>
                    <Link to="/auth" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px',
                        background: 'black',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 800,
                        textDecoration: 'none',
                        justifyContent: 'center'
                    }}>
                        SIGN IN <ArrowRight size={16} />
                    </Link>
                </div>
            </aside>
        );
    }

    return (
        <aside className="sticky-sidebar">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Link to="/" style={{ color: 'var(--primary-color)', fontSize: '18px', fontWeight: 900, letterSpacing: '-0.03em', textDecoration: 'none', marginBottom: '10px' }}>
                    COLLECTIONS
                </Link>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link
                        to="/products"
                        style={{
                            padding: '10px 12px',
                            fontSize: '14px',
                            fontWeight: 800,
                            color: '#333',
                            textDecoration: 'none',
                            background: '#f5f5f7',
                            borderRadius: '12px'
                        }}
                    >
                        All Products
                    </Link>
                    {categories.map((cat) => (
                        <CategoryItem key={cat.name} name={cat.name} sub={cat.sub} />
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '40px', marginBottom: '20px' }}>
                <button style={{ width: '44px', height: '44px', background: '#f5f5f7', borderRadius: '14px', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={18} />
                </button>
                <button style={{ width: '44px', height: '44px', background: 'black', color: 'white', borderRadius: '14px', border: 'none', cursor: 'pointer' }}>
                    <ArrowRight size={18} />
                </button>
            </div>

            {/* Profile Card Section */}
            <div style={{ position: 'relative', marginTop: 'auto' }}>
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
                                <Link to="/profile" style={{ textDecoration: 'none' }}>
                                    <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#555', transition: 'background 0.2s', border: 'none', background: 'transparent', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f7')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                        <User size={16} /> Account
                                    </button>
                                </Link>
                                <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#555', transition: 'background 0.2s', border: 'none', background: 'transparent', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f7')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                    <Settings size={16} /> Settings
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

                <div
                    className="profile-card"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    style={{
                        cursor: 'pointer',
                        margin: 0,
                        position: 'relative',
                        zIndex: 101,
                        padding: '8px 10px',
                        background: '#ffffff',
                        border: '1px solid #eee',
                        borderRadius: '16px'
                    }}
                >
                    <div className="profile-avatar" style={{ width: '32px', height: '32px' }}>
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Profile" style={{ width: '100%', borderRadius: '10px' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {profile?.email?.split('@')[0] || user.email?.split('@')[0] || 'User'}
                        </p>
                        <p style={{ fontSize: '9px', color: '#999', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                            {profile?.role === 'admin' ? 'ADMINSTRATOR' : 'MEMBER'}
                        </p>
                    </div>
                    <motion.div animate={{ rotate: isProfileOpen ? 90 : 0 }}>
                        <ChevronRight size={14} color="#aaa" />
                    </motion.div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
