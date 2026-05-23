import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminOrders, updateAdminOrderStatus } from '../../redux/slices/adminSlice';
import { useToast } from '../../components/common/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ClipboardList, ShieldAlert, Search, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        <div className="py-12 glass-panel border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] text-center text-slate-400 text-sm">
          No matching transactions discovered.
        </div>
      ) : (
        <div className="glass-panel border border-white/10 rounded-[2rem] overflow-hidden shadow-lg p-0 sm:p-6 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Placement Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Amount Due</th>
                  <th className="py-3 px-4 text-center">Status Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 block sm:table-row-group">
                {filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/30 transition-colors block sm:table-row p-4 sm:p-0">
                    {/* ID */}
                    <td className="py-1 sm:py-3.5 px-0 sm:px-4 block sm:table-cell mb-2 sm:mb-0">
                      <div className="flex items-center justify-between sm:block">
                        <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">Order ID</span>
                        <span className="font-bold select-all font-mono text-cyan-600 dark:text-cyan-400">{o._id.slice(-8).toUpperCase()}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-1 sm:py-3.5 px-0 sm:px-4 block sm:table-cell mb-2 sm:mb-0">
                      <div className="flex items-center justify-between sm:block">
                        <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">Placed On</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                          {new Date(o.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-1 sm:py-3.5 px-0 sm:px-4 block sm:table-cell mb-2 sm:mb-0">
                      <div className="flex items-center justify-between sm:block">
                        <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">Customer</span>
                        <div className="text-right sm:text-left">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{o.user?.name || 'Guest User'}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{o.user?.email || 'guest@example.com'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-1 sm:py-3.5 px-0 sm:px-4 block sm:table-cell mb-3 sm:mb-0">
                      <div className="flex items-center justify-between sm:block">
                        <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">Total Amount</span>
                        <span className="font-black text-slate-900 dark:text-white text-sm sm:text-xs">
                          ₹{o.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    {/* Status Dropdown control */}
                    <td className="py-2 sm:py-3.5 px-0 sm:px-4 block sm:table-cell border-t sm:border-0 border-slate-100 dark:border-slate-800 mt-2 sm:mt-0 pt-3 sm:pt-0">
                      <div className="flex justify-between sm:justify-center items-center gap-3">
                        <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">Update Status</span>
                        <div className="flex items-center gap-3">
                          <Link 
                            to={`/order/invoice/${o._id}`}
                            className="p-2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-all shadow-sm"
                            title="Print Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                          <select
                            disabled={actionLoading}
                            value={o.status}
                            onChange={(e) => handleStatusChange(o._id, e.target.value)}
                            className={`px-4 py-2 sm:py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider focus:outline-none transition-all shadow-sm ${statusBadges[o.status]}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
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
