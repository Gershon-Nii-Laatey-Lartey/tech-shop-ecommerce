import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck,
    Save,
    Globe,
    Search,
    Plus,
    Trash2,
    ChevronRight,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Settings,
    Layers,
    Map
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LogisticsZone {
    id: string;
    parent_id: string | null;
    name: string;
    level: number;
    description?: string;
}

interface LogisticsSettings {
    api_endpoint: string;
    is_enabled: boolean;
}

const AdminLogistics = () => {
    const { isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Settings State
    const [settings, setSettings] = useState<LogisticsSettings>({
        api_endpoint: '',
        is_enabled: false
    });

    // Hierarchy State
    const [zones, setZones] = useState<LogisticsZone[]>([]);
    const [path, setPath] = useState<LogisticsZone[]>([]);
    const [currentParentId, setCurrentParentId] = useState<string | null>(null);

    // UI State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newZoneName, setNewZoneName] = useState('');
    const [activeTab, setActiveTab] = useState<'infrastructure' | 'configuration'>('configuration');

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/');
        }
    }, [isAdmin, authLoading, navigate]);

    useEffect(() => {
        if (isAdmin) {
            fetchSettings();
            fetchZones(null);
        }
    }, [isAdmin]);

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('admin_settings')
            .select('*')
            .eq('key', 'logistics_config')
            .single();

        if (data) {
            setSettings(data.value);
        } else if (error && error.code === 'PGRST116') {
            // No settings yet
            const defaultSettings = { api_endpoint: '', is_enabled: false };
            await supabase.from('admin_settings').insert({ key: 'logistics_config', value: defaultSettings });
            setSettings(defaultSettings);
        }
    };

    const fetchZones = async (parentId: string | null) => {
        setLoading(true);
        const query = supabase
            .from('logistics_zones')
            .select('*')
            .order('name');

        if (parentId) {
            query.eq('parent_id', parentId);
        } else {
            query.is('parent_id', null);
        }

        const { data, error } = await query;
        if (!error) setZones(data || []);
        setLoading(false);
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('admin_settings')
            .update({ value: settings })
            .eq('key', 'logistics_config');

        if (!error) {
            alert('Logistics configuration updated successfully');
        }
        setSaving(false);
    };

    const handleAddZone = async () => {
        if (!newZoneName) return;

        const { error } = await supabase
            .from('logistics_zones')
            .insert({
                name: newZoneName,
                parent_id: currentParentId,
                level: path.length
            });

        if (!error) {
            setNewZoneName('');
            setIsAddModalOpen(false);
            fetchZones(currentParentId);
        }
    };

    const handleDeleteZone = async (id: string) => {
        if (!window.confirm('Delete this zone and all its sub-locations?')) return;

        const { error } = await supabase
            .from('logistics_zones')
            .delete()
            .eq('id', id);

        if (!error) fetchZones(currentParentId);
    };

    const navigateToZone = (zone: LogisticsZone) => {
        const newPath = [...path, zone];
        setPath(newPath);
        setCurrentParentId(zone.id);
        fetchZones(zone.id);
    };

    const navigateBack = (index: number) => {
        if (index === -1) {
            setPath([]);
            setCurrentParentId(null);
            fetchZones(null);
        } else {
            const newPath = path.slice(0, index + 1);
            const target = newPath[newPath.length - 1];
            setPath(newPath);
            setCurrentParentId(target.id);
            fetchZones(target.id);
        }
    };

    if (authLoading || !isAdmin) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            <AdminSidebar activeTab="Settings" />

            <div className="admin-main-content">
                <header style={{ marginBottom: '40px', marginTop: '40px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.04em', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Settings size={32} color="#5544ff" />
                        Shop Settings
                    </h1>
                    <p style={{ color: '#64748B', fontWeight: 600, marginTop: '8px' }}>Global logistics and distribution controls</p>
                </header>

                <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', borderBottom: '1px solid #E2E8F0' }}>
                    <button
                        onClick={() => setActiveTab('configuration')}
                        style={{
                            padding: '16px 4px',
                            background: 'none',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: '14px',
                            color: activeTab === 'configuration' ? '#5544ff' : '#64748B',
                            borderBottom: activeTab === 'configuration' ? '2px solid #5544ff' : '2px solid transparent',
                            cursor: 'pointer'
                        }}
                    >
                        Integration Configuration
                    </button>
                    <button
                        onClick={() => setActiveTab('infrastructure')}
                        style={{
                            padding: '16px 4px',
                            background: 'none',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: '14px',
                            color: activeTab === 'infrastructure' ? '#5544ff' : '#64748B',
                            borderBottom: activeTab === 'infrastructure' ? '2px solid #5544ff' : '2px solid transparent',
                            cursor: 'pointer'
                        }}
                    >
                        Logistics Infrastructure
                    </button>
                </div>

                {activeTab === 'configuration' ? (
                    <div style={{ maxWidth: '800px' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(85, 68, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Globe size={24} color="#5544ff" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Real-time Shipping API</h3>
                                    <p style={{ fontSize: '13px', color: '#64748B' }}>Connect your logistics provider to fetch live delivery rates</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Endpoint URL
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://api.logistics.com/v1/rates"
                                        value={settings.api_endpoint}
                                        onChange={(e) => setSettings({ ...settings, api_endpoint: e.target.value })}
                                        style={{ width: '100%', padding: '16px', background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: '16px', fontSize: '15px', fontWeight: 600, outline: 'none', transition: 'all 0.2s' }}
                                    />
                                    <div style={{ marginTop: '12px', padding: '16px', background: '#F0F9FF', borderRadius: '12px', display: 'flex', gap: '12px' }}>
                                        <AlertCircle size={18} color="#0EA5E9" style={{ flexShrink: 0 }} />
                                        <p style={{ fontSize: '12px', color: '#0369A1', lineHeight: 1.6 }}>
                                            <strong>Integration Specs:</strong> We'll send a POST request with the customer's selected location hierarchy (Zone, Sub-Zone, Area) and cart items. Your API must return a JSON object with a <code style={{ background: '#E0F2FE', padding: '2px 4px', borderRadius: '4px' }}>delivery_fee</code> value.
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#F8FAFC', borderRadius: '16px' }}>
                                    <div>
                                        <p style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>Enable Real-time Rates</p>
                                        <p style={{ fontSize: '12px', color: '#64748B' }}>If disabled, the store will default to flat rates or free shipping.</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.is_enabled}
                                            onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked })}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <button
                                    onClick={handleSaveSettings}
                                    disabled={saving}
                                    style={{
                                        width: 'fit-content',
                                        padding: '16px 32px',
                                        background: '#5544ff',
                                        color: '#fff',
                                        borderRadius: '16px',
                                        border: 'none',
                                        fontWeight: 800,
                                        fontSize: '15px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        boxShadow: '0 8px 30px rgba(85, 68, 255, 0.2)'
                                    }}
                                >
                                    <Save size={18} />
                                    {saving ? 'Updating...' : 'Persist Configuration'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <div style={{ maxWidth: '1000px' }}>
                        {/* Breadcrumbs */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => navigateBack(-1)}
                                style={{ background: 'none', border: 'none', color: '#5544ff', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                            >
                                Root
                            </button>
                            {path.map((p, i) => (
                                <React.Fragment key={p.id}>
                                    <ChevronRight size={14} color="#94A3B8" />
                                    <button
                                        onClick={() => navigateBack(i)}
                                        style={{ background: 'none', border: 'none', color: i === path.length - 1 ? '#0F172A' : '#5544ff', fontWeight: 800, fontSize: '13px', cursor: i === path.length - 1 ? 'default' : 'pointer' }}
                                    >
                                        {p.name}
                                    </button>
                                </React.Fragment>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div style={{ position: 'relative', width: '320px' }}>
                                <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    placeholder="Filter locations..."
                                    style={{ width: '100%', padding: '12px 16px 12px 48px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
                                />
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                style={{ padding: '12px 24px', background: '#0F172A', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                            >
                                <Plus size={18} />
                                New Location
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ padding: '100px', textAlign: 'center' }}>
                                <div className="loader" style={{ margin: '0 auto' }} />
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                {zones.map(zone => (
                                    <motion.div
                                        key={zone.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{
                                            background: '#fff',
                                            padding: '20px',
                                            borderRadius: '20px',
                                            border: '1px solid #E2E8F0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={(e) => {
                                            // Check if click was not on delete button
                                            if (!(e.target as HTMLElement).closest('.delete-btn')) {
                                                navigateToZone(zone);
                                            }
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#5544ff'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MapPin size={20} color="#5544ff" />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>{zone.name}</p>
                                                <p style={{ fontSize: '12px', color: '#94A3B8' }}>{path.length === 0 ? 'Major Zone' : path.length === 1 ? 'Sub-Zone' : 'District'}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => { e.stopPropagation(); handleDeleteZone(zone.id); }}
                                                style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', color: '#CBD5E1' }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = '#CBD5E1'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <ChevronRight size={18} color="#CBD5E1" />
                                        </div>
                                    </motion.div>
                                ))}
                                {zones.length === 0 && (
                                    <div style={{ gridColumn: '1 / -1', padding: '80px', textAlign: 'center', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #E2E8F0' }}>
                                        <Map size={48} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                                        <p style={{ color: '#64748B', fontWeight: 700 }}>No nested locations found here</p>
                                        <button
                                            onClick={() => setIsAddModalOpen(true)}
                                            style={{ marginTop: '16px', color: '#5544ff', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            Create the first one
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000 }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', background: '#fff', borderRadius: '32px', padding: '32px', zIndex: 1001, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}
                        >
                            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px' }}>Add {path.length === 0 ? 'Major Zone' : 'Sub-Location'}</h2>
                            <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>
                                {path.length === 0 ? 'Create a primary distribution zone' : `Adding nested location under ${path[path.length - 1].name}`}
                            </p>

                            <input
                                type="text"
                                placeholder="Enter name (e.g. Greater Accra)"
                                value={newZoneName}
                                onChange={(e) => setNewZoneName(e.target.value)}
                                style={{ width: '100%', padding: '16px', background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: '16px', fontSize: '15px', fontWeight: 600, outline: 'none', marginBottom: '24px' }}
                                autoFocus
                            />

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setIsAddModalOpen(false)} style={{ flex: 1, padding: '14px', background: '#F8FAFC', border: 'none', borderRadius: '14px', fontWeight: 800, color: '#64748B', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleAddZone} style={{ flex: 2, padding: '14px', background: '#5544ff', border: 'none', borderRadius: '14px', fontWeight: 800, color: '#fff', cursor: 'pointer', boxShadow: '0 8px 20px rgba(85, 68, 255, 0.2)' }}>Create Location</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 52px;
                    height: 28px;
                }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: #E2E8F0;
                    transition: .4s;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 20px; width: 20px;
                    left: 4px; bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                input:checked + .slider { background-color: #5544ff; }
                input:checked + .slider:before { transform: translateX(24px); }
                .slider.round { border-radius: 34px; }
                .slider.round:before { border-radius: 50%; }

                .loader {
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #5544ff;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AdminLogistics;
