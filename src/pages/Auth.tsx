import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                navigate('/');
            } else {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (signUpError) throw signUpError;
                setError('Check your email for the confirmation link!');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Left Side - Branding (Hidden on mobile) */}
            <div className="auth-branding">
                {/* Animated background elements */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="auth-glow-1"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="auth-glow-2"
                />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="auth-logo"
                    >
                        <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                            <div style={{ position: 'absolute', width: '20px', height: '20px', background: 'white', borderRadius: '50% 50% 0 50%' }}></div>
                            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px', background: 'white', borderRadius: '50% 0 50% 50%', opacity: 0.6 }}></div>
                        </div>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>TECH SHOP</h1>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="auth-title"
                    >
                        Premium Tech<br />
                        <span style={{ opacity: 0.7 }}>For Everyone</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="auth-subtitle"
                    >
                        Join thousands of tech enthusiasts discovering the latest and greatest in consumer electronics.
                    </motion.p>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="auth-form-side">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ width: '100%', maxWidth: '440px' }}
                >
                    <div className="auth-header">
                        <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.03em', color: '#1a1a1a' }}>
                            {isLogin ? 'Welcome Back' : 'Get Started'}
                        </h2>
                        <p style={{ color: '#666', fontSize: '15px' }}>
                            {isLogin ? 'Sign in to your account' : 'Create your account today'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <label className="auth-label">Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required={!isLogin}
                                            placeholder="John Doe"
                                            className="auth-input"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="auth-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    className="auth-input"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="auth-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="auth-input"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`auth-error-box ${error.includes('Check') ? 'success' : ''}`}
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="auth-submit-btn"
                        >
                            {loading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="spinner"
                                />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="auth-toggle-btn"
                        >
                            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                        </button>
                    </div>
                </motion.div>
            </div>

            <style>{`
                .auth-container {
                    min-height: 100vh;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    background: #ffffff;
                }

                .auth-branding {
                    background: linear-gradient(135deg, var(--primary-color) 0%, #4338ca 100%);
                    padding: 60px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }

                .auth-glow-1 {
                    position: absolute; top: 10%; right: 10%; width: 300px; height: 300px;
                    background: rgba(255,255,255,0.05); border-radius: 50%; filter: blur(60px);
                }

                .auth-glow-2 {
                    position: absolute; bottom: 20%; left: 5%; width: 400px; height: 400px;
                    background: rgba(255,255,255,0.03); border-radius: 50%; filter: blur(80px);
                }

                .auth-logo { display: flex; alignItems: center; gap: 12px; margin-bottom: 40px; }
                .auth-title { font-size: 48px; font-weight: 900; color: white; line-height: 1.1; margin-bottom: 20px; letter-spacing: -0.04em; }
                .auth-subtitle { font-size: 16px; color: rgba(255,255,255,0.8); line-height: 1.6; max-width: 400px; }

                .auth-form-side { background: #ffffff; padding: 40px; display: flex; align-items: center; justify-content: center; }
                .auth-header { margin-bottom: 40px; }
                .auth-label { display: block; fontSize: 13px; fontWeight: 700; marginBottom: 8px; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.05em; }
                .auth-input {
                    width: 100%; padding: 14px 16px 14px 48px; border-radius: 12px; border: 2px solid #f1f5f9;
                    font-size: 14px; font-weight: 500; transition: all 0.2s; background: #f8fafc; outline: none;
                }
                .auth-input:focus { border-color: var(--primary-color); background: #fff; box-shadow: 0 0 0 4px rgba(85, 68, 255, 0.05); }

                .auth-error-box { padding: 12px; border-radius: 10px; background: #fff1f2; color: #be123c; font-size: 13px; font-weight: 600; border: 1px solid #fecdd3; }
                .auth-error-box.success { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }

                .auth-submit-btn {
                    width: 100%; padding: 16px; background: var(--primary-color); color: white; border: none; borderRadius: 12px;
                    fontSize: 15px; fontWeight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
                    transition: all 0.2s; box-shadow: 0 4px 12px rgba(85, 68, 255, 0.2);
                }
                .auth-submit-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(85, 68, 255, 0.3); }
                .auth-submit-btn:active { transform: translateY(0); }

                .auth-toggle-btn { background: none; border: none; color: var(--primary-color); font-size: 14px; fontWeight: 700; cursor: pointer; }
                .spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; }

                @media (max-width: 900px) {
                    .auth-container { grid-template-columns: 1fr; }
                    .auth-branding { display: none; }
                    .auth-form-side { padding: 32px 20px; }
                }
            `}</style>
        </div>
    );
};

export default Auth;
