import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2,
    Edit2,
    Upload,
    Plus,
    X,
    Save,
    Eye,
    Check,
    ChevronLeft,
    Box,
    Tag,
    Layers,
    Type
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';

interface Variant {
    id?: string;
    option_type: string;
    option_value: string;
    price_impact: number;
}

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

const Admin = () => {
    const { isAdmin, loading: authLoading, user, profile } = useAuth();
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Editor State
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [variants, setVariants] = useState<Variant[]>([]);

    useEffect(() => {
        if (isAdmin) fetchProducts();
    }, [isAdmin]);

    const fetchProducts = async () => {
        setLoading(true);
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) setProducts(data);
        setLoading(false);
    };

    const handleOpenEditor = async (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            // Fetch variants
            const { data } = await supabase.from('product_variants').select('*').eq('product_id', product.id);
            setVariants(data || []);
        } else {
            setEditingProduct({
                name: '',
                price: 0,
                category: 'Audio',
                description: '',
                image: '',
                brand: 'BRAND TECH'
            });
            setVariants([]);
        }
        setView('editor');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newImages = [...(editingProduct?.images || [])];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `product-images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) {
                console.error(uploadError);
                alert('Upload failed for one or more images: ' + uploadError.message);
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);
                newImages.push(publicUrl);
            }
        }

        setEditingProduct(prev => ({
            ...prev,
            images: newImages,
            // Set first image as primary if none exists
            image: prev?.image || newImages[0]
        }));
        setUploading(false);
    };

    const removeImage = (index: number) => {
        setEditingProduct(prev => {
            const nextImages = prev?.images?.filter((_, i) => i !== index) || [];
            return {
                ...prev,
                images: nextImages,
                image: prev?.image === prev?.images?.[index] ? nextImages[0] || '' : prev?.image
            };
        });
    };

    const handleAddVariant = () => {
        setVariants([...variants, { option_type: 'Color', option_value: '', price_impact: 0 }]);
    };

    const handleRemoveVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!editingProduct?.name || !editingProduct?.price) return alert('Name and Price are required');

        setLoading(true);
        const isNew = !editingProduct.id;

        const payload = {
            name: editingProduct.name,
            price: Number(editingProduct.price),
            discount_price: editingProduct.discount_price ? Number(editingProduct.discount_price) : null,
            category: editingProduct.category,
            description: editingProduct.description,
            image: editingProduct.image,
            images: editingProduct.images || [],
            brand: editingProduct.brand,
            specification: editingProduct.specification,
            features: editingProduct.features || []
        };

        let result;
        if (isNew) {
            result = await supabase.from('products').insert([payload]).select().single();
        } else {
            result = await supabase.from('products').update(payload).eq('id', editingProduct.id).select().single();
        }

        if (result.error) {
            alert(result.error.message);
        } else {
            const productId = result.data.id;

            // Delete old variants if editing
            if (!isNew) {
                await supabase.from('product_variants').delete().eq('product_id', productId);
            }

            // Insert new variants
            if (variants.length > 0) {
                const variantPayload = variants.map(v => ({
                    product_id: productId,
                    option_type: v.option_type,
                    option_value: v.option_value,
                    price_impact: v.price_impact
                }));
                await supabase.from('product_variants').insert(variantPayload);
            }

            alert('Store updated successfully!');
            fetchProducts();
            setView('list');
        }
        setLoading(false);
    };

    if (authLoading) return <div style={{ padding: '100px', textAlign: 'center' }}>Verifying Profile...</div>;

    if (!isAdmin) return (
        <div style={{ padding: '100px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 900 }}>Access Denied</h2>
            <div style={{ background: '#f5f5f7', padding: '24px', borderRadius: '16px', maxWidth: '500px' }}>
                <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#888', wordBreak: 'break-all' }}>
                    User ID: {user?.id}<br />
                    Email: {user?.email}<br />
                    Role: {profile?.role || 'None'}
                </p>
            </div>
            <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', background: 'black', color: 'white', borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                Retry
            </button>
        </div>
    );

    return (
        <div className="layout-with-sidebar">
            <Sidebar />

            <div style={{ flex: 1, padding: '40px' }}>
                {view === 'list' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <div>
                                <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em' }}>Inventory Manager</h1>
                                <p style={{ color: '#aaa', fontWeight: 600 }}>{products.length} Products currently in catalogue</p>
                            </div>
                            <button
                                onClick={() => handleOpenEditor()}
                                style={{ height: '48px', padding: '0 24px', background: 'black', color: 'white', borderRadius: '14px', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Plus size={18} /> Add New Product
                            </button>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '24px'
                        }}>
                            {loading ? [1, 2, 3, 4].map(i => (
                                <div key={i} style={{ height: '340px', background: '#f5f5f7', borderRadius: '24px', animation: 'pulse 1.5s infinite' }}></div>
                            )) :
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
                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'black'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#f0f0f0'}
                                    >
                                        <div style={{ position: 'relative', height: '200px', background: '#f9f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                                            <img src={product.image || '/laptop.png'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleOpenEditor(product)}
                                                    style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Delete product?')) {
                                                            await supabase.from('products').delete().eq('id', product.id);
                                                            fetchProducts();
                                                        }
                                                    }}
                                                    style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4444', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div style={{ position: 'absolute', bottom: '16px', left: '16px' }}>
                                                <span style={{ fontSize: '10px', fontWeight: 900, padding: '4px 10px', background: 'black', color: 'white', borderRadius: '8px', textTransform: 'uppercase' }}>
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#666', background: '#f5f5f7', padding: '6px 12px', borderRadius: '10px' }}>
                                                    <Box size={12} /> Stock: High
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', padding: '6px 12px', borderRadius: '10px' }}>
                                                    <Check size={12} /> Published
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '48px' }}>
                            <button
                                onClick={() => setView('list')}
                                style={{ width: '48px', height: '48px', borderRadius: '16px', border: '1px solid #eee', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'black'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#eee'}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div>
                                <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em' }}>
                                    {editingProduct?.id ? 'Edit Product' : 'Create New Product'}
                                </h1>
                                <p style={{ color: '#aaa', fontWeight: 600 }}>Configure your product listing with high-end details</p>
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
                                <button
                                    onClick={() => setView('list')}
                                    style={{ height: '56px', padding: '0 32px', background: '#f5f5f7', color: 'black', borderRadius: '18px', fontWeight: 800, fontSize: '15px', border: 'none', cursor: 'pointer' }}>
                                    Discard Changes
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    style={{ height: '56px', padding: '0 40px', background: 'black', color: 'white', borderRadius: '18px', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                    <Save size={20} /> {loading ? 'Processing...' : 'Save & Publish'}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '40px' }}>
                            {/* Left Column - Main Details */}
                            <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '32px' }}>

                                {/* Basic Info Card */}
                                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #f0f0f0', padding: '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                                    <p style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', letterSpacing: '0.1em', marginBottom: '32px', textTransform: 'uppercase' }}>Basic Information</p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <label style={{ fontSize: '12px', fontWeight: 800, color: '#555' }}>Product Title</label>
                                                <input
                                                    placeholder="e.g. Studio Pro Wireless"
                                                    value={editingProduct?.name}
                                                    onChange={e => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                                                    style={{ padding: '16px', borderRadius: '14px', border: '2px solid #f5f5f7', outline: 'none', fontSize: '15px', fontWeight: 700 }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <label style={{ fontSize: '12px', fontWeight: 800, color: '#555' }}>Brand Name</label>
                                                <input
                                                    placeholder="e.g. APPLE, SONY"
                                                    value={editingProduct?.brand}
                                                    onChange={e => setEditingProduct(prev => ({ ...prev, brand: e.target.value.toUpperCase() }))}
                                                    style={{ padding: '16px', borderRadius: '14px', border: '2px solid #f5f5f7', outline: 'none', fontSize: '15px', fontWeight: 700 }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: 800, color: '#555' }}>Product Narrative</label>
                                            <textarea
                                                rows={5}
                                                placeholder="Craft a compelling story for your product..."
                                                value={editingProduct?.description}
                                                onChange={e => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                                                style={{ padding: '16px', borderRadius: '14px', border: '2px solid #f5f5f7', outline: 'none', fontSize: '15px', fontWeight: 600, lineHeight: 1.6, resize: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Media Gallery Card */}
                                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #f0f0f0', padding: '40px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                        <p style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Media Gallery</p>
                                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#4ade80' }}>{editingProduct?.images?.length || 0} Assets Uploaded</span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
                                        {editingProduct?.images?.map((url, idx) => (
                                            <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '20px', overflow: 'hidden', background: '#f9f9fb', border: url === editingProduct.image ? '3px solid black' : '1px solid #eee' }}>
                                                <img src={url} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
                                                <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                                                    <button
                                                        onClick={() => removeImage(idx)}
                                                        style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,68,68,0.9)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                {url === editingProduct.image && (
                                                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'black', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 900 }}>PRIMARY</div>
                                                )}
                                                {url !== editingProduct.image && (
                                                    <button
                                                        onClick={() => {
                                                            const otherImages = editingProduct.images?.filter(img => img !== url) || [];
                                                            setEditingProduct(prev => ({
                                                                ...prev,
                                                                image: url,
                                                                images: [url, ...otherImages]
                                                            }));
                                                        }}
                                                        style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'white', color: 'black', padding: '4px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 900, border: '1px solid #eee', cursor: 'pointer' }}>SET PRIMARY</button>
                                                )}
                                            </div>
                                        ))}

                                        <div style={{ position: 'relative', aspectRatio: '1', borderRadius: '20px', border: '2px dashed #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#fcfcfd' }}>
                                            <Upload size={24} style={{ color: '#ccc' }} />
                                            <p style={{ fontSize: '11px', fontWeight: 800, color: '#aaa' }}>{uploading ? 'Uploading...' : 'Add Assets'}</p>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleImageUpload}
                                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Features & Specs */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #f0f0f0', padding: '32px' }}>
                                        <p style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', letterSpacing: '0.1em', marginBottom: '24px', textTransform: 'uppercase' }}>Key Features</p>
                                        <textarea
                                            rows={6}
                                            placeholder="Enter flagship features (one per line)..."
                                            value={editingProduct?.features?.join('\n')}
                                            onChange={e => setEditingProduct(prev => ({ ...prev, features: e.target.value.split('\n') }))}
                                            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #f5f5f7', background: '#f9f9fb', outline: 'none', fontWeight: 600, fontSize: '13px', lineHeight: 1.6, resize: 'none' }}
                                        />
                                    </div>
                                    <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #f0f0f0', padding: '32px' }}>
                                        <p style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', letterSpacing: '0.1em', marginBottom: '24px', textTransform: 'uppercase' }}>Full Technical Specs</p>
                                        <textarea
                                            rows={6}
                                            placeholder="Detailed specs (Model, Battery, Weight etc)..."
                                            value={editingProduct?.specification}
                                            onChange={e => setEditingProduct(prev => ({ ...prev, specification: e.target.value }))}
                                            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #f5f5f7', background: '#f9f9fb', outline: 'none', fontWeight: 600, fontSize: '13px', lineHeight: 1.6, resize: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Secondary Settings */}
                            <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '32px' }}>

                                {/* Pricing Card */}
                                <div style={{ background: 'black', color: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                                    <p style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: '32px', textTransform: 'uppercase' }}>Pricing Strategy</p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', display: 'block' }}>Regular Price ($)</label>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={editingProduct?.price}
                                                onChange={e => setEditingProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                                                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', outline: 'none', fontSize: '24px', fontWeight: 900 }}
                                            />
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', display: 'block' }}>Sale Price (Optional)</label>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={editingProduct?.discount_price}
                                                onChange={e => setEditingProduct(prev => ({ ...prev, discount_price: Number(e.target.value) }))}
                                                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#4ade80', outline: 'none', fontSize: '24px', fontWeight: 900 }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Variants Card */}
                                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #f0f0f0', padding: '32px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <p style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Available Tiers</p>
                                        <button
                                            onClick={handleAddVariant}
                                            style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#f5f5f7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {variants.map((v, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '10px', background: '#f9f9fb', padding: '12px', borderRadius: '16px', border: '1px solid #f0f0f0' }}>
                                                <input
                                                    placeholder="Type"
                                                    value={v.option_type}
                                                    onChange={e => {
                                                        const n = [...variants];
                                                        n[i].option_type = e.target.value;
                                                        setVariants(n);
                                                    }}
                                                    style={{ width: '70px', border: 'none', background: 'transparent', fontSize: '11px', fontWeight: 900, outline: 'none' }}
                                                />
                                                <input
                                                    placeholder="Value"
                                                    value={v.option_value}
                                                    onChange={e => {
                                                        const n = [...variants];
                                                        n[i].option_value = e.target.value;
                                                        setVariants(n);
                                                    }}
                                                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '11px', fontWeight: 700, outline: 'none' }}
                                                />
                                                <button onClick={() => handleRemoveVariant(i)} style={{ border: 'none', background: 'transparent', color: '#ff4444', cursor: 'pointer' }}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Status & Tags */}
                                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #f0f0f0', padding: '32px' }}>
                                    <p style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', letterSpacing: '0.1em', marginBottom: '24px', textTransform: 'uppercase' }}>Organization</p>
                                    <select
                                        value={editingProduct?.category}
                                        onChange={e => setEditingProduct(prev => ({ ...prev, category: e.target.value }))}
                                        style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #f5f5f7', background: '#f9f9fb', outline: 'none', fontWeight: 800, fontSize: '14px' }}>
                                        <option>Audio</option>
                                        <option>Wearables</option>
                                        <option>Computing</option>
                                        <option>Vision</option>
                                        <option>Mobile</option>
                                    </select>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Admin;
