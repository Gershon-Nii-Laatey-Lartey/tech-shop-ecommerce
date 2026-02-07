import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    ImagePlus,
    X,
    ChevronDown,
    Save,
    Upload,
    Package,
    Tag,
    Layers,
    Type
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';

// --- TYPES ---
interface ProductImage {
    id?: string;
    url: string;
    is_primary: boolean;
    file?: File; // For newly added files
}

interface ProductVariant {
    id?: string;
    name: string;
    value: string;
    price_modifier: number;
    stock: number;
    sku: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    rating: number;
    is_new: boolean;
    is_featured: boolean;
    brand?: string;
    sku?: string;
}

const FONT_FAMILY = "'Plus Jakarta Sans', 'Inter', sans-serif";

const AdminProducts = () => {
    const { isAdmin, user, profile, loading: authLoading } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0, status: '' });

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            
            .admin-main-content {
                padding: 0 32px 40px 32px;
                transition: padding 0.3s;
            }

            .product-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
            }

            .product-table-container {
                display: none;
            }

            @media (min-width: 1400px) {
                .product-grid {
                    display: none !important;
                }
                .product-table-container {
                    display: block !important;
                }
            }

            @media (max-width: 1024px) {
                .admin-main-content {
                    padding: 0 24px 40px 24px;
                }
                .product-grid {
                    grid-template-columns: repeat(3, 1fr) !important;
                }
            }

            @media (max-width: 768px) {
                .admin-main-content {
                    padding: 0 20px 100px 20px !important;
                    margin-top: 60px !important;
                }
                .main-header-sticky {
                    top: 0 !important;
                    z-index: 40 !important;
                    margin-bottom: 0 !important;
                    padding: 12px 0 16px 0 !important;
                }
                .hide-mobile {
                    display: none !important;
                }
                .product-grid {
                    display: grid !important; /* Ensure grid is shown on mobile */
                    grid-template-columns: repeat(2, 1fr) !important; /* 2 columns on mobile */
                    gap: 12px !important;
                }
                .product-table-container {
                    display: none !important; /* Hide table on mobile */
                }
                header {
                    padding: 12px 0 !important;
                    margin-bottom: 8px !important;
                    background: rgba(248, 250, 252, 0.9) !important;
                    backdrop-filter: blur(10px) !important;
                    border-bottom: 1px solid rgba(226, 232, 240, 0.4);
                }
                .page-title {
                    font-size: 24px !important;
                    margin-bottom: 16px !important;
                }
                .action-buttons {
                    width: 100% !important;
                    justify-content: space-between !important;
                }
            }

            @media (max-width: 480px) {
                .product-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                    gap: 10px !important;
                }
            }

            .product-card-mobile {
                background: white;
                border: 1px solid #E2E8F0;
                border-radius: 16px;
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                transition: all 0.2s;
            }
            
            .product-card-mobile:hover {
                box-shadow: 0 4px 16px rgba(0,0,0,0.08);
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchProducts();
        }
    }, [isAdmin]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsImporting(true);
            setImportProgress({ current: 0, total: 0, status: 'Reading ZIP file...' });

            const zip = await JSZip.loadAsync(file);
            const metadataFiles: string[] = [];

            zip.forEach((relativePath) => {
                if (relativePath.endsWith('metadata.json')) {
                    metadataFiles.push(relativePath);
                }
            });

            if (metadataFiles.length === 0) {
                alert('No metadata.json found in the ZIP file.');
                setIsImporting(false);
                return;
            }

            setImportProgress({ current: 0, total: metadataFiles.length, status: 'Ready to import...' });
            const importResults = [];

            for (let i = 0; i < metadataFiles.length; i++) {
                const metadataPath = metadataFiles[i];
                const folderPath = metadataPath.substring(0, metadataPath.lastIndexOf('/') + 1);
                const metadataFile = zip.file(metadataPath);

                if (metadataFile) {
                    const metadataText = await metadataFile.async('text');
                    const metadata = JSON.parse(metadataText);

                    setImportProgress(prev => ({
                        ...prev,
                        current: i + 1,
                        status: `Importing: ${metadata.name}`
                    }));

                    // 1. Create Product
                    const { data: product, error: productError } = await supabase
                        .from('products')
                        .insert([{
                            name: metadata.name,
                            description: metadata.description,
                            category: metadata.category,
                            price: parseFloat(metadata.price),
                            stock: metadata.stock || 50,
                            rating: metadata.rating || 4.5,
                            reviews_count: metadata.reviews_count || 0,
                            image: '',
                            brand: metadata.brand || '',
                            sku: metadata.sku || undefined
                        }])
                        .select()
                        .single();

                    if (productError) throw productError;

                    // 2. Upload Images
                    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
                    const imageFiles = zip.filter((path) => {
                        const isInSameFolder = path.startsWith(folderPath);
                        const isNotSubFolder = path.substring(folderPath.length).indexOf('/') === -1;
                        const isImage = imageExtensions.some(ext => path.toLowerCase().endsWith(ext));
                        return isInSameFolder && isNotSubFolder && isImage;
                    });

                    let primaryPublicUrl = '';

                    for (let j = 0; j < imageFiles.length; j++) {
                        const imgZipEntry = imageFiles[j];
                        const fileName = imgZipEntry.name.split('/').pop()!;

                        setImportProgress(prev => ({
                            ...prev,
                            status: `Importing: ${metadata.name} (Image ${j + 1}/${imageFiles.length})`
                        }));

                        const fileData = await imgZipEntry.async('blob');
                        const storagePath = `${product.id}/${Date.now()}-${fileName}`;

                        const { error: uploadError } = await supabase.storage
                            .from('products')
                            .upload(storagePath, fileData);

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = supabase.storage
                            .from('products')
                            .getPublicUrl(storagePath);

                        const isPrimary = fileName === metadata.primary_image;
                        if (isPrimary) primaryPublicUrl = publicUrl;

                        await supabase.from('product_images').insert({
                            product_id: product.id,
                            url: publicUrl,
                            is_primary: isPrimary,
                            display_order: j
                        });
                    }

                    if (primaryPublicUrl) {
                        await supabase
                            .from('products')
                            .update({ image: primaryPublicUrl })
                            .eq('id', product.id);
                    }

                    // 3. Handle Variants if they exist in metadata
                    if (metadata.variants && Array.isArray(metadata.variants)) {
                        const variantsToInsert = metadata.variants.map((v: any) => ({
                            product_id: product.id,
                            name: v.name,
                            value: v.value,
                            price_modifier: v.price_modifier || 0,
                            stock: v.stock || 0,
                            sku: v.sku || undefined
                        }));

                        await supabase.from('product_variants').insert(variantsToInsert);
                    }

                    importResults.push(metadata.name);
                }
            }

            setImportProgress(prev => ({ ...prev, status: 'Finishing up...' }));
            alert(`Successfully imported ${importResults.length} products: ${importResults.join(', ')}`);
            fetchProducts();
        } catch (error) {
            console.error('Import error:', error);
            alert('Failed to import products. Check console for details.');
        } finally {
            setIsImporting(false);
            setImportProgress({ current: 0, total: 0, status: '' });
            if (e.target) e.target.value = '';
        }
    };

    if (authLoading || !isAdmin) return null;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#F8FAFC',
            fontFamily: FONT_FAMILY,
            color: '#0f172a'
        }}>
            <AdminSidebar activeTab="Products" />

            <div className="admin-main-content" style={{ flex: 1, position: 'relative', width: '100%', overflowX: 'hidden' }}>
                <header className="main-header-sticky" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '24px 0',
                    position: 'sticky',
                    top: 0,
                    background: '#F8FAFC',
                    zIndex: 100,
                    gap: '16px',
                    marginRight: '-4px'
                }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="search"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                background: '#ffffff',
                                border: '1.5px solid #F1F5F9',
                                borderRadius: '14px',
                                fontSize: '14px',
                                outline: 'none',
                                fontWeight: 600,
                                color: '#0F172A',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                        />
                        {searchTerm && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                zIndex: 50,
                                marginTop: '4px',
                                border: '1px solid #E2E8F0',
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                {filteredProducts.slice(0, 5).map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => {
                                            setEditingProduct(product);
                                            setSearchTerm('');
                                        }}
                                        style={{
                                            padding: '12px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #F1F5F9'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <img src={product.image} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{product.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748B' }}>GH₵ {Number(product.price).toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <div style={{ padding: '12px 16px', color: '#64748B', fontSize: '14px' }}>No products found</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="action-buttons" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={() => setShowAddModal(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#5544ff',
                                color: 'white',
                                border: 'none',
                                padding: '12px',
                                borderRadius: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(85, 68, 255, 0.2)'
                            }}
                        >
                            <Plus size={20} />
                            <span className="hide-mobile">Add Product</span>
                        </button>

                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#ffffff',
                                color: '#5544ff',
                                border: '1.5px solid #5544ff',
                                padding: '11px',
                                borderRadius: '14px',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            <Upload size={19} />
                            <span className="hide-mobile">{isImporting ? 'Importing...' : 'Import ZIP'}</span>
                            <input type="file" hidden accept=".zip" onChange={handleImport} disabled={isImporting} />
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="hide-mobile">
                            <img
                                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                                alt="avatar"
                                style={{ width: '38px', height: '38px', borderRadius: '12px', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                </header>

                <div style={{ marginBottom: '32px' }}>
                    <h2 className="page-title" style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em', color: '#0F172A' }}>Inventory <span style={{ color: '#94A3B8', fontWeight: 600 }}>({filteredProducts.length})</span></h2>
                    <p style={{ color: '#64748B', fontSize: '15px', marginTop: '4px', fontWeight: 600 }} className="hide-mobile">Manage products, variants and media assets</p>
                </div>

                <div className="product-grid">
                    {loading ? (
                        <>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{ background: '#F8FAFC', borderRadius: '16px', height: '280px', animation: 'pulse 1.5s infinite' }} />
                            ))}
                        </>
                    ) : filteredProducts.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', padding: '100px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No products found matching your search.</div>
                    ) : (
                        filteredProducts.map(p => (
                            <div key={p.id} className="product-card-mobile">
                                <div style={{ width: '100%', aspectRatio: '1', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9', padding: '12px', position: 'relative', overflow: 'hidden' }}>
                                    <img src={p.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={p.name} />
                                    {p.is_featured && (
                                        <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#FEF3C7', color: '#D97706', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Tag size={10} /> Featured
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3, minHeight: '36px' }}>{p.name}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                                        <span style={{ padding: '4px 10px', background: '#F1F5F9', borderRadius: '8px', fontSize: '11px', fontWeight: 800, color: '#475569' }}>
                                            {p.category}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.stock < 10 ? '#ef4444' : '#10b981' }}></div>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: p.stock < 10 ? '#ef4444' : '#0F172A' }}>{p.stock}</span>
                                        </div>
                                    </div>
                                    <p style={{ margin: '8px 0 0 0', fontSize: '18px', fontWeight: 900, color: '#5544ff' }}>GH₵ {Number(p.price).toFixed(2)}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid #F8FAFC' }}>
                                    <button
                                        onClick={() => setEditingProduct(p)}
                                        style={{ flex: 1, padding: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 700, fontSize: '12px' }}
                                    >
                                        <Edit size={14} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} style={{ flex: 1, padding: '10px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '10px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 700, fontSize: '12px' }}>
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="product-table-container" style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '12px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '12px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '12px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</th>
                                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '12px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock</th>
                                <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '12px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ textAlign: 'right', padding: '20px 24px', fontSize: '12px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '100px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                            <Upload className="animate-pulse" size={40} color="#cbd5e1" />
                                            <p style={{ color: '#64748b', fontWeight: 600 }}>Loading inventory...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '100px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No products found matching your search.</td>
                                </tr>
                            ) : filteredProducts.map(p => (
                                <tr key={p.id} className="table-row-hover" style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#F8FAFC', padding: '4px', border: '1px solid #F1F5F9' }}>
                                                <img src={p.image} style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'contain' }} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{p.name}</p>
                                                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, fontFamily: 'monospace' }}>{p.sku || p.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ padding: '6px 12px', background: '#F1F5F9', borderRadius: '10px', fontSize: '12px', fontWeight: 800, color: '#475569' }}>
                                            {p.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>GH₵ {Number(p.price).toFixed(2)}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.stock < 10 ? '#ef4444' : '#10b981' }}></div>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: p.stock < 10 ? '#ef4444' : '#0f172a' }}>
                                                {p.stock}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        {p.is_featured ? (
                                            <span style={{ padding: '6px 12px', background: '#FEF3C7', color: '#D97706', borderRadius: '10px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <Tag size={12} /> Featured
                                            </span>
                                        ) : (
                                            <span style={{ padding: '6px 12px', background: '#F8FAFC', color: '#94a3b8', borderRadius: '10px', fontSize: '12px', fontWeight: 800 }}>Standard</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button onClick={() => setEditingProduct(p)} style={{ padding: '10px', background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(p.id)} style={{ padding: '10px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '12px', cursor: 'pointer', color: '#ef4444', transition: 'all 0.2s' }}><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <style>{`
                    .table-row-hover:hover {
                        background: #F8FAFC;
                    }
                    .animate-pulse {
                        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: .5; }
                    }
                `}</style>
            </div>

            <AnimatePresence>
                {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} onRefresh={fetchProducts} />}
            </AnimatePresence>

            <AnimatePresence>
                {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onRefresh={fetchProducts} />}
            </AnimatePresence>

            <AnimatePresence>
                {isImporting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(15, 23, 42, 0.6)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            style={{
                                background: 'white',
                                padding: '40px',
                                borderRadius: '32px',
                                width: '400px',
                                textAlign: 'center',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                            }}
                        >
                            <div style={{ marginBottom: '24px' }}>
                                <Upload size={48} className="animate-bounce" color="#5544ff" />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px' }}>Importing Products</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Please wait while we process your ZIP file.</p>

                            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                                <span>Item {importProgress.current} profile of {importProgress.total}</span>
                                <span>{Math.round((importProgress.current / importProgress.total) * 100) || 0}%</span>
                            </div>

                            <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                                    style={{ height: '100%', background: '#5544ff', borderRadius: '4px' }}
                                />
                            </div>

                            <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, fontStyle: 'italic' }}>
                                {importProgress.status}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AddProductModal = ({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const [sku, setSku] = useState('');
    const [stock, setStock] = useState('0');
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

    // Variations State
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [showVariantForm, setShowVariantForm] = useState(false);
    const [newVariant, setNewVariant] = useState({ name: 'Color', value: '', price_modifier: 0, stock: 0, sku: '' });

    // Images State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<ProductImage[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name, slug')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
            if (data && data.length > 0) setCategory(data[0].name);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.map(file => ({
            url: URL.createObjectURL(file),
            is_primary: images.length === 0, // First image is primary by default
            file
        }));
        setImages([...images, ...newImages]);
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        if (newImages.length > 0 && !newImages.some(img => img.is_primary)) {
            newImages[0].is_primary = true;
        }
        setImages(newImages);
    };

    const setPrimaryImage = (index: number) => {
        setImages(images.map((img, i) => ({ ...img, is_primary: i === index })));
    };

    const addVariant = () => {
        if (!newVariant.value) return;
        setVariants([...variants, { ...newVariant, id: Math.random().toString() }]);
        setNewVariant({ ...newVariant, value: '', sku: '' });
    };

    const removeVariant = (id: string) => {
        setVariants(variants.filter(v => v.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length === 0) {
            alert('Please add at least one image');
            return;
        }

        try {
            setSubmitting(true);

            // 1. Create Product
            const { data: product, error: productError } = await supabase
                .from('products')
                .insert([{
                    name,
                    description,
                    brand,
                    sku: sku || undefined,
                    price: parseFloat(price),
                    category,
                    stock: parseInt(stock),
                    image: '', // Will be updated after upload
                    rating: 4.5,
                    reviews_count: 0
                }])
                .select()
                .single();

            if (productError) throw productError;

            // 2. Upload Images
            const uploadedImageUrls: string[] = [];
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                if (img.file) {
                    const fileExt = img.file.name.split('.').pop();
                    const fileName = `${product.id}/${Date.now()}-${i}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage
                        .from('products')
                        .upload(fileName, img.file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('products')
                        .getPublicUrl(fileName);

                    uploadedImageUrls.push(publicUrl);

                    // Insert into product_images table
                    await supabase.from('product_images').insert({
                        product_id: product.id,
                        url: publicUrl,
                        is_primary: img.is_primary,
                        display_order: i
                    });

                    // Update main product image if primary
                    if (img.is_primary) {
                        await supabase
                            .from('products')
                            .update({ image: publicUrl })
                            .eq('id', product.id);
                    }
                }
            }

            // 3. Insert Variants
            if (variants.length > 0) {
                const variantsToInsert = variants.map(v => ({
                    product_id: product.id,
                    name: v.name,
                    value: v.value,
                    price_modifier: v.price_modifier,
                    stock: v.stock,
                    sku: v.sku || undefined
                }));

                const { error: variantError } = await supabase
                    .from('product_variants')
                    .insert(variantsToInsert);

                if (variantError) throw variantError;
            }

            onRefresh();
            onClose();
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Error adding product. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                style={{ background: 'white', borderRadius: '32px', padding: '40px', width: '95%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>Add New Product</h3>
                    <button onClick={onClose} style={{ padding: '8px', borderRadius: '12px', border: 'none', background: '#F1F5F9', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

                    {/* Left Column: Media & Variants */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Images Section */}
                        <section>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Media</h4>
                                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{images.length} images</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                                {images.map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '16px', overflow: 'hidden', border: img.is_primary ? '2px solid #5544ff' : '1px solid #E2E8F0' }}>
                                        <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px' }}>
                                            <button type="button" onClick={() => removeImage(idx)} style={{ width: '24px', height: '24px', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.9)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                                        </div>
                                        {img.is_primary ? (
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#5544ff', color: 'white', fontSize: '10px', fontWeight: 800, textAlign: 'center', padding: '2px' }}>PRIMARY</div>
                                        ) : (
                                            <button type="button" onClick={() => setPrimaryImage(idx)} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.9)', color: '#64748b', fontSize: '10px', fontWeight: 800, border: 'none', padding: '4px', cursor: 'pointer' }}>SET PRIMARY</button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ aspectRatio: '1', borderRadius: '16px', border: '2px dashed #E2E8F0', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#5544ff'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                                >
                                    <ImagePlus size={24} />
                                    <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '4px' }}>Add Image</span>
                                </button>
                            </div>
                            <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} accept="image/*" multiple />
                        </section>

                        {/* Variants Section */}
                        <section>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Variations</h4>
                                <button type="button" onClick={() => setShowVariantForm(!showVariantForm)} style={{ fontSize: '12px', color: '#5544ff', fontWeight: 800, border: 'none', background: 'none', cursor: 'pointer' }}>
                                    {showVariantForm ? 'Close' : '+ Add Variant'}
                                </button>
                            </div>

                            {showVariantForm && (
                                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <Layers size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <select value={newVariant.name} onChange={e => setNewVariant({ ...newVariant, name: e.target.value })} style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, outline: 'none', background: 'white' }}>
                                                <option>Color</option>
                                                <option>Size</option>
                                                <option>Material</option>
                                                <option>Storage</option>
                                            </select>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <Type size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input placeholder="Value (e.g. Red)" value={newVariant.value} onChange={e => setNewVariant({ ...newVariant, value: e.target.value })} style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, outline: 'none' }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                        <input type="number" placeholder="Price Add-on" value={newVariant.price_modifier || ''} onChange={e => setNewVariant({ ...newVariant, price_modifier: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, outline: 'none' }} />
                                        <input type="number" placeholder="Stock" value={newVariant.stock || ''} onChange={e => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, outline: 'none' }} />
                                    </div>
                                    <button type="button" onClick={addVariant} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: '#0f172a', color: 'white', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>Apply Variant</button>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {variants.map(v => (
                                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                        <div>
                                            <span style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>{v.name}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: 700 }}>{v.value}</span>
                                                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>+GH₵{v.price_modifier}</span>
                                                <span style={{ fontSize: '12px', color: '#64748b' }}>({v.stock} in stock)</span>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => removeVariant(v.id!)} style={{ padding: '6px', borderRadius: '8px', border: 'none', background: '#FEF2F2', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Base Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <section>
                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Product Details</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ position: 'relative' }}>
                                    <Package size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
                                    <input required placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '14px 16px 14px 44px', border: '1px solid #E2E8F0', borderRadius: '14px', fontSize: '15px', fontWeight: 600, outline: 'none', transition: 'all 0.2s' }} onFocus={e => e.target.style.borderColor = '#5544ff'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
                                </div>

                                <textarea required placeholder="Product Description" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '14px 16px', border: '1px solid #E2E8F0', borderRadius: '14px', fontSize: '15px', fontWeight: 600, outline: 'none', height: '120px', resize: 'vertical' }} />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <input placeholder="Brand" value={brand} onChange={e => setBrand(e.target.value)} style={{ width: '100%', padding: '14px 16px', border: '1px solid #E2E8F0', borderRadius: '14px', fontSize: '15px', fontWeight: 600, outline: 'none' }} />
                                    <input placeholder="SKU (Optional)" value={sku} onChange={e => setSku(e.target.value)} style={{ width: '100%', padding: '14px 16px', border: '1px solid #E2E8F0', borderRadius: '14px', fontSize: '15px', fontWeight: 600, outline: 'none' }} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '16px', top: '14px', fontSize: '14px', fontWeight: 800, color: '#64748b' }}>GH₵</span>
                                        <input required type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} style={{ width: '100%', padding: '14px 16px 14px 50px', border: '1px solid #E2E8F0', borderRadius: '14px', fontSize: '15px', fontWeight: 800, outline: 'none' }} />
                                    </div>
                                    <input required type="number" placeholder="Total Stock" value={stock} onChange={e => setStock(e.target.value)} style={{ width: '100%', padding: '14px 16px', border: '1px solid #E2E8F0', borderRadius: '14px', fontSize: '15px', fontWeight: 800, outline: 'none' }} />
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                                    <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '14px 16px', border: '1px solid #E2E8F0', borderRadius: '14px', fontSize: '15px', fontWeight: 700, outline: 'none', background: 'white', appearance: 'none', cursor: 'pointer' }}>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                            <button type="button" onClick={onClose} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white', color: '#64748b', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>Cancel</button>
                            <button disabled={submitting} type="submit" style={{ flex: 2, padding: '16px', borderRadius: '16px', border: 'none', background: '#5544ff', color: 'white', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 20px rgba(85, 68, 255, 0.2)' }}>
                                {submitting ? <Upload className="animate-pulse" size={18} /> : <Save size={18} />}
                                {submitting ? 'Saving...' : 'Publish Product'}
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const EditProductModal = ({ product, onClose, onRefresh }: { product: Product, onClose: () => void, onRefresh: () => void }) => {
    const [name, setName] = useState(product.name);
    const [description, setDescription] = useState(product.description);
    const [price, setPrice] = useState(product.price.toString());
    const [category, setCategory] = useState(product.category);
    const [brand, setBrand] = useState(product.brand || '');
    const [sku, setSku] = useState(product.sku || '');
    const [stock, setStock] = useState(product.stock.toString());
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const { error } = await supabase
                .from('products')
                .update({
                    name,
                    description,
                    brand,
                    sku: sku || undefined,
                    price: parseFloat(price),
                    category,
                    stock: parseInt(stock)
                })
                .eq('id', product.id);

            if (error) throw error;
            onRefresh();
            onClose();
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Error updating product. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                style={{ background: 'white', borderRadius: '32px', padding: '40px', width: '95%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>Edit Product</h3>
                    <button onClick={onClose} style={{ padding: '8px', borderRadius: '12px', border: 'none', background: '#F1F5F9', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Product Name</label>
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Description</label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', fontWeight: 500, outline: 'none', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Price (GH₵)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Stock</label>
                            <input
                                required
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Category</label>
                            <input
                                required
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Brand</label>
                            <input
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>SKU (Optional)</label>
                        <input
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white', color: '#64748b', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                        <button disabled={submitting} type="submit" style={{ flex: 2, padding: '16px', borderRadius: '16px', border: 'none', background: '#5544ff', color: 'white', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 20px rgba(85, 68, 255, 0.2)' }}>
                            {submitting ? <Upload className="animate-pulse" size={18} /> : <Save size={18} />}
                            {submitting ? 'Updating...' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default AdminProducts;
