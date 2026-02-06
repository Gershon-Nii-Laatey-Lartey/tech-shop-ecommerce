import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { supabase } from '../supabaseClient';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';
import { Search as SearchIcon, Loader2, SlidersHorizontal, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useCategories } from '../contexts/CategoryContext';

interface Product {
    id: string;
    name: string;
    price: string;
    image: string;
    category: string;
    is_new?: boolean;
}

const ITEMS_PER_PAGE = 8;
const SORT_OPTIONS = [
    { label: 'Newest Arrivals', value: 'latest' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
];

const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { categories } = useCategories();
    const query = searchParams.get('q') || '';
    const categoryFilter = searchParams.get('category') || '';
    const minPriceParam = searchParams.get('min') || '';
    const maxPriceParam = searchParams.get('max') || '';
    const sortBy = searchParams.get('sort') || 'latest';

    const minPriceValue = parseInt(minPriceParam || '0');
    const maxPriceValue = parseInt(maxPriceParam || '100000');

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [tempMinPrice, setTempMinPrice] = useState(minPriceParam);
    const [tempMaxPrice, setTempMaxPrice] = useState(maxPriceParam);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 900 : false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 900);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: false
    });

    const fetchProducts = useCallback(async (pageNum: number, isInitial: boolean = false) => {
        try {
            if (isInitial) setLoading(true);
            else setLoadingMore(true);

            const from = pageNum * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            let supabaseQuery = supabase
                .from('products')
                .select('*', { count: 'exact' });

            if (query) {
                supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,category.ilike.%${query}%`);
            }

            if (categoryFilter) {
                supabaseQuery = supabaseQuery.eq('category', categoryFilter);
            }

            if (minPriceValue > 0) {
                supabaseQuery = supabaseQuery.gte('price', minPriceValue);
            }
            if (maxPriceValue < 100000) {
                supabaseQuery = supabaseQuery.lte('price', maxPriceValue);
            }

            let orderCol = 'created_at';
            let ascending = false;

            if (sortBy === 'price-low') {
                orderCol = 'price';
                ascending = true;
            } else if (sortBy === 'price-high') {
                orderCol = 'price';
                ascending = false;
            }

            const { data, error, count } = await supabaseQuery
                .order(orderCol, { ascending })
                .range(from, to);

            if (error) throw error;

            if (isInitial) {
                setProducts(data || []);
                setTotalCount(count || 0);
            } else {
                setProducts(prev => [...prev, ...(data || [])]);
            }

            setHasMore((data?.length || 0) === ITEMS_PER_PAGE);
        } catch (err) {
            console.error('Error searching products:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [query, categoryFilter, minPriceValue, maxPriceValue, sortBy]);

    useEffect(() => {
        setPage(0);
        fetchProducts(0, true);
    }, [query, categoryFilter, minPriceValue, maxPriceValue, sortBy, fetchProducts]);

    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchProducts(nextPage);
        }
    }, [inView, hasMore, loading, loadingMore, page, fetchProducts]);

    const handleFilterChange = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        setSearchParams(params);
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('category');
        params.delete('min');
        params.delete('max');
        params.delete('sort');
        setSearchParams(params);
        setTempMinPrice('');
        setTempMaxPrice('');
        setShowFilters(false);
    };

    const applyPriceRange = () => {
        const params = new URLSearchParams(searchParams);
        if (tempMinPrice) params.set('min', tempMinPrice);
        else params.delete('min');

        if (tempMaxPrice) params.set('max', tempMaxPrice);
        else params.delete('max');

        setSearchParams(params);
    };

    return (
        <div className="layout-with-sidebar">
            <Sidebar />

            <div className="search-results-main">
                <div className="search-results-container">
                    {/* Header */}
                    <div className="search-page-header">

                        <div className="search-meta">
                            <h1 className="search-title">
                                {query ? (
                                    <>Results for "<span className="query-highlight">{query}</span>"</>
                                ) : categoryFilter ? (
                                    <><span className="query-highlight">{categoryFilter}</span> Collection</>
                                ) : (
                                    "Exploring All Tech"
                                )}
                            </h1>
                            {!loading && (
                                <p className="results-count">
                                    {totalCount} items found
                                    {(categoryFilter || minPriceValue > 0 || maxPriceValue < 100000) && " • Filters applied"}
                                </p>
                            )}
                        </div>

                        <div className="search-actions">
                            <button className="filter-chip" onClick={() => setShowFilters(true)}>
                                <SlidersHorizontal size={14} />
                                Filters
                                {(categoryFilter || minPriceValue > 0 || maxPriceValue < 100000) && <span className="filter-indicator" />}
                            </button>
                        </div>
                    </div>

                    <div className="results-content">
                        {loading && page === 0 ? (
                            <div className="loading-grid">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="skeleton product-skeleton" />
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="product-grid-main">
                                    {products.map((product, idx) => (
                                        <motion.div
                                            key={`${product.id}-${idx}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: (idx % ITEMS_PER_PAGE) * 0.05 }}
                                        >
                                            <ProductCard
                                                id={product.id}
                                                name={product.name}
                                                price={product.price}
                                                image={product.image}
                                                category={product.category}
                                                isNew={product.is_new}
                                            />
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Infinite Scroll Trigger */}
                                <div ref={ref} className="scroll-trigger">
                                    {loadingMore && (
                                        <div className="loader-box">
                                            <Loader2 size={24} className="spin" />
                                            <span>Discovering more...</span>
                                        </div>
                                    )}
                                    {!hasMore && products.length > 0 && (
                                        <div className="end-message">
                                            <div className="dot" />
                                            <span>You've reached the end of the collection</span>
                                            <div className="dot" />
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="empty-search"
                            >
                                <div className="empty-search-icon">
                                    <SearchIcon size={40} />
                                </div>
                                <h2>No matches found</h2>
                                <p>We couldn't find anything matching your search. Try different keywords or browse categories.</p>
                                <button onClick={() => { clearFilters(); navigate('/'); }} className="browse-all-btn">
                                    Browse New Arrivals
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Overlay */}
            <AnimatePresence>
                {showFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowFilters(false)}
                            className="filter-backdrop"
                        />
                        <motion.div
                            initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
                            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
                            exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="filter-drawer"
                        >
                            {isMobile && <div className="drawer-handle" />}
                            <div className="filter-drawer-header">
                                <h2>Filters</h2>
                                <button onClick={() => setShowFilters(false)} className="close-btn">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="filter-drawer-content">
                                <div className="filter-section">
                                    <h3>Categories</h3>
                                    <div className="filter-options-grid">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => handleFilterChange('category', categoryFilter === cat.name ? null : cat.name)}
                                                className={`filter-option ${categoryFilter === cat.name ? 'active' : ''}`}
                                            >
                                                {cat.name}
                                                {categoryFilter === cat.name && <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="filter-section">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ margin: 0 }}>Price Range</h3>
                                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#5544ff' }}>GH₵</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={tempMinPrice}
                                                onChange={(e) => setTempMinPrice(e.target.value)}
                                                className="filter-price-input"
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={tempMaxPrice}
                                                onChange={(e) => setTempMaxPrice(e.target.value)}
                                                className="filter-price-input"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={applyPriceRange}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '12px',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            color: '#5544ff'
                                        }}
                                    >
                                        Apply Range
                                    </button>
                                </div>

                                <div className="filter-section">
                                    <h3>Sort By</h3>
                                    <div className="filter-list">
                                        {SORT_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleFilterChange('sort', opt.value)}
                                                className={`filter-list-item ${sortBy === opt.value ? 'active' : ''}`}
                                            >
                                                {opt.label}
                                                <div className={`filter-checkbox ${sortBy === opt.value ? 'checked' : ''}`}>
                                                    {sortBy === opt.value && <Check size={12} color="white" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="filter-drawer-footer">
                                <button onClick={clearFilters} className="clear-all-btn">Clear All</button>
                                <button onClick={() => setShowFilters(false)} className="apply-btn">Show Results</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
                .search-results-main {
                    flex: 1;
                    background: #fff;
                    min-height: 100vh;
                    padding: 40px;
                }
                .search-results-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .search-page-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 48px;
                    gap: 24px;
                }
                .back-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    padding: 10px 16px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 700;
                    color: #64748B;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .back-link:hover {
                    background: #f1f5f9;
                    color: #0F172A;
                }
                .search-meta {
                    flex: 1;
                }
                .search-title {
                    font-size: 32px;
                    font-weight: 900;
                    color: #0F172A;
                    letter-spacing: -0.04em;
                    margin: 0 0 4px 0;
                }
                .query-highlight {
                    color: #5544ff;
                }
                .results-count {
                    color: #64748B;
                    font-size: 15px;
                    font-weight: 600;
                    margin: 0;
                }
                .filter-chip {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 20px;
                    background: #0F172A;
                    color: white;
                    border-radius: 14px;
                    font-size: 13px;
                    font-weight: 800;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
                    position: relative;
                }
                .filter-indicator {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    width: 10px;
                    height: 10px;
                    background: #5544ff;
                    border: 2px solid white;
                    border-radius: 50%;
                }
                .filter-chip:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.2);
                }
                .product-grid-main {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 24px;
                }
                .scroll-trigger {
                    margin-top: 60px;
                    padding-bottom: 60px;
                    display: flex;
                    justify-content: center;
                }
                .loader-box {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #64748B;
                    font-weight: 700;
                    font-size: 14px;
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .end-message {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    color: #CBD5E1;
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                }
                .dot {
                    width: 6px;
                    height: 6px;
                    background: #E2E8F0;
                    border-radius: 50%;
                }
                .empty-search {
                    text-align: center;
                    padding: 100px 24px;
                    background: #F8FAFC;
                    border-radius: 40px;
                    border: 2px dashed #E2E8F0;
                }
                .empty-search-icon {
                    width: 80px;
                    height: 80px;
                    background: white;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                    color: #CBD5E1;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                }
                .empty-search h2 {
                    font-size: 24px;
                    font-weight: 900;
                    color: #0F172A;
                    margin-bottom: 12px;
                }
                .empty-search p {
                    color: #64748B;
                    font-weight: 500;
                    max-width: 400px;
                    margin: 0 auto 32px;
                }
                .browse-all-btn {
                    background: #5544ff;
                    color: white;
                    padding: 16px 32px;
                    border-radius: 16px;
                    font-weight: 800;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 10px 20px rgba(85, 68, 255, 0.2);
                }
                .loading-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 32px;
                }
                .product-skeleton {
                    height: 380px;
                    background: #F8FAFC;
                    border-radius: 32px;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }

                /* Filter UI Styles */
                .filter-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(4px);
                    z-index: 3000;
                }
                .filter-drawer {
                    position: fixed;
                    background: white;
                    z-index: 3001;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
                }

                @media (min-width: 901px) {
                    .filter-drawer {
                        top: 10%;
                        left: 50%;
                        margin-left: -250px;
                        width: 500px;
                        max-height: 80vh;
                        border-radius: 48px;
                    }
                }

                @media (max-width: 900px) {
                    .filter-drawer {
                        bottom: 0;
                        left: 0;
                        right: 0;
                        width: 100%;
                        height: 88vh;
                        border-radius: 40px 40px 0 0;
                    }
                }
                .drawer-handle {
                    width: 40px;
                    height: 5px;
                    background: #e2e8f0;
                    border-radius: 10px;
                    margin: 12px auto 0;
                }
                .filter-drawer-header {
                    padding: 12px 24px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid #f1f5f9;
                }
                .filter-drawer-header h2 {
                    font-size: 24px;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0;
                }
                .close-btn {
                    color: #64748B;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: #f8fafc;
                }
                .close-btn:hover {
                    background: #f1f5f9;
                    color: #0F172A;
                }
                .filter-drawer-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }
                .filter-section {
                    margin-bottom: 24px;
                }
                .filter-section h3 {
                    font-size: 14px;
                    font-weight: 800;
                    color: #0F172A;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .filter-options-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .filter-option {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 18px;
                    background: #f8fafc;
                    border: 2px solid transparent;
                    border-radius: 16px;
                    font-size: 14px;
                    font-weight: 700;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .filter-option:hover {
                    background: #f1f5f9;
                    border-color: #e2e8f0;
                }
                .filter-option.active {
                    background: rgba(85, 68, 255, 0.05);
                    border-color: #5544ff;
                    color: #5544ff;
                }
                .filter-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .filter-list-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: #f8fafc;
                    border: 2px solid transparent;
                    border-radius: 16px;
                    font-size: 14px;
                    font-weight: 700;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                }
                .filter-list-item:hover {
                    background: #f1f5f9;
                }
                .filter-list-item.active {
                    background: white;
                    border-color: #5544ff;
                    color: #0F172A;
                    box-shadow: 0 4px 12px rgba(85, 68, 255, 0.1);
                }
                .filter-list-item.active {
                    background: #f8fafc;
                    border-color: #5544ff;
                }
                .filter-price-input {
                    width: 100%;
                    padding: 12px 14px;
                    border-radius: 12px;
                    border: 1px solid #eee;
                    font-size: 13px;
                    font-weight: 700;
                    outline: none;
                }
                .filter-price-input:focus {
                    border-color: #5544ff;
                }
                .filter-checkbox {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #cbd5e1;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .filter-checkbox.checked {
                    background: #5544ff;
                    border-color: #5544ff;
                }
                .filter-drawer-footer {
                    padding: 24px 32px 40px;
                    display: flex;
                    gap: 16px;
                    border-top: 1px solid #f1f5f9;
                }
                .clear-all-btn {
                    flex: 1;
                    padding: 16px;
                    border-radius: 16px;
                    font-weight: 800;
                    color: #64748B;
                    background: #f8fafc;
                    transition: all 0.2s;
                }
                .clear-all-btn:hover {
                    background: #f1f5f9;
                    color: #0F172A;
                }
                .apply-btn {
                    flex: 2;
                    padding: 16px;
                    background: #5544ff;
                    color: white;
                    border-radius: 16px;
                    font-weight: 800;
                    box-shadow: 0 8px 16px rgba(85, 68, 255, 0.2);
                }

                @media (max-width: 900px) {
                    .search-results-main {
                        padding: 16px 8px !important;
                    }
                    .search-page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 0 16px;
                        gap: 20px;
                        margin-bottom: 32px;
                    }
                    .search-title {
                        font-size: 24px;
                    }
                    .product-grid-main {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                        padding: 0 4px;
                    }
                }
            `}</style>
        </div>
    );
};

export default SearchResults;
