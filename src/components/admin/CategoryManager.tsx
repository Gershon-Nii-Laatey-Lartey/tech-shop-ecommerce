import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, FolderOpen } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parent_id?: string;
}

const CategoryManager = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (data && !error) {
            setCategories(data);
        }
        setLoading(false);
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (name: string) => {
        setFormData({
            ...formData,
            name,
            slug: generateSlug(name)
        });
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return;

        if (editingCategory) {
            const { error } = await supabase
                .from('categories')
                .update({
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description || null,
                    image: formData.image || null
                })
                .eq('id', editingCategory.id);

            if (!error) {
                fetchCategories();
                closeModal();
            }
        } else {
            const { error } = await supabase
                .from('categories')
                .insert({
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description || null,
                    image: formData.image || null
                });

            if (!error) {
                fetchCategories();
                closeModal();
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (!error) {
            fetchCategories();
        }
    };

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                slug: category.slug,
                description: category.description || '',
                image: category.image || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', slug: '', description: '', image: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', slug: '', description: '', image: '' });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '8px' }}>Categories</h1>
                    <p style={{ color: '#888', fontWeight: 600 }}>Manage product categories</p>
                </div>
                <button
                    onClick={() => openModal()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '14px 24px',
                        background: 'black',
                        color: 'white',
                        borderRadius: '14px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> Add Category
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <div style={{ width: '40px', height: '40px', border: '4px solid #f0f0f0', borderTop: '4px solid black', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
            ) : categories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px', background: '#f9f9fb', borderRadius: '24px', border: '2px dashed #eee' }}>
                    <FolderOpen size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>No Categories Yet</h3>
                    <p style={{ color: '#888', marginBottom: '24px' }}>Create your first category to organize products</p>
                    <button
                        onClick={() => openModal()}
                        style={{
                            padding: '14px 24px',
                            background: 'black',
                            color: 'white',
                            borderRadius: '12px',
                            fontWeight: 800,
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Create Category
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {categories.map((category, idx) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '24px',
                                border: '1px solid #eee'
                            }}
                        >
                            {category.image && (
                                <div style={{ height: '120px', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', background: '#f5f5f7' }}>
                                    <img src={category.image} alt={category.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '4px' }}>{category.name}</h3>
                            <p style={{ fontSize: '13px', color: '#888', fontWeight: 600, marginBottom: '12px' }}>/{category.slug}</p>
                            {category.description && (
                                <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: 1.5 }}>{category.description}</p>
                            )}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => openModal(category)}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        padding: '10px',
                                        borderRadius: '10px',
                                        border: '1px solid #eee',
                                        background: 'white',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        border: '1px solid #fecaca',
                                        background: '#fef2f2',
                                        color: '#ef4444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '480px',
                                background: 'white',
                                borderRadius: '24px',
                                padding: '32px',
                                margin: '20px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 900 }}>
                                    {editingCategory ? 'Edit Category' : 'New Category'}
                                </h2>
                                <button
                                    onClick={closeModal}
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

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => handleNameChange(e.target.value)}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '15px', fontWeight: 600 }}
                                        placeholder="e.g., Laptops"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Slug</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '15px', fontWeight: 600 }}
                                        placeholder="laptops"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Description (optional)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '15px', fontWeight: 600, minHeight: '80px', resize: 'vertical' }}
                                        placeholder="A short description..."
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Image URL (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '15px', fontWeight: 600 }}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button
                                    onClick={closeModal}
                                    style={{
                                        flex: 1,
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid #eee',
                                        background: 'white',
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    style={{
                                        flex: 2,
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'black',
                                        color: 'white',
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {editingCategory ? 'Save Changes' : 'Create Category'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CategoryManager;