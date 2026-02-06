import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Mail,
    Calendar,
    User,
    ShoppingBag,
    Shield
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';

interface Profile {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
    role: string;
    created_at: string;
}

interface CustomerStats {
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string | null;
}

interface CustomerWithStats extends Profile {
    stats: CustomerStats;
}

const AdminCustomers = () => {
    const { isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/');
        }
    }, [isAdmin, authLoading, navigate]);

    useEffect(() => {
        if (isAdmin) {
            fetchCustomers();
        }
    }, [isAdmin]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);

            // 1. Fetch Profiles
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profileError) throw profileError;

            // 2. Fetch Orders to aggregate stats
            const { data: orders, error: orderError } = await supabase
                .from('orders')
                .select('id, user_id, total_amount, created_at');

            if (orderError) throw orderError;

            // 3. Aggregate Stats
            const customersWithStats = profiles.map(profile => {
                const userOrders = orders?.filter(o => o.user_id === profile.id) || [];
                const totalSpent = userOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
                const lastOrder = userOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

                return {
                    ...profile,
                    stats: {
                        totalOrders: userOrders.length,
                        totalSpent,
                        lastOrderDate: lastOrder ? lastOrder.created_at : null
                    }
                };
            });

            setCustomers(customersWithStats);

        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || !isAdmin) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            <AdminSidebar activeTab="Customers" />

            <main style={{ flex: 1, padding: '40px', marginLeft: '260px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>Customers</h1>
                            <p style={{ color: '#64748B', fontWeight: 600 }}>Manage your user base and view activity</p>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={16} />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: '12px 12px 12px 40px',
                                    borderRadius: '12px',
                                    border: '1px solid #E2E8F0',
                                    fontSize: '14px',
                                    width: '300px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC' }}>
                                    <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Customer</th>
                                    <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Orders</th>
                                    <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Total Spent</th>
                                    <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Last Active</th>
                                    <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>Loading customers...</td></tr>
                                ) : filteredCustomers.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>No customers found</td></tr>
                                ) : filteredCustomers.map((customer) => (
                                    <tr key={customer.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F1F5F9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {customer.avatar_url ? (
                                                        <img src={customer.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <User size={20} color="#94A3B8" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>{customer.full_name || 'Unnamed'}</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                        <Mail size={12} color="#94A3B8" />
                                                        <span style={{ fontSize: '12px', color: '#64748B' }}>{customer.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#F1F5F9', borderRadius: '8px' }}>
                                                <ShoppingBag size={14} color="#64748B" />
                                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>{customer.stats.totalOrders}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                                                GH₵ {customer.stats.totalSpent.toFixed(2)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} color="#94A3B8" />
                                                <span style={{ fontSize: '13px', color: '#64748B' }}>
                                                    {customer.stats.lastOrderDate
                                                        ? new Date(customer.stats.lastOrderDate).toLocaleDateString()
                                                        : 'Never'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                background: customer.role === 'admin' ? '#EFF6FF' : '#F1F5F9',
                                                color: customer.role === 'admin' ? '#1E40AF' : '#64748B',
                                                border: customer.role === 'admin' ? '1px solid #DBEAFE' : 'none'
                                            }}>
                                                {customer.role === 'admin' && <Shield size={12} />}
                                                {customer.role}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminCustomers;
