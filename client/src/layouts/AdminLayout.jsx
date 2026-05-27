import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
  Ticket,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { logoutUser } from "../redux/slices/authSlice";
import { useTheme } from "../context/ThemeContext";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { darkTheme, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: <FolderTree className="w-5 h-5" />,
    },
    {
      name: "Sub Categories",
      path: "/admin/subcategories",
      icon: <FolderTree className="w-5 h-5" />,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      name: "Offers",
      path: "/admin/offers",
      icon: <Ticket className="w-5 h-5" />,
    },
    {
      name: "Coupons",
      path: "/admin/coupons",
      icon: <Ticket className="w-5 h-5" />,
    },
    {
      name: "Customers",
      path: "/admin/users",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "Audit Logs",
      path: "/admin/logs",
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-white flex overflow-hidden relative">
      {/* BACKGROUND GLOW */}
      <div className="fixed top-[-120px] left-[-120px] w-[320px] h-[320px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="fixed bottom-[-150px] right-[-120px] w-[320px] h-[320px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[300px] z-40 border-r border-white/10 bg-white/[0.04] backdrop-blur-2xl flex-col">
        {/* LOGO */}
        <div className="px-7 py-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
              <Sparkles className="w-7 h-7 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                SUMAIYA'99
              </h1>

              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold mt-1">
                Premium Admin
              </p>
            </div>
          </div>
        </div>

        

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 border ${
                  active
                    ? "bg-gradient-to-r from-cyan-500 to-indigo-600 border-cyan-400/30 text-white shadow-xl shadow-cyan-500/10"
                    : "border-transparent hover:bg-white/[0.05] text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`transition-all ${
                      active
                        ? "text-white"
                        : "text-slate-500 group-hover:text-cyan-400"
                    }`}
                  >
                    {item.icon}
                  </div>

                  <span className="font-semibold text-sm tracking-wide">
                    {item.name}
                  </span>
                </div>

                <ChevronRight
                  className={`w-4 h-4 transition-all ${
                    active
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 translate-x-1"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/[0.05] transition-all text-slate-400 hover:text-white"
          >
            <Home className="w-5 h-5 text-indigo-400" />
            <span className="font-medium">Storefront</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/[0.05] transition-all text-slate-400 hover:text-white"
          >
            {darkTheme ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-cyan-400" />
            )}

            <span className="font-medium">
              {darkTheme ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 transition-all"
          >
            <LogOut className="w-5 h-5" />

            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MOBILE SIDEBAR ================= */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* OVERLAY */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          {/* DRAWER */}
          <aside className="absolute left-0 top-0 h-full w-[300px] bg-[#0b1120] border-r border-white/10 backdrop-blur-2xl flex flex-col">
            {/* TOP */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                  SUMAIYA'99
                </h1>

                <p className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-bold mt-1">
                  Admin Panel
                </p>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {/* USER */}
            <div className="px-5 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center font-black uppercase">
                  {user?.name?.charAt(0)}
                </div>

                <div>
                  <p className="font-bold">{user?.name}</p>
                  <p className="text-xs text-slate-400">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* MENU */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {navItems.map((item) => {
                const active = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      active
                        ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white"
                        : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    {item.icon}

                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* FOOTER */}
            <div className="p-4 border-t border-white/10 space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/[0.05] text-slate-400 hover:text-white transition-all"
              >
                {darkTheme ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-cyan-400" />
                )}

                <span>{darkTheme ? "Light Mode" : "Dark Mode"}</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white transition-all"
              >
                <LogOut className="w-5 h-5" />

                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 lg:ml-[300px] min-h-screen flex flex-col">
        {/* MOBILE TOPBAR */}
        <header className="lg:hidden sticky top-0 z-30 h-16 border-b border-white/10 bg-[#0b1120]/80 backdrop-blur-2xl flex items-center justify-between px-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                SUMAIYA'99
              </h1>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center"
          >
            {darkTheme ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-cyan-400" />
            )}
          </button>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 xl:p-12 bg-slate-200 dark:bg-slate-900 min-h-screen" >
          <div className="max-w-[1800px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;