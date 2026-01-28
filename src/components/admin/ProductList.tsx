import { motion } from 'framer-motion';
import { Edit2, Trash2, Plus, Box, Check } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface Product {
    id: string;
    name: string;
    price: number;
    discount_price?: number;
    category: string;
    image: string;
    images?: string[];
    description: string;
    brand?: string;
    specification?: string;
    features?: string[];
    options?: any[];
}

interface ProductListProps {
    products: Product[];
    loading: boolean;
    onEditProduct: (product: Product) => void;
    onAddProduct: () => void;
    onRefresh: () => void;
}

const ProductList = ({ products, loading, onEditProduct, onAddProduct, onRefresh }: ProductListProps) => {
    const handleDelete = async (productId: string) => {
        if (confirm('Delete product?')) {
            await supabase.from('products').delete().eq('id', productId);
            onRefresh();
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em' }}>Inventory Manager</h1>
                    <p style={{ color: '#aaa', fontWeight: 600 }}>{products.length} Products currently in catalogue</p>
                </div>
                <button
                    onClick={onAddProduct}
                    style={{
                        height: '48px',
                        padding: '0 24px',
                        background: 'black',
                        color: 'white',
                        borderRadius: '14px',
                        fontWeight: 800,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> Add New Product
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
            }}>
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            style={{
                                height: '340px',
                                background: '#f5f5f7',
                                borderRadius: '24px',
                                animation: 'pulse 1.5s infinite'
                            }}
                        />
                    ))
                ) : (
                    products.map(product => (
                        <motion.div
                            key={product.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'white',
                                borderRadius: '24px',
                                border: '1px solid #f0f0f0',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'black')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = '#f0f0f0')}
                        >
                            <div
                                style={{
                                    position: 'relative',
                                    height: '200px',
                                    background: '#f9f9fb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '24px'
                                }}
                            >
                                <img
                                    src={product.image || '/laptop.png'}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => onEditProduct(product)}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#111',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#ff4444',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div style={{ position: 'absolute', bottom: '16px', left: '16px' }}>
                                    <span
                                        style={{
                                            fontSize: '10px',
                                            fontWeight: 900,
                                            padding: '4px 10px',
                                            background: 'black',
                                            color: 'white',
                                            borderRadius: '8px',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {product.category}
                                    </span>
                                </div>
                            </div>

                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div>
                                        <h4 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '2px' }}>{product.name}</h4>
                                        <p style={{ fontSize: '12px', color: '#aaa', fontWeight: 700 }}>{product.brand || 'No Brand'}</p>
                                    </div>
                                    <p style={{ fontSize: '18px', fontWeight: 900 }}>${product.price.toLocaleString()}</p>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            color: '#666',
                                            background: '#f5f5f7',
                                            padding: '6px 12px',
                                            borderRadius: '10px'
                                        }}
                                    >
                                        <Box size={12} /> Stock: High
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            color: '#4ade80',
                                            background: 'rgba(74, 222, 128, 0.1)',
                                            padding: '6px 12px',
                                            borderRadius: '10px'
                                        }}
                                    >
                                        <Check size={12} /> Published
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

export default ProductList;
