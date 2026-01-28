import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Save, Trash2, Upload, Plus, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface Variant {
    id?: string;
    option_type: string;
    option_value: string;
    price_impact: number;
}

interface Product {
    id?: string;
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

interface ProductEditorProps {
    product: Partial<Product>;
    variants: Variant[];
    onBack: () => void;
    onSaveComplete: () => void;
}

const ProductEditor = ({ product: initialProduct, variants: initialVariants, onBack, onSaveComplete }: ProductEditorProps) => {
    const [editingProduct, setEditingProduct] = useState<Partial<Product>>(initialProduct);
    const [variants, setVariants] = useState<Variant[]>(initialVariants);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

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
                alert('Upload failed: ' + uploadError.message);
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
        if (!editingProduct?.name || !editingProduct?.price) {
            return alert('Name and Price are required');
        }

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

            if (!isNew) {
                await supabase.from('product_variants').delete().eq('product_id', productId);
            }

            if (variants.length > 0) {
                const variantPayload = variants.map(v => ({
                    product_id: productId,
                    option_type: v.option_type,
                    option_value: v.option_value,
                    price_impact: v.price_impact
                }));
                await supabase.from('product_variants').insert(variantPayload);
            }

            alert('Product saved successfully!');
            onSaveComplete();
        }
        setLoading(false);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '48px' }}>
                <button
                    onClick={onBack}
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        border: '1px solid #eee',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'black')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#eee')}
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em' }}>
                        {editingProduct?.id ? 'Edit Product' : 'Create New Product'}
                    </h1>
                    <p style={{ color: '#aaa', fontWeight: 600 }}>Configure your product listing</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
                    <button
                        onClick={onBack}
                        style={{
                            height: '56px',
                            padding: '0 32px',
                            background: '#f5f5f7',
                            color: 'black',
                            borderRadius: '18px',
                            fontWeight: 800,
                            fontSize: '15px',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        style={{
                            height: '56px',
                            padding: '0 40px',
                            background: 'black',
                            color: 'white',
                            borderRadius: '18px',
                            fontWeight: 800,
                            fontSize: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Save size={20} /> {loading ? 'Saving...' : 'Save & Publish'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '40px' }}>
                {/* Left Column */}
                <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Basic Info */}
                    <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #f0f0f0', padding: '40px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', letterSpacing: '0.1em', marginBottom: '32px', textTransform: 'uppercase' }}>
                            Basic Information
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#555' }}>Product Title</label>
                                    <input
                                        placeholder="e.g. Studio Pro Wireless"
                                        value={editingProduct?.name || ''}
                                        onChange={e => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                                        style={{ padding: '16px', borderRadius: '14px', border: '2px solid #f5f5f7', outline: 'none', fontSize: '15px', fontWeight: 700 }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#555' }}>Brand Name</label>
                                    <input
                                        placeholder="e.g. APPLE, SONY"
                                        value={editingProduct?.brand || ''}
                                        onChange={e => setEditingProduct(prev => ({ ...prev, brand: e.target.value.toUpperCase() }))}
                                        style={{ padding: '16px', borderRadius: '14px', border: '2px solid #f5f5f7', outline: 'none', fontSize: '15px', fontWeight: 700 }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 800, color: '#555' }}>Description</label>
                                <textarea
                                    rows={5}
                                    placeholder="Craft a compelling story for your product..."
                                    value={editingProduct?.description || ''}
                                    onChange={e => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                                    style={{ padding: '16px', borderRadius: '14px', border: '2px solid #f5f5f7', outline: 'none', fontSize: '15px', fontWeight: 600, resize: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media Gallery */}
                    <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #f0f0f0', padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Media Gallery</p>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#4ade80' }}>{editingProduct?.images?.length || 0} Assets</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
                            {editingProduct?.images?.map((url, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        position: 'relative',
                                        aspectRatio: '1',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        background: '#f9f9fb',
                                        border: url === editingProduct.image ? '3px solid black' : '1px solid #eee'
                                    }}
                                >
                                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
                                    <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                        <button
                                            onClick={() => removeImage(idx)}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '8px',
                                                background: 'rgba(255,68,68,0.9)',
                                                color: 'white',
                                                border: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    {url === editingProduct.image && (
                                        <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'black', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 900 }}>
                                            PRIMARY
                                        </div>
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
                                            style={{
                                                position: 'absolute',
                                                bottom: '8px',
                                                left: '8px',
                                                background: 'white',
                                                color: 'black',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontSize: '9px',
                                                fontWeight: 900,
                                                border: '1px solid #eee',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            SET PRIMARY
                                        </button>
                                    )}
                                </div>
                            ))}

                            <div
                                style={{
                                    position: 'relative',
                                    aspectRatio: '1',
                                    borderRadius: '20px',
                                    border: '2px dashed #eee',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    background: '#fcfcfd'
                                }}
                            >
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
                            <p style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', letterSpacing: '0.1em', marginBottom: '24px', textTransform: 'uppercase' }}>
                                Key Features
                            </p>
                            <textarea
                                rows={6}
                                placeholder="Enter features (one per line)..."
                                value={editingProduct?.features?.join('\n') || ''}
                                onChange={e => setEditingProduct(prev => ({ ...prev, features: e.target.value.split('\n') }))}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: '2px solid #f5f5f7',
                                    background: '#f9f9fb',
                                    outline: 'none',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    resize: 'none'
                                }}
                            />
                        </div>
                        <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #f0f0f0', padding: '32px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', letterSpacing: '0.1em', marginBottom: '24px', textTransform: 'uppercase' }}>
                                Technical Specs
                            </p>
                            <textarea
                                rows={6}
                                placeholder="Detailed specifications..."
                                value={editingProduct?.specification || ''}
                                onChange={e => setEditingProduct(prev => ({ ...prev, specification: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: '2px solid #f5f5f7',
                                    background: '#f9f9fb',
                                    outline: 'none',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    resize: 'none'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Pricing */}
                    <div style={{ background: 'black', color: 'white', borderRadius: '32px', padding: '40px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: '32px', textTransform: 'uppercase' }}>
                            Pricing
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', display: 'block' }}>
                                    Regular Price ($)
                                </label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={editingProduct?.price || ''}
                                    onChange={e => setEditingProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        border: 'none',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '24px',
                                        fontWeight: 900
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', display: 'block' }}>
                                    Sale Price (Optional)
                                </label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={editingProduct?.discount_price || ''}
                                    onChange={e => setEditingProduct(prev => ({ ...prev, discount_price: Number(e.target.value) }))}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        border: 'none',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: '#4ade80',
                                        outline: 'none',
                                        fontSize: '24px',
                                        fontWeight: 900
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Variants */}
                    <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #f0f0f0', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Variants</p>
                            <button
                                onClick={handleAddVariant}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '10px',
                                    background: '#f5f5f7',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {variants.map((v, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        gap: '10px',
                                        background: '#f9f9fb',
                                        padding: '12px',
                                        borderRadius: '16px',
                                        border: '1px solid #f0f0f0'
                                    }}
                                >
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

                    {/* Category */}
                    <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #f0f0f0', padding: '32px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', letterSpacing: '0.1em', marginBottom: '24px', textTransform: 'uppercase' }}>
                            Category
                        </p>
                        <select
                            value={editingProduct?.category || 'Audio'}
                            onChange={e => setEditingProduct(prev => ({ ...prev, category: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '16px',
                                border: '2px solid #f5f5f7',
                                background: '#f9f9fb',
                                outline: 'none',
                                fontWeight: 800,
                                fontSize: '14px'
                            }}
                        >
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
    );
};

export default ProductEditor;
