import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingBag, User, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { user } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleScroll = () => {
      if (!isMobile || isSearchOpen) {
        setIsVisible(true);
        return;
      }

      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, isMobile, isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="floating-header"
      style={{
        transition: 'background-color 0.3s, padding 0.3s',
        backgroundColor: 'rgba(85, 68, 255, 0.95)',
        padding: isMobile ? '0 10px' : '0 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <AnimatePresence mode="wait">
        {!(isSearchOpen && isMobile) && (
          <motion.div
            key="logo-group"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            <Link to="/" style={{ fontSize: isMobile ? '22px' : '24px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', letterSpacing: '-0.04em', textDecoration: 'none', color: 'white' }}>
              <div style={{ position: 'relative', width: isMobile ? '32px' : '32px', height: isMobile ? '32px' : '32px' }}>
                <div style={{ position: 'absolute', width: isMobile ? '16px' : '16px', height: isMobile ? '16px' : '16px', background: 'white', borderRadius: '50% 50% 0 50%' }}></div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: isMobile ? '16px' : '16px', height: isMobile ? '16px' : '16px', background: 'white', borderRadius: '50% 0 50% 50%', opacity: 0.6 }}></div>
                <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%', border: '1.5px solid var(--primary-color)' }}></div>
              </div>
              <span style={{ fontSize: isMobile ? '20px' : '24px' }}>TECH SHOP</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingLeft: isSearchOpen && isMobile ? '0' : (isMobile ? '8px' : '24px'),
        paddingRight: isMobile ? '8px' : '24px',
        overflow: 'hidden'
      }}>
        <AnimatePresence mode="wait">
          {!isSearchOpen ? (
            <motion.div
              key="nav-links"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', gap: isMobile ? '10px' : '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', alignItems: 'center' }}
            >
              <Link to="/" className="hide-mobile" style={{ transition: 'all 0.2s', color: 'white', opacity: 0.7 }}>Home</Link>
              <Link to="/orders" className="hide-mobile" style={{ transition: 'all 0.2s', color: 'white', opacity: 0.7 }}>Orders</Link>
              <button
                onClick={() => setIsSearchOpen(true)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7, padding: '8px' }}
              >
                <Search size={isMobile ? 22 : 22} strokeWidth={2.5} />
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="search-form"
              onSubmit={handleSearchSubmit}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                maxWidth: isMobile ? '100%' : '300px',
                width: '100%'
              }}
            >
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  background: 'white',
                  border: 'none',
                  borderRadius: '18px',
                  padding: '0 35px 0 15px',
                  color: '#0f172a',
                  fontSize: '15px',
                  fontWeight: 600,
                  outline: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <button
                type="button"
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px', flexShrink: 0 }}>
        <Link to="/cart" style={{ position: 'relative', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingBag size={isMobile ? 22 : 22} strokeWidth={2.5} />
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
                  fontSize: '9px',
                  fontWeight: 900,
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '10px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(255, 59, 48, 0.3)',
                  pointerEvents: 'none'
                }}
              >
                {itemCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {!user ? (
          <Link to="/auth" style={{
            height: isMobile ? '34px' : '40px',
            padding: isMobile ? '0 14px' : '0 20px',
            background: 'white',
            color: 'black',
            borderRadius: '20px',
            fontSize: isMobile ? '10px' : '12px',
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
            <User size={isMobile ? 22 : 22} strokeWidth={2.5} />
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default Navbar;


