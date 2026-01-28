import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Apple } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate('/');
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Success! Check your email to confirm your account.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            background: 'white',
            overflow: 'hidden'
        }}>
            {/* Left Side: Visual Content */}
            <div style={{
                flex: 1.2,
                background: 'var(--primary-color)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '80px',
                color: 'white',
                borderRadius: '0 40px 40px 0' // Rounded edge for the left section
            }} className="desktop-only">
                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute',
                    top: '-100px',
                    right: '-100px',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    filter: 'blur(80px)'
                }}></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '24px' }}>
                        The future of <br /> <span style={{ opacity: 0.6 }}>tech is here.</span>
                    </h1>
                    <p style={{ fontSize: '18px', fontWeight: 600, opacity: 0.8, maxWidth: '400px', lineHeight: 1.6, marginBottom: '40px' }}>
                        Join the most exclusive community of tech enthusiasts and early adopters.
                    </p>

                    <div style={{ display: 'flex', gap: '40px' }}>
                        <div>
                            <p style={{ fontSize: '32px', fontWeight: 900 }}>12k+</p>
                            <p style={{ fontSize: '12px', fontWeight: 800, opacity: 0.6, textTransform: 'uppercase' }}>Active Users</p>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                        <div>
                            <p style={{ fontSize: '32px', fontWeight: 900 }}>450+</p>
                            <p style={{ fontSize: '12px', fontWeight: 800, opacity: 0.6, textTransform: 'uppercase' }}>Products</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Side: Auth Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '60px',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                <div style={{ maxWidth: '400px', width: '100%' }}>
                    <motion.div
                        key={isLogin ? 'login' : 'register'}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '8px' }}>
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p style={{ color: '#aaa', fontWeight: 600, marginBottom: '40px' }}>
                            {isLogin ? 'Enter your details to access your account' : 'Sign up to start your journey with us'}
                        </p>

                        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {error && (
                                <div style={{ padding: '12px', background: '#fff5f5', color: '#ff4444', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>
                                    {error}
                                </div>
                            )}

                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', marginBottom: '10px', display: 'block', letterSpacing: '0.05em' }}>EMAIL ADDRESS</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '20px', top: '18px', color: '#aaa' }} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        style={{
                                            width: '100%',
                                            padding: '18px 20px 18px 52px',
                                            borderRadius: '24px', // More rounded
                                            border: '2px solid #f5f5f7',
                                            outline: 'none',
                                            fontWeight: 600,
                                            fontSize: '15px',
                                            transition: 'border-color 0.2s',
                                            background: '#f9f9fb'
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = 'black'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = '#f5f5f7'}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 900, color: '#aaa', marginBottom: '10px', display: 'block', letterSpacing: '0.05em' }}>PASSWORD</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '20px', top: '18px', color: '#aaa' }} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={{
                                            width: '100%',
                                            padding: '18px 20px 18px 52px',
                                            borderRadius: '24px', // More rounded
                                            border: '2px solid #f5f5f7',
                                            outline: 'none',
                                            fontWeight: 600,
                                            fontSize: '15px',
                                            transition: 'border-color 0.2s',
                                            background: '#f9f9fb'
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = 'black'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = '#f5f5f7'}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    height: '60px',
                                    background: 'black',
                                    color: 'white',
                                    borderRadius: '30px', // Full rounding
                                    fontWeight: 800,
                                    fontSize: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    marginTop: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div style={{ margin: '40px 0', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }}></div>
                            <span style={{ fontSize: '11px', fontWeight: 900, color: '#ccc', letterSpacing: '0.1em' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }}></div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button style={{ flex: 1, height: '56px', borderRadius: '28px', border: '2px solid #f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 700, fontSize: '14px' }}>
                                <Apple size={20} /> Apple
                            </button>
                            <button style={{ flex: 1, height: '56px', borderRadius: '28px', border: '2px solid #f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 700, fontSize: '14px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </div>

                        <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '14px', fontWeight: 700, color: '#aaa' }}>
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                style={{ color: 'var(--primary-color)', fontWeight: 900, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
