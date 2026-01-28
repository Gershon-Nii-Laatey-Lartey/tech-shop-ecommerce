import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => navigate(`/product/${id}`)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                position: 'relative',
                background: '#fff',
                borderRadius: '32px',
                padding: '12px',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                border: '1px solid #f0f0f0'
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

            <div style={{ padding: '20px 12px 12px' }}>
                <p style={{ fontSize: '11px', color: '#aaa', fontWeight: 800, marginBottom: '6px', letterSpacing: '0.05em' }}>{category.toUpperCase()}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em' }}>{name}</h3>
                    <p style={{ fontSize: '18px', color: '#1a1a1a', fontWeight: 800 }}>${price}</p>
                </div>
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
            `}</style>
        </motion.div>
    );
};

export default ProductCard;
