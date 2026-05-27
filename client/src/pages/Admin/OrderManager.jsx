import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
} from "../../redux/slices/adminSlice";

import { useToast } from "../../components/common/ToastContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { Search, FileText } from "lucide-react";

import { Link } from "react-router-dom";

const OrderManager = () => {
  const dispatch = useDispatch();

  const { toast } = useToast();

  const { orders, loading, actionLoading } = useSelector(
    (state) => state.admin
  );

  const [searchVal, setSearchVal] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ordersPerPage = 10;

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  // Filter Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o._id.toLowerCase().includes(searchVal.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(searchVal.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(searchVal.toLowerCase());

    const matchesStatus =
      statusFilter === "" ? true : o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const indexOfLastOrder = currentPage * ordersPerPage;

  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  // Reset page on filter/search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchVal, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(
        updateAdminOrderStatus({
          id: orderId,
          status: newStatus,
        })
      ).unwrap();

      toast(
        `Order status updated successfully to ${newStatus}!`,
        "success"
      );

      dispatch(fetchAdminOrders());
    } catch (err) {
      toast(err || "Failed to update order status.", "error");
    }
  };

  const statusBadges = {
    Pending:
      "bg-amber-500/10 text-amber-500 border border-amber-500/20",

    Processing:
      "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",

    Shipped:
      "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20",

    Delivered:
      "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",

    Cancelled:
      "bg-rose-500/10 text-rose-500 border border-rose-500/20",
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
            Order Status Manager
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Coordinate client purchases, carrier trackings, and cancel records.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />

          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {filteredOrders.length} Active Orders
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md group">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-300" />

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search by Order ID, name, email..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="relative w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 shadow-sm transition-all"
          />
        </div>

        {/* Status Filter */}
        {/* <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-5 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 shadow-sm transition-all w-full md:w-56"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select> */}
      </div>

      {/* Loading */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 backdrop-blur-md text-center">
          <p className="text-slate-400 text-sm font-medium">
            No matching transactions discovered.
          </p>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-white/10 bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl shadow-[0_10px_50px_rgba(0,0,0,0.08)] overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200/70 dark:border-slate-800 text-slate-500 text-xs uppercase tracking-widest">
                  <th className="px-6 py-5 text-left">Order ID</th>

                  <th className="px-6 py-5 text-left">Date</th>

                  <th className="px-6 py-5 text-left">Customer</th>

                  <th className="px-6 py-5 text-left">Amount</th>

                  <th className="px-6 py-5 text-center">Invoice</th>

                  <th className="px-6 py-5 text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {currentOrders.map((o) => (
                  <tr
                    key={o._id}
                    className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-cyan-500/[0.03] transition-all duration-200"
                  >
                    {/* ID */}
                    <td className="px-6 py-5">
                      <span className="font-black tracking-wider font-mono text-cyan-600 dark:text-cyan-400">
                        #{o._id.slice(-8).toUpperCase()}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {new Date(o.createdAt).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">
                          {o.user?.name || "Guest User"}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {o.user?.email || "guest@example.com"}
                        </p>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-5">
                      <span className="font-black text-base text-slate-900 dark:text-white">
                        ₹{o.totalPrice.toFixed(2)}
                      </span>
                    </td>

                    {/* Invoice */}
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <Link
                          to={`/order/invoice/${o._id}`}
                          className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-cyan-500 hover:bg-cyan-500/10 transition-all"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <select
                          disabled={actionLoading}
                          value={o.status}
                          onChange={(e) =>
                            handleStatusChange(o._id, e.target.value)
                          }
                          className={`px-4 py-2 rounded-xl text-xs  font-black uppercase tracking-wider focus:outline-none transition-all shadow-sm ${statusBadges[o.status]}`}
                        >
                          <option value="Pending" className="text-black">
                            Pending
                          </option>
                          <option value="Processing" className="text-black">
                            Processing
                          </option>
                          <option value="Shipped" className="text-black">
                            Shipped
                          </option>
                          <option value="Delivered" className="text-black">
                            Delivered
                          </option>
                          <option value="Cancelled" className="text-black">
                            Cancelled
                          </option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden p-4 space-y-4">
            {currentOrders.map((o) => (
              <div
                key={o._id}
                className="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-5 shadow-sm"
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      Order ID
                    </p>

                    <h3 className="font-black font-mono text-cyan-600 dark:text-cyan-400 mt-1">
                      #{o._id.slice(-8).toUpperCase()}
                    </h3>
                  </div>

                  <Link
                    to={`/order/invoice/${o._id}`}
                    className="w-10 h-10 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-cyan-500 hover:bg-cyan-500/10 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                  </Link>
                </div>

                {/* Info */}
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Customer</span>

                    <div className="text-right">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {o.user?.name || "Guest User"}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        {o.user?.email || "guest@example.com"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Date</span>

                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {new Date(o.createdAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Amount</span>

                    <span className="font-black text-lg text-slate-900 dark:text-white">
                      ₹{o.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-5">
                  <select
                    disabled={actionLoading}
                    value={o.status}
                    onChange={(e) =>
                      handleStatusChange(o._id, e.target.value)
                    }
                    className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider focus:outline-none transition-all ${statusBadges[o.status]}`}
                  >
                    <option value="Pending" className="text-black">
                      Pending
                    </option>
                    <option value="Processing" className="text-black">
                      Processing
                    </option>
                    <option value="Shipped" className="text-black">
                      Shipped
                    </option>
                    <option value="Delivered" className="text-black">
                      Delivered
                    </option>
                    <option value="Cancelled" className="text-black">
                      Cancelled
                    </option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredOrders.length > ordersPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-slate-200/70 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
              {/* Info */}
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-bold text-cyan-600">
                  {indexOfFirstOrder + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-cyan-600">
                  {Math.min(indexOfLastOrder, filteredOrders.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-cyan-600">
                  {filteredOrders.length}
                </span>{" "}
                orders
              </p>

              {/* Buttons */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {/* Prev */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    currentPage === 1
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-cyan-500 hover:text-white"
                  }`}
                >
                  Prev
                </button>

                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        currentPage === page
                          ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-cyan-500 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Next */}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    currentPage === totalPages
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-cyan-500 hover:text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderManager;