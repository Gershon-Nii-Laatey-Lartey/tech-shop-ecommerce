import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import {
    Search,
    Bell,
    Sun,
    TrendingUp,
    MoreHorizontal,
    Users,
    Layers,
    ShoppingCart
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    RadialBarChart,
    RadialBar
} from 'recharts';

// --- TYPES ---
interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    sold_count?: number;
    rating?: number;
    revenue?: number;
}

interface DashboardStats {
    pageViews: number;
    visitors: number;
    clicks: number;
    orders: number;
    totalProfit: number;
    revenueHistory: { name: string; value: number }[];
    activeDays: { name: string; value: number }[];
    customerCategories: { name: string; value: number; color: string; percent: number }[];
    repeatRate: number;
}

// --- MOCK DATA FOR GRAPHS ---
const radialData = (value: number) => [
    {
        name: 'Repeat',
        value: value,
        fill: '#10b981',
    },
];

const FONT_FAMILY = "'Plus Jakarta Sans', 'Inter', sans-serif";

const formatCurrency = (value: number) => {
    if (value >= 1000) {
        return `GH₵ ${(value / 1000).toFixed(1)}K`;
    }
    return `GH₵ ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Admin = () => {
    const { isAdmin, user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        pageViews: 0,
        visitors: 0,
        clicks: 0,
        orders: 0,
        totalProfit: 0,
        revenueHistory: [],
        activeDays: [],
        customerCategories: [],
        repeatRate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            
            *::-webkit-scrollbar {
                width: 3px !important;
                height: 3px !important;
            }
            *::-webkit-scrollbar-track {
                background: transparent !important;
            }
            *::-webkit-scrollbar-thumb {
                background-color: #CBD5E1 !important;
                border-radius: 10px !important;
            }
            *::-webkit-scrollbar-button {
                display: none !important;
            }
            * {
                scrollbar-width: thin !important;
                scrollbar-color: #CBD5E1 transparent !important;
            }
        `;
        document.head.appendChild(style);
    }, []);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/');
        }
    }, [isAdmin, authLoading, navigate]);

    useEffect(() => {
        if (isAdmin) {
            fetchDashboardData();
        }
    }, [isAdmin]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const { data: orderItems, error: itemsError } = await supabase
                .from('order_items')
                .select('product_id, product_name, quantity, price');

            if (itemsError) throw itemsError;

            const productAggregates = (orderItems || []).reduce((acc: any, item) => {
                if (!acc[item.product_id]) {
                    acc[item.product_id] = {
                        id: item.product_id,
                        name: item.product_name,
                        sold_count: 0,
                        revenue: 0
                    };
                }
                acc[item.product_id].sold_count += item.quantity;
                acc[item.product_id].revenue += Number(item.price) * item.quantity;
                return acc;
            }, {});

            const sortedProducts = Object.values(productAggregates)
                .sort((a: any, b: any) => b.sold_count - a.sold_count)
                .slice(0, 5) as Product[];

            if (sortedProducts.length > 0) {
                const { data: pImages } = await supabase
                    .from('products')
                    .select('id, image, rating')
                    .in('id', sortedProducts.map(p => p.id));

                sortedProducts.forEach(p => {
                    const found = pImages?.find(img => img.id === p.id);
                    if (found) {
                        p.image = found.image;
                        p.rating = found.rating || 4.8;
                    }
                });
            }
            setProducts(sortedProducts);

            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: true });

            if (ordersError) throw ordersError;

            const totalRevenue = ordersData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
            const ordersCount = ordersData?.length || 0;

            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const revenueByDay: Record<string, number> = {};
            daysOfWeek.forEach(day => { revenueByDay[day] = 0; });

            ordersData?.forEach(order => {
                const date = new Date(order.created_at);
                const dayName = daysOfWeek[date.getDay()];
                revenueByDay[dayName] += Number(order.total_amount);
            });

            const revenueHistory = daysOfWeek.map(day => ({
                name: day,
                value: revenueByDay[day]
            }));

            const { data: analyticsData, error: analyticsError } = await supabase
                .from('site_analytics')
                .select('*');

            if (analyticsError) throw analyticsError;

            const pageViewsCount = analyticsData?.filter(e => e.event_type === 'page_view').length || 0;
            const clicksCount = analyticsData?.filter(e => e.event_type === 'click').length || 0;

            const visitsByDOW: Record<string, number> = {};
            daysOfWeek.forEach(day => { visitsByDOW[day] = 0; });
            analyticsData?.filter(e => e.event_type === 'page_view').forEach(event => {
                const date = new Date(event.created_at);
                const dayName = daysOfWeek[date.getDay()];
                visitsByDOW[dayName] += 1;
            });

            const activeDays = daysOfWeek.map(day => ({
                name: day,
                value: visitsByDOW[day]
            }));

            const { count: customerCount } = await supabase
                .from('customers')
                .select('*', { count: 'exact', head: true });

            const customerOrderCounts: Record<string, number> = {};
            ordersData?.forEach(order => {
                customerOrderCounts[order.customer_id] = (customerOrderCounts[order.customer_id] || 0) + 1;
            });

            const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
            const repeatRate = customerCount ? Math.round((repeatCustomers / customerCount) * 100) : 0;

            const uniqueVisitorsCount = new Set(analyticsData?.map(e => e.session_id)).size;

            setStats({
                pageViews: pageViewsCount,
                visitors: uniqueVisitorsCount || 0,
                clicks: clicksCount,
                orders: ordersCount,
                totalProfit: totalRevenue,
                revenueHistory,
                activeDays,
                repeatRate,
                customerCategories: [
                    { name: 'Potential', value: Math.floor((customerCount || 0) * 0.45), color: '#5544ff', percent: 65 },
                    { name: 'New Customers', value: Math.floor((customerCount || 0) * 0.35), color: '#10b981', percent: 45 },
                    { name: 'Returning', value: Math.floor((customerCount || 0) * 0.20), color: '#f97316', percent: 25 },
                ]
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !isAdmin) return null;

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#F8FAFC',
            fontFamily: FONT_FAMILY,
            color: '#000000'
        }}>
            <AdminSidebar activeTab="Dashboard" />

            <div className="admin-main-content" style={{ flex: 1, position: 'relative' }}>
                <header style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '24px 0',
                    position: 'sticky',
                    top: 0,
                    background: '#F8FAFC',
                    zIndex: 40,
                    gap: '20px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '400px' }}>
                        <Search size={18} color="#000000" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                background: '#ffffff',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                fontSize: '16px',
                                outline: 'none',
                                fontWeight: 500,
                                color: '#000000'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="hide-mobile" style={{ display: 'flex', gap: '12px' }}>
                            <NavIconButton icon={<Sun size={18} />} />
                            <NavIconButton icon={<Bell size={18} />} badge />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right' }} className="hide-mobile">
                                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{profile?.full_name || 'Admin'}</p>
                                <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Global Admin</p>
                            </div>
                            <img
                                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                                alt="avatar"
                                style={{ width: '40px', height: '40px', borderRadius: '12px', border: '2px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            />
                        </div>
                    </div>
                </header>

                <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.02em', color: '#0f172a' }}>Dashboard</h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '24px',
                    marginBottom: '24px'
                }}>
                    {loading ? (
                        <>
                            <SkeletonStatCard />
                            <SkeletonStatCard />
                            <SkeletonStatCard />
                            <SkeletonStatCard />
                        </>
                    ) : (
                        <>
                            <StatCard title="Page Views" value={stats.pageViews.toLocaleString()} trend="+ 15.6%" positive icon={<Layers size={20} color="#5544ff" />} />
                            <StatCard title="Visitors" value={stats.visitors.toLocaleString()} trend="+ 8.4%" positive icon={<Users size={20} color="#10b981" />} />
                            <StatCard title="Click" value={stats.clicks.toLocaleString()} trend="- 11.5%" positive={false} icon={<TrendingUp size={20} color="#f97316" />} />
                            <StatCard title="Orders" value={stats.orders.toLocaleString()} trend="+ 4.4%" positive icon={<ShoppingCart size={20} color="#8b5cf6" />} />
                        </>
                    )}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '24px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <DashboardCard title={loading ? "" : "Total Profit"}>
                            {loading ? (
                                <SkeletonContent height="300px" />
                            ) : (
                                <div style={{ marginTop: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                        <span style={{ fontSize: '32px', fontWeight: 800 }}>{formatCurrency(stats.totalProfit)}</span>
                                        <span style={{ fontSize: '14px', color: '#10b981', fontWeight: 700, background: '#f0fdf4', padding: '4px 8px', borderRadius: '6px' }}>+ 34.6%</span>
                                    </div>
                                    <div style={{ height: '240px', width: '100%' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats.revenueHistory}>
                                                <defs>
                                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#5544ff" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#5544ff" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <Area type="monotone" dataKey="value" stroke="#5544ff" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                                <YAxis hide />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </DashboardCard>

                        <DashboardCard title={loading ? "" : "Best Selling Products"}>
                            {loading ? (
                                <SkeletonContent height="400px" />
                            ) : (
                                <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                                    <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Name</th>
                                                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Sold</th>
                                                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(p => (
                                                <tr key={p.id} style={{ borderBottom: '1px solid #fafbfc' }}>
                                                    <td style={{ padding: '16px 0' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <img src={p.image} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                                                            <span style={{ fontSize: '14px', fontWeight: 700 }}>{p.name}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px 0', fontSize: '14px', fontWeight: 600 }}>{p.sold_count}</td>
                                                    <td style={{ padding: '16px 0', fontSize: '14px', fontWeight: 700, color: '#10b981' }}>{formatCurrency(p.revenue || 0)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </DashboardCard>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <DashboardCard title="Most Day Active">
                            {loading ? <SkeletonContent height="200px" /> : (
                                <div style={{ height: '220px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.activeDays}>
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {stats.activeDays.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 2 ? '#5544ff' : '#e2e8f0'} />
                                                ))}
                                            </Bar>
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '10px', border: 'none' }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </DashboardCard>

                        <DashboardCard title="Repeat Customer Rate">
                            {loading ? <SkeletonContent height="220px" /> : (
                                <div style={{ height: '220px', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={12} data={radialData(stats.repeatRate)} startAngle={90} endAngle={450}>
                                            <RadialBar background dataKey="value" cornerRadius={10} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                        <p style={{ fontSize: '32px', fontWeight: 800 }}>{stats.repeatRate}%</p>
                                    </div>
                                </div>
                            )}
                        </DashboardCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NavIconButton = ({ icon, badge }: { icon: React.ReactNode, badge?: boolean }) => (
    <div style={{ width: '40px', height: '40px', background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
        {icon}
        {badge && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', background: '#EF4444', border: '2px solid #ffffff', borderRadius: '50%' }} />}
    </div>
);

const StatCard = ({ title, value, trend, positive, icon }: { title: string, value: string, trend: string, positive: boolean, icon: React.ReactNode }) => (
    <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800 }}>{value}</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: positive ? '#10B981' : '#EF4444' }}>{trend}</span>
        </div>
    </div>
);

const DashboardCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #E2E8F0', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{title}</h3>
            <MoreHorizontal size={20} />
        </div>
        {children}
    </div>
);

const SkeletonStatCard = () => (
    <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #E2E8F0' }}>
        <div className="skeleton" style={{ width: '60px', height: '10px', marginBottom: '10px' }} />
        <div className="skeleton" style={{ width: '100px', height: '24px' }} />
    </div>
);

const SkeletonContent = ({ height }: { height: string }) => (
    <div className="skeleton" style={{ width: '100%', height, borderRadius: '12px' }} />
);

export default Admin;
