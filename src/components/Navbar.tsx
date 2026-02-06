import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingBag, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user } = useAuth();
  const { items } = useCart();

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="floating-header">
      <Link to="/" style={{ fontSize: '24px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.04em', textDecoration: 'none', color: 'white' }}>
        <div style={{ position: 'relative', width: '32px', height: '32px' }}>
          <div style={{ position: 'absolute', width: '16px', height: '16px', background: 'white', borderRadius: '50% 50% 0 50%' }}></div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '16px', height: '16px', background: 'white', borderRadius: '50% 0 50% 50%', opacity: 0.6 }}></div>
          <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', border: '2px solid var(--primary-color)' }}></div>
        </div>
        <span>people</span>
      </Link>

      <div style={{ display: 'flex', gap: '32px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 'auto', alignItems: 'center' }}>
        <Link to="/" className="hide-mobile" style={{ transition: 'all 0.2s', color: 'white', opacity: 0.7 }}>Home</Link>
        <Link to="/orders" className="hide-mobile" style={{ transition: 'all 0.2s', color: 'white', opacity: 0.7 }}>Orders</Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/cart" style={{ position: 'relative', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={22} strokeWidth={2.5} />
            <AnimatePresence mode="popLayout">
              {itemCount > 0 && (
                <motion.span
                  key="cart-badge"
                  initial={{ scale: 0, opacity: 0, y: 5 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0, y: 5 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                  style={{
                    position: 'absolute',
                    top: '-7px',
                    right: '-10px',
                    background: 'linear-gradient(135deg, #ff3b30 0%, #ff2d55 100%)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 900,
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '10px',
                    padding: '0 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(255, 59, 48, 0.3)',
                    pointerEvents: 'none'
                  }}
                >
                  <motion.span
                    key={itemCount}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 300 }}
                  >
                    {itemCount}
                  </motion.span>
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {!user ? (
            <Link to="/auth" style={{
              height: '40px',
              padding: '0 20px',
              background: 'white',
              color: 'black',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none'
            }}>
              LOGIN
            </Link>
          ) : (
            <Link to="/profile" style={{ color: 'white' }}>
              <User size={22} strokeWidth={2.5} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;


