import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search,
    Plus,
    Hash,
    Trash2,
    ToggleLeft,
    ToggleRight,
    X
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';

interface Discount {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    max_uses: number | null;
    used_count: number;
    expires_at: string | null;
    is_active: boolean;
}

const AdminDiscounts = () => {
    const { isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [newDiscount, setNewDiscount] = useState({
        code: '',
        type: 'percentage',
        value: '',
        max_uses: '',
        expires_at: ''
    });

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/');
        }
    }, [isAdmin, authLoading, navigate]);

    useEffect(() => {
        if (isAdmin) {
            fetchDiscounts();
        }
    }, [isAdmin]);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            
            .admin-discounts-main {
                margin-left: 260px;
                padding: 40px;
                transition: all 0.3s;
            }

            .discounts-grid {
                display: none;
            }

            .discounts-table-container {
                display: block;
            }

            .create-modal {
                width: 400px;
                max-width: 90vw;
            }

            @media (max-width: 1024px) {
                .admin-discounts-main {
                    margin-left: 0;
                    padding: 0 24px 40px 24px;
                    margin-top: 60px;
                }
            }

            @media (max-width: 768px) {
                .admin-discounts-main {
                    padding: 0 20px 100px 20px;
                    margin-top: 60px;
                }
                .discounts-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 12px;
                }
                .discounts-table-container {
                    display: none;
                }
                .discounts-header {
                    flex-direction: column;
                    align-items: flex-start !important;
                    gap: 16px;
                }
                .header-actions {
                    width: 100%;
                    flex-direction: column;
                }
                .header-actions input {
                    width: 100% !important;
                }
                .create-btn {
                    width: 100%;
                    justify-content: center;
                }
            }

            .discount-card-mobile {
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
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('discounts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDiscounts(data || []);
        } catch (error) {
            console.error('Error fetching discounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newDiscount.code || !newDiscount.value) {
            alert('Please fill in required fields');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('discounts')
                .insert([{
                    code: newDiscount.code.toUpperCase(),
                    type: newDiscount.type,
                    value: parseFloat(newDiscount.value),
                    max_uses: newDiscount.max_uses ? parseInt(newDiscount.max_uses) : null,
                    expires_at: newDiscount.expires_at || null,
                    is_active: true
                }])
                .select()
                .single();

            if (error) throw error;

            setDiscounts([data, ...discounts]);
            setIsCreating(false);
            setNewDiscount({ code: '', type: 'percentage', value: '', max_uses: '', expires_at: '' });
        } catch (error: any) {
            alert('Error creating discount: ' + error.message);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('discounts')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setDiscounts(discounts.map(d => d.id === id ? { ...d, is_active: !currentStatus } : d));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const deleteDiscount = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this discount?')) return;
        try {
            const { error } = await supabase.from('discounts').delete().eq('id', id);
            if (error) throw error;
            setDiscounts(discounts.filter(d => d.id !== id));
        } catch (error) {
            console.error('Error deleting discount:', error);
        }
    };

    const filteredDiscounts = discounts.filter(d =>
        d.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || !isAdmin) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            <AdminSidebar activeTab="Discounts" />

            <main className="admin-discounts-main" style={{ flex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="discounts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>Discounts</h1>
                            <p style={{ color: '#64748B', fontWeight: 600 }}>Manage promo codes and offers</p>
                        </div>
                        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ position: 'relative' }}>
                                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={16} />
                                <input
                                    type="text"
                                    placeholder="Search codes..."
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
                                        {filteredDiscounts.slice(0, 5).map(discount => (
                                            <div
                                                key={discount.id}
                                                onClick={() => setSearchTerm(discount.code)}
                                                style={{
                                                    padding: '12px 16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #F1F5F9'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                            >
                                                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{discount.code}</div>
                                                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                                                    {discount.type === 'percentage' ? `${discount.value}%` : `GH₵ ${discount.value}`} off
                                                </div>
                                            </div>
                                        ))}
                                        {filteredDiscounts.length === 0 && (
                                            <div style={{ padding: '12px 16px', color: '#64748B', fontSize: '14px' }}>No codes found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                className="create-btn"
                                onClick={() => setIsCreating(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                <Plus size={16} /> Create Discount
                            </button>
                        </div>
                    </div>

                    {/* Mobile Grid View */}
                    <div className="discounts-grid">
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
                        ) : filteredDiscounts.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No discounts found</div>
                        ) : (
                            filteredDiscounts.map((discount) => (
                                <div key={discount.id} className="discount-card-mobile">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#F1F5F9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                                                <Hash size={18} />
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>{discount.code}</p>
                                                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                                                    {discount.type === 'percentage' ? `${discount.value}%` : `GH₵ ${discount.value}`} off
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleStatus(discount.id, discount.is_active)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: discount.is_active ? '#10B981' : '#CBD5E1', padding: 0 }}
                                        >
                                            {discount.is_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                                        <span style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            Used: <span style={{ fontWeight: 700, color: '#0F172A' }}>{discount.used_count}</span>
                                            <span style={{ color: '#CBD5E1' }}>/</span>
                                            <span>{discount.max_uses ? discount.max_uses : '∞'}</span>
                                        </span>
                                        <button
                                            onClick={() => deleteDiscount(discount.id)}
                                            style={{ color: '#EF4444', background: '#FEF2F2', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="discounts-table-container" style={{ background: '#fff', borderRadius: '24px', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC' }}>
                                    <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Code</th>
                                    <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Value</th>
                                    <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Usage</th>
                                    <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
                                ) : filteredDiscounts.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>No discounts found</td></tr>
                                ) : filteredDiscounts.map((discount) => (
                                    <tr key={discount.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '32px', height: '32px', background: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                                                    <Hash size={14} />
                                                </div>
                                                <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>{discount.code}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <span style={{ fontWeight: 700, color: '#475569', fontSize: '14px' }}>
                                                {discount.type === 'percentage' ? `${discount.value}%` : `GH₵ ${discount.value}`}
                                                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, marginLeft: '4px' }}>off</span>
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <span style={{ fontSize: '13px', color: '#64748B' }}>
                                                {discount.used_count} / {discount.max_uses ? discount.max_uses : '∞'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <button
                                                onClick={() => toggleStatus(discount.id, discount.is_active)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: discount.is_active ? '#10B981' : '#CBD5E1' }}
                                            >
                                                {discount.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                            </button>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <button onClick={() => deleteDiscount(discount.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <AnimatePresence>
                    {isCreating && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreating(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} />
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="create-modal" style={{ position: 'relative', background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <h2 style={{ fontSize: '20px', fontWeight: 900 }}>New Discount</h2>
                                    <button onClick={() => setIsCreating(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94A3B8', marginBottom: '6px', textTransform: 'uppercase' }}>Code</label>
                                        <input type="text" value={newDiscount.code} onChange={e => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: 800 }} placeholder="e.g. SUMMER25" />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94A3B8', marginBottom: '6px', textTransform: 'uppercase' }}>Type</label>
                                            <select
                                                value={newDiscount.type}
                                                // @ts-ignore
                                                onChange={e => setNewDiscount({ ...newDiscount, type: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: 600, background: '#fff' }}
                                            >
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="fixed">Fixed Amount (GH₵)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94A3B8', marginBottom: '6px', textTransform: 'uppercase' }}>Value</label>
                                            <input type="number" value={newDiscount.value} onChange={e => setNewDiscount({ ...newDiscount, value: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: 800 }} placeholder={newDiscount.type === 'percentage' ? '10' : '50.00'} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94A3B8', marginBottom: '6px', textTransform: 'uppercase' }}>Max Uses (Optional)</label>
                                        <input type="number" value={newDiscount.max_uses} onChange={e => setNewDiscount({ ...newDiscount, max_uses: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: 800 }} placeholder="Infinite" />
                                    </div>
                                    <button onClick={handleCreate} style={{ width: '100%', padding: '14px', background: '#0F172A', color: '#fff', borderRadius: '14px', fontWeight: 800, border: 'none', marginTop: '8px', cursor: 'pointer' }}>Create Code</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>


            </main>
        </div>
    );
};

export default AdminDiscounts;
