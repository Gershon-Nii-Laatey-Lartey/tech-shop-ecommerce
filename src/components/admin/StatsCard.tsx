import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: 'default' | 'dark' | 'accent';
}

const StatsCard = ({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatsCardProps) => {
    const getStyles = () => {
        switch (variant) {
            case 'dark':
                return {
                    background: '#111',
                    color: 'white',
                    subtitleColor: 'rgba(255,255,255,0.5)',
                    iconBg: 'rgba(255,255,255,0.1)',
                    iconColor: 'white'
                };
            case 'accent':
                return {
                    background: 'linear-gradient(135deg, #5544ff 0%, #7766ff 100%)',
                    color: 'white',
                    subtitleColor: 'rgba(255,255,255,0.7)',
                    iconBg: 'rgba(255,255,255,0.2)',
                    iconColor: 'white'
                };
            default:
                return {
                    background: 'white',
                    color: '#111',
                    subtitleColor: '#888',
                    iconBg: '#f5f5f7',
                    iconColor: '#666'
                };
        }
    };

    const styles = getStyles();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            style={{
                background: styles.background,
                borderRadius: '24px',
                padding: '28px',
                border: variant === 'default' ? '1px solid #f0f0f0' : 'none',
                transition: 'all 0.3s ease'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: styles.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Icon size={22} style={{ color: styles.iconColor }} />
                </div>
                {trend && (
                    <div
                        style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: trend.isPositive ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 68, 68, 0.15)',
                            color: trend.isPositive ? '#22c55e' : '#ef4444'
                        }}
                    >
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </div>
                )}
            </div>

            <p style={{ fontSize: '11px', fontWeight: 700, color: styles.subtitleColor, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {title}
            </p>
            <h3 style={{ fontSize: '32px', fontWeight: 900, color: styles.color, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {value}
            </h3>
            {subtitle && (
                <p style={{ fontSize: '12px', fontWeight: 600, color: styles.subtitleColor, marginTop: '8px' }}>
                    {subtitle}
                </p>
            )}
        </motion.div>
    );
};

export default StatsCard;
