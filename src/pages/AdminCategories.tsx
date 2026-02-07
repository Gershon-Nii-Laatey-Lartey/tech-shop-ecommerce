import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Save, X, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const FONT_FAMILY = "'Plus Jakarta Sans', 'Inter', sans-serif";

const AdminCategories = () => {
    const { user, profile } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: '',
        display_order: 0,
        is_active: true
    });



    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const { error } = await supabase
                .from('categories')
                .insert([formData]);

            if (error) throw error;

            setIsCreating(false);
            resetForm();
            fetchCategories();
        } catch (err) {
            console.error('Error creating category:', err);
            alert('Failed to create category');
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            const { error } = await supabase
                .from('categories')
                .update(formData)
                .eq('id', id);

            if (error) throw error;

            setEditingId(null);
            resetForm();
            fetchCategories();
        } catch (err) {
            console.error('Error updating category:', err);
            alert('Failed to update category');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchCategories();
        } catch (err) {
            console.error('Error deleting category:', err);
            alert('Failed to delete category');
        }
    };

    const handleToggleActive = async (category: Category) => {
        try {
            const { error } = await supabase
                .from('categories')
                .update({ is_active: !category.is_active })
                .eq('id', category.id);

            if (error) throw error;
            fetchCategories();
        } catch (err) {
            console.error('Error toggling category:', err);
        }
    };

    const startEdit = (category: Category) => {
        setEditingId(category.id);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            icon: category.icon || '',
            display_order: category.display_order,
            is_active: category.is_active
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            icon: '',
            display_order: 0,
            is_active: true
        });
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    };



    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#F8FAFC',
            fontFamily: FONT_FAMILY,
            color: '#000000',
            overflow: 'hidden'
        }}>
            <AdminSidebar activeTab="Categories" />

            <div className="admin-main-content" style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
                {/* Header */}
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
                            placeholder="Search categories..."
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
                            onClick={() => setIsCreating(true)}
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
                            <span className="hide-mobile">Add Category</span>
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

                {/* Create Form Modal */}
                <AnimatePresence>
                    {isCreating && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000,
                                padding: '20px'
                            }}
                            onClick={() => { setIsCreating(false); resetForm(); }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    background: 'white',
                                    borderRadius: '24px',
                                    padding: '32px',
                                    maxWidth: '600px',
                                    width: '100%',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                                }}
                            >
                                <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px', color: '#0F172A' }}>Create New Category</h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => {
                                                setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) });
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '2px solid #F1F5F9',
                                                borderRadius: '12px',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Slug</label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '2px solid #F1F5F9',
                                                borderRadius: '12px',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '2px solid #F1F5F9',
                                                borderRadius: '12px',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                outline: 'none',
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Icon</label>
                                            <input
                                                type="text"
                                                value={formData.icon}
                                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                                placeholder="e.g., 📱"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    border: '2px solid #F1F5F9',
                                                    borderRadius: '12px',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Display Order</label>
                                            <input
                                                type="number"
                                                value={formData.display_order}
                                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    border: '2px solid #F1F5F9',
                                                    borderRadius: '12px',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                        <button
                                            onClick={handleCreate}
                                            style={{
                                                flex: 1,
                                                background: '#5544ff',
                                                color: 'white',
                                                border: 'none',
                                                padding: '14px',
                                                borderRadius: '12px',
                                                fontWeight: 800,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Create Category
                                        </button>
                                        <button
                                            onClick={() => { setIsCreating(false); resetForm(); }}
                                            style={{
                                                flex: 1,
                                                background: '#F8FAFC',
                                                color: '#64748B',
                                                border: '1px solid #E2E8F0',
                                                padding: '14px',
                                                borderRadius: '12px',
                                                fontWeight: 800,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Categories Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="loading-dots">
                            <span>.</span><span>.</span><span>.</span>
                        </div>
                    </div>
                ) : (
                    <div className="categories-grid">
                        {filteredCategories.map((category) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    border: '1px solid #E2E8F0',
                                    padding: '24px',
                                    position: 'relative',
                                    transition: 'all 0.2s',
                                    overflow: 'hidden'
                                }}
                                className="category-card"
                            >
                                {editingId === category.id ? (
                                    // Edit Mode
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Category Name"
                                            style={{
                                                padding: '10px 14px',
                                                border: '2px solid #5544ff',
                                                borderRadius: '10px',
                                                fontSize: '16px',
                                                fontWeight: 700,
                                                outline: 'none'
                                            }}
                                        />
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            placeholder="slug"
                                            style={{
                                                padding: '8px 12px',
                                                border: '2px solid #5544ff',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                outline: 'none',
                                                fontFamily: 'monospace'
                                            }}
                                        />
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Description"
                                            rows={2}
                                            style={{
                                                padding: '10px 14px',
                                                border: '2px solid #5544ff',
                                                borderRadius: '10px',
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                outline: 'none',
                                                resize: 'vertical'
                                            }}
                                        />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <input
                                                type="text"
                                                value={formData.icon}
                                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                                placeholder="Icon"
                                                style={{
                                                    padding: '8px 12px',
                                                    border: '2px solid #5544ff',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    outline: 'none'
                                                }}
                                            />
                                            <input
                                                type="number"
                                                value={formData.display_order}
                                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                                placeholder="Order"
                                                style={{
                                                    padding: '8px 12px',
                                                    border: '2px solid #5544ff',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                            <button
                                                onClick={() => handleUpdate(category.id)}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    background: '#10B981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    fontWeight: 700,
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <Save size={16} />
                                                Save
                                            </button>
                                            <button
                                                onClick={() => { setEditingId(null); resetForm(); }}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    background: '#F8FAFC',
                                                    color: '#64748B',
                                                    border: '1px solid #E2E8F0',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    fontWeight: 700,
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <X size={16} />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0, wordBreak: 'break-word' }}>{category.name}</h3>
                                                <code style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', background: '#F8FAFC', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                                                    {category.slug}
                                                </code>
                                            </div>
                                            <button
                                                onClick={() => handleToggleActive(category)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    padding: '6px 10px',
                                                    background: category.is_active ? '#ECFDF5' : '#F8FAFC',
                                                    color: category.is_active ? '#059669' : '#94A3B8',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '11px',
                                                    fontWeight: 800,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {category.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                {category.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </div>

                                        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, marginBottom: '20px', minHeight: '40px' }}>
                                            {category.description || 'No description provided'}
                                        </p>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                                            <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                                                Order: <span style={{ color: '#0F172A', fontWeight: 700 }}>{category.display_order}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => startEdit(category)}
                                                    style={{
                                                        padding: '8px 12px',
                                                        background: '#F8FAFC',
                                                        border: '1px solid #E2E8F0',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        color: '#5544ff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '13px',
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    <Edit2 size={14} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    style={{
                                                        padding: '8px',
                                                        background: '#FEF2F2',
                                                        border: '1px solid #FEE2E2',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        color: '#EF4444'
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .loading-dots {
                    font-size: 40px;
                    font-weight: 900;
                    letter-spacing: 4px;
                }
                .loading-dots span {
                    animation: blink 1s infinite;
                }
                .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
                .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
                @keyframes blink {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .category-card:hover {
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                    transform: translateY(-2px);
                }
                .admin-main-content {
                    padding: 0 40px;
                }
                .categories-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    padding-bottom: 40px;
                }
                @media (max-width: 1200px) {
                    .categories-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 1024px) {
                    .admin-main-content {
                        padding: 80px 20px 20px 20px;
                    }
                    .hide-mobile {
                        display: none !important;
                    }
                }
                @media (max-width: 768px) {
                    .categories-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminCategories;
