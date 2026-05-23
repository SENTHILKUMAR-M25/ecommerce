import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyOrders, cancelMyOrder } from '../../redux/slices/orderSlice';
import { useToast } from '../../components/common/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { Calendar, ShieldAlert, ShoppingBag, Truck, CheckCircle2, XCircle, FileText } from 'lucide-react';

const OrdersHistory = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you absolutely sure you want to cancel this order? This will restore product stock.')) {
      return;
    }

    try {
      await dispatch(cancelMyOrder(orderId)).unwrap();
      toast('Order cancelled successfully. Stock restored.', 'info');
    } catch (err) {
      toast(err || 'Failed to cancel order.', 'error');
    }
  };

  const statusBadges = {
    Pending: <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">Pending</span>,
    Processing: <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">Processing</span>,
    Shipped: <span className="bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">Shipped</span>,
    Delivered: <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">Delivered</span>,
    Cancelled: <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">Cancelled</span>
  };

  if (loading && orders.length === 0) return <LoadingSpinner />;
  
  if (orders.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="text-5xl">📦</div>
        <h2 className="text-2xl font-extrabold tracking-tight">No Order History Found</h2>
        <p className="text-slate-500 text-sm">
          You haven't placed any premium orders yet. Create an account and checkout items to log history.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold transition-all shadow-md active:scale-95"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Start Shopping</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Order History</h1>
      <p className="text-sm text-slate-500">Track shipments, verify payment channels, and manage cancellation options.</p>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="glass-panel border border-white/10 rounded-[2rem] overflow-hidden shadow-lg p-6 space-y-6 animate-fadeIn"
          >
            {/* Header: Order metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-105 dark:border-slate-805 pb-4 text-xs">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div>
                  <span className="text-slate-400 font-medium block">Order ID</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 select-all">{order._id}</span>
                </div>
                
                <div>
                  <span className="text-slate-400 font-medium block">Placement Date</span>
                  <span className="font-semibold">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Payment Method</span>
                  <span className="font-semibold uppercase">{order.paymentMethod}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Grand Total</span>
                  <span className="font-extrabold text-cyan-600 dark:text-cyan-400">₹{order.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/order/invoice/${order._id}`}
                  className="flex items-center space-x-2 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-cyan-500/10 hover:text-cyan-500 text-slate-500 font-bold transition-all text-[10px]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Invoice</span>
                </Link>
                {statusBadges[order.status]}
              </div>
            </div>

            {/* Middle: Order Items Mini cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {order.orderItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-3 border border-white/10 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 rounded-2xl text-xs"
                >
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-white/10" />
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-bold truncate">{item.name}</h4>
                    {item.variant && <p className="text-[10px] text-cyan-550 font-semibold">{item.variant}</p>}
                    <p className="text-slate-400">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer: Ship Coordinates & cancellation actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 text-xs">
              <div className="flex items-start gap-2">
                <Truck className="w-4.5 h-4.5 text-indigo-500 flex-shrink-0 pt-0.5" />
                <p className="text-slate-500 leading-normal">
                  Shipping: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                </p>
              </div>

              {/* Cancellation trigger */}
              {(order.status === 'Pending' || order.status === 'Processing') && (
                <button
                  onClick={() => handleCancelOrder(order._id)}
                  className="flex items-center justify-center space-x-1.5 px-5 py-2 border border-rose-500/25 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 font-bold rounded-full transition-all self-end"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Request Cancellation</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersHistory;
