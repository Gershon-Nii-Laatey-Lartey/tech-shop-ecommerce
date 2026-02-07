import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AdminSidebar from '../components/AdminSidebar';
import { Save, FileText, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentPage {
    slug: string;
    title: string;
    content: string;
    updated_at: string;
}

const AdminContent = () => {
    const [pages, setPages] = useState<ContentPage[]>([]);
    const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showMobileEditor, setShowMobileEditor] = useState(false);



    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            
            .admin-content-main {
                margin-left: 260px;
                padding: 40px;
                transition: all 0.3s;
            }

            .content-grid {
                display: grid;
                grid-template-columns: 300px 1fr;
                gap: 24px;
                height: calc(100vh - 200px);
            }

            .pages-list {
                display: flex;
            }

            .editor-panel {
                display: flex;
            }

            .mobile-back-btn {
                display: none;
            }

            @media (max-width: 1024px) {
                .admin-content-main {
                    margin-left: 0;
                    padding: 0 24px 40px 24px;
                    margin-top: 60px;
                }
            }

            @media (max-width: 768px) {
                .admin-content-main {
                    padding: 0 20px 100px 20px;
                    margin-top: 60px;
                }
                .content-grid {
                    display: flex;
                    flex-direction: column;
                    height: auto;
                }
                .pages-list {
                    width: 100%;
                    display: ${showMobileEditor ? 'none' : 'flex'};
                }
                .editor-panel {
                    width: 100%;
                    display: ${showMobileEditor ? 'flex' : 'none'};
                    height: calc(100vh - 140px);
                }
                .mobile-back-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                    font-weight: 700;
                    color: #64748B;
                    background: none;
                    border: none;
                    padding: 0;
                    margin-bottom: 16px;
                    cursor: pointer;
                }
                .page-header {
                    flex-direction: column;
                    align-items: flex-start !important;
                    gap: 16px;
                }
                .save-btn {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, [showMobileEditor]);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('site_content')
                .select('*')
                .order('title');

            if (error) throw error;
            setPages(data || []);
            if (data && data.length > 0) {
                setSelectedPage(data[0]);
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedPage) return;
        setSaving(true);
        setMessage(null);
        try {
            const { error } = await supabase
                .from('site_content')
                .update({
                    content: selectedPage.content,
                    updated_at: new Date().toISOString()
                })
                .eq('slug', selectedPage.slug);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Page updated successfully!' });
            // Update local state
            setPages(pages.map(p => p.slug === selectedPage.slug ? selectedPage : p));
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update page' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };



    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            <AdminSidebar activeTab="Content" />

            <main className="admin-content-main" style={{ flex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>Site Content</h1>
                            <p style={{ color: '#64748B', fontWeight: 600 }}>Manage public pages and legal documents</p>
                        </div>

                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        background: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                                        border: `1px solid ${message.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
                                        color: message.type === 'success' ? '#15803D' : '#B91C1C',
                                        fontSize: '14px',
                                        fontWeight: 600
                                    }}
                                >
                                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="content-grid">
                        {/* Sidebar: Pages List */}
                        <div className="pages-list" style={{ background: '#fff', borderRadius: '24px', border: '1px solid #F1F5F9', padding: '12px', overflowY: 'auto', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {loading ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>Loading...</div>
                                ) : pages.map(page => (
                                    <button
                                        key={page.slug}
                                        onClick={() => {
                                            setSelectedPage(page);
                                            setShowMobileEditor(true);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '14px 16px',
                                            borderRadius: '14px',
                                            border: 'none',
                                            background: selectedPage?.slug === page.slug ? '#F1F5F9' : 'transparent',
                                            color: selectedPage?.slug === page.slug ? '#0F172A' : '#64748B',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <FileText size={18} />
                                            <span style={{ fontSize: '14px', fontWeight: selectedPage?.slug === page.slug ? 700 : 600 }}>{page.title}</span>
                                        </div>
                                        {selectedPage?.slug === page.slug && <ChevronRight size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Main: Editor */}
                        <div className="editor-panel" style={{ background: '#fff', borderRadius: '24px', border: '1px solid #F1F5F9', flexDirection: 'column', overflow: 'hidden' }}>
                            {selectedPage ? (
                                <>
                                    <div className="page-header" style={{ padding: '24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <button className="mobile-back-btn" onClick={() => setShowMobileEditor(false)}>
                                                <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Pages
                                            </button>
                                            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{selectedPage.title}</h2>
                                            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                                                Last updated: {new Date(selectedPage.updated_at).toLocaleString()} • Markdown supported
                                            </p>
                                        </div>
                                        <button
                                            className="save-btn"
                                            onClick={handleSave}
                                            disabled={saving}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '10px 20px',
                                                background: '#0F172A',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '12px',
                                                fontSize: '14px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                opacity: saving ? 0.7 : 1
                                            }}
                                        >
                                            <Save size={18} />
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                    <div style={{ flex: 1, padding: '24px', position: 'relative' }}>
                                        <textarea
                                            value={selectedPage.content}
                                            onChange={(e) => setSelectedPage({ ...selectedPage, content: e.target.value })}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                border: 'none',
                                                resize: 'none',
                                                outline: 'none',
                                                fontSize: '16px',
                                                lineHeight: 1.6,
                                                color: '#334155',
                                                fontFamily: 'inherit'
                                            }}
                                            placeholder="Write your content here..."
                                        />
                                    </div>
                                </>
                            ) : (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                                    Select a page to edit
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>


        </div>
    );
};

export default AdminContent;
