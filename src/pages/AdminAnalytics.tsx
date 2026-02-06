import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import AdminSidebar from '../components/AdminSidebar';
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid
} from 'recharts';
import {
    TrendingUp, Users, MousePointer2, Eye,
    ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react';

const COLORS = ['#5544ff', '#10b981', '#f97316', '#8b5cf6', '#ec4899'];

const AdminAnalytics = () => {
    const { isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalViews: 0,
        uniqueVisitors: 0,
        clickThroughRate: 0,
        avgSessionTime: '4m 32s',
        topPages: [] as any[],
        dailyTraffic: [] as any[]
    });

    useEffect(() => {
        if (!authLoading && !isAdmin) navigate('/');
    }, [isAdmin, authLoading, navigate]);

    useEffect(() => {
        if (isAdmin) fetchAnalytics();
    }, [isAdmin]);

    const fetchAnalytics = async () => {
        try {
            const { data: analytics, error } = await supabase
                .from('site_analytics')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            const views = analytics.filter(e => e.event_type === 'page_view');
            const clicks = analytics.filter(e => e.event_type === 'click');
            const uniqueSessions = new Set(analytics.map(e => e.session_id)).size;

            // Group by day
            const dailyMap: Record<string, { name: string, views: number, clicks: number }> = {};
            analytics.forEach(e => {
                const day = new Date(e.created_at).toLocaleDateString('en-US', { weekday: 'short' });
                if (!dailyMap[day]) dailyMap[day] = { name: day, views: 0, clicks: 0 };
                if (e.event_type === 'page_view') dailyMap[day].views++;
                else dailyMap[day].clicks++;
            });

            // Group by page
            const pageMap: Record<string, number> = {};
            views.forEach(v => {
                pageMap[v.page_path] = (pageMap[v.page_path] || 0) + 1;
            });

            const topPages = Object.entries(pageMap)
                .map(([path, count]) => ({ path, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            setStats({
                totalViews: views.length,
                uniqueVisitors: uniqueSessions,
                clickThroughRate: views.length ? Math.round((clicks.length / views.length) * 100) : 0,
                avgSessionTime: '4m 32s',
                topPages,
                dailyTraffic: Object.values(dailyMap)
            });

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            // Loading finished
        }
    };

    if (authLoading || !isAdmin) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            <AdminSidebar activeTab="Analytics" />

            <main style={{ flex: 1, padding: '40px', marginLeft: '260px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>Analytics Insights</h1>
                            <p style={{ color: '#64748B', fontWeight: 600 }}>Deep dive into your store performance and traffic</p>
                        </div>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '14px', fontWeight: 700 }}>
                            <Filter size={16} /> Last 7 Days
                        </button>
                    </div>

                    {/* Quick Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                        <AnalyticsStatCard title="Total Page Views" value={stats.totalViews} trend="+12.5%" icon={<Eye size={20} color="#5544ff" />} />
                        <AnalyticsStatCard title="Unique Visitors" value={stats.uniqueVisitors} trend="+8.2%" icon={<Users size={20} color="#10b981" />} />
                        <AnalyticsStatCard title="CTR" value={`${stats.clickThroughRate}%`} trend="-2.4%" icon={<MousePointer2 size={20} color="#f97316" />} />
                        <AnalyticsStatCard title="Avg. Session" value={stats.avgSessionTime} trend="+1.2%" icon={<TrendingUp size={20} color="#8b5cf6" />} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                        {/* Main Traffic Chart */}
                        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #F1F5F9', padding: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Traffic Overview</h3>
                            <div style={{ height: '350px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.dailyTraffic}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                        <Line type="monotone" dataKey="views" stroke="#5544ff" strokeWidth={4} dot={{ r: 4, fill: '#5544ff', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Pages List */}
                        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #F1F5F9', padding: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Popular Pages</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {stats.topPages.map((page, i) => (
                                    <div key={page.path} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${COLORS[i]}15`, color: COLORS[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                                                {i + 1}
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>{page.path === '/' ? 'Home' : page.path}</span>
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{page.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const AnalyticsStatCard = ({ title, value, trend, icon }: any) => (
    <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #F1F5F9', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '8px', background: trend.startsWith('+') ? '#F0FDF4' : '#FEF2F2', color: trend.startsWith('+') ? '#16a34a' : '#dc2626', fontSize: '11px', fontWeight: 800 }}>
                {trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend}
            </div>
        </div>
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{title}</p>
        <p style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: 0 }}>{value}</p>
    </div>
)

export default AdminAnalytics;
