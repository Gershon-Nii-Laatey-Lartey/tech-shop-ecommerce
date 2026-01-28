import { useState, useEffect } from 'react';

import { Search, Filter, Grid, List as ListIcon } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabaseClient';

interface Product {
    id: string;
    name: string;
    price: string;
    image: string;
    category: string;
    isTop?: boolean;
    brand?: string;
}

const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('products')
                .select('*');

            if (data && data.length > 0) {
                setProducts(data);
            } else {
                console.warn('No products found in DB, using fallbacks');
                const fallbacks = [
                    { id: '1', name: 'SONIC-X', price: '249.00', image: '/hero-product.png', category: 'Audio', isTop: true },
                    { id: '2', name: 'TIME-LESS', price: '189.50', image: '/watch.png', category: 'Wearables', isTop: true },
                    { id: '3', name: 'BLADE M1', price: '1299.00', image: '/laptop.png', category: 'Computing' },
                    { id: '4', name: 'CORE BUDS', price: '99.00', image: '/hero-product.png', category: 'Audio' },
                    { id: '5', name: 'VISION PRO', price: '3499.00', image: '/watch.png', category: 'Vision' },
                ];
                setProducts(fallbacks);
            }
            setLoading(false);
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="layout-with-sidebar">
            <Sidebar />

            <div style={{ flex: 1, padding: '0 0 100px' }}>
                {/* Header Search & Filter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#aaa' }} />
                        <input
                            type="text"
                            placeholder="Search catalogue..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid #eee', outline: 'none', fontSize: '14px', fontWeight: 600, background: '#f9f9fb' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ width: '45px', height: '45px', borderRadius: '14px', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
                            <Filter size={18} />
                        </button>
                        <div style={{ display: 'flex', background: '#f5f5f7', padding: '4px', borderRadius: '14px' }}>
                            <button style={{ width: '37px', height: '37px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                <Grid size={16} />
                            </button>
                            <button style={{ width: '37px', height: '37px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: '#aaa' }}>
                                <ListIcon size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                        <div style={{ width: '40px', height: '40px', border: '4px solid #f0f0f0', borderTop: '4px solid black', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: '32px'
                    }}>
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
