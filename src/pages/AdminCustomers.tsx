import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Search,
    Mail,
    Calendar,
    User,
    ShoppingBag,
    Shield
} from 'lucide-react';
import { supabase } from '../supabaseClient';
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
    const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');



    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            
            .admin-customers-main {
                margin-left: 260px;
                padding: 40px;
                transition: all 0.3s;
            }

            .customers-grid {
                display: none;
            }

            .customers-table-container {
                display: block;
            }

            @media (max-width: 1024px) {
                .admin-customers-main {
                    margin-left: 0;
                    padding: 0 24px 40px 24px;
                    margin-top: 60px;
                }
            }

            @media (max-width: 768px) {
                .admin-customers-main {
                    padding: 0 20px 100px 20px;
                    margin-top: 60px;
                }
                .customers-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 12px;
                }
                .customers-table-container {
                    display: none;
                }
                .hide-mobile {
                    display: none !important;
                }
                .customers-header {
                    flex-direction: column;
                    align-items: flex-start !important;
                    gap: 16px;
                }
                .search-container {
                    width: 100%;
                }
                .search-container input {
                    width: 100% !important;
                }
            }

            .customer-card-mobile {
                background: white;
                border: 1px solid #E2E8F0;
                border-radius: 16px;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                transition: all 0.2s;
            }
            
            .customer-card-mobile:hover {
                box-shadow: 0 4px 16px rgba(0,0,0,0.08);
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, []);

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

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            setCustomers(customers.map(c =>
                c.id === userId ? { ...c, role: newRole } : c
            ));
            alert('Role updated successfully');
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update role');
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );



    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            <AdminSidebar activeTab="Customers" />

            <main className="admin-customers-main" style={{ flex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="customers-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>Customers</h1>
                            <p className="hide-mobile" style={{ color: '#64748B', fontWeight: 600 }}>Manage your user base and view activity</p>
                        </div>
                        <div className="search-container" style={{ position: 'relative' }}>
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
                            {searchTerm && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    zIndex: 50,
                                    marginTop: '4px',
                                    border: '1px solid #E2E8F0',
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                }}>
                                    {filteredCustomers.slice(0, 5).map(customer => (
                                        <div
                                            key={customer.id}
                                            onClick={() => {
                                                setSearchTerm(customer.full_name || customer.email);
                                            }}
                                            style={{
                                                padding: '12px 16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #F1F5F9'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            <img
                                                src={customer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.email}`}
                                                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                                            />
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{customer.full_name || 'No Name'}</div>
                                                <div style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{customer.email}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredCustomers.length === 0 && (
                                        <div style={{ padding: '12px 16px', color: '#64748B', fontSize: '14px' }}>No customers found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Grid View */}
                    <div className="customers-grid">
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading customers...</div>
                        ) : filteredCustomers.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No customers found</div>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <div key={customer.id} className="customer-card-mobile">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {customer.avatar_url ? (
                                                <img src={customer.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <User size={24} color="#94A3B8" />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>{customer.full_name || 'Unnamed'}</p>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{customer.email}</p>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                fontSize: '10px',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                background: customer.role === 'admin' ? '#EFF6FF' : '#F1F5F9',
                                                color: customer.role === 'admin' ? '#1E40AF' : '#64748B',
                                                border: customer.role === 'admin' ? '1px solid #DBEAFE' : 'none'
                                            }}>
                                                {customer.role === 'admin' && <Shield size={10} style={{ marginRight: '2px' }} />}
                                                {customer.role}
                                            </div>
                                            <select
                                                value={customer.role}
                                                onChange={(e) => handleRoleChange(customer.id, e.target.value)}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    opacity: 0,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="customer">Customer</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px 0', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Total Spent</p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>GH₵ {customer.stats.totalSpent.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Orders</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                <ShoppingBag size={14} color="#5544ff" />
                                                <p style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>{customer.stats.totalOrders}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={14} color="#94A3B8" />
                                        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                                            Last Active: {customer.stats.lastOrderDate ? new Date(customer.stats.lastOrderDate).toLocaleDateString() : 'Never'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="customers-table-container" style={{ background: '#fff', borderRadius: '24px', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
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
                                            <div style={{ position: 'relative' }}>
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
                                                    border: customer.role === 'admin' ? '1px solid #DBEAFE' : '1px solid transparent'
                                                }}>
                                                    {customer.role === 'admin' && <Shield size={12} />}
                                                    {customer.role}
                                                </div>
                                                <select
                                                    value={customer.role}
                                                    onChange={(e) => handleRoleChange(customer.id, e.target.value)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        opacity: 0,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
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
