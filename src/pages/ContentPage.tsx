import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ContentPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState<{ title: string; content: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('site_content')
                    .select('title, content')
                    .eq('slug', slug)
                    .single();

                if (error || !data) {
                    console.error('Content not found:', error);
                    navigate('/');
                    return;
                }

                setPage(data);
            } catch (error) {
                console.error('Error fetching content:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchContent();
    }, [slug, navigate]);

    if (loading) return (
        <div className="layout-with-sidebar">
            <Sidebar />
            <div style={{ flex: 1, padding: '100px', textAlign: 'center' }}>
                <div className="skeleton" style={{ width: '300px', height: '40px', margin: '0 auto 20px' }} />
                <div className="skeleton" style={{ width: '100%', height: '400px' }} />
            </div>
        </div>
    );

    if (!page) return null;

    return (
        <div className="layout-with-sidebar">
            <Sidebar />

            <main style={{ flex: 1, padding: '60px 40px', background: '#fff', minHeight: '100vh' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ maxWidth: '800px', margin: '0 auto' }}
                    className="markdown-content"
                >
                    <h1 style={{
                        fontSize: '48px',
                        fontWeight: 900,
                        color: '#0F172A',
                        letterSpacing: '-0.04em',
                        marginBottom: '40px',
                        lineHeight: 1.1
                    }}>
                        {page.title}
                    </h1>

                    <div style={{
                        fontSize: '18px',
                        lineHeight: 1.8,
                        color: '#475569'
                    }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {page.content.replace(/\\n/g, '\n')}
                        </ReactMarkdown>
                    </div>
                </motion.div>
            </main>

            <style>{`
                .markdown-content h3 {
                    font-size: 20px;
                    font-weight: 800;
                    color: #0F172A;
                    margin-top: 32px;
                    margin-bottom: 12px;
                }
                .markdown-content p {
                    margin-bottom: 20px;
                }
                .markdown-content li {
                    margin-bottom: 8px;
                }
                .markdown-content strong {
                    color: #0F172A;
                    font-weight: 700;
                }
            `}</style>
        </div>
    );
};

export default ContentPage;
