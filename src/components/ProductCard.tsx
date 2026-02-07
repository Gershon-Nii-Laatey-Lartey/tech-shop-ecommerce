import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { trackClick } from '../hooks/useAnalytics';

interface ProductCardProps {
    id: string;
    name: string;
    price: string;
    image: string;
    category: string;
    isNew?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, image, category, isNew }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        trackClick(`product-card-${id}`);
        navigate(`/product/${id}`);
    };

    return (
        <motion.div
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                background: '#fff',
                borderRadius: '32px',
                padding: '12px',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                border: '1px solid #f0f0f0',
                cursor: 'pointer'
            }}
            className="product-card-premium"
        >
            <div style={{
                aspectRatio: '1',
                overflow: 'hidden',
                backgroundColor: '#f9f9fb',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                position: 'relative'
            }}>
                {isNew && (
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'black',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '9px',
                        fontWeight: 900,
                        letterSpacing: '0.1em',
                        zIndex: 2,
                        lineHeight: 1
                    }}>
                        NEW
                    </div>
                )}

                <motion.img
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    src={image}
                    alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}
                />

                <div className="quick-add-btn" style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    width: '44px',
                    height: '44px',
                    background: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
                    transform: 'translateY(10px)',
                    opacity: 0,
                    transition: 'all 0.3s ease'
                }}>
                    <Plus size={20} />
                </div>
            </div>

            <div style={{ padding: '16px 8px 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{
                    fontSize: '10px',
                    color: '#94A3B8',
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: '0.05em'
                }}>{(category || '').toUpperCase()}</p>

                <h3 className="product-card-name" style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#0F172A',
                    letterSpacing: '-0.02em',
                    margin: 0,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '2.6em'
                }} title={name}>{name}</h3>

                <p style={{
                    fontSize: '16px',
                    color: '#0F172A',
                    fontWeight: 900,
                    margin: 0
                }}>GH₵ {price}</p>
            </div>

            <style>{`
                .product-card-premium:hover {
                    border-color: #e0e0e0;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.04);
                }
                .product-card-premium:hover .quick-add-btn {
                    opacity: 1;
                    transform: translateY(0);
                }
                @media (max-width: 768px) {
                    .product-card-premium {
                        border-radius: 20px !important;
                        padding: 8px !important;
                    }
                    .product-card-premium > div:first-child {
                        padding: 16px !important;
                        border-radius: 16px !important;
                    }
                    .product-card-name {
                        font-size: 13px !important;
                        min-height: 2.6em !important;
                    }
                    .quick-add-btn {
                        display: none !important;
                    }
                }
            `}</style>
        </motion.div>
    );
};

export default ProductCard;

