import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyOrders, cancelMyOrder } from '../../redux/slices/orderSlice';
import { useToast } from '../../components/common/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShoppingBag,
  Truck,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const OrdersHistory = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { orders, loading } = useSelector((state) => state.orders);

  /* ---------------- Pagination ---------------- */
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    return orders.slice(startIndex, startIndex + ordersPerPage);
  }, [orders, currentPage]);

  const handleCancelOrder = async (orderId) => {
    if (
      !window.confirm(
        'Are you absolutely sure you want to cancel this order? This will restore product stock.'
      )
    ) {
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
    Pending: (
      <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">
        Pending
      </span>
    ),
    Processing: (
      <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">
        Processing
      </span>
    ),
    Shipped: (
      <span className="bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">
        Shipped
      </span>
    ),
    Delivered: (
      <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">
        Delivered
      </span>
    ),
    Cancelled: (
      <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">
        Cancelled
      </span>
    ),
  };

  if (loading && orders.length === 0) return <LoadingSpinner />;

  if (orders.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="text-5xl">📦</div>

        <h2 className="text-2xl font-extrabold tracking-tight">
          No Order History Found
        </h2>

        <p className="text-slate-500 text-sm">
          You haven't placed any premium orders yet. Create an account and
          checkout items to log history.
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
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Order History
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Track shipments, verify payment channels, and manage cancellation
            options.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-[10px] uppercase tracking-widest text-cyan-500 font-black">
              Total Orders
            </p>
            <h3 className="text-xl font-black text-cyan-600 dark:text-cyan-400">
              {orders.length}
            </h3>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-[10px] uppercase tracking-widest text-indigo-500 font-black">
              Current Page
            </p>
            <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              {currentPage}/{totalPages}
            </h3>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="space-y-6">
        {paginatedOrders.map((order) => (
          <div
            key={order._id}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl p-6"
          >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 border-b border-slate-200/60 dark:border-slate-800 pb-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">
                    Order ID
                  </span>

                  <span className="font-bold text-slate-700 dark:text-slate-200 break-all">
                    #{order._id.slice(-10)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">
                    Order Date
                  </span>

                  <span className="font-semibold">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      dateStyle: 'medium',
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">
                    Payment
                  </span>

                  <span className="font-semibold uppercase">
                    {order.paymentMethod}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">
                    Total
                  </span>

                  <span className="font-extrabold text-cyan-600 dark:text-cyan-400 text-base">
                    ₹{order.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/order/invoice/${order._id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 hover:bg-cyan-500/10 hover:text-cyan-500 text-slate-500 font-bold transition-all text-[11px]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Invoice
                </Link>

                {statusBadges[order.status]}
              </div>
            </div>

            {/* Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {order.orderItems.map((item, idx) => (
                <div
                  key={idx}
                  className="group flex gap-4 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:shadow-lg transition-all"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-bold text-sm truncate">
                      {item.name}
                    </h4>

                    {item.variant && (
                      <p className="text-[11px] text-cyan-500 font-semibold">
                        {item.variant}
                      </p>
                    )}

                    <p className="text-slate-500 text-xs">
                      Qty: {item.quantity}
                    </p>

                    <p className="font-bold text-indigo-500 text-sm">
                      ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                    Shipping Address
                  </p>

                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {order.shippingAddress.street},{" "}
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.state} -{" "}
                    {order.shippingAddress.zipCode}
                  </p>
                </div>
              </div>

              {(order.status === 'Pending' ||
                order.status === 'Processing') && (
                <button
                  onClick={() => handleCancelOrder(order._id)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 font-bold rounded-full transition-all self-start lg:self-auto"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Cancel Order</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          {/* Info */}
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {(currentPage - 1) * ordersPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {Math.min(currentPage * ordersPerPage, orders.length)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {orders.length}
            </span>{" "}
            orders
          </p>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              className="w-11 h-11 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const page = idx + 1;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-11 h-11 rounded-2xl font-bold text-sm transition-all ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-lg'
                      : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
              className="w-11 h-11 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersHistory;