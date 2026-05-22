import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FolderTree, 
  ClipboardList, 
  Users, 
  FileText, 
  Home, 
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Ticket
} from 'lucide-react';
import { logoutUser } from '../redux/slices/authSlice';
import { useTheme } from '../context/ThemeContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { darkTheme, toggleTheme } = useTheme();

  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Products', path: '/admin/products', icon: <ShoppingBag className="w-5 h-5" /> },
    { name: 'Categories', path: '/admin/categories', icon: <FolderTree className="w-5 h-5" /> },
    { name: 'Orders', path: '/admin/orders', icon: <ClipboardList className="w-5 h-5" /> },
    { name: 'Offers', path: '/admin/offers', icon: <Ticket className="w-5 h-5" /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <Ticket className="w-5 h-5" /> },
    { name: 'Customers', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Audit Logs', path: '/admin/logs', icon: <FileText className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080a13] flex transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 glass-panel border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 fixed h-full z-30 backdrop-blur-md">
        <div className="flex items-center space-x-2 px-3 py-4 mb-6">
          <span className="text-2xl font-black tracking-wider gradient-text font-sans">AURA</span>
          <span className="text-[10px] uppercase tracking-widest bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded-full font-bold">Admin</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/10'
                    : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-cyan-500'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-150 dark:hover:bg-slate-800/40 hover:text-cyan-500 transition-all"
          >
            <Home className="w-5 h-5 text-indigo-500" />
            <span>Storefront</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="flex w-full items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-150 dark:hover:bg-slate-800/40 transition-all"
          >
            {darkTheme ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
            <span>{darkTheme ? 'Light Theme' : 'Dark Theme'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Overlay */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>

          <aside className="fixed top-0 bottom-0 left-0 w-64 glass-panel border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 z-50 flex flex-col">
            <div className="flex items-center justify-between px-3 py-4 mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-wider gradient-text font-sans">AURA</span>
                <span className="text-[10px] uppercase tracking-widest bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded-full font-bold">Admin</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-lg'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-cyan-500'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-150 dark:hover:bg-slate-800/40 hover:text-cyan-500 transition-all"
              >
                <Home className="w-5 h-5 text-indigo-500" />
                <span>Storefront</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Administrative Page View */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Top bar - Mobile header */}
        <header className="lg:hidden glass-panel border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 h-16 flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-600 dark:text-slate-300">
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-xl font-bold tracking-wider gradient-text font-sans">AURA</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {darkTheme ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        {/* Content Portal */}
        <main className="flex-grow p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
