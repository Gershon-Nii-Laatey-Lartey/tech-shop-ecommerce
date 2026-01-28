import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    isNew?: boolean;
}

const Home = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('products')
                .select('*')
                .limit(6); // Show top 6 on home

            if (data && data.length > 0) {
                setProducts(data);
            } else {
                // Return empty or fetch nothing if no data, 
                // but for now keeping fallback so UI isn't empty on first run
                console.warn('No products in database, showing fallbacks');
                const fallbackProducts = [
                    { id: '1', name: 'SONIC-X', price: '249.00', image: '/hero-product.png', category: 'Audio', isNew: true },
                    { id: '2', name: 'TIME-LESS', price: '189.50', image: '/watch.png', category: 'Wearables', isNew: true },
                    { id: '3', name: 'BLADE M1', price: '1299.00', image: '/laptop.png', category: 'Computing' },
                    { id: '4', name: 'CORE BUDS', price: '99.00', image: '/hero-product.png', category: 'Audio' },
                    { id: '5', name: 'VISION PRO', price: '3499.00', image: '/watch.png', category: 'Vision' },
                    { id: '6', name: 'SILK PHONE', price: '999.00', image: '/mobile.png', category: 'Mobile' },
                ];
                setProducts(fallbackProducts);
            }
            setLoading(false);
        };

        fetchProducts();
    }, []);

    return (
        <div className="layout-with-sidebar">
            <Sidebar />

            <div style={{ flex: 1 }}>
                <HeroContent />

                <section style={{ padding: '60px 0 100px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em' }}>Recommended <br /> <span style={{ color: '#aaa' }}>For You</span></h2>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: 'black', borderBottom: '2px solid black', paddingBottom: '4px', cursor: 'pointer' }}>NEWEST</span>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#aaa', paddingBottom: '4px', cursor: 'pointer' }}>POPULAR</span>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                style={{ width: '40px', height: '40px', border: '4px solid #f0f0f0', borderTop: '4px solid black', borderRadius: '50%' }}
                            />
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '24px'
                        }}>
                            {products.map(product => (
                                <ProductCard key={product.id} {...product} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Home;
