import React from 'react';
import Navbar from './Navbar';
import { Mic, SlidersHorizontal, ArrowLeft, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

const Hero = () => {
    return (
        <div className="hero-wrapper">
            <Navbar />

            <div className="hero-grid" style={{ marginTop: '30px' }}> {/* Reduced top margin */}
                <div className="hero-sidebar" style={{ gap: '16px' }}> {/* Reduced gap */}
                    <div className="hero-sidebar-item active" style={{ fontSize: '16px' }}>All</div>
                    <div className="hero-sidebar-item" style={{ fontSize: '16px' }}>Man</div>
                    <div className="hero-sidebar-item" style={{ fontSize: '16px' }}>Woman</div>
                    <div className="hero-sidebar-item" style={{ fontSize: '16px' }}>Kids</div>

                    <button style={{
                        marginTop: '20px',
                        border: '1px solid rgba(255,255,255,0.4)',
                        color: 'white',
                        borderRadius: '16px',
                        padding: '8px 20px',
                        fontSize: '13px',
                        width: 'fit-content',
                        fontWeight: 600
                    }}>
                        Show All
                    </button>

                    <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingBottom: '10px' }}>
                        <button className="arrow-btn" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px' }}>
                            <ArrowLeft size={18} />
                        </button>
                        <button className="arrow-btn" style={{ width: '40px', height: '40px', background: '#ff9900', color: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(255, 153, 0, 0.3)' }}>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                <div>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'flex-end' }}>
                        <div style={{ width: '60px', height: '60px', background: 'white', borderRadius: '30px' }}></div>
                        <div style={{ width: '90px', height: '60px', background: 'white', borderRadius: '0 40px 40px 40px' }}></div>
                    </div>
                    <h1 className="hero-title" style={{ fontSize: 'clamp(32px, 6vw, 64px)', letterSpacing: '-0.04em', marginBottom: '30px' }}>
                        People Get <br /> <span style={{ opacity: 0.6, fontWeight: 400 }}>Good Smartly</span>
                    </h1>

                    <div className="hero-search-container" style={{ marginBottom: '40px' }}>
                        <input type="text" className="search-input" placeholder="Search" style={{ paddingLeft: '32px' }} />
                        <div style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '20px', color: 'rgba(255,255,255,0.6)' }}>
                            <Mic size={20} />
                            <SlidersHorizontal size={20} />
                        </div>
                    </div>

                    <div className="hero-cards-scroll">
                        <div className="hero-card ghost" style={{ height: '120px', minWidth: '160px' }}>
                            <h4 style={{ opacity: 0.6, fontSize: '14px' }}>Recent</h4>
                        </div>
                        <div className="hero-card" style={{ height: '120px', minWidth: '160px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h4 style={{ fontSize: '14px', lineHeight: 1.2 }}>Popular <br /> Items</h4>
                                <div style={{ color: '#5544ff' }}><TrendingUp size={18} /></div>
                            </div>
                            <div style={{ border: '1px solid #eee', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowRight size={14} />
                            </div>
                        </div>
                        <div className="hero-card" style={{ height: '120px', minWidth: '160px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h4 style={{ fontSize: '14px', lineHeight: 1.2 }}>Special <br /> Offers For You</h4>
                                <div style={{ color: '#ff9900' }}><Sparkles size={18} fill="#ff9900" stroke="none" /></div>
                            </div>
                            <div style={{ border: '1px solid #eee', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowRight size={14} />
                            </div>
                        </div>
                        <div className="hero-card ghost" style={{ height: '120px', minWidth: '120px' }}>
                            <h4 style={{ fontSize: '14px' }}>Show All</h4>
                            <div style={{ border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowRight size={14} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
