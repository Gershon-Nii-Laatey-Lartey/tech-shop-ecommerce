import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, Plus, ChevronLeft, ChevronRight, Check, ShoppingBag, MessageSquare, Menu, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabaseClient';
import { useCart } from '../contexts/CartContext';

interface Variant {
    id: string;
    option_type: string;
    option_value: string;
    price_impact: number;
}

interface Product {
    id: string;
    name: string;
    price: number;
    discount_price?: number;
    image: string;
    images?: string[];
    category: string;
    description: string;
    brand?: string;
    specification?: string;
    features?: string[];
}

const ProductDetail = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'discussion'>('details');
    const [activeImage, setActiveImage] = useState<string>('');

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            const { data: prodData } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (prodData) {
                setProduct(prodData);
                setActiveImage(prodData.image);
                const { data: varData } = await supabase
                    .from('product_variants')
                    .select('*')
                    .eq('product_id', id);

                if (varData) {
                    setVariants(varData);
                    const defaults: Record<string, string> = {};
                    varData.forEach(v => {
                        if (!defaults[v.option_type]) defaults[v.option_type] = v.option_value;
                    });
                    setSelectedOptions(defaults);
                }
            }
            setLoading(false);
        };
        fetchProductData();
    }, [id]);

    const displayImages = product?.images ? [
        product.image,
        ...product.images.filter(img => img !== product.image)
    ].filter(Boolean) : [product?.image].filter(Boolean);

    const calculateCurrentPrice = () => {
        if (!product) return 0;
        let extra = 0;
        variants.forEach(v => {
            if (selectedOptions[v.option_type] === v.option_value) {
                extra += Number(v.price_impact);
            }
        });
        const base = product.discount_price || product.price;
        return base + extra;
    };

    const handleNextImage = () => {
        const currentIndex = displayImages.indexOf(activeImage);
        const nextIndex = (currentIndex + 1) % displayImages.length;
        setActiveImage(displayImages[nextIndex] as string);
    };

    const handlePrevImage = () => {
        const currentIndex = displayImages.indexOf(activeImage);
        const prevIndex = (currentIndex - 1 + displayImages.length) % displayImages.length;
        setActiveImage(displayImages[prevIndex] as string);
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'white' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: '40px', height: '40px', border: '4px solid #f0f0f0', borderTop: '4px solid black', borderRadius: '50%' }} />
        </div>
    );

    if (!product) return <div style={{ padding: '100px', textAlign: 'center' }}>Product not found</div>;

    const groupedVariants = variants.reduce((acc, v) => {
        if (!acc[v.option_type]) acc[v.option_type] = [];
        acc[v.option_type].push(v);
        return acc;
    }, {} as Record<string, Variant[]>);

    return (
        <div className="layout-with-sidebar">
            <Sidebar />

            <div style={{ flex: 1, padding: '24px 40px' }}>
                {/* Breadcrumbs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888', fontWeight: 600, marginBottom: '24px' }}>
                    <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
                    <span>/</span>
                    <Link to="/products" style={{ color: '#888', textDecoration: 'none' }}>{product.category}</Link>
                    <span>/</span>
                    <span style={{ color: 'black' }}>{product.name}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '64px', alignItems: 'start' }}>
                    {/* Left: Product Media Gallery */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{
                            background: '#f8f8f8',
                            borderRadius: '32px',
                            padding: '40px',
                            aspectRatio: '1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImage}
                                    src={activeImage}
                                    style={{ width: '90%', height: 'auto', mixBlendMode: 'multiply' }}
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 1.1, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </AnimatePresence>

                            {displayImages.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.preventDefault(); handlePrevImage(); }}
                                        style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', background: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer', zIndex: 10 }}>
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.preventDefault(); handleNextImage(); }}
                                        style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', background: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer', zIndex: 10 }}>
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}

                            <button style={{ position: 'absolute', bottom: '24px', right: '24px', width: '48px', height: '48px', borderRadius: '50%', background: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', cursor: 'pointer' }}>
                                <Share2 size={20} />
                            </button>
                        </div>

                        {/* Thumbnails strip */}
                        {displayImages.length > 0 && (
                            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
                                {displayImages.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setActiveImage(img as string)}
                                        style={{
                                            flex: '0 0 80px',
                                            aspectRatio: '1',
                                            background: '#f8f8f8',
                                            borderRadius: '16px',
                                            padding: '10px',
                                            border: activeImage === img ? '2.5px solid black' : '2.5px solid transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <img src={img as string} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Configuration & Actions */}
                    <div style={{ padding: '0 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '24px', height: '24px', background: 'black', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: '10px', height: '10px', background: 'white', borderRadius: '2px' }}></div>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{product.brand || 'Tech Brand'}</span>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#aaa' }}>{product.id.slice(0, 8).toUpperCase()}</span>
                        </div>

                        <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '16px' }}>{product.name}</h1>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', color: '#ffcc00', gap: '2px' }}>
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" stroke="none" />)}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'black' }}>4.8 <span style={{ color: '#aaa', marginLeft: '4px' }}>42 reviews</span></span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '32px' }}>
                            <span style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-0.04em' }}>
                                ${calculateCurrentPrice().toLocaleString()}
                            </span>
                            {product.discount_price && (
                                <span style={{ fontSize: '20px', fontWeight: 700, color: '#aaa', textDecoration: 'line-through' }}>
                                    ${product.price.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* Options Selection */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '40px' }}>
                            {Object.keys(groupedVariants).map(type => (
                                <div key={type}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <p style={{ fontSize: '11px', fontWeight: 900, color: '#888', letterSpacing: '0.05em' }}>{type.toUpperCase()}</p>
                                        {type.toLowerCase() === 'size' && <button style={{ fontSize: '11px', fontWeight: 800, color: 'black', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Size guide</button>}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {groupedVariants[type].map((v, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedOptions(prev => ({ ...prev, [type]: v.option_value }))}
                                                style={{
                                                    minWidth: type.toLowerCase() === 'color' ? '48px' : '56px',
                                                    height: '44px',
                                                    padding: '0 12px',
                                                    borderRadius: '12px',
                                                    border: '1.5px solid',
                                                    borderColor: selectedOptions[type] === v.option_value ? 'black' : '#eee',
                                                    background: selectedOptions[type] === v.option_value ? 'black' : 'white',
                                                    fontWeight: 800,
                                                    fontSize: '13px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    color: selectedOptions[type] === v.option_value ? 'white' : 'black',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {v.option_value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <button
                                onClick={() => addToCart(product)}
                                style={{
                                    flex: 1,
                                    height: '56px',
                                    background: 'black',
                                    color: 'white',
                                    borderRadius: '16px',
                                    fontSize: '15px',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <ShoppingBag size={18} /> Add to cart
                            </button>
                            <button style={{
                                width: '56px',
                                height: '56px',
                                border: '1.5px solid #eee',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#111',
                                background: 'white',
                                cursor: 'pointer'
                            }}>
                                <Heart size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={12} strokeWidth={3} />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#555' }}>Free delivery on orders over $130.0</span>
                        </div>
                    </div>
                </div>

                {/* Tabs & Full Details Section */}
                <div style={{ marginTop: '80px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
                    <div style={{ display: 'flex', gap: '40px', marginBottom: '48px', borderBottom: '1px solid #eee' }}>
                        {['Details', 'Reviews', 'Discussion'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase() as any)}
                                style={{
                                    paddingBottom: '20px',
                                    fontSize: '18px',
                                    fontWeight: 900,
                                    color: activeTab === tab.toLowerCase() ? 'black' : '#aaa',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'color 0.2s'
                                }}
                            >
                                {tab}
                                {activeTab === tab.toLowerCase() && (
                                    <motion.div layoutId="activeTabLine" style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: '2px', background: 'black' }} />
                                )}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '80px' }}>
                        <div style={{ flex: 1 }}>
                            {activeTab === 'details' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '24px' }}>Product Narrative</h3>
                                        <p style={{ fontSize: '16px', color: '#555', lineHeight: 1.8, fontWeight: 600 }}>{product.description}</p>
                                    </div>

                                    {product.features && product.features.length > 0 && (
                                        <div>
                                            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '24px' }}>Flagship Features</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                {product.features.map((feature, i) => feature.trim() && (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '20px', background: '#f9f9fb', borderRadius: '20px' }}>
                                                        <div style={{ padding: '4px', background: 'black', borderRadius: '6px', marginTop: '2px' }}>
                                                            <Check size={12} color="white" strokeWidth={4} />
                                                        </div>
                                                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#111' }}>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {product.specification && (
                                        <div>
                                            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '24px' }}>Full Specifications</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {product.specification.split('\n').map((spec, i) => spec.trim() && (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', background: 'white', border: '1px solid #f0f0f0', borderRadius: '16px', fontWeight: 700, fontSize: '14px' }}>
                                                        <span style={{ color: '#888' }}>{spec.split(':')[0]}</span>
                                                        <span style={{ color: 'black' }}>{spec.split(':')[1] || spec}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'reviews' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                                        <select style={{ padding: '10px 16px', borderRadius: '12px', border: '1.5px solid #eee', fontWeight: 800, outline: 'none', fontSize: '13px' }}>
                                            <option>Newest</option>
                                            <option>Highest Rating</option>
                                            <option>Lowest Rating</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                        {[
                                            { name: 'Helen M.', date: 'Yesterday', rating: 5, comment: 'Excellent product. It turns very sharply on the foot.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Helen' },
                                            { name: 'Ann D.', date: '2 days ago', rating: 4, comment: 'Good quality but slightly larger than expected.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ann' }
                                        ].map((review, i) => (
                                            <div key={i} style={{ borderBottom: '1px solid #f5f5f7', paddingBottom: '32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                    <img src={review.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f5f5f7' }} />
                                                    <div>
                                                        <h4 style={{ fontSize: '15px', fontWeight: 800 }}>{review.name}</h4>
                                                        <p style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>{review.date}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', color: '#ffcc00', gap: '2px', marginBottom: '12px' }}>
                                                    {[1, 2, 3, 4, 5].map(star => <Star key={star} size={12} fill={star <= review.rating ? "currentColor" : "none"} stroke={star <= review.rating ? "none" : "#eee"} />)}
                                                </div>
                                                <p style={{ fontSize: '15px', fontWeight: 600, color: '#444' }}>{review.comment}</p>
                                                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                                                    <button style={{ fontSize: '12px', fontWeight: 800, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer' }}>Reply</button>
                                                    <button style={{ fontSize: '12px', fontWeight: 800, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>35 <Plus size={12} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Right Summary Column (Dynamic Sidebar) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div style={{ background: '#f9f9fb', padding: '32px', borderRadius: '24px', textAlign: 'center' }}>
                                <h4 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '4px' }}>4.8</h4>
                                <div style={{ display: 'flex', color: '#ffcc00', gap: '2px', justifyContent: 'center', marginBottom: '24px' }}>
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" stroke="none" />)}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { star: 5, val: 28 },
                                        { star: 4, val: 12 },
                                        { star: 3, val: 4 },
                                        { star: 2, val: 1 },
                                        { star: 1, val: 0 },
                                    ].map(item => (
                                        <div key={item.star} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 800, width: '12px' }}>{item.star}</span>
                                            <div style={{ flex: 1, height: '6px', background: '#eee', borderRadius: '3px', position: 'relative' }}>
                                                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(item.val / 30) * 100}%`, background: '#ffcc00', borderRadius: '3px' }}></div>
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#aaa', width: '20px' }}>{item.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: '#e2dec9', padding: '32px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <h4 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px', lineHeight: 1.2 }}>Popular brands with discounts over 25%</h4>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>B</div>
                                        ))}
                                    </div>
                                    <button style={{ width: '100%', height: '48px', background: 'white', color: 'black', borderRadius: '12px', fontSize: '13px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>View more</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
