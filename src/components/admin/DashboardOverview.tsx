import { useEffect, useState } from 'react';
import { Package, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import { supabase } from '../../supabaseClient';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    created_at: string;
    stock_status?: string;
}

interface DashboardOverviewProps {
    onNavigateToInventory: () => void;
}

const DashboardOverview = ({ onNavigateToInventory }: DashboardOverviewProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('products')
            .select('id, name, price, category, created_at, stock_status')
            .order('created_at', { ascending: false });

        if (data) setProducts(data);
        setLoading(false);
    };

    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    const categories = [...new Set(products.map(p => p.category))].length;
    const lowStockItems = products.filter(p => p.stock_status === 'Low Stock' || p.stock_status === 'Out of Stock').length;

    // Generate recent activity from product creation dates
    const recentActivities = products.slice(0, 5).map(product => {
        const createdDate = new Date(product.created_at);
        const now = new Date();
        const diffMs = now.getTime() - createdDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        let timestamp = '';
        if (diffDays > 0) {
            timestamp = `${diffDays}d ago`;
        } else if (diffHours > 0) {
            timestamp = `${diffHours}h ago`;
        } else {
            timestamp = 'Just now';
        }

        return {
            id: product.id,
            type: 'create' as const,
            productName: product.name,
            timestamp
        };
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#888' }}>Loading dashboard...</div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px' }}>
                    Dashboard
                </h1>
                <p style={{ color: '#888', fontWeight: 600 }}>
                    Overview of your store performance
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <StatsCard
                    title="Total Products"
                    value={totalProducts}
                    subtitle="In catalogue"
                    icon={Package}
                    trend={{ value: 12, isPositive: true }}
                />
                <StatsCard
                    title="Inventory Value"
                    value={`$${totalValue.toLocaleString()}`}
                    subtitle="Total stock value"
                    icon={DollarSign}
                    variant="dark"
                />
                <StatsCard
                    title="Categories"
                    value={categories}
                    subtitle="Product categories"
                    icon={TrendingUp}
                />
                <StatsCard
                    title="Low Stock Alerts"
                    value={lowStockItems}
                    subtitle="Items need attention"
                    icon={AlertTriangle}
                    variant={lowStockItems > 0 ? 'accent' : 'default'}
                />
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'white',
                        borderRadius: '24px',
                        border: '1px solid #f0f0f0',
                        padding: '28px'
                    }}
                >
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#111', marginBottom: '24px' }}>
                        Quick Actions
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <motion.button
                            onClick={onNavigateToInventory}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                padding: '24px',
                                background: '#111',
                                color: 'white',
                                borderRadius: '16px',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            <Package size={24} />
                            <span style={{ fontSize: '13px', fontWeight: 700 }}>Add Product</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                padding: '24px',
                                background: '#f5f5f7',
                                color: '#111',
                                borderRadius: '16px',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            <TrendingUp size={24} />
                            <span style={{ fontSize: '13px', fontWeight: 700 }}>View Analytics</span>
                        </motion.button>
                        <motion.button
                            onClick={onNavigateToInventory}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                padding: '24px',
                                background: '#f5f5f7',
                                color: '#111',
                                borderRadius: '16px',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            <DollarSign size={24} />
                            <span style={{ fontSize: '13px', fontWeight: 700 }}>Manage Inventory</span>
                        </motion.button>
                    </div>

                    {/* Category Breakdown */}
                    <div style={{ marginTop: '28px' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Products by Category
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {[...new Set(products.map(p => p.category))].map(category => {
                                const count = products.filter(p => p.category === category).length;
                                return (
                                    <div
                                        key={category}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#f5f5f7',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 700
                                        }}
                                    >
                                        {category}: <span style={{ color: '#5544ff' }}>{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <RecentActivity activities={recentActivities} />
            </div>
        </motion.div>
    );
};

export default DashboardOverview;
