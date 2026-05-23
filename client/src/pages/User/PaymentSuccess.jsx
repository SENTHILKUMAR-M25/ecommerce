import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, ArrowRight, ShoppingBag, FileText } from 'lucide-react';

const PaymentSuccess = () => {
  const { orderId } = useParams();

  return (
    <div className="py-20 max-w-md mx-auto text-center space-y-8 animate-fadeIn">
      {/* Icon checkmark */}
      <div className="flex justify-center relative">
        <div className="absolute inset-0 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl mx-auto -z-10 animate-pulse"></div>
        <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/25 rounded-full">
          <CheckCircle className="w-16 h-16 text-emerald-500" />
        </div>
      </div>

      {/* Confirmation text */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3.5 py-1.5 rounded-full">
          Transaction Authorized
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight">Order Placed Successfully!</h1>
        <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
          Thank you for choosing AURA. Your purchase has been logged and is moving into carrier fulfillment.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-lg text-left text-xs space-y-3">
        <div className="flex justify-between pb-2.5 border-b border-slate-100 dark:border-slate-805">
          <span className="text-slate-400 font-medium">Order Reference ID</span>
          <span className="font-bold text-slate-700 dark:text-slate-200 select-all">{orderId}</span>
        </div>
        
        <div className="flex gap-3.5 items-start">
          <Calendar className="w-4 h-4 text-indigo-500 flex-shrink-0 pt-0.5" />
          <div>
            <p className="font-bold text-slate-700 dark:text-slate-200">Estimated Delivery Date</p>
            <p className="text-slate-450 leading-normal mt-0.5">
              Your premium shipment is scheduled to arrive within 3-5 business days. A tracking link will be updated in your profile.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/orders"
          className="flex items-center justify-center space-x-2 px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-cyan-500 hover:text-white transition-all shadow-md"
        >
          <span>Track Order History</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        
        <Link
          to={`/order/invoice/${orderId}`}
          className="flex items-center justify-center space-x-2 px-6 py-3 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-500 font-bold text-xs hover:bg-cyan-500/10 transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>View Official Invoice</span>
        </Link>
        
        <Link
          to="/products"
          className="flex items-center justify-center space-x-2 px-6 py-3 rounded-full border border-slate-250 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 font-bold text-xs hover:border-slate-400 transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
