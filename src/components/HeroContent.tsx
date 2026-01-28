import { Mic, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroContent = () => {
    return (
        <div className="hero-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Left Side: Content */}
            <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-end' }}>
                    <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '16px' }}></div>
                    <div style={{ width: '48px', height: '32px', background: 'white', borderRadius: '0 24px 24px 24px' }}></div>
                </div>

                <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.05em', marginBottom: '24px' }}>
                    Modern Tech <br />
                    <span style={{ fontSize: '0.92em', opacity: 0.85, fontWeight: 500 }}>
                        Designed for Everyone
                    </span>
                </h1>

                <div style={{ maxWidth: '400px', position: 'relative' }}>
                    <input type="text" className="search-input" placeholder="Search products..." style={{ paddingLeft: '28px', fontSize: '16px', fontWeight: 500 }} />
                    <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '20px', color: 'rgba(255,255,255,0.6)' }}>
                        <Mic size={20} cursor="pointer" />
                        <SlidersHorizontal size={20} cursor="pointer" />
                    </div>
                </div>
            </div>

            {/* Right Side: Hero Image */}
            <div style={{
                position: 'absolute',
                right: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '140%',
                width: '60%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                zIndex: 1,
                pointerEvents: 'none'
            }}>
                <motion.img
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    src="/hero image.png"
                    alt="Hero"
                    style={{
                        height: '100%',
                        width: 'auto',
                        objectFit: 'contain'
                    }}
                />
            </div>
        </div>
    );
};

export default HeroContent;
