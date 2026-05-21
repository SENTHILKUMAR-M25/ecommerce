import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../../redux/slices/authSlice';
import { useToast } from '../../components/common/ToastContext';
import { User, MapPin, Key, Save, Plus, Trash2, Shield, Phone, Mail, Award, CheckCircle } from 'lucide-react';
import API from '../../services/api';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user, loading } = useSelector((state) => state.auth);

  // Profile forms states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phno, setPhno] = useState(user?.phno || '');

  // Password forms states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Address forms states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('United States');
  const [zipCode, setZipCode] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast('Name and email are required fields.', 'error');
      return;
    }

    try {
      await dispatch(updateProfile({ name, email, phno })).unwrap();
      toast('Profile information updated successfully!', 'success');
    } catch (err) {
      toast(err || 'Failed to update profile.', 'error');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast('All password fields are required.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast('New password choices do not match.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      toast('New password must be at least 6 characters.', 'error');
      return;
    }

    try {
      setPwdLoading(true);
      const res = await API.put('/auth/password', {
        currentPassword,
        newPassword
      });
      toast(res.data.message || 'Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast(err || 'Failed to update password.', 'error');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zipCode) {
      toast('Please enter all address coordinates.', 'error');
      return;
    }

    const newAddr = { street, city, state, country, zipCode, isDefault: (user?.addresses ?? []).length === 0 };
    const updatedAddresses = [...(user?.addresses ?? []), newAddr];

    try {
      await dispatch(updateProfile({ addresses: updatedAddresses })).unwrap();
      toast('Address added to profile book!', 'success');
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
      setShowAddressForm(false);
    } catch (err) {
      toast(err || 'Failed to add address.', 'error');
    }
  };

  const handleRemoveAddress = async (index) => {
    const updatedAddresses = (user?.addresses ?? []).filter((_, i) => i !== index);
    try {
      await dispatch(updateProfile({ addresses: updatedAddresses })).unwrap();
      toast('Address removed from profile book.', 'info');
    } catch (err) {
      toast(err || 'Failed to remove address.', 'error');
    }
  };

  return (
    <div className="space-y-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl margin-auto">
      {/* 1. PROFILE HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 dark:border-white/5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 shadow-2xl flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
        {/* Decorative ambient blurs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl -z-10"></div>

        {/* Avatar */}
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 p-1 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-black text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
          <div className="absolute bottom-1 right-1 bg-cyan-400 text-slate-950 p-1.5 rounded-full shadow-lg" title="Verified Member">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-2 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 justify-center sm:justify-start">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{user?.name || 'AURA Member'}</h1>
            <span className="inline-block self-center sm:self-auto text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 rounded-full backdrop-blur-sm">
              {user?.role || 'Customer'} Tier
            </span>
          </div>
          <p className="text-slate-300 text-sm flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>{user?.email || 'user@example.com'}</span>
          </p>
          {user?.phno && (
            <p className="text-slate-400 text-xs flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              <span>{user.phno}</span>
            </p>
          )}
        </div>

        {/* Aura VIP Badge */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md flex items-center gap-3 shadow-inner">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold">Rewards Club</span>
            <span className="text-xs font-black text-white">AURA VIP Elite</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: forms for profile & passwords */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile form */}
          <form onSubmit={handleUpdateProfile} className="glass-panel p-8 rounded-3xl border border-white/10 shadow-xl space-y-6 hover:border-cyan-500/20 transition-all duration-300">
            <h2 className="font-bold text-lg flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <User className="w-5 h-5 text-cyan-500" />
              <span>Personal Credentials</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Full Name</span>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none shadow-sm"
                  />
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Email Address</span>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none shadow-sm"
                  />
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Phone Number</span>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={phno}
                    onChange={(e) => setPhno(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none shadow-sm"
                  />
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-xs hover:shadow-lg hover:shadow-cyan-500/20 active:scale-98 transition-all shadow disabled:opacity-55"
              >
                <Save className="w-4 h-4" />
                <span>Save Personal details</span>
              </button>
            </div>
          </form>

          {/* Password update form */}
          <form onSubmit={handlePasswordReset} className="glass-panel p-8 rounded-3xl border border-white/10 shadow-xl space-y-6 hover:border-indigo-500/20 transition-all duration-300">
            <h2 className="font-bold text-lg flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <Key className="w-5 h-5 text-indigo-500" />
              <span>Modify Password</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Current Password</span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-4 py-2.5 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">New Password</span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-4 py-2.5 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-455 tracking-wider">Confirm New Password</span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-4 py-2.5 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={pwdLoading}
                className="flex items-center space-x-2 px-8 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-indigo-500 dark:hover:bg-indigo-400 hover:text-white transition-all shadow disabled:opacity-55"
              >
                <Save className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: address managers */}
        <div className="space-y-8">
          {/* Coordinate booklet */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-xl space-y-6 hover:border-cyan-500/20 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="font-bold text-lg flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-cyan-500" />
                <span>Coordinate booklet</span>
              </h2>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs text-cyan-500 font-bold hover:text-cyan-400 flex items-center gap-1 bg-cyan-500/10 px-3 py-1.5 rounded-full transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New</span>
              </button>
            </div>

            {/* List saved profile addresses */}
            {(user?.addresses ?? []).length === 0 ? (
              <div className="py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
                No shipping addresses saved in coordinate booklet.
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {(user?.addresses ?? []).map((addr, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-white/10 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex justify-between gap-4 text-xs shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 dark:text-white">Address #{idx + 1}</p>
                        {addr.isDefault && (
                          <span className="text-[9px] bg-cyan-500/20 text-cyan-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                        {addr.street}, {addr.city}, <br />
                        {addr.state} - {addr.zipCode}, {addr.country}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveAddress(idx)}
                      className="p-2 rounded-full text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 self-start transition-all opacity-80 group-hover:opacity-100"
                      aria-label="Remove Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Inline add Address form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="border border-white/10 dark:border-slate-800 p-5 rounded-2xl space-y-4 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md animate-fadeIn shadow-inner">
                <h3 className="font-bold text-xs tracking-wider uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">Add shipping Coordinate</h3>
                
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Street Address</span>
                    <input
                      type="text"
                      required
                      placeholder="123 Luxury St"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/60 dark:bg-slate-900/60 px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">City</span>
                      <input
                        type="text"
                        required
                        placeholder="Seattle"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/60 dark:bg-slate-900/60 px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">State</span>
                      <input
                        type="text"
                        required
                        placeholder="WA"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/60 dark:bg-slate-900/60 px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Zip Code</span>
                      <input
                        type="text"
                        required
                        placeholder="98101"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/60 dark:bg-slate-900/60 px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Country</span>
                      <input
                        type="text"
                        required
                        placeholder="United States"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/60 dark:bg-slate-900/60 px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-5 py-2 border border-slate-200 dark:border-slate-700 rounded-full font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-full font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all shadow-md"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Account Tier Info */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-xl flex items-center gap-5 hover:border-indigo-500/20 transition-all duration-300">
            <div className="p-4 bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-500 rounded-2xl shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Aura Security Shield</h4>
              <p className="text-xs text-slate-450 mt-1">Role Authorization: <span className="font-black uppercase text-indigo-500 tracking-wider">{user?.role}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
