import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, clearError } from '../../redux/slices/authSlice';
import { useToast } from '../../components/common/ToastContext';
import { Mail, Lock, LogIn, ArrowRight, UserCheck, ShieldAlert, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { user, loading, error } = useSelector((state) => state.auth);

  // Parse redirect query parameter (e.g. login?redirect=checkout)
  const redirectParam = new URLSearchParams(location.search).get('redirect');

  useEffect(() => {
    // Clear auth errors on mount
    dispatch(clearError());

    // Check for expired session from URL query
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired') === 'true') {
      toast('Your session has expired. Please login again.', 'info');
    }
  }, [dispatch, location.search, toast]);

  useEffect(() => {
    if (user) {
      toast(`Welcome back, ${user.name}!`, 'success');
      if (redirectParam) {
        navigate(`/${redirectParam}`);
      } else {
        navigate(user.role === 'admin' ? '/admin' : '/');
      }
    }
  }, [user, navigate, redirectParam, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please enter both email and password.', 'error');
      return;
    }

    try {
      await dispatch(loginUser({ email, password })).unwrap();
    } catch (err) {
      toast(err || 'Invalid login credentials.', 'error');
    }
  };

  const handleQuickLogin = (demoRole) => {
    if (demoRole === 'user') {
      setEmail('user@ecommerce.com');
      setPassword('user123');
      toast('Loaded Customer Demo Account credentials', 'info');
    } else {
      setEmail('admin@ecommerce.com');
      setPassword('admin123');
      toast('Loaded Admin Demo Account credentials', 'info');
    }
  };

  // return (
  //   <div className="min-h-[80vh] flex flex-col justify-center items-center relative py-12">
  //     {/* Decorative neon blurs */}
  //     <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl -z-10"></div>
  //     <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl -z-10"></div>

  //     <div className="w-full max-w-md space-y-8">
  //       {/* Brand header */}
  //       <div className="text-center space-y-2">
  //         <Link to="/" className="text-4xl font-extrabold tracking-wider gradient-text font-sans">
  //           AURA
  //         </Link>
  //         <h2 className="text-2xl font-bold tracking-tight mt-3">Welcome to AURA</h2>
  //         <p className="text-sm text-slate-500">Sign in to unlock personalized premium shopping features.</p>
  //       </div>

  //       {/* Card Form */}
  //       <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
  //         <form onSubmit={handleSubmit} className="space-y-4">
  //           {/* Email field */}
  //           <div className="space-y-1">
  //             <span className="text-[10px] uppercase font-bold text-slate-450">Email Address</span>
  //             <div className="relative">
  //               <input
  //                 type="email"
  //                 required
  //                 placeholder="user@ecommerce.com"
  //                 value={email}
  //                 onChange={(e) => setEmail(e.target.value)}
  //                 className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-white/40 dark:bg-slate-900/40 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
  //               />
  //               <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
  //             </div>
  //           </div>

  //           {/* Password field */}
  //           <div className="space-y-1">
  //             <span className="text-[10px] uppercase font-bold text-slate-455">Password</span>
  //             <div className="relative">
  //               <input
  //                 type={showPassword ? "text" : "password"}
  //                 required
  //                 placeholder="••••••••"
  //                 value={password}
  //                 onChange={(e) => setPassword(e.target.value)}
  //                 className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-202 dark:border-slate-805 bg-white/40 dark:bg-slate-900/40 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
  //               />
  //               <Lock className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
  //               <button
  //                 type="button"
  //                 onClick={() => setShowPassword(!showPassword)}
  //                 className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
  //               >
  //                 {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
  //               </button>
  //             </div>
  //           </div>

  //           {/* Submit button */}
  //           <button
  //             type="submit"
  //             disabled={loading}
  //             className="w-full flex items-center justify-center space-x-2 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold hover:shadow-lg shadow-md active:scale-98 transition-all disabled:opacity-60 pt-3"
  //           >
  //             <LogIn className="w-4.5 h-4.5" />
  //             <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
  //           </button>
  //         </form>

  //         {/* Quick Demo Acc panel */}
  //         <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 space-y-3">
  //           <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 text-center">Fast Demo Access</p>
  //           <div className="flex gap-3">
  //             <button
  //               type="button"
  //               onClick={() => handleQuickLogin('user')}
  //               className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl text-xs font-bold transition-all"
  //             >
  //               <UserCheck className="w-3.5 h-3.5" />
  //               <span>Customer</span>
  //             </button>
              
  //             <button
  //               type="button"
  //               onClick={() => handleQuickLogin('admin')}
  //               className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all"
  //             >
  //               <ShieldAlert className="w-3.5 h-3.5" />
  //               <span>Admin Panel</span>
  //             </button>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Footer links */}
  //       <p className="text-center text-xs text-slate-500">
  //         Don't have an account?{' '}
  //         <Link
  //           to={`/register${redirectParam ? `?redirect=${redirectParam}` : ''}`}
  //           className="font-bold text-cyan-500 hover:text-cyan-400 flex inline-flex items-center gap-0.5"
  //         >
  //           <span>Register Now</span>
  //           <ArrowRight className="w-3 h-3" />
  //         </Link>
  //       </p>
  //     </div>
  //   </div>
  // );
  return (
  <div className="relative min-h-screen overflow-hidden  flex items-center justify-center px-4 ">

    {/* Background */}
    <div className="absolute inset-0 overflow-hidden">

    </div>

    <div className="relative z-10    rounded-4xl overflow-hidden border border-white/10  backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)]">

      {/* LEFT SIDE 
     */}

      {/* RIGHT SIDE LOGIN */}
      <div className="relative p-6 sm:p-10 lg:p-14 flex items-center">

        <div className="w-full max-w-md mx-auto space-y-8">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link
              to="/"
              className="text-4xl font-black tracking-[0.25em] text-white"
            >
              AURA
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-white tracking-tight">
              Welcome Back
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed">
              Login to continue your premium shopping experience.
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-slate-400">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                <input
                  type="email"
                  required
                  placeholder="user@ecommerce.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-black dark:text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-slate-400">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-14 text-black dark:text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="group relative w-full h-14 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

              <span className="relative flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" />
                {loading ? 'Authenticating...' : 'Sign In'}
              </span>
            </button>
          </div>

        
          {/* Register */}
          <div className="text-center pt-2">
            <p className="text-sm text-slate-400">
              Don’t have an account?
            </p>

            <Link
              to={`/register${redirectParam ? `?redirect=${redirectParam}` : ''}`}
              className="inline-flex items-center gap-1 mt-2 font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  </div>
);

};

export default LoginPage;
