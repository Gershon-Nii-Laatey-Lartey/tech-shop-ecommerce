import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroContent from '../components/HeroContent';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabaseClient';

interface Product {
    id: string;
    name: string;
    price: string;
    image: string;
    category: string;
    is_new?: boolean;
}

const Home = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products;

    return (
        <div className="layout-with-sidebar">
            <Sidebar />

            <div style={{ flex: 1 }}>
                <HeroContent />

                {/* Mobile Category Pills */}
                <div className="mobile-category-pills" style={{
                    display: 'none',
                    padding: '20px 0 10px',
                    overflowX: 'auto',
                    gap: '12px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                    {['All', 'Laptops', 'Audio', 'Wearables', 'Vision'].map((cat) => (
                        <span
                            key={cat}
                            onClick={() => {
                                if (cat === 'All') {
                                    navigate('/search');
                                } else {
                                    navigate(`/search?q=${encodeURIComponent(cat)}`);
                                }
                            }}
                            style={{
                                padding: '8px 20px',
                                background: '#f3f4f6',
                                color: '#666',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat}
                        </span>
                    ))}
                </div>

                <section style={{ padding: '30px 0 100px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.04em' }}>Recommended <br /> <span style={{ color: '#aaa' }}>For You</span></h2>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: 'black', borderBottom: '2px solid black', paddingBottom: '3px', cursor: 'pointer' }}>NEWEST</span>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#aaa', paddingBottom: '3px', cursor: 'pointer' }}>POPULAR</span>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                            <div className="loading-dots">
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        </div>
                    ) : (
                        <div className="product-grid-main">
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    price={product.price}
                                    image={product.image}
                                    category={product.category}
                                    isNew={product.is_new}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
            <style>{`
                .product-grid-main {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 24px;
                }
                @media (max-width: 768px) {
                    .product-grid-main {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                    }
                    .mobile-category-pills {
                        display: flex !important;
                    }
                    .mobile-category-pills::-webkit-scrollbar {
                        display: none;
                    }
                }
                .loading-dots {
                    font-size: 40px;
                    font-weight: 900;
                    letter-spacing: 4px;
                }
                .loading-dots span {
                    animation: blink 1s infinite;
                }
                .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
                .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
                @keyframes blink {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default Home;
