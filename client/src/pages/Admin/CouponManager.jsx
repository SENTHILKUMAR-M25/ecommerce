import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAdminCoupons,
  addAdminCoupon,
  toggleCouponActiveState,
  deleteAdminCoupon
} from '../../redux/slices/adminSlice';
import { useToast } from '../../components/common/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Plus, Edit2, Trash2, X, Ticket, ToggleLeft, ToggleRight, Calendar, Info, ShieldCheck, CheckCircle, Clock3 } from 'lucide-react';
import API from '../../services/api';

const CouponManager = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { coupons, loading, actionLoading } = useSelector((state) => state.admin);

  const [showModal, setShowModal] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [minPurchase, setMinPurchase] = useState('0');
  const [usageLimitPerUser, setUsageLimitPerUser] = useState('1');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    dispatch(fetchAdminCoupons());
  }, [dispatch]);

  const resetForm = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setExpiryDate('');
    setMinPurchase('0');
    setUsageLimitPerUser('1');
    setIsActive(true);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !discountValue || !expiryDate) {
      toast('Please enter code, value, and expiry date fields.', 'error');
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      expiryDate: new Date(expiryDate),
      minPurchase: Number(minPurchase) || 0,
      usageLimitPerUser: Number(usageLimitPerUser) || 1,
      isActive
    };

    try {
      await dispatch(addAdminCoupon(payload)).unwrap();
      toast('New coupon created successfully!', 'success');
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast(err || 'Failed to save coupon details.', 'error');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await dispatch(toggleCouponActiveState(id)).unwrap();
      toast('Coupon active status updated!', 'success');
    } catch (err) {
      toast(err || 'Failed to toggle status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }

    try {
      await dispatch(deleteAdminCoupon(id)).unwrap();
      toast('Coupon removed from system index.', 'info');
    } catch (err) {
      toast(err || 'Failed to delete coupon.', 'error');
    }
  };

  // Simple statistics
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.isActive && new Date(c.expiryDate) > new Date()).length;
  const expiredCoupons = coupons.filter(c => new Date(c.expiryDate) <= new Date()).length;

  return (
    // <div className="space-y-6 pb-16">
    //   {/* Header controls */}
    //   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    //     <div>
    //       <h1 className="text-3xl font-extrabold tracking-tight">Coupon Manager</h1>
    //       <p className="text-sm text-slate-500 mt-1">Configure user promotion discounts, active status boundaries, and referral campaigns.</p>
    //     </div>

    //     <button
    //       onClick={handleOpenAddModal}
    //       className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-sm shadow-md hover:shadow-cyan-500/10 transition-all active:scale-95 self-stretch sm:self-auto"
    //     >
    //       <Plus className="w-4 h-4" />
    //       <span>Create Coupon</span>
    //     </button>
    //   </div>

    //   {/* Stats Cards Row */}
    //   <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
    //     <div className="glass-panel border border-white/10 rounded-2xl p-5 shadow-sm space-y-2">
    //       <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Coupons</span>
    //       <p className="text-3xl font-black">{totalCoupons}</p>
    //     </div>
    //     <div className="glass-panel border border-white/10 rounded-2xl p-5 shadow-sm space-y-2">
    //       <span className="text-xs text-slate-450 font-bold uppercase tracking-wider text-emerald-500">Active & Valid</span>
    //       <p className="text-3xl font-black text-emerald-500">{activeCoupons}</p>
    //     </div>
    //     <div className="glass-panel border border-white/10 rounded-2xl p-5 shadow-sm space-y-2">
    //       <span className="text-xs text-slate-450 font-bold uppercase tracking-wider text-rose-500">Expired</span>
    //       <p className="text-3xl font-black text-rose-500">{expiredCoupons}</p>
    //     </div>
    //   </div>

    //   {/* Main List */}
    //   {loading ? (
    //     <LoadingSpinner />
    //   ) : coupons.length === 0 ? (
    //     <div className="py-12 glass-panel border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] text-center text-slate-400 text-sm">
    //       No coupons exist. Click "Create Coupon" to initialize discounts.
    //     </div>
    //   ) : (
    //     <div className="glass-panel border border-white/10 rounded-[2rem] overflow-hidden shadow-lg p-0 sm:p-6 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md">
    //       <div className="overflow-x-auto">
    //         <table className="w-full text-left text-xs border-collapse">
    //           <thead className="hidden sm:table-header-group">
    //             <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
    //               <th className="py-4 px-4">Code</th>
    //               <th className="py-4 px-4">Discount</th>
    //               <th className="py-4 px-4">Min Purchase</th>
    //               <th className="py-4 px-4">Expiry Date</th>
    //               <th className="py-4 px-4">Status</th>
    //               <th className="py-4 px-4 text-center">Actions</th>
    //             </tr>
    //           </thead>
    //           <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 block sm:table-row-group">
    //             {coupons.map((c) => {
    //               const isExpired = new Date(c.expiryDate) <= new Date();
    //               return (
    //                 <tr key={c._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/30 transition-colors block sm:table-row p-4 sm:p-0">
    //                   {/* Code */}
    //                   <td className="py-1 sm:py-4 px-0 sm:px-4 block sm:table-cell mb-2 sm:mb-0">
    //                     <div className="flex items-center justify-between sm:justify-start space-x-2">
    //                       <div className="flex items-center space-x-2">
    //                         <Ticket className="w-4 h-4 text-cyan-500" />
    //                         <span className="font-black text-slate-800 dark:text-white text-sm tracking-wide uppercase">{c.code}</span>
    //                       </div>
    //                       <span className="sm:hidden text-[9px] text-slate-400 border border-slate-200 dark:border-slate-800 px-2 rounded-lg font-bold">ID: {c._id.slice(-6).toUpperCase()}</span>
    //                     </div>
    //                   </td>

    //                   {/* Discount */}
    //                   <td className="py-1 sm:py-4 px-0 sm:px-4 block sm:table-cell mb-2 sm:mb-0">
    //                     <div className="flex items-center justify-between sm:block">
    //                       <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">Discount</span>
    //                       {c.discountType === 'percentage' ? (
    //                         <span className="bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">{c.discountValue}% Off</span>
    //                       ) : (
    //                         <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">₹{c.discountValue} Off</span>
    //                       )}
    //                     </div>
    //                   </td>

    //                   {/* Min Purchase */}
    //                   <td className="py-1 sm:py-4 px-0 sm:px-4 block sm:table-cell mb-2 sm:mb-0">
    //                     <div className="flex items-center justify-between sm:block">
    //                       <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">Min Order</span>
    //                       <span className="font-bold text-slate-600 dark:text-slate-300">₹{c.minPurchase}</span>
    //                     </div>
    //                   </td>

    //                   {/* Expiry */}
    //                   <td className="py-1 sm:py-4 px-0 sm:px-4 block sm:table-cell mb-2 sm:mb-0">
    //                     <div className="flex items-center justify-between sm:block">
    //                       <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">Expires On</span>
    //                       <div className="flex items-center space-x-1.5 text-slate-500 text-[10px] font-bold">
    //                         <Calendar className="w-3.5 h-3.5 text-indigo-500" />
    //                         <span>{new Date(c.expiryDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
    //                       </div>
    //                     </div>
    //                   </td>

    //                   {/* Status */}
    //                   <td className="py-1 sm:py-4 px-0 sm:px-4 block sm:table-cell mb-3 sm:mb-0">
    //                     <div className="flex items-center justify-between sm:block">
    //                       <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">Status</span>
    //                       {isExpired ? (
    //                         <span className="text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full font-black text-[9px] uppercase tracking-widest border border-rose-500/20">Expired</span>
    //                       ) : c.isActive ? (
    //                         <span className="text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full font-black text-[9px] uppercase tracking-widest border border-emerald-500/20">Active</span>
    //                       ) : (
    //                         <span className="text-slate-400 bg-slate-500/10 px-2.5 py-1 rounded-full font-black text-[9px] uppercase tracking-widest border border-slate-500/20">Inactive</span>
    //                       )}
    //                     </div>
    //                   </td>

    //                   {/* Actions */}
    //                   <td className="py-2 sm:py-4 px-0 sm:px-4 block sm:table-cell border-t sm:border-0 border-slate-100 dark:border-slate-800 mt-2 sm:mt-0 pt-3 sm:pt-0">
    //                     <div className="flex justify-end sm:justify-center items-center gap-2">
    //                       <button
    //                         onClick={() => handleToggleActive(c._id)}
    //                         className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-2 sm:p-1.5 rounded-xl sm:rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition-all font-bold text-[10px] uppercase"
    //                         title={c.isActive ? 'Deactivate' : 'Activate'}
    //                       >
    //                         {c.isActive ? <ToggleRight className="w-5 h-5 text-cyan-500" /> : <ToggleLeft className="w-5 h-5" />}
    //                         <span className="sm:hidden">{c.isActive ? 'Deactivate' : 'Activate'}</span>
    //                       </button>
    //                       <button
    //                         onClick={() => handleDelete(c._id)}
    //                         className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-2 sm:p-1.5 rounded-xl sm:rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-all font-bold text-[10px] uppercase"
    //                         title="Delete"
    //                       >
    //                         <Trash2 className="w-4 h-4" />
    //                         <span className="sm:hidden">Delete</span>
    //                       </button>
    //                     </div>
    //                   </td>
    //                 </tr>
    //               );
    //             })}
    //           </tbody>
    //         </table>
    //       </div>
    //     </div>
    //   )}

    //   {/* Create Modal */}
    //   {showModal && (
    //     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    //       <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>

    //       <div className="relative glass-panel bg-white dark:bg-slate-950 border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl z-50 animate-fadeIn space-y-6">
    //         <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-85 pb-4">
    //           <h2 className="text-xl font-extrabold flex items-center gap-2">
    //             <Ticket className="w-5 h-5 text-cyan-500" />
    //             <span>Create Discount Coupon</span>
    //           </h2>
    //           <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
    //             <X className="w-6 h-6" />
    //           </button>
    //         </div>

    //         <form onSubmit={handleSubmit} className="space-y-4 text-xs">
    //           <div className="space-y-3.5">
    //             {/* Coupon Code */}
    //             <div className="space-y-1">
    //               <span className="text-[10px] uppercase font-bold text-slate-450">Coupon Code *</span>
    //               <input
    //                 type="text"
    //                 required
    //                 placeholder="e.g. FLASH50, BDAY20"
    //                 value={code}
    //                 onChange={(e) => setCode(e.target.value)}
    //                 className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 uppercase font-bold focus:ring-1 focus:ring-cyan-500"
    //               />
    //             </div>

    //             <div className="grid grid-cols-2 gap-4">
    //               {/* Discount Type */}
    //               <div className="space-y-1">
    //                 <span className="text-[10px] uppercase font-bold text-slate-450">Discount Type</span>
    //                 <select
    //                   value={discountType}
    //                   onChange={(e) => setDiscountType(e.target.value)}
    //                   className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white dark:bg-slate-900 px-3 py-2 focus:ring-1 focus:ring-cyan-500"
    //                 >
    //                   <option value="percentage">Percentage (%)</option>
    //                   <option value="flat">Flat Price (₹)</option>
    //                 </select>
    //               </div>

    //               {/* Discount Value */}
    //               <div className="space-y-1">
    //                 <span className="text-[10px] uppercase font-bold text-slate-450">Discount Value *</span>
    //                 <input
    //                   type="number"
    //                   required
    //                   min="1"
    //                   placeholder={discountType === 'percentage' ? 'e.g. 20' : 'e.g. 150'}
    //                   value={discountValue}
    //                   onChange={(e) => setDiscountValue(e.target.value)}
    //                   className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
    //                 />
    //               </div>
    //             </div>

    //             <div className="grid grid-cols-2 gap-4">
    //               {/* Min purchase */}
    //               <div className="space-y-1">
    //                 <span className="text-[10px] uppercase font-bold text-slate-450">Min Purchase Required (₹)</span>
    //                 <input
    //                   type="number"
    //                   min="0"
    //                   value={minPurchase}
    //                   onChange={(e) => setMinPurchase(e.target.value)}
    //                   className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
    //                 />
    //               </div>

    //               {/* Usage limit per user */}
    //               <div className="space-y-1">
    //                 <span className="text-[10px] uppercase font-bold text-slate-450">Limit Per User</span>
    //                 <input
    //                   type="number"
    //                   min="1"
    //                   value={usageLimitPerUser}
    //                   onChange={(e) => setUsageLimitPerUser(e.target.value)}
    //                   className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
    //                 />
    //               </div>
    //             </div>

    //             {/* Expiry Date */}
    //             <div className="space-y-1">
    //               <span className="text-[10px] uppercase font-bold text-slate-450">Expiry Date & Time *</span>
    //               <input
    //                 type="datetime-local"
    //                 required
    //                 value={expiryDate}
    //                 onChange={(e) => setExpiryDate(e.target.value)}
    //                 className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500 [color-scheme:dark]"
    //               />
    //             </div>

    //             {/* Is Active Status checkbox */}
    //             <div className="flex items-center space-x-2 pt-2">
    //               <input
    //                 type="checkbox"
    //                 id="isActive"
    //                 checked={isActive}
    //                 onChange={(e) => setIsActive(e.target.checked)}
    //                 className="rounded text-cyan-500 focus:ring-cyan-500 h-4 w-4 bg-slate-900 border-white/10"
    //               />
    //               <label htmlFor="isActive" className="text-xs text-slate-400 font-bold select-none cursor-pointer">
    //                 Mark as active immediately
    //               </label>
    //             </div>
    //           </div>

    //           {/* Action Buttons */}
    //           <div className="flex justify-end gap-2.5 pt-2">
    //             <button
    //               type="button"
    //               onClick={() => setShowModal(false)}
    //               className="px-4.5 py-2 border rounded-full font-bold"
    //             >
    //               Cancel
    //             </button>

    //             <button
    //               type="submit"
    //               disabled={actionLoading}
    //               className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-55"
    //             >
    //               Create Coupon
    //             </button>
    //           </div>
    //         </form>
    //       </div>
    //     </div>
    //   )}
    // </div>


    <div className="relative space-y-8 pb-20">

      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 blur-3xl rounded-full"></div>
      </div>

      {/* ───────────────── HEADER ───────────────── */}
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">

        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shadow-xl shadow-cyan-500/20">
              <Ticket className="w-7 h-7 text-white" />
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                Coupon Manager
              </h1>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Manage promotions, referral rewards, seasonal discounts, and user campaign offers.
              </p>
            </div>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={handleOpenAddModal}
          className="group relative overflow-hidden flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 text-white font-bold shadow-[0_10px_30px_rgba(6,182,212,0.35)] hover:scale-[1.03] active:scale-95 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition"></div>

          <Plus className="relative w-5 h-5" />
          <span className="relative">Create Coupon</span>
        </button>
      </div>

      {/* ───────────────── STATS ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Total */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/60 dark:bg-slate-950/50 backdrop-blur-2xl p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>

          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[3px] text-slate-400 font-bold">
                Total Coupons
              </span>

              <h2 className="text-4xl font-black text-slate-900 dark:text-white">
                {totalCoupons}
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <Ticket className="w-7 h-7 text-cyan-500" />
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/60 dark:bg-slate-950/50 backdrop-blur-2xl p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>

          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[3px] text-emerald-500 font-bold">
                Active Coupons
              </span>

              <h2 className="text-4xl font-black text-emerald-500">
                {activeCoupons}
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Expired */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/60 dark:bg-slate-950/50 backdrop-blur-2xl p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full"></div>

          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[3px] text-rose-500 font-bold">
                Expired
              </span>

              <h2 className="text-4xl font-black text-rose-500">
                {expiredCoupons}
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
              <Clock3 className="w-7 h-7 text-rose-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────── TABLE ───────────────── */}
      {loading ? (
        <LoadingSpinner />
      ) : coupons.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 backdrop-blur-xl py-20 text-center">
          <div className="space-y-3">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900 mx-auto flex items-center justify-center">
              <Ticket className="w-10 h-10 text-slate-400" />
            </div>

            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
              No Coupons Found
            </h3>

            <p className="text-sm text-slate-400">
              Start by creating your first promotional coupon.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-[32px] border border-white/10 bg-white/60 dark:bg-slate-950/50 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">

          {/* Desktop Header */}
          <div className="hidden lg:grid grid-cols-6 gap-4 px-8 py-5 border-b border-slate-200/50 dark:border-slate-800/60 text-xs uppercase tracking-[2px] font-bold text-slate-400">
            <span>Coupon</span>
            <span>Discount</span>
            <span>Min Order</span>
            <span>Expiry</span>
            <span>Status</span>
            <span className="text-center">Actions</span>
          </div>

          {/* Coupon Rows */}
          <div className="divide-y divide-slate-200/50 dark:divide-slate-800/60">
            {coupons.map((c) => {
              const isExpired = new Date(c.expiryDate) <= new Date();

              return (
                <div
                  key={c._id}
                  className="group grid grid-cols-1 lg:grid-cols-6 gap-5 lg:gap-4 p-6 lg:px-8 hover:bg-white/40 dark:hover:bg-slate-900/30 transition-all duration-300"
                >

                  {/* Coupon */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 flex items-center justify-center border border-cyan-500/10">
                      <Ticket className="w-6 h-6 text-cyan-500" />
                    </div>

                    <div>
                      <h3 className="font-black text-lg tracking-wide uppercase text-slate-900 dark:text-white">
                        {c.code}
                      </h3>

                      <p className="text-xs text-slate-400">
                        ID: {c._id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Discount */}
                  <div className="flex lg:items-center">
                    {c.discountType === "percentage" ? (
                      <span className="px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-black uppercase tracking-[2px]">
                        {c.discountValue}% OFF
                      </span>
                    ) : (
                      <span className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-[2px]">
                        ₹{c.discountValue} OFF
                      </span>
                    )}
                  </div>

                  {/* Min Purchase */}
                  <div className="flex flex-col justify-center">
                    <span className="text-xs text-slate-400 uppercase lg:hidden">
                      Minimum Order
                    </span>

                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      ₹{c.minPurchase}
                    </span>
                  </div>

                  {/* Expiry */}
                  <div className="flex flex-col justify-center">
                    <span className="text-xs text-slate-400 uppercase lg:hidden">
                      Expiry
                    </span>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                      <Calendar className="w-4 h-4 text-indigo-500" />

                      <span className="text-sm">
                        {new Date(c.expiryDate).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex lg:items-center">
                    {isExpired ? (
                      <span className="px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black uppercase tracking-[2px]">
                        Expired
                      </span>
                    ) : c.isActive ? (
                      <span className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-[2px]">
                        Active
                      </span>
                    ) : (
                      <span className="px-4 py-2 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-xs font-black uppercase tracking-[2px]">
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center lg:justify-center gap-3">

                    <button
                      onClick={() => handleToggleActive(c._id)}
                      className="group/btn flex items-center justify-center w-12 h-12 rounded-2xl border border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all duration-300"
                    >
                      {c.isActive ? (
                        <ToggleRight className="w-6 h-6 text-cyan-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-400 group-hover/btn:text-cyan-500 transition" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(c._id)}
                      className="group/btn flex items-center justify-center w-12 h-12 rounded-2xl border border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl hover:border-rose-500/30 hover:bg-rose-500/10 transition-all duration-300"
                    >
                      <Trash2 className="w-5 h-5 text-slate-400 group-hover/btn:text-rose-500 transition" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───────────────── MODAL ───────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          ></div>

          {/* Modal */}
          <div className="relative w-full max-w-2xl rounded-[36px] border border-white/10 bg-white/80 dark:bg-slate-950/90 backdrop-blur-3xl shadow-[0_30px_80px_rgba(0,0,0,0.35)] overflow-hidden animate-fadeIn">

            {/* Glow */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-500/10 blur-3xl rounded-full"></div>

            {/* Header */}
            <div className="relative flex items-center justify-between px-8 py-6 border-b border-slate-200/50 dark:border-slate-800/60">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shadow-xl">
                  <Ticket className="w-7 h-7 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Create Coupon
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Configure new discount campaign
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-rose-500/10 transition-all flex items-center justify-center"
              >
                <X className="w-5 h-5 text-slate-500 hover:text-rose-500 transition" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="relative p-8 space-y-6"
            >

              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Coupon Code */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs uppercase tracking-[2px] font-bold text-black dark:text-white">
                    Coupon Code
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="FLASH50"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-14 rounded-2xl border  border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-black dark:text-white px-5 uppercase font-black tracking-wide focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
                  />
                </div>

                {/* Discount Type */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[2px] font-bold text-black dark:text-white">
                    Discount Type
                  </label>

                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full h-14 rounded-2xl border border-slate-200 text-black dark:text-white dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 px-5 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[2px] font-bold text-black dark:text-white">
                    Discount Value
                  </label>

                  <input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full h-14 rounded-2xl border border-slate-200 dark:border-slate-800 text-black dark:text-white bg-white/70 dark:bg-slate-900/60 px-5 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                {/* Min Purchase */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[2px] font-bold text-black dark:text-white">
                    Min Purchase
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(e.target.value)}
                    className="w-full h-14 rounded-2xl border border-slate-200 dark:border-slate-800 text-black dark:text-white bg-white/70 dark:bg-slate-900/60 px-5 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                {/* Usage Limit */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[2px] font-bold text-black dark:text-white">
                    Usage Limit
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={usageLimitPerUser}
                    onChange={(e) => setUsageLimitPerUser(e.target.value)}
                    className="w-full h-14 rounded-2xl border border-slate-200 dark:border-slate-800 text-black dark:text-white bg-white/70 dark:bg-slate-900/60 px-5 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                {/* Expiry */}
                <div className="flex items-center space-x-2">
                <div className="md:col-span-2 w-sm space-y-2">
                  <label className="text-xs uppercase tracking-[2px] font-bold text-black dark:text-white">
                    Expiry Date & Time
                  </label>

                  <input
                    type="datetime-local"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className=" h-14 rounded-2xl border  border-slate-200 dark:border-slate-800 text-black dark:text-white bg-white/70 dark:bg-slate-900/60 px-5 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 [color-scheme:dark]"
                  />
                </div>
                <div className="flex w-full items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 px-5 py-4">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">
                      Activate Immediately
                    </h4>

                    <p className="text-sm text-slate-400">
                      Enable coupon once created
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />

                    <div className="w-14 h-8 bg-slate-300 dark:bg-slate-700 rounded-full peer peer-checked:bg-cyan-500 transition-all"></div>

                    <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-all peer-checked:translate-x-6"></div>
                  </label>
                </div>
                </div>
              </div>

              {/* Active Toggle */}


              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-14 px-6 rounded-2xl border border-slate-300 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="h-14 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 text-white font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50"
                >
                  {actionLoading ? "Creating..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManager;
