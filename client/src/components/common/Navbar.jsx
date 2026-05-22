import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LogOut, 
  Grid, 
  Tag,
  LayoutDashboard,
  MapPin,
  History
} from 'lucide-react';
import { logoutUser } from '../../redux/slices/authSlice';
import { setFilters, fetchProducts } from '../../redux/slices/productSlice';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { darkTheme, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters({ keyword: searchVal }));
    
    // Redirect to listings if not there
    if (location.pathname !== '/products') {
      navigate('/products');
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setDropdownOpen(false);
    navigate('/login');
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setDropdownOpen(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 dark:border-white/5 bg-white/70 dark:bg-slate-950/75 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-extrabold tracking-wider gradient-text font-sans">
              AURA
            </Link>
          </div>

          {/* Search bar (desktop) */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex flex-1 max-w-md mx-8 relative"
          >
            <input
              type="text"
              placeholder="Search premium products..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
            />
            <Search className="absolute left-3.5 top-2.5 w-5 h-5 text-slate-400" />
          </form>

          {/* Nav Actions (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/products" 
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
            >
              Shop
            </Link>
            <Link 
              to="/offers" 
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Offers</span>
            </Link>

            {/* Dark Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-950/50 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Toggle theme"
            >
              {darkTheme ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(!dropdownOpen);
                    }}
                    className="flex items-center space-x-2 p-1 rounded-full border border-slate-200 dark:border-slate-800 hover:border-cyan-500 transition-all focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                      {user.name[0]}
                    </div>
                  </button>

                  {/* Dropdown Box */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-2xl glass-panel border border-white/10 bg-white dark:bg-slate-900/90 shadow-2xl p-2 z-50 text-slate-700 dark:text-slate-200">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      {/* Admin panel link */}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 mt-1 text-sm rounded-xl hover:bg-cyan-50 dark:hover:bg-slate-800/50 hover:text-cyan-600 transition-all"
                        >
                          <LayoutDashboard className="w-4 h-4 text-cyan-500" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 mt-0.5 text-sm rounded-xl hover:bg-cyan-50 dark:hover:bg-slate-800/50 hover:text-cyan-600 transition-all"
                      >
                        <User className="w-4 h-4 text-indigo-500" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 mt-0.5 text-sm rounded-xl hover:bg-cyan-50 dark:hover:bg-slate-800/50 hover:text-cyan-600 transition-all"
                      >
                        <History className="w-4 h-4 text-emerald-500" />
                        <span>Order History</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center space-x-2 px-4 py-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-sm text-rose-500 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-sm hover:bg-cyan-500 dark:hover:bg-cyan-400 hover:text-white transition-all shadow-md"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>

          {/* Hamburger Mobile Toggle */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-1 rounded-full text-slate-600 dark:text-slate-300"
            >
              {darkTheme ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 rounded-md text-slate-600 dark:text-slate-300"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 dark:border-white/5 bg-white dark:bg-slate-950 shadow-xl px-4 pt-2 pb-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search premium products..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm"
            />
            <Search className="absolute left-3.5 top-2.5 w-5 h-5 text-slate-400" />
          </form>

          <div className="flex flex-col space-y-2.5 pt-2">
            <Link
              to="/products"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-cyan-50 dark:hover:bg-slate-900"
            >
              Shop Products
            </Link>

            <Link
              to="/offers"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-cyan-50 dark:hover:bg-slate-900 flex items-center gap-2"
            >
              <Tag className="w-4 h-4 text-cyan-500" />
              <span>Special Offers</span>
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-cyan-50 dark:hover:bg-slate-900 flex justify-between items-center"
            >
              <span>My Wishlist</span>
              {wishlistItems.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-cyan-50 dark:hover:bg-slate-900 flex justify-between items-center"
            >
              <span>My Shopping Cart</span>
              {cartCount > 0 && (
                <span className="bg-cyan-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <div className="h-px bg-slate-150 dark:bg-slate-800 my-1"></div>
                
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 rounded-xl hover:bg-cyan-50 dark:hover:bg-slate-900 flex items-center space-x-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-cyan-50 dark:hover:bg-slate-900"
                >
                  My Profile
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-cyan-50 dark:hover:bg-slate-900"
                >
                  Order History
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 text-left text-sm font-medium text-rose-500 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="mx-4 mt-2 py-2 text-center text-sm font-semibold rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
