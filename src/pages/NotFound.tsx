import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F8FAFC',
            padding: '24px',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
            <div style={{
                maxWidth: '600px',
                width: '100%',
                textAlign: 'center'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 style={{
                        fontSize: 'clamp(100px, 20vw, 180px)',
                        fontWeight: 900,
                        color: '#0F172A',
                        lineHeight: 1,
                        margin: 0,
                        letterSpacing: '-0.05em',
                        background: 'linear-gradient(135deg, #0F172A 0%, #5544ff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        404
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <h2 style={{
                        fontSize: '28px',
                        fontWeight: 800,
                        color: '#0F172A',
                        marginTop: '24px',
                        marginBottom: '16px'
                    }}>
                        Page Not Found
                    </h2>
                    <p style={{
                        fontSize: '16px',
                        color: '#64748B',
                        lineHeight: 1.6,
                        marginBottom: '40px',
                        maxWidth: '400px',
                        margin: '0 auto 40px auto'
                    }}>
                        Oops! The page you're looking for seems to have vanished into thin air. Let's get you back on track.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    style={{
                        display: 'flex',
                        gap: '16px',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}
                >
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '16px 32px',
                            background: '#5544ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontSize: '15px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 10px 20px rgba(85, 68, 255, 0.2)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 15px 30px rgba(85, 68, 255, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(85, 68, 255, 0.2)';
                        }}
                    >
                        <Home size={20} />
                        Back to Home
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '16px 32px',
                            background: 'white',
                            color: '#0F172A',
                            border: '1px solid #E2E8F0',
                            borderRadius: '16px',
                            fontSize: '15px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#F8FAFC';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <ArrowLeft size={20} />
                        Go Back
                    </button>
                </motion.div>

                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    opacity: 0.05,
                    pointerEvents: 'none'
                }}>
                    <Search size={120} color="#5544ff" />
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
            `}</style>
        </div>
    );
};

export default NotFound;
