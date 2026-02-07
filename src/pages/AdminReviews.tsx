import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { Star, Trash2, Search, MessageSquare } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    product_id: string;
    user_id: string;
    products: {
        name: string;
        image: string;
    };
    profiles: {
        full_name: string;
        email: string;
        avatar_url?: string;
    };
}

const FONT_FAMILY = "'Plus Jakarta Sans', 'Inter', sans-serif";

const AdminReviews = () => {
    const { user, profile } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');



    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            
            .admin-reviews-main {
                margin-left: 260px;
                padding: 40px;
                transition: all 0.3s;
            }

            .reviews-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 24px 0;
                position: sticky;
                top: 0;
                background: #F8FAFC;
                z-index: 40;
                gap: 20px;
                border-bottom: 1px solid rgba(0,0,0,0.05);
                margin-bottom: 32px;
            }

            .reviews-grid {
                 display: grid;
                 grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                 gap: 20px;
            }

            @media (max-width: 1024px) {
                .admin-reviews-main {
                    margin-left: 0;
                    padding: 0 24px 40px 24px;
                    margin-top: 60px;
                }
            }

            @media (max-width: 768px) {
                .admin-reviews-main {
                    padding: 0 20px 100px 20px;
                    margin-top: 60px;
                }
                .reviews-header {
                    flex-direction: column-reverse;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 16px 0;
                    position: relative; /* Unstick on mobile to save space */
                }
                .search-container {
                    width: 100%;
                    max-width: none !important;
                }
                .header-profile {
                    width: 100%;
                    justify-content: flex-end;
                }
                .reviews-grid {
                    grid-template-columns: 1fr;
                }
                .hide-mobile {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('product_reviews')
                .select(`
                    *,
                    products (name, image),
                    profiles (full_name, email, avatar_url)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteReview = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            const { error } = await supabase
                .from('product_reviews')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setReviews(reviews.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review');
        }
    };



    const filteredReviews = reviews.filter(review =>
        review.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#F8FAFC',
            fontFamily: FONT_FAMILY,
            color: '#000000'
        }}>
            <AdminSidebar activeTab="Reviews" />

            <div className="admin-reviews-main" style={{ flex: 1, position: 'relative' }}>
                <header className="reviews-header">
                    <div className="search-container" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="search"
                            placeholder="Search reviews by product or customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                background: '#ffffff',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                fontSize: '15px',
                                outline: 'none',
                                fontWeight: 500,
                                transition: 'all 0.2s'
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
                                {filteredReviews.slice(0, 5).map(review => (
                                    <div
                                        key={review.id}
                                        onClick={() => setSearchTerm(review.products?.name || '')}
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
                                        <img src={review.products?.image} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain', background: '#F8FAFC' }} />
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{review.products?.name}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Star size={10} fill="#F59E0B" stroke="#F59E0B" />
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{review.rating}</span>
                                                <span style={{ fontSize: '12px', color: '#94A3B8' }}>• {review.profiles?.full_name || 'User'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredReviews.length === 0 && (
                                    <div style={{ padding: '12px 16px', color: '#64748B', fontSize: '14px' }}>No reviews found</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="header-profile" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }} className="hide-mobile">
                            <p style={{ fontSize: '14px', fontWeight: 700 }}>{profile?.full_name || 'Admin'}</p>
                            <p style={{ fontSize: '12px', color: '#64748b' }}>Store Manager</p>
                        </div>
                        <img
                            src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                            alt="avatar"
                            style={{ width: '40px', height: '40px', borderRadius: '12px', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        />
                    </div>
                </header>

                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: '#0F172A', marginBottom: '4px' }}>Customer Reviews</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Monitor and moderate customer feedback for your products</p>
                </div>

                {loading ? (
                    <div style={{ padding: '80px', textAlign: 'center' }}>
                        <div className="loader" style={{ margin: '0 auto' }} />
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                        <MessageSquare size={48} color="#94A3B8" style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>No reviews found</h3>
                        <p style={{ color: '#64748B' }}>Wait for customers to leave some feedback!</p>
                    </div>
                ) : (
                    <div className="reviews-grid">
                        {filteredReviews.map((review) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: '#fff',
                                    borderRadius: '20px',
                                    padding: '24px',
                                    border: '1px solid #E2E8F0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', background: '#F8FAFC', borderRadius: '12px', padding: '4px' }}>
                                        <img src={review.products?.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{review.products?.name}</h4>
                                        <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill={i < review.rating ? "#F59E0B" : "none"} stroke="#F59E0B" />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px' }}>
                                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>"{review.comment || 'No comment provided'}"</p>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <img
                                            src={review.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user_id}`}
                                            alt=""
                                            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                                        />
                                        <div>
                                            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{review.profiles?.full_name || 'Verified Buyer'}</p>
                                            <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{new Date(review.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteReview(review.id)}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            background: '#fee2e2',
                                            color: '#ef4444',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default AdminReviews;
