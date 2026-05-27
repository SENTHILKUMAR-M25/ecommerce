import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProfile } from '../../redux/slices/authSlice';
import { useToast } from '../../components/common/ToastContext';
import {
  User,
  MapPin,
  Key,
  Save,
  Plus,
  Trash2,
  Shield,
  Phone,
  Mail,
  Award,
  CheckCircle,
  Star,
  Crown,
  Sparkles,
  ChevronRight,
  LockKeyhole,
  Home,
  Globe,
  BadgeCheck,
} from 'lucide-react';
import API from '../../services/api';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user, loading } = useSelector((state) => state.auth);

  /* ================= PROFILE ================= */
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phno, setPhno] = useState(user?.phno || '');

  /* ================= PASSWORD ================= */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  /* ================= ADDRESS ================= */
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [zipCode, setZipCode] = useState('');

  /* ================= REVIEWS ================= */
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        setReviewLoading(true);
        const res = await API.get('/reviews/user/my');
        setReviews(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setReviewLoading(false);
      }
    };

    fetchMyReviews();
  }, []);

  /* ================= DELETE REVIEW ================= */
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review permanently?')) return;

    try {
      await API.delete(`/reviews/delete/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      toast('Review removed successfully.', 'info');
    } catch (err) {
      toast(err || 'Failed to remove review.', 'error');
    }
  };

  /* ================= UPDATE PROFILE ================= */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      await dispatch(updateProfile({ name, email, phno })).unwrap();
      toast('Profile updated successfully!', 'success');
    } catch (err) {
      toast(err || 'Failed to update profile.', 'error');
    }
  };

  /* ================= PASSWORD RESET ================= */
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast('Passwords do not match.', 'error');
      return;
    }

    try {
      setPwdLoading(true);

      const res = await API.put('/auth/password', {
        currentPassword,
        newPassword,
      });

      toast(res.data.message || 'Password updated!', 'success');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast(err || 'Failed to update password.', 'error');
    } finally {
      setPwdLoading(false);
    }
  };

  /* ================= ADD ADDRESS ================= */
  const handleAddAddress = async (e) => {
    e.preventDefault();

    const newAddr = {
      street,
      city,
      state,
      country,
      zipCode,
      isDefault: (user?.addresses ?? []).length === 0,
    };

    const updatedAddresses = [...(user?.addresses ?? []), newAddr];

    try {
      await dispatch(
        updateProfile({
          addresses: updatedAddresses,
        })
      ).unwrap();

      toast('Address added successfully!', 'success');

      setStreet('');
      setCity('');
      setState('');
      setCountry('India');
      setZipCode('');
      setShowAddressForm(false);
    } catch (err) {
      toast(err || 'Failed to add address.', 'error');
    }
  };

  /* ================= REMOVE ADDRESS ================= */
  const handleRemoveAddress = async (index) => {
    const updatedAddresses = (user?.addresses ?? []).filter(
      (_, i) => i !== index
    );

    try {
      await dispatch(
        updateProfile({
          addresses: updatedAddresses,
        })
      ).unwrap();

      toast('Address removed.', 'info');
    } catch (err) {
      toast(err || 'Failed to remove address.', 'error');
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.8rem] border border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-8 sm:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
        >
          {/* Glow */}
          <div className="absolute -top-24 -right-20 w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col xl:flex-row gap-10 items-center xl:items-start">

            {/* Avatar */}
            <div className="relative">
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-500 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-5xl font-black text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              </div>

              <div className="absolute bottom-2 right-2 bg-emerald-400 text-slate-900 p-2 rounded-full shadow-xl">
                <BadgeCheck className="w-5 h-5" />
              </div>
            </div>

            {/* User details */}
            <div className="flex-1 text-center xl:text-left space-y-5">

              <div className="space-y-3">
                <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    {user?.name || 'Aura Member'}
                  </h1>

                  <div className="inline-flex items-center gap-2 self-center xl:self-auto px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/20 backdrop-blur-xl">
                    <Crown className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-cyan-300">
                      {user?.role || 'Customer'} Tier
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 flex items-center justify-center xl:justify-start gap-2 text-sm">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  {user?.email}
                </p>

                {user?.phno && (
                  <p className="text-slate-400 flex items-center justify-center xl:justify-start gap-2 text-sm">
                    <Phone className="w-4 h-4 text-indigo-400" />
                    {user?.phno}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">

                {[
                  {
                    label: 'Reviews',
                    value: reviews.length,
                    icon: Star,
                    color: 'text-amber-400',
                  },
                  {
                    label: 'Addresses',
                    value: user?.addresses?.length || 0,
                    icon: MapPin,
                    color: 'text-cyan-400',
                  },
                  {
                    label: 'Security',
                    value: 'Active',
                    icon: Shield,
                    color: 'text-emerald-400',
                  },
                  
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4"
                  >
                    <div className="flex items-center justify-between">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <Sparkles className="w-4 h-4 text-white/20" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      {item.value}
                    </h3>

                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-1">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ================================================= */}
        {/* MAIN GRID */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="xl:col-span-2 space-y-8">

            {/* ========================================== */}
            {/* REVIEWS */}
            {/* ========================================== */}

            <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
              
              <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    My Reviews
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Manage your shared product experiences
                  </p>
                </div>

                <div className="px-4 py-2 rounded-full bg-amber-500/10 text-amber-500 text-xs font-black uppercase tracking-widest">
                  {reviews.length} Reviews
                </div>
              </div>

              {reviewLoading ? (
                <div className="py-24 flex justify-center">
                  <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-24 text-center space-y-5">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                    <Star className="w-9 h-9 text-slate-300" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                      No Reviews Yet
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      Share your experience after purchasing products.
                    </p>
                  </div>

                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-6 py-3 rounded-full font-bold text-sm"
                  >
                    Browse Products
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {reviews.map((rev) => (
                    <motion.div
                      key={rev._id}
                      whileHover={{ y: -4 }}
                      className="rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-1">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300 dark:text-slate-700'
                                }`}
                              />
                            ))}
                        </div>

                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <Link to={`/product/${rev.product?.slug}`}>
                        <h3 className="font-black text-cyan-500 text-sm truncate">
                          {rev.product?.name}
                        </h3>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 italic leading-relaxed">
                          "{rev.comment}"
                        </p>
                      </Link>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-400 font-semibold">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>

                        <Link
                          to={`/product/${rev.product?.slug}`}
                          className="text-xs font-bold text-cyan-500 hover:underline"
                        >
                          View Product
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* ========================================== */}
            {/* PROFILE FORM */}
            {/* ========================================== */}

            <form
              onSubmit={handleUpdateProfile}
              className="rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-xl p-8 space-y-8"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-5">
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
                  <User className="w-5 h-5" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Personal Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Update your account details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <InputField
                  icon={User}
                  label="Full Name"
                  value={name}
                  onChange={setName}
                  placeholder="John Doe"
                />

                <InputField
                  icon={Mail}
                  label="Email Address"
                  value={email}
                  onChange={setEmail}
                  placeholder="john@example.com"
                  type="email"
                />

                <InputField
                  icon={Phone}
                  label="Phone Number"
                  value={phno}
                  onChange={setPhno}
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-[1.02] transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>

            {/* ========================================== */}
            {/* PASSWORD */}
            {/* ========================================== */}

            <form
              onSubmit={handlePasswordReset}
              className="rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-xl p-8 space-y-8"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-5">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                  <LockKeyhole className="w-5 h-5" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Password & Security
                  </h2>

                  <p className="text-sm text-slate-500">
                    Protect your account with a strong password
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <PasswordField
                  label="Current Password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                />

                <PasswordField
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                />

                <PasswordField
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-full font-bold text-sm"
                >
                  <Key className="w-4 h-4" />
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT */}
          <div className="space-y-8">

            {/* ========================================== */}
            {/* ADDRESSES */}
            {/* ========================================== */}

            <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">

              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                    <MapPin className="w-5 h-5 text-cyan-500" />
                    Saved Addresses
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Manage delivery locations
                  </p>
                </div>

                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-500 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="p-6 space-y-5">

                {(user?.addresses ?? []).length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl py-16 text-center">
                    <Home className="w-10 h-10 text-slate-300 mx-auto mb-4" />

                    <h3 className="font-bold text-slate-800 dark:text-white">
                      No Addresses Added
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      Add a delivery address for faster checkout.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(user?.addresses ?? []).map((addr, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -3 }}
                        className="rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-5"
                      >
                        <div className="flex items-start justify-between gap-4">

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-slate-900 dark:text-white">
                                Address #{idx + 1}
                              </h3>

                              {addr.isDefault && (
                                <span className="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-[10px] font-black uppercase tracking-wider">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-slate-500 leading-relaxed">
                              {addr.street}, {addr.city}, {addr.state} -{' '}
                              {addr.zipCode}, {addr.country}
                            </p>
                          </div>

                          <button
                            onClick={() => handleRemoveAddress(idx)}
                            className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Add address form */}
                <AnimatePresence>
                  {showAddressForm && (
                    <motion.form
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleAddAddress}
                      className="rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-5 space-y-5"
                    >
                      <div className="grid grid-cols-1 gap-4">

                        <InputSimple
                          icon={Home}
                          value={street}
                          onChange={setStreet}
                          placeholder="Street Address"
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <InputSimple
                            value={city}
                            onChange={setCity}
                            placeholder="City"
                          />

                          <InputSimple
                            value={state}
                            onChange={setState}
                            placeholder="State"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <InputSimple
                            value={zipCode}
                            onChange={setZipCode}
                            placeholder="Zip Code"
                          />

                          <InputSimple
                            icon={Globe}
                            value={country}
                            onChange={setCountry}
                            placeholder="Country"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="px-5 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-bold"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-sm font-bold"
                        >
                          Save Address
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================= */
/* INPUT FIELD */
/* ================================================= */

const InputField = ({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}) => (
  <div className="space-y-2">
    <label className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-400">
      {label}
    </label>

    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
      />

      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    </div>
  </div>
);

const PasswordField = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-400">
      {label}
    </label>

    <input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="••••••••"
      className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
    />
  </div>
);

const InputSimple = ({
  value,
  onChange,
  placeholder,
  icon: Icon,
}) => (
  <div className="relative">
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-11 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
    />

    {Icon && (
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    )}
  </div>
);

export default ProfilePage;