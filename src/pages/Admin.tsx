import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import AdminSidebar, { type AdminView } from '../components/admin/AdminSidebar';
import DashboardOverview from '../components/admin/DashboardOverview';
import ProductList from '../components/admin/ProductList';
import ProductEditor from '../components/admin/ProductEditor';
import OrderManager from '../components/admin/OrderManager';
import CategoryManager from '../components/admin/CategoryManager';

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
    const [currentView, setCurrentView] = useState<AdminView>('dashboard');
    const [editorMode, setEditorMode] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

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
        setEditorMode(true);
    };

    const handleCloseEditor = () => {
        setEditorMode(false);
        setEditingProduct(null);
        setVariants([]);
    };

    const handleSaveComplete = () => {
        fetchProducts();
        setEditorMode(false);
        setEditingProduct(null);
        setVariants([]);
    };

    const handleViewChange = (view: AdminView) => {
        setCurrentView(view);
        setEditorMode(false);
    };

    if (authLoading) {
        return (
            <div style={{ padding: '100px', textAlign: 'center' }}>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#888' }}>Verifying access...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div style={{ padding: '100px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 900 }}>Access Denied</h2>
                <div style={{ background: '#f5f5f7', padding: '24px', borderRadius: '16px', maxWidth: '500px' }}>
                    <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#888', wordBreak: 'break-all' }}>
                        User ID: {user?.id}<br />
                        Email: {user?.email}<br />
                        Role: {profile?.role || 'None'}
                    </p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '12px 24px',
                        background: 'black',
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
            {/* Admin Sidebar */}
            <AdminSidebar currentView={currentView} onViewChange={handleViewChange} />
            
            {/* Spacer for fixed sidebar */}
            <div style={{ width: '220px', flexShrink: 0 }} />

            {/* Main Content */}
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                {editorMode && editingProduct ? (
                    <ProductEditor
                        product={editingProduct}
                        variants={variants}
                        onBack={handleCloseEditor}
                        onSaveComplete={handleSaveComplete}
                    />
                ) : currentView === 'dashboard' ? (
                    <DashboardOverview onNavigateToInventory={() => setCurrentView('inventory')} />
                ) : currentView === 'inventory' ? (
                    <ProductList
                        products={products}
                        loading={loading}
                        onEditProduct={handleOpenEditor}
                        onAddProduct={() => handleOpenEditor()}
                        onRefresh={fetchProducts}
                    />
                ) : currentView === 'orders' ? (
                    <OrderManager />
                ) : currentView === 'categories' ? (
                    <CategoryManager />
                ) : currentView === 'analytics' ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Analytics</h2>
                        <p style={{ color: '#888' }}>Coming soon - Sales charts and performance metrics</p>
                    </div>
                ) : currentView === 'settings' ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Settings</h2>
                        <p style={{ color: '#888' }}>Coming soon - Store configuration options</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Admin;
