import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminOrders, updateAdminOrderStatus } from '../../redux/slices/adminSlice';
import { useToast } from '../../components/common/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ClipboardList, ShieldAlert, Search } from 'lucide-react';

const OrderManager = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { orders, loading, actionLoading } = useSelector((state) => state.admin);

  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateAdminOrderStatus({ id: orderId, status: newStatus })).unwrap();
      toast(`Order status updated successfully to ${newStatus}!`, 'success');
      dispatch(fetchAdminOrders()); // reload
    } catch (err) {
      toast(err || 'Failed to update order status.', 'error');
    }
  };

  const statusBadges = {
    Pending: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    Processing: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
    Shipped: 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20',
    Delivered: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    Cancelled: 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o._id.toLowerCase().includes(searchVal.toLowerCase()) || 
                          o.user?.email?.toLowerCase().includes(searchVal.toLowerCase()) ||
                          o.user?.name?.toLowerCase().includes(searchVal.toLowerCase());
    const matchesStatus = statusFilter === '' ? true : o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header text */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Order Status Manager</h1>
        <p className="text-sm text-slate-500">Coordinate client purchases, carrier trackings, and cancel records.</p>
      </div>

      {/* Query filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search by Order ID, name, email..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-full border border-slate-202 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs w-full sm:w-48"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders list sheet */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredOrders.length === 0 ? (
        <div className="py-12 glass-panel border border-dashed border-slate-205 dark:border-slate-805 rounded-[2rem] text-center text-slate-400 text-sm">
          No matching transactions discovered.
        </div>
      ) : (
        <div className="glass-panel border border-white/10 rounded-[2rem] overflow-hidden shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Placement Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Amount Due</th>
                  <th className="py-3 px-4 text-center">Status Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/30 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-bold select-all">{o._id}</td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-semibold text-slate-550 dark:text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-700 dark:text-slate-200">{o.user?.name || 'Guest User'}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{o.user?.email || 'guest@example.com'}</p>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4 font-extrabold text-cyan-600 dark:text-cyan-400">
                      ₹{o.totalPrice.toFixed(2)}
                    </td>

                    {/* Status Dropdown control */}
                    <td className="py-3.5 px-4">
                      <div className="flex justify-center items-center gap-3">
                        <select
                          disabled={actionLoading}
                          value={o.status}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase focus:outline-none ${statusBadges[o.status]}`}
                        >
                          <option value="Pending" className="text-slate-700 bg-white dark:bg-slate-950 font-semibold">Pending</option>
                          <option value="Processing" className="text-slate-700 bg-white dark:bg-slate-950 font-semibold">Processing</option>
                          <option value="Shipped" className="text-slate-700 bg-white dark:bg-slate-950 font-semibold">Shipped</option>
                          <option value="Delivered" className="text-slate-700 bg-white dark:bg-slate-950 font-semibold">Delivered</option>
                          <option value="Cancelled" className="text-slate-700 bg-white dark:bg-slate-950 font-semibold">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;
