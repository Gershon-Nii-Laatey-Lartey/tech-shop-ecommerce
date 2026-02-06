import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import {
    Search,
    Plus,
    Edit,
    Trash2
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

// --- TYPES ---
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
}

const FONT_FAMILY = "'Plus Jakarta Sans', 'Inter', sans-serif";

const AdminProducts = () => {
    const { isAdmin, user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/');
        }
    }, [isAdmin, authLoading, navigate]);

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

    if (authLoading || !isAdmin) return null;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#F8FAFC',
            fontFamily: FONT_FAMILY,
            color: '#000000'
        }}>
            <AdminSidebar activeTab="Products" />

            <div className="admin-main-content" style={{ flex: 1, position: 'relative' }}>
                <header style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '24px 0',
                    position: 'sticky',
                    top: 0,
                    background: '#F8FAFC',
                    zIndex: 40,
                    gap: '20px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '400px' }}>
                        <Search size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="search"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            enterKeyHint="search"
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                background: '#ffffff',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                fontSize: '16px',
                                outline: 'none',
                                fontWeight: 500
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => setShowAddModal(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#5544ff',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '14px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(85, 68, 255, 0.2)'
                            }}
                        >
                            <Plus size={18} />
                            <span className="hide-mobile">Add Product</span>
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right' }} className="hide-mobile">
                                <p style={{ fontSize: '14px', fontWeight: 700 }}>{profile?.full_name || 'Admin'}</p>
                                <p style={{ fontSize: '12px', color: '#64748b' }}>Store Manager</p>
                            </div>
                            <img
                                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                                alt="avatar"
                                style={{ width: '40px', height: '40px', borderRadius: '12px', border: '2px solid white' }}
                            />
                        </div>
                    </div>
                </header>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em' }}>Products</h2>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Manage your inventory and product listings</p>
                    </div>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #E2E8F0', overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Product</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Category</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Price</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Stock</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading products...</td>
                                </tr>
                            ) : filteredProducts.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <img src={p.image} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', background: '#F8FAFC' }} />
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{p.name}</p>
                                                <p style={{ fontSize: '12px', color: '#64748b' }}>ID: {p.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ padding: '4px 10px', background: '#F1F5F9', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                                            {p.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                                        GH₵ {Number(p.price).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: p.stock < 10 ? '#ef4444' : '#0f172a' }}>
                                            {p.stock} in stock
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        {p.is_featured ? (
                                            <span style={{ padding: '4px 10px', background: '#FEF3C7', color: '#D97706', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>Featured</span>
                                        ) : (
                                            <span style={{ padding: '4px 10px', background: '#F8FAFC', color: '#94a3b8', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>Standard</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button style={{ padding: '8px', background: 'none', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(p.id)} style={{ padding: '8px', background: 'none', border: '1px solid #FEE2E2', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} onRefresh={fetchProducts} />}
        </div>
    );
};

const AddProductModal = ({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [stock, setStock] = useState('0');
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

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
            if (data && data.length > 0) {
                setCategory(data[0].name); // Set first category as default
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const { error } = await supabase.from('products').insert([{
                name, description, price: parseFloat(price), category, stock: parseInt(stock), image: '/hero-product.png', rating: 4.5, reviews_count: 0
            }]);
            if (error) throw error;
            onRefresh();
            onClose();
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Error adding product');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Add New Product</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <input required placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '10px', outline: 'none' }} />
                    <textarea required placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '10px', outline: 'none', height: '100px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <input required type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '10px', outline: 'none' }} />
                        <input required type="number" placeholder="Stock" value={stock} onChange={e => setStock(e.target.value)} style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '10px', outline: 'none' }} />
                    </div>
                    <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '10px', outline: 'none', background: 'white' }}>
                        {categories.length === 0 ? (
                            <option>Loading categories...</option>
                        ) : (
                            categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))
                        )}
                    </select>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'none', fontWeight: 700 }}>Cancel</button>
                        <button disabled={submitting} type="submit" style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: '#5544ff', color: 'white', fontWeight: 700 }}>{submitting ? 'Saving...' : 'Save Product'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProducts;
