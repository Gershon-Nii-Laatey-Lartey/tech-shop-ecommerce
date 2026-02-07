import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Compass,
    Inbox,
    Package,
    Users,
    ImageIcon,
    BarChart3,
    Percent,
    Settings,
    HelpCircle,
    PanelLeftClose,
    Menu,
    X,
    FolderTree,
    MessageSquare
} from 'lucide-react';

interface AdminSidebarProps {
    activeTab?: string;
}

const AdminSidebar = ({ activeTab }: AdminSidebarProps) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Header Toggle */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: 'white',
                borderBottom: '1px solid #F1F5F9',
                display: 'none',
                alignItems: 'center',
                padding: '0 20px',
                zIndex: 45,
                justifyContent: 'space-between',
                marginBottom: 0
            }} className="mobile-admin-header">
                <div
                    onClick={() => navigate('/admin')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                >
                    <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                        <div style={{ position: 'absolute', width: '16px', height: '16px', background: '#5544ff', borderRadius: '50% 50% 0 50%' }}></div>
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '16px', height: '16px', background: '#5544ff', borderRadius: '50% 0 50% 50%', opacity: 0.6 }}></div>
                        <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', border: '2px solid white' }}></div>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#000', letterSpacing: '-0.04em' }}>TECH SHOP</span>
                </div>
                <button onClick={() => setIsOpen(!isOpen)} style={{ padding: '8px', background: '#F8FAFC', borderRadius: '8px' }}>
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Sidebar Desktop/Mobile */}
            <aside
                className={`admin-sidebar-container ${isOpen ? 'open' : ''}`}
                style={{
                    width: '260px',
                    background: '#ffffff',
                    borderRight: '1px solid #F1F5F9',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    height: '100vh',
                    zIndex: 200,
                    padding: '0',
                    transition: 'transform 0.3s ease'
                }}
            >
                {/* Brand Header */}
                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                        onClick={() => navigate('/admin')}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    >
                        <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                            <div style={{ position: 'absolute', width: '16px', height: '16px', background: '#5544ff', borderRadius: '50% 50% 0 50%' }}></div>
                            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '16px', height: '16px', background: '#5544ff', borderRadius: '50% 0 50% 50%', opacity: 0.6 }}></div>
                            <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', border: '2px solid white' }}></div>
                        </div>
                        <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.04em', color: '#000000' }}>TECH SHOP</span>
                    </div>
                    <PanelLeftClose size={16} color="#000000" style={{ cursor: 'pointer' }} className="hide-mobile" />
                </div>

                <div style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <SidebarItem icon={<Compass />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => { navigate('/admin'); setIsOpen(false); }} />
                        <SidebarItem icon={<Inbox />} label="Orders" active={activeTab === 'Orders'} onClick={() => { navigate('/admin/orders'); setIsOpen(false); }} />
                        <SidebarItem icon={<Package />} label="Products" active={activeTab === 'Products'} onClick={() => { navigate('/admin/products'); setIsOpen(false); }} />
                        <SidebarItem icon={<FolderTree />} label="Categories" active={activeTab === 'Categories'} onClick={() => { navigate('/admin/categories'); setIsOpen(false); }} />
                        <SidebarItem icon={<Users />} label="Customers" active={activeTab === 'Customers'} onClick={() => { navigate('/admin/customers'); setIsOpen(false); }} />
                        <SidebarItem icon={<ImageIcon />} label="Content" active={activeTab === 'Content'} onClick={() => { navigate('/admin/content'); setIsOpen(false); }} />
                    </div>

                    <div style={{ margin: '20px 0', height: '1px', background: '#F1F5F9' }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' }}>
                        <SidebarItem icon={<BarChart3 />} label="Analytics" active={activeTab === 'Analytics'} onClick={() => { navigate('/admin/analytics'); setIsOpen(false); }} />
                        <SidebarItem icon={<Percent />} label="Discounts" active={activeTab === 'Discounts'} onClick={() => { navigate('/admin/discounts'); setIsOpen(false); }} />
                        <SidebarItem icon={<MessageSquare />} label="Reviews" active={activeTab === 'Reviews'} onClick={() => { navigate('/admin/reviews'); setIsOpen(false); }} />
                    </div>
                </div>

                <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '12px' }}>
                        <SidebarItem icon={<Settings />} label="Settings" active={activeTab === 'Settings'} onClick={() => { navigate('/admin/settings'); setIsOpen(false); }} />
                        <SidebarItem icon={<HelpCircle />} label="Help & Support" onClick={() => { setIsOpen(false); }} />
                    </div>

                    <button style={{
                        width: '100%',
                        padding: '10px',
                        background: '#5544ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(85, 68, 255, 0.2)',
                        transition: 'all 0.2s'
                    }}
                        onClick={() => navigate('/')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.background = '#4433ee';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.background = '#5544ff';
                        }}
                    >
                        View Store
                    </button>
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 150
                    }}
                />
            )}

            <style>{`
                @media (max-width: 1024px) {
                    .mobile-admin-header {
                        display: flex !important;
                    }
                    .admin-sidebar-container {
                        transform: translateX(-100%);
                        z-index: 500 !important;
                    }
                    .admin-sidebar-container.open {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </>
    );
};

const SidebarItem = ({ icon, label, active, badge, onClick }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string, onClick: () => void }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            background: active ? 'rgba(85, 68, 255, 0.1)' : 'transparent',
            color: active ? '#5544ff' : '#64748B',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            borderLeft: active ? '3px solid #5544ff' : '3px solid transparent',
            marginLeft: active ? '-3px' : '0'
        }}
        onMouseEnter={(e) => {
            if (!active) {
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.color = '#5544ff';
            }
        }}
        onMouseLeave={(e) => {
            if (!active) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#64748B';
            }
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ size?: number; strokeWidth?: number; color?: string }>, {
                size: 18,
                strokeWidth: active ? 2.5 : 2,
                color: active ? '#5544ff' : 'currentColor'
            }) : icon}
            <span style={{ fontSize: '14px', fontWeight: active ? 700 : 600 }}>{label}</span>
        </div>
        {badge && (
            <span style={{
                background: '#ecfdf5',
                color: '#10b981',
                fontSize: '12px',
                fontWeight: 700,
                padding: '1px 8px',
                borderRadius: '6px',
                border: '1px solid #d1fae5'
            }}>{badge}</span>
        )}
    </div>
);


export default AdminSidebar;
