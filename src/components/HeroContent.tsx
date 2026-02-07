import { SlidersHorizontal, Search, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../contexts/CategoryContext';

const SORT_OPTIONS = [
    { label: 'Newest Arrivals', value: 'latest' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
];

const HeroContent = () => {
    const { categories } = useCategories();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('latest');
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 900 : false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 900);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSearch = (e?: React.KeyboardEvent) => {
        if (e && e.key !== 'Enter') return;

        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        if (categoryFilter) params.set('category', categoryFilter);
        if (minPrice) params.set('min', minPrice);
        if (maxPrice) params.set('max', maxPrice);
        if (sortBy !== 'latest') params.set('sort', sortBy);

        const searchStr = params.toString();
        navigate(`/search${searchStr ? `?${searchStr}` : ''}`);
        setShowFilters(false);
    };

    const clearFilters = () => {
        setCategoryFilter(null);
        setMinPrice('');
        setMaxPrice('');
        setSortBy('latest');
    };

    const hasActiveFilters = categoryFilter !== null || minPrice !== '' || maxPrice !== '' || sortBy !== 'latest';

    return (
        <div className="hero-wrapper" style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            {/* Left Side: Content Top */}
            <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-end' }}>
                    <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '16px' }}></div>
                    <div style={{ width: '48px', height: '32px', background: 'white', borderRadius: '0 24px 24px 24px' }}></div>
                </div>

                <h1 className="hero-heading" style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.05em', marginBottom: '8px', marginTop: '0px' }}>
                    Modern Tech <br />
                    <span style={{ fontSize: '0.9em', opacity: 0.7, fontWeight: 700, display: 'inline-block', marginTop: '8px' }}>
                        Designed for Everyone
                    </span>
                </h1>
            </div>

            {/* Bottom Search Bar */}
            <div className="search-outer-container" style={{ position: 'relative', zIndex: 3, marginTop: 'auto' }}>
                <form
                    action="javascript:void(0)"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearch();
                    }}
                    style={{ maxWidth: '400px', position: 'relative' }}
                    className="hero-search-container"
                >
                    <input
                        type="search"
                        className="search-input"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        enterKeyHint="search"
                        style={{ paddingLeft: '44px', fontSize: '16px', fontWeight: 500 }}
                    />
                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.6)' }}>
                        <Search size={18} />
                    </div>
                    <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '20px', color: 'rgba(255, 255, 255, 0.6)' }} className="hero-search-icons">
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <SlidersHorizontal
                                size={20}
                                cursor="pointer"
                                onClick={() => setShowFilters(true)}
                                style={{ color: hasActiveFilters ? 'white' : 'rgba(255, 255, 255, 0.6)' }}
                            />
                            {hasActiveFilters && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    width: '8px',
                                    height: '8px',
                                    background: '#ff6b00',
                                    borderRadius: '50%',
                                    border: '1.5px solid var(--primary-color)'
                                }} />
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Right Side: Hero Image */}
            <div className="hero-image-container" style={{
                position: 'absolute',
                right: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '140%',
                width: '60%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                zIndex: 1,
                pointerEvents: 'none'
            }}>
                <motion.img
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    src="/hero image.png"
                    alt="Hero"
                    style={{
                        height: '100%',
                        width: 'auto',
                        objectFit: 'contain'
                    }}
                />
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
                            className="hero-filter-backdrop"
                        />
                        <motion.div
                            initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, x: '-50%', y: '-45%' }}
                            animate={isMobile ? { y: 0, x: 0 } : { opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                            exit={isMobile ? { y: '100%', x: 0 } : { opacity: 0, scale: 0.9, x: '-50%', y: '-45%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="hero-filter-drawer"
                            style={!isMobile ? { top: '50%', left: '50%', position: 'fixed' } : {}}
                        >
                            {isMobile && <div className="hero-drawer-handle" />}
                            <div className="hero-filter-header">
                                <h2>Refine Search</h2>
                                <button onClick={() => setShowFilters(false)} className="hero-close-btn">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="hero-filter-content">
                                <div className="hero-filter-section">
                                    <h3>Categories</h3>
                                    <div className="hero-filter-grid">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setCategoryFilter(categoryFilter === cat.name ? null : cat.name)}
                                                className={`hero-filter-btn ${categoryFilter === cat.name ? 'active' : ''}`}
                                            >
                                                {cat.name}
                                                {categoryFilter === cat.name && <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="hero-filter-section">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ margin: 0 }}>Price Range</h3>
                                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#5544ff' }}>GH₵</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={minPrice}
                                                onChange={(e) => setMinPrice(e.target.value)}
                                                className="hero-price-input"
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(e.target.value)}
                                                className="hero-price-input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="hero-filter-section">
                                    <h3>Sort By</h3>
                                    <div className="hero-sort-list">
                                        {SORT_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setSortBy(opt.value)}
                                                className={`hero-sort-item ${sortBy === opt.value ? 'active' : ''}`}
                                            >
                                                {opt.label}
                                                <div className={`hero-checkbox ${sortBy === opt.value ? 'checked' : ''}`}>
                                                    {sortBy === opt.value && <Check size={12} color="white" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="hero-filter-footer">
                                <button onClick={clearFilters} className="hero-clear-btn">Clear</button>
                                <button onClick={() => handleSearch()} className="hero-apply-btn">Show Results</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
                .hero-filter-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(8px);
                    z-index: 4000;
                }
                .hero-filter-drawer {
                    position: fixed;
                    background: white;
                    z-index: 4001;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
                    color: #1a1a1a;
                }
                @media (min-width: 901px) {
                    .hero-filter-drawer {
                        width: 450px;
                        max-height: 80vh;
                        border-radius: 48px;
                    }
                }
                @media (max-width: 900px) {
                    .hero-filter-drawer {
                        bottom: 0;
                        left: 0;
                        right: 0;
                        width: 100%;
                        height: 88vh;
                        border-radius: 40px 40px 0 0;
                    }
                }
                .hero-drawer-handle {
                    width: 40px;
                    height: 5px;
                    background: #eee;
                    border-radius: 10px;
                    margin: 12px auto 0;
                }
                .hero-filter-header {
                    padding: 24px 32px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .hero-filter-header h2 {
                    font-size: 20px;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                }
                .hero-close-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 12px;
                    background: #f5f5f5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #666;
                }
                .hero-filter-content {
                    padding: 0 32px 32px;
                    flex: 1;
                    overflow-y: auto;
                }
                .hero-filter-section {
                    margin-top: 24px;
                }
                .hero-filter-section h3 {
                    font-size: 13px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #999;
                    margin-bottom: 16px;
                }
                .hero-filter-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                .hero-filter-btn {
                    padding: 12px 16px;
                    border-radius: 16px;
                    background: #f8f8f8;
                    border: 2px solid transparent;
                    font-size: 14px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: #444;
                }
                .hero-filter-btn.active {
                    background: rgba(85, 68, 255, 0.05);
                    border-color: #5544ff;
                    color: #5544ff;
                }
                .hero-price-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .hero-price-item {
                    padding: 14px 20px;
                    background: #f8f8f8;
                    border-radius: 16px;
                    border: 2px solid transparent;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-weight: 700;
                    color: #444;
                }
                .hero-price-item.active {
                    border-color: #5544ff;
                    background: white;
                    color: #1a1a1a;
                }
                .hero-sort-item.active {
                    border-color: #5544ff;
                    background: white;
                    color: #1a1a1a;
                }
                .hero-price-input {
                    width: 100%;
                    padding: 14px 16px;
                    border-radius: 16px;
                    border: 1px solid #eee;
                    font-size: 14px;
                    font-weight: 700;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .hero-price-input:focus {
                    border-color: #5544ff;
                }
                .hero-checkbox {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #ddd;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .hero-checkbox.checked {
                    background: #5544ff;
                    border-color: #5544ff;
                }
                .hero-filter-footer {
                    padding: 20px 32px 32px;
                    display: flex;
                    gap: 12px;
                    border-top: 1px solid #f5f5f5;
                }
                .hero-clear-btn {
                    flex: 1;
                    padding: 14px;
                    border-radius: 16px;
                    font-weight: 800;
                    color: #999;
                    background: #f5f5f5;
                }
                .hero-apply-btn {
                    flex: 2;
                    padding: 14px;
                    background: #5544ff;
                    color: white;
                    border-radius: 16px;
                    font-weight: 800;
                    box-shadow: 0 8px 20px rgba(85, 68, 255, 0.2);
                }

                @media (max-width: 768px) {
                    .hero-wrapper {
                        min-height: 250px !important;
                        padding: 24px 20px 0px 20px !important;
                        justify-content: flex-start !important;
                        margin-bottom: 20px !important;
                        margin-top: 0 !important;
                    }
                    .hero-heading {
                        font-size: 26px !important;
                        line-height: 1.1 !important;
                        margin-bottom: 8px !important;
                        margin-top: 28px !important;
                    }
                    .hero-heading span {
                        font-size: 22px !important;
                        display: block;
                        margin-top: 14px !important;
                        opacity: 0.4 !important;
                    }
                    .search-outer-container {
                        position: absolute !important;
                        bottom: -15px !important;
                        left: 20px !important;
                        right: 20px !important;
                        margin-top: 0 !important;
                    }
                    .hero-search-container {
                        max-width: 100% !important;
                    }
                    .hero-search-container input {
                        padding: 12px 16px 12px 48px !important;
                        font-size: 16px !important;
                        height: 46px !important;
                        border-left-width: 3px !important;
                        background: rgba(255, 255, 255, 0.15) !important;
                        border: none !important;
                        box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important;
                    }
                    .hero-image-container {
                        width: 65% !important;
                        right: -20px !important;
                        top: 35% !important;
                        opacity: 1 !important;
                    }
                }
                @media (min-width: 769px) {
                    .search-outer-container {
                        transform: translateY(20px);
                    }
                }
            `}</style>
        </div >
    );
};

export default HeroContent;
