import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Heart, Menu, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleCart, openCart } from '../../store/slices/cartSlice';
import { Button } from '../ui/button';
import { SearchBar } from '../search/SearchBar';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <motion.nav
        data-testid="navbar"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" data-testid="logo-link">
              <h1 className="font-heading text-3xl tracking-tighter text-primary">
                VEXOR
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/shop"
                data-testid="shop-link"
                className="text-sm uppercase tracking-widest font-semibold hover:text-accent transition-colors"
              >
                Shop
              </Link>
              <Link
                to="/shop?category=hoodies"
                className="text-sm uppercase tracking-widest font-semibold hover:text-accent transition-colors"
              >
                Hoodies
              </Link>
              <Link
                to="/shop?category=tshirts"
                className="text-sm uppercase tracking-widest font-semibold hover:text-accent transition-colors"
              >
                Tees
              </Link>
              <Link
                to="/shop?category=pants"
                className="text-sm uppercase tracking-widest font-semibold hover:text-accent transition-colors"
              >
                Bottoms
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                data-testid="search-button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:text-accent transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {isAuthenticated ? (
                <button
                  data-testid="profile-button"
                  onClick={() => navigate('/profile')}
                  className="p-2 hover:text-accent transition-colors"
                >
                  <User className="w-5 h-5" />
                </button>
              ) : (
                <Button
                  data-testid="login-button"
                  onClick={() => navigate('/auth')}
                  variant="ghost"
                  className="hidden md:inline-flex"
                >
                  Login
                </Button>
              )}

              <button
                data-testid="wishlist-button"
                className="p-2 hover:text-accent transition-colors hidden md:block"
              >
                <Heart className="w-5 h-5" />
              </button>

              <button
                data-testid="cart-button"
                onClick={() => dispatch(openCart())}
                className="relative p-2 hover:text-accent transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span
                    data-testid="cart-count"
                    className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                  >
                    {cartItemsCount}
                  </span>
                )}
              </button>

              <button
                data-testid="mobile-menu-button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            data-testid="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 bg-white z-40 shadow-lg md:hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-lg uppercase tracking-widest font-semibold hover:text-accent"
              >
                Shop All
              </Link>
              <Link
                to="/shop?category=hoodies"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-lg uppercase tracking-widest font-semibold hover:text-accent"
              >
                Hoodies
              </Link>
              <Link
                to="/shop?category=tshirts"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-lg uppercase tracking-widest font-semibold hover:text-accent"
              >
                Tees
              </Link>
              <Link
                to="/shop?category=pants"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-lg uppercase tracking-widest font-semibold hover:text-accent"
              >
                Bottoms
              </Link>
              {!isAuthenticated && (
                <Button
                  onClick={() => {
                    navigate('/auth');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Login
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};