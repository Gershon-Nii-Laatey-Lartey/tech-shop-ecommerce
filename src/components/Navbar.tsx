import { useState } from 'react';
import { ShoppingBag, Search, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import SearchModal from './SearchModal';

const Navbar = () => {
  const { count } = useCart();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <div className="floating-header" style={{ height: '60px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Link to="/" style={{ fontSize: '26px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.04em' }}>
          <div style={{ position: 'relative', width: '32px', height: '32px' }}>
            <div style={{ position: 'absolute', width: '16px', height: '16px', background: 'white', borderRadius: '50% 50% 0 50%' }}></div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '16px', height: '16px', background: 'white', borderRadius: '50% 0 50% 50%', opacity: 0.6 }}></div>
            <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', border: '2px solid var(--primary-color)' }}></div>
          </div>
          people
        </Link>

        <div style={{ display: 'flex', gap: '32px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginLeft: 'auto', marginRight: '48px' }} className="desktop-only">
          <Link to="/" style={{ transition: 'all 0.2s' }}>Home</Link>
          <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
            Products <span className="badge" style={{ fontSize: '8px', padding: '3px 7px', borderRadius: '8px', background: '#ff4444' }}>New</span>
          </Link>
          {user && (
            <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <Package size={14} /> Orders
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" style={{ color: '#4ade80', transition: 'all 0.2s' }}>Dashboard</Link>
          )}
          <Link to="/" style={{ opacity: 0.6, transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}>Support</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <Search size={18} />
          </button>

          <Link to="/cart">
            <button style={{
              background: 'white',
              color: 'black',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              position: 'relative',
              border: 'none',
              cursor: 'pointer'
            }}>
              <ShoppingBag size={20} />
              {count > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#ff4444',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 900,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white'
                }}>
                  {count}
                </div>
              )}
            </button>
          </Link>

          {user ? (
            <div
              onClick={() => navigate('/profile')}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
            >
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" />
            </div>
          ) : (
            <Link to="/auth" style={{
              height: '44px',
              padding: '0 24px',
              background: 'white',
              color: 'black',
              borderRadius: '22px',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none'
            }}>
              LOGIN
            </Link>
          )}
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
