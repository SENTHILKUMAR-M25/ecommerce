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
import { Plus, Edit2, Trash2, X, Ticket, ToggleLeft, ToggleRight, Calendar, Info, ShieldCheck } from 'lucide-react';
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
    <div className="space-y-6 pb-16">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Coupon Manager</h1>
          <p className="text-sm text-slate-500 mt-1">Configure user promotion discounts, active status boundaries, and referral campaigns.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-sm shadow-md hover:shadow-cyan-500/10 transition-all active:scale-95 self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel border border-white/10 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Coupons</span>
          <p className="text-3xl font-black">{totalCoupons}</p>
        </div>
        <div className="glass-panel border border-white/10 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-xs text-slate-450 font-bold uppercase tracking-wider text-emerald-500">Active & Valid</span>
          <p className="text-3xl font-black text-emerald-500">{activeCoupons}</p>
        </div>
        <div className="glass-panel border border-white/10 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-xs text-slate-450 font-bold uppercase tracking-wider text-rose-500">Expired</span>
          <p className="text-3xl font-black text-rose-500">{expiredCoupons}</p>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <LoadingSpinner />
      ) : coupons.length === 0 ? (
        <div className="py-12 glass-panel border border-dashed border-slate-205 dark:border-slate-805 rounded-[2rem] text-center text-slate-400 text-sm">
          No coupons exist. Click "Create Coupon" to initialize discounts.
        </div>
      ) : (
        <div className="glass-panel border border-white/10 rounded-[2rem] overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/40 text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-85">
                  <th className="p-4 font-bold">Code</th>
                  <th className="p-4 font-bold">Discount</th>
                  <th className="p-4 font-bold">Min Purchase</th>
                  <th className="p-4 font-bold">Limit per User</th>
                  <th className="p-4 font-bold">Expiry Date</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-85 font-medium">
                {coupons.map((c) => {
                  const isExpired = new Date(c.expiryDate) <= new Date();
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Ticket className="w-4 h-4 text-cyan-500" />
                          <span className="font-extrabold text-slate-750 dark:text-white text-sm tracking-wide uppercase">{c.code}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {c.discountType === 'percentage' ? (
                          <span className="bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-bold">{c.discountValue}% Off</span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">₹{c.discountValue} Off</span>
                        )}
                      </td>
                      <td className="p-4">₹{c.minPurchase}</td>
                      <td className="p-4">{c.usageLimitPerUser} time(s)</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(c.expiryDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {isExpired ? (
                          <span className="text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">Expired</span>
                        ) : c.isActive ? (
                          <span className="text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">Active</span>
                        ) : (
                          <span className="text-slate-400 bg-slate-500/10 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">Inactive</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Toggle Active status */}
                          <button
                            onClick={() => handleToggleActive(c._id)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-80 text-slate-400 hover:text-cyan-500 transition-colors"
                            title={c.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
                          >
                            {c.isActive ? <ToggleRight className="w-5 h-5 text-cyan-500" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-80 text-slate-400 hover:text-rose-500 hover:border-rose-500 transition-all"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="relative glass-panel bg-white dark:bg-slate-950 border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl z-50 animate-fadeIn space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-85 pb-4">
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <Ticket className="w-5 h-5 text-cyan-500" />
                <span>Create Discount Coupon</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-3.5">
                {/* Coupon Code */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-450">Coupon Code *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FLASH50, BDAY20"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 uppercase font-bold focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Discount Type */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-450">Discount Type</span>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white dark:bg-slate-900 px-3 py-2 focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Price (₹)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-450">Discount Value *</span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder={discountType === 'percentage' ? 'e.g. 20' : 'e.g. 150'}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Min purchase */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-450">Min Purchase Required (₹)</span>
                    <input
                      type="number"
                      min="0"
                      value={minPurchase}
                      onChange={(e) => setMinPurchase(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Usage limit per user */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-450">Limit Per User</span>
                    <input
                      type="number"
                      min="1"
                      value={usageLimitPerUser}
                      onChange={(e) => setUsageLimitPerUser(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-450">Expiry Date *</span>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* Is Active Status checkbox */}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-cyan-500 focus:ring-cyan-500 h-4 w-4 bg-slate-900 border-white/10"
                  />
                  <label htmlFor="isActive" className="text-xs text-slate-400 font-bold select-none cursor-pointer">
                    Mark as active immediately
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4.5 py-2 border rounded-full font-bold"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-55"
                >
                  Create Coupon
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
