import { LayoutDashboard, Package, Settings, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

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
    return (
        <div className="admin-sidebar">
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '-0.02em', color: '#111' }}>Admin Panel</h2>
                <p style={{ fontSize: '11px', color: '#888', fontWeight: 600 }}>Tech Shop Management</p>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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

            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                <p style={{ fontSize: '10px', color: '#aaa', fontWeight: 600 }}>Version 1.0.0</p>
            </div>
        </div>
    );
};

export default AdminSidebar;
