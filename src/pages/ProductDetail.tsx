import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, ShieldCheck, Truck, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useCart } from '../contexts/CartContext';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';

interface ProductImage {
    id: string;
    url: string;
    is_primary: boolean;
}

interface ProductVariant {
    id: string;
    name: string;
    value: string;
    price_modifier: number;
    stock: number;
}

interface Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles?: {
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
    weight: number;
    brand?: string;
    product_images?: ProductImage[];
    product_variants?: ProductVariant[];
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

    // Gallery State
    const [activeImage, setActiveImage] = useState('');

    // Variants State
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

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
                .select(`
                    *,
                    product_images (*),
                    product_variants (*)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setProduct(data);
            setActiveImage(data.image);

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
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        // If there are variants but none selected (optional: force selection)
        // For now we just add the base product if no variant selected

        const finalPrice = product.price + (selectedVariant?.price_modifier || 0);

        addToCart({
            ...product,
            price: finalPrice,
            quantity,
            weight: product.weight || 0.5,
            variant_id: selectedVariant?.id,
            variant_name: selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : undefined
        });
    };

    if (loading) return (
        <div className="layout-with-sidebar">
            <Sidebar />
            <div style={{ flex: 1, background: '#fff', minHeight: '100vh' }}>
                <div className="product-detail-container" style={{ paddingTop: '40px' }}>
                    <div className="product-skeleton-grid">
                        {/* Gallery Skeleton */}
                        <div className="gallery-skeleton-side">
                            <div className="skeleton main-img-skeleton" />
                            <div className="thumbnails-skeleton-row">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="skeleton thumb-skeleton" />
                                ))}
                            </div>
                        </div>

                        {/* Info Skeleton */}
                        <div className="info-skeleton-side">
                            <div className="skeleton" style={{ height: '14px', width: '80px', borderRadius: '10px', marginBottom: '16px' }} />
                            <div className="skeleton" style={{ height: '48px', width: '80%', borderRadius: '12px', marginBottom: '12px' }} />
                            <div className="skeleton" style={{ height: '32px', width: '120px', borderRadius: '12px', marginBottom: '32px' }} />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '40px' }}>
                                <div className="skeleton" style={{ height: '12px', width: '100%' }} />
                                <div className="skeleton" style={{ height: '12px', width: '95%' }} />
                                <div className="skeleton" style={{ height: '12px', width: '90%' }} />
                                <div className="skeleton" style={{ height: '12px', width: '40%' }} />
                            </div>

                            <div className="skeleton" style={{ height: '64px', borderRadius: '20px', width: '100%', marginBottom: '24px' }} />
                            <div className="skeleton" style={{ height: '20px', width: '150px', marginBottom: '16px' }} />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="skeleton" style={{ height: '40px', width: '80px', borderRadius: '12px' }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                    .product-skeleton-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                        gap: 60px;
                        align-items: start;
                    }
                    .main-img-skeleton {
                        aspect-ratio: 1;
                        border-radius: 32px;
                        width: 100%;
                        margin-bottom: 20px;
                    }
                    .thumbnails-skeleton-row {
                        display: flex;
                        gap: 12px;
                    }
                    .thumb-skeleton {
                        width: 100px;
                        height: 100px;
                        border-radius: 16px;
                    }
                    @media (max-width: 768px) {
                        .product-skeleton-grid {
                            grid-template-columns: 1fr;
                            gap: 32px;
                        }
                        .thumb-skeleton {
                            width: 60px;
                            height: 60px;
                        }
                    }
                `}</style>
            </div>
        </div>
    );

    if (!product) return null;

    const currentPrice = product.price + (selectedVariant?.price_modifier || 0);

    return (
        <div className="layout-with-sidebar">
            <Sidebar />
            <div style={{ flex: 1, background: '#fff', minHeight: '100vh', width: '100%' }}>
                <div className="product-detail-container">

                    {/* Main Product Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '40px', alignItems: 'start' }}>

                        {/* Gallery */}
                        <div className="gallery-section">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="main-image-wrapper"
                                style={{
                                    background: '#fff',
                                    borderRadius: '32px',
                                    aspectRatio: '1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0',
                                    border: '1px solid #F1F5F9',
                                    marginBottom: '20px',
                                    cursor: 'zoom-in',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Arrow Controls */}
                                {product.product_images && product.product_images.length > 0 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const allImages = [product.image, ...(product.product_images?.map(img => img.url) || [])].filter((url, index, self) => self.indexOf(url) === index);
                                                const currentIndex = allImages.indexOf(activeImage);
                                                const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                                                setActiveImage(allImages[prevIndex]);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                left: '8px',
                                                zIndex: 10,
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                backdropFilter: 'blur(4px)',
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                color: '#0f172a'
                                            }}
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const allImages = [product.image, ...(product.product_images?.map(img => img.url) || [])].filter((url, index, self) => self.indexOf(url) === index);
                                                const currentIndex = allImages.indexOf(activeImage);
                                                const nextIndex = (currentIndex + 1) % allImages.length;
                                                setActiveImage(allImages[nextIndex]);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                right: '8px',
                                                zIndex: 10,
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                backdropFilter: 'blur(4px)',
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                color: '#0f172a'
                                            }}
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </>
                                )}

                                <motion.img
                                    key={activeImage}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    src={activeImage}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </motion.div>

                            {/* Thumbnails */}
                            {(product.product_images && product.product_images.length > 1) && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                                    {[product.image, ...product.product_images.map(img => img.url)]
                                        .filter((url, index, self) => self.indexOf(url) === index) // Unique images
                                        .map((url, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveImage(url)}
                                                style={{
                                                    aspectRatio: '1',
                                                    borderRadius: '12px',
                                                    border: activeImage === url ? '2px solid #5544ff' : '1px solid #E2E8F0',
                                                    background: '#fff',
                                                    padding: '4px',
                                                    cursor: 'pointer',
                                                    overflow: 'hidden',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                            </button>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="info-section">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category}</span>
                                {product.brand && <span style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 600 }}>by {product.brand}</span>}
                            </div>

                            <h1 className="product-title" style={{
                                fontSize: 'clamp(24px, 5vw, 32px)',
                                fontWeight: 900,
                                color: '#0F172A',
                                marginBottom: '12px',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.1
                            }}>{product.name}</h1>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    {[...Array(5)].map((_, i) => {
                                        const avgRating = reviews.length > 0
                                            ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
                                            : (product.rating || 0);
                                        return (
                                            <Star
                                                key={i}
                                                size={16}
                                                fill={i < Math.floor(avgRating) ? "#F59E0B" : "none"}
                                                stroke="#F59E0B"
                                            />
                                        );
                                    })}
                                </div>
                                <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>
                                    {reviews.length > 0
                                        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
                                        : product.rating || 'No ratings'
                                    } • {reviews.length} Trust Reviews
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '32px' }}>
                                <span style={{ fontSize: '36px', fontWeight: 900, color: '#0F172A' }}>GH₵ {currentPrice.toFixed(2)}</span>
                                {selectedVariant && <span style={{ color: '#10B981', fontSize: '14px', fontWeight: 700 }}>({selectedVariant.name}: {selectedVariant.value})</span>}
                            </div>

                            <p style={{ color: '#475569', fontSize: '16px', lineHeight: 1.7, marginBottom: '40px' }}>{product.description}</p>

                            {/* Variants Selection */}
                            {product.product_variants && product.product_variants.length > 0 && (
                                <div style={{ marginBottom: '40px' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Select {product.product_variants[0].name}</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                        {product.product_variants.map(variant => (
                                            <button
                                                key={variant.id}
                                                onClick={() => setSelectedVariant(variant)}
                                                style={{
                                                    padding: '12px 20px',
                                                    borderRadius: '16px',
                                                    border: selectedVariant?.id === variant.id ? '2px solid #5544ff' : '1px solid #E2E8F0',
                                                    background: selectedVariant?.id === variant.id ? '#F5F3FF' : '#fff',
                                                    color: selectedVariant?.id === variant.id ? '#5544ff' : '#475569',
                                                    fontSize: '14px',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {variant.value}
                                                {variant.price_modifier > 0 && <span style={{ fontSize: '11px', color: '#10B981', marginLeft: '6px' }}>+GH₵{variant.price_modifier}</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0', height: '64px', padding: '4px' }}>
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '48px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}><Minus size={18} /></button>
                                    <span style={{ width: '40px', textAlign: 'center', fontSize: '18px', fontWeight: 800 }}>{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} style={{ width: '48px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}><Plus size={18} /></button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    style={{ flex: 1, background: '#5544ff', color: '#fff', height: '64px', borderRadius: '20px', border: 'none', fontSize: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 8px 30px rgba(85, 68, 255, 0.3)' }}
                                >
                                    <ShoppingCart size={20} /> Add To Bag
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid #F1F5F9', paddingTop: '32px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Truck size={20} color="#10B981" /></div>
                                    <div><span style={{ fontWeight: 800, fontSize: '13px', color: '#0F172A', display: 'block' }}>Free Delivery</span><span style={{ fontSize: '11px', color: '#64748B' }}>Orders over GH₵500</span></div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={20} color="#3B82F6" /></div>
                                    <div><span style={{ fontWeight: 800, fontSize: '13px', color: '#0F172A', display: 'block' }}>Secure Warranty</span><span style={{ fontSize: '11px', color: '#64748B' }}>2 year official coverage</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews & More - Keep Existing Structure but Polish it */}
                    {/* ... (rest of the file stays largely the same but with slightly more spacing) */}
                    <div style={{ marginTop: '100px' }}>
                        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '80px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                                <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A' }}>Member Reviews</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#F59E0B', fontWeight: 800 }}>{product.rating}</span>
                                    <div style={{ display: 'flex' }}>{[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.floor(product.rating || 4.5) ? "#F59E0B" : "none"} stroke="#F59E0B" />)}</div>
                                </div>
                            </div>

                            {reviews.length === 0 ? (
                                <div style={{ padding: '60px', textAlign: 'center', background: '#F8FAFC', borderRadius: '32px', color: '#64748B' }}>
                                    <p style={{ fontWeight: 600 }}>Be the first to review this product!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '32px' }}>
                                    {(showAllReviews ? reviews : reviews.slice(0, 3)).map(review => (
                                        <div key={review.id} style={{ display: 'flex', gap: '24px', paddingBottom: '32px', borderBottom: '1px solid #F8FAFC' }}>
                                            <img src={review.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user_id}`} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <h4 style={{ fontWeight: 800, fontSize: '16px' }}>{review.profiles?.full_name}</h4>
                                                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>{new Date(review.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
                                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? "#F59E0B" : "none"} stroke="#F59E0B" />)}
                                                </div>
                                                <p style={{ color: '#475569', lineHeight: 1.6 }}>{review.comment}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {reviews.length > 3 && !showAllReviews && (
                                        <button onClick={() => setShowAllReviews(true)} style={{ alignSelf: 'center', background: 'none', border: '1px solid #E2E8F0', padding: '12px 32px', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', color: '#475569' }}>Read All {reviews.length} Reviews</button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="related-products-section">
                        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                            <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '48px', textAlign: 'center', letterSpacing: '-0.02em' }}>Complete The Set</h2>
                            <div className="related-products-grid">
                                {relatedProducts.map(p => (
                                    <ProductCard
                                        key={p.id}
                                        id={p.id}
                                        name={p.name}
                                        price={p.price.toString()}
                                        image={p.image}
                                        category={p.category}
                                    />
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
