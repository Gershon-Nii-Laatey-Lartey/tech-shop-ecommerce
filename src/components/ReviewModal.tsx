import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface Product {
    id: string;
    name: string;
    image: string;
}

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    products: Product[];
    onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, orderId, products, onSuccess }) => {
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [comments, setComments] = useState<Record<string, string>>({});
    const [alreadyReviewed, setAlreadyReviewed] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [step, setStep] = useState(0);

    const currentProduct = products[step];
    const isAlreadyReviewed = alreadyReviewed.has(currentProduct.id);

    // Fetch existing reviews to pre-fill
    useEffect(() => {
        const fetchExistingReviews = async () => {
            setInitialLoading(true);
            const { data } = await supabase
                .from('product_reviews')
                .select('*')
                .eq('order_id', orderId);

            if (data && data.length > 0) {
                const existingRatings: Record<string, number> = {};
                const existingComments: Record<string, string> = {};
                const reviewedIds = new Set<string>();

                data.forEach(rev => {
                    existingRatings[rev.product_id] = rev.rating;
                    existingComments[rev.product_id] = rev.comment;
                    reviewedIds.add(rev.product_id);
                });

                setRatings(prev => ({ ...prev, ...existingRatings }));
                setComments(prev => ({ ...prev, ...existingComments }));
                setAlreadyReviewed(reviewedIds);
            }
            setInitialLoading(false);
        };
        fetchExistingReviews();
    }, [orderId]);

    const handleSubmit = async () => {
        if (!ratings[currentProduct.id]) return;

        setLoading(true);
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase.from('product_reviews').upsert({
                product_id: currentProduct.id,
                order_id: orderId,
                rating: ratings[currentProduct.id],
                comment: comments[currentProduct.id] || '',
                user_id: user.id
            }, {
                onConflict: 'user_id, product_id, order_id'
            });

            if (error) throw error;

            if (step < products.length - 1) {
                setStep(step + 1);
            } else {
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            alert('Error submitting review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: '#fff',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '420px',
                    overflow: 'hidden',
                    position: 'relative',
                    marginTop: '40px'
                }}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                    <X size={20} />
                </button>

                <div style={{ padding: '48px 32px 32px 32px' }}>
                    {initialLoading ? (
                        <div style={{ padding: '60px 0', textAlign: 'center' }}>
                            <div className="loader" style={{ margin: '0 auto 20px' }} />
                            <p style={{ color: '#64748B', fontWeight: 600, fontSize: '14px' }}>Loading your order details...</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>Rate & Review</h2>
                                <p style={{ color: '#64748B', fontSize: '14px' }}>Product {step + 1} of {products.length}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#F8FAFC', padding: '12px', borderRadius: '16px', marginBottom: '24px' }}>
                                <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '10px', padding: '4px' }}>
                                    <img src={currentProduct.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{currentProduct.name}</h3>
                                    {isAlreadyReviewed && (
                                        <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, background: '#D1FAE5', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Already Reviewed</span>
                                    )}
                                </div>
                            </div>

                            {isAlreadyReviewed ? (
                                <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', marginBottom: '24px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '12px' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={24}
                                                fill={ratings[currentProduct.id] >= star ? "#F59E0B" : "none"}
                                                stroke={ratings[currentProduct.id] >= star ? "#F59E0B" : "#CBD5E1"}
                                            />
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#475569', fontStyle: 'italic', lineHeight: 1.6 }}>"{comments[currentProduct.id] || 'No comment provided'}"</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ marginBottom: '24px' }}>
                                        <p style={{ textAlign: 'center', fontWeight: 700, marginBottom: '12px', color: '#0F172A', fontSize: '14px' }}>Your Rating</p>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setRatings({ ...ratings, [currentProduct.id]: star })}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    <Star
                                                        size={28}
                                                        fill={ratings[currentProduct.id] >= star ? "#F59E0B" : "none"}
                                                        stroke={ratings[currentProduct.id] >= star ? "#F59E0B" : "#CBD5E1"}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '24px' }}>
                                        <p style={{ fontWeight: 700, marginBottom: '8px', color: '#0F172A', fontSize: '14px' }}>Share your thoughts</p>
                                        <textarea
                                            value={comments[currentProduct.id] || ''}
                                            onChange={(e) => setComments({ ...comments, [currentProduct.id]: e.target.value })}
                                            placeholder="How do you like the product? (Optional)"
                                            style={{
                                                width: '100%',
                                                height: '90px',
                                                background: '#F8FAFC',
                                                border: '1px solid #E2E8F0',
                                                borderRadius: '12px',
                                                padding: '12px',
                                                fontSize: '14px',
                                                fontFamily: 'inherit',
                                                resize: 'none'
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            <button
                                onClick={isAlreadyReviewed ?
                                    (step < products.length - 1 ? () => setStep(step + 1) : onClose) :
                                    handleSubmit
                                }
                                disabled={(!isAlreadyReviewed && !ratings[currentProduct.id]) || loading}
                                style={{
                                    width: '100%',
                                    height: '48px',
                                    background: (isAlreadyReviewed || ratings[currentProduct.id]) ? '#5544ff' : '#E2E8F0',
                                    color: '#fff',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '15px',
                                    cursor: (isAlreadyReviewed || ratings[currentProduct.id]) ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {loading ? 'Submitting...' : (
                                    isAlreadyReviewed ?
                                        (step < products.length - 1 ? 'Next Product' : 'Close') :
                                        (step < products.length - 1 ? 'Next Product' : 'Submit Review')
                                )}
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ReviewModal;
