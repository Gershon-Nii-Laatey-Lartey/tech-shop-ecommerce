import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    brand?: string;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            const saved = localStorage.getItem('recentSearches');
            if (saved) setRecentSearches(JSON.parse(saved));
        }
    }, [isOpen]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (query.length >= 2) {
                searchProducts();
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [query]);

    const searchProducts = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('products')
            .select('*')
            .or(`name.ilike.%${query}%,category.ilike.%${query}%,brand.ilike.%${query}%`)
            .limit(8);

        if (data) setResults(data);
        setLoading(false);
    };

    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery);
        // Save to recent searches
        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: '100px'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        width: '100%',
                        maxWidth: '640px',
                        background: 'white',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}
                >
                    {/* Search Input */}
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Search size={24} color="#888" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search products, categories, brands..."
                            style={{
                                flex: 1,
                                border: 'none',
                                outline: 'none',
                                fontSize: '18px',
                                fontWeight: 600
                            }}
                        />
                        <button
                            onClick={onClose}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                border: 'none',
                                background: '#f5f5f7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {loading && (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <div style={{ width: '32px', height: '32px', border: '3px solid #f0f0f0', borderTop: '3px solid black', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                            </div>
                        )}

                        {!loading && query.length === 0 && (
                            <div style={{ padding: '24px' }}>
                                {recentSearches.length > 0 && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '12px' }}>Recent Searches</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {recentSearches.map((search, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSearch(search)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        borderRadius: '20px',
                                                        background: '#f5f5f7',
                                                        border: 'none',
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {search}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <p style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '12px' }}>Popular Categories</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {['Laptops', 'Audio', 'Wearables', 'Vision', 'Accessories'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => handleSearch(cat)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                background: 'black',
                                                color: 'white',
                                                border: 'none',
                                                fontSize: '13px',
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!loading && query.length > 0 && results.length === 0 && (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <p style={{ fontSize: '16px', fontWeight: 700, color: '#888' }}>No results found for "{query}"</p>
                                <p style={{ fontSize: '14px', color: '#aaa', marginTop: '8px' }}>Try different keywords</p>
                            </div>
                        )}

                        {!loading && results.length > 0 && (
                            <div style={{ padding: '16px' }}>
                                <p style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '12px', paddingLeft: '8px' }}>
                                    {results.length} results
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {results.map(product => (
                                        <Link
                                            key={product.id}
                                            to={`/product/${product.id}`}
                                            onClick={onClose}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                padding: '12px',
                                                borderRadius: '16px',
                                                textDecoration: 'none',
                                                color: 'inherit',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f9f9fb'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                background: '#f5f5f7',
                                                borderRadius: '12px',
                                                padding: '8px',
                                                flexShrink: 0
                                            }}>
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontWeight: 800, fontSize: '15px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {product.name}
                                                </p>
                                                <p style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>
                                                    {product.category} {product.brand && `• ${product.brand}`}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontWeight: 900, fontSize: '16px' }}>${product.price.toLocaleString()}</span>
                                                <ArrowRight size={18} color="#ccc" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                <Link
                                    to={`/products?search=${encodeURIComponent(query)}`}
                                    onClick={onClose}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '16px',
                                        marginTop: '16px',
                                        background: '#f5f5f7',
                                        borderRadius: '14px',
                                        fontWeight: 700,
                                        fontSize: '14px',
                                        textDecoration: 'none',
                                        color: '#333'
                                    }}
                                >
                                    View all results for "{query}" <ArrowRight size={16} />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Footer hint */}
                    <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#aaa', fontWeight: 600 }}>
                            <kbd style={{ padding: '4px 8px', background: '#f5f5f7', borderRadius: '6px', fontFamily: 'inherit' }}>ESC</kbd> to close
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SearchModal;