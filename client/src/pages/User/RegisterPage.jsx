import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { registerUser, clearError } from '../../redux/slices/authSlice';
import { useToast } from '../../components/common/ToastContext';
import { User, Mail, Lock, ArrowRight, UserPlus, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  // Registration form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phno, setPhno] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { user, loading, error } = useSelector((state) => state.auth);

  // Parse redirect query parameter
  const redirectParam = new URLSearchParams(location.search).get('redirect');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      toast(`Registration successful! Welcome to AURA, ${user.name}!`, 'success');
      if (redirectParam) {
        navigate(`/${redirectParam}`);
      } else {
        navigate('/');
      }
    }
  }, [user, navigate, redirectParam, toast]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phno || !street || !city || !state || !zipCode || !password || !confirmPassword) {
      toast('Please fill out all registration fields.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      toast('Password and confirm password choices do not match.', 'error');
      return;
    }

    if (password.length < 6) {
      toast('Password must be at least 6 characters.', 'error');
      return;
    }

    const address = { street, city, state, zipCode, country };

    try {
      await dispatch(registerUser({ name, email, phno, address, password })).unwrap();
      navigate('/login');
    } catch (err) {
      toast(err || 'Registration failed. Email might already exist.', 'error');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center relative py-12 px-4">
      {/* Decorative neon blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl -z-10"></div>

      <div className="w-full max-w-xl space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="text-4xl font-extrabold tracking-wider gradient-text font-sans">
            AURA
          </Link>
          <h2 className="text-2xl font-bold tracking-tight mt-3">
            Create Premium Account
          </h2>
          <p className="text-sm text-slate-500">
            Register in seconds to secure members-only coupons and tracking books.
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 animate-fadeIn">
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name field */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-450">Full Name</span>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Alexander Stone"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-white/40 dark:bg-slate-900/40 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Email Address field */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-450">Email Address</span>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="alexander@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-white/40 dark:bg-slate-900/40 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Phone Number field */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-450">Phone Number</span>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="+1 (555) 123-4567"
                    value={phno}
                    onChange={(e) => setPhno(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-white/40 dark:bg-slate-900/40 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Street Address field */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-450">Street Address</span>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="123 Luxury Blvd"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-white/40 dark:bg-slate-900/40 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* City field */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-450">City</span>
                <input
                  type="text"
                  required
                  placeholder="Seattle"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-white/40 dark:bg-slate-900/40 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* State field */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-450">State / Province</span>
                <input
                  type="text"
                  required
                  placeholder="WA"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-white/40 dark:bg-slate-900/40 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Zip Code field */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-450">Zip / Postal Code</span>
                <input
                  type="text"
                  required
                  placeholder="98101"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-white/40 dark:bg-slate-900/40 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Country field */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-450">Country</span>
                <input
                  type="text"
                  required
                  placeholder="United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-white/40 dark:bg-slate-900/40 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-455">Choose Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-white/40 dark:bg-slate-900/40 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password field */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-455">Confirm Password</span>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-white/40 dark:bg-slate-900/40 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold hover:shadow-lg shadow-md active:scale-98 transition-all disabled:opacity-60 text-xs"
              >
                <UserPlus className="w-4.5 h-4.5" />
                <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer links */}
        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link
            to={`/login${redirectParam ? `?redirect=${redirectParam}` : ''}`}
            className="font-bold text-cyan-500 hover:text-cyan-400 inline-flex items-center gap-0.5"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
