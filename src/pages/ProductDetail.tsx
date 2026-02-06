import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, ShieldCheck, Truck, Minus, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useCart } from '../contexts/CartContext';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_id: string;
    profiles: {
        full_name: string;
        avatar_url: string;
    };
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    rating: number;
    reviews_count: number;
}

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [showAllReviews, setShowAllReviews] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProduct();
            fetchReviews();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setProduct(data);

            if (data) {
                fetchRelatedProducts(data.category, data.id);
            }
        } catch (err) {
            console.error('Error fetching product:', err);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async (category: string, currentId: string) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', category)
                .neq('id', currentId)
                .limit(4);

            if (error) throw error;
            setRelatedProducts(data || []);
        } catch (err) {
            console.error('Error fetching related products:', err);
        }
    };

    const fetchReviews = async () => {
        try {
            const { data, error } = await supabase
                .from('product_reviews')
                .select('*, profiles(full_name, avatar_url)')
                .eq('product_id', id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            // Optional: alert('Could not load reviews. Please check your connection.');
        }
    };

    if (loading) return (
        <div className="layout-with-sidebar">
            <Sidebar />
            <div style={{ flex: 1, background: '#fff', minHeight: '100vh', padding: '32px' }}>
                <div className="skeleton" style={{ height: '500px', borderRadius: '24px' }} />
            </div>
        </div>
    );

    if (!product) return null;

    return (
        <div className="layout-with-sidebar">
            <Sidebar />
            <div style={{ flex: 1, background: '#fff', minHeight: '100vh' }}>
                <div className="product-detail-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
                        {/* Image */}
                        <div className="product-image-container">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="product-image-wrapper" style={{ background: '#F9FAFB', borderRadius: '24px', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </motion.div>
                        </div>

                        {/* Info */}
                        <div className="product-info-wrapper">
                            <span style={{ display: 'inline-block', background: '#F3F4F6', color: '#374151', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>{product.category}</span>
                            <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#0F172A', marginBottom: '12px' }}>{product.name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                                <div style={{ display: 'flex' }}>{[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < Math.floor(product.rating || 4.5) ? "#F59E0B" : "none"} stroke="#F59E0B" />)}</div>
                                <span style={{ fontSize: '14px', color: '#6B7280' }}>({reviews.length} reviews)</span>
                            </div>
                            <p style={{ fontSize: '28px', fontWeight: 900, color: '#5544ff', marginBottom: '24px' }}>GH₵ {product.price}</p>
                            <p style={{ color: '#4B5563', lineHeight: 1.6, marginBottom: '32px' }}>{product.description}</p>

                            <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', height: '56px' }}>
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '40px', border: 'none', background: 'none', cursor: 'pointer' }}><Minus size={16} /></button>
                                    <span style={{ width: '30px', textAlign: 'center', fontWeight: 800 }}>{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} style={{ width: '40px', border: 'none', background: 'none', cursor: 'pointer' }}><Plus size={16} /></button>
                                </div>
                                <button
                                    onClick={() => addToCart({ ...product, quantity })}
                                    style={{ flex: 1, background: '#5544ff', color: '#fff', height: '56px', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                    <ShoppingCart size={18} /> Add to Cart
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', borderTop: '1px solid #E5E7EB', paddingTop: '32px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}><Truck size={20} color="#5544ff" /> <div><span style={{ fontWeight: 700, fontSize: '13px', display: 'block' }}>Free Shipping</span></div></div>
                                <div style={{ display: 'flex', gap: '8px' }}><ShieldCheck size={20} color="#5544ff" /> <div><span style={{ fontWeight: 700, fontSize: '13px', display: 'block' }}>2 Year Warranty</span></div></div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div style={{ marginTop: '80px', borderTop: '1px solid #E5E7EB', paddingTop: '60px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '32px' }}>Customer Reviews</h2>
                        {reviews.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', background: '#F8FAFC', borderRadius: '24px' }}>No reviews yet.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                {(showAllReviews ? reviews : reviews.slice(0, 2)).map(review => (
                                    <div key={review.id} style={{ display: 'flex', gap: '24px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', overflow: 'hidden' }}>
                                            <img src={review.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user_id}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ marginBottom: '8px' }}>
                                                <h4 style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A', marginBottom: '2px' }}>{review.profiles?.full_name || 'Verified Buyer'}</h4>
                                                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>{new Date(review.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? "#F59E0B" : "none"} stroke="#F59E0B" />)}
                                            </div>
                                            <p style={{ color: '#475569' }}>{review.comment}</p>
                                        </div>
                                    </div>
                                ))}
                                {reviews.length > 2 && !showAllReviews && (
                                    <button onClick={() => setShowAllReviews(true)} style={{ padding: '12px 24px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', alignSelf: 'center' }}>Show All Reviews ({reviews.length})</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div style={{ background: '#F8FAFC', padding: '80px 40px', borderTop: '1px solid #E5E7EB' }}>
                        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '40px', textAlign: 'center' }}>You Might Also Like</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                                {relatedProducts.map(p => (
                                    <ProductCard key={p.id} id={p.id} name={p.name} price={p.price.toString()} image={p.image} category={p.category} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
