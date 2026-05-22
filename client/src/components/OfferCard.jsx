import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  CalendarDays,
  Percent,
  IndianRupee,
  Tag,
  ShoppingBag,
  Clock3,
  Zap,
} from "lucide-react";

const OfferCard = ({ offer }) => {
  const isExpired = new Date(offer.endDate) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      transition={{ duration: 0.35 }}
      className="group relative overflow-hidden rounded-[28px] glass-panel glass-panel-hover border border-white/10 p-6 w-full"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
        <div className="absolute top-0 left-0 w-56 h-56 bg-cyan-500/10 blur-[100px] rounded-full" />

        <div className="absolute bottom-0 right-0 w-56 h-56 bg-indigo-500/10 blur-[100px] rounded-full" />
      </div>

      {/* Offer Ribbon */}
      <div className="absolute top-4 right-[-35px] rotate-45 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-xs px-10 py-1 shadow-lg">
        HOT DEAL
      </div>

      <div className="relative z-10">
        {/* TOP */}
        <div className="flex items-start justify-between">
          {/* Icon */}
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-2xl">
              <Tag className="text-cyan-400 w-5 h-5" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white leading-tight">
                {offer.title}
              </h2>

              <p className="text-sm text-gray-400 capitalize mt-1">
                {offer.type} Offer
              </p>
            </div>
          </div>
        </div>

        {/* Discount */}
        <div className="mt-8 flex items-center gap-3">
          <div className="bg-yellow-500/10 p-2 rounded-xl">
            <Sparkles className="text-yellow-400 w-5 h-5" />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-5xl font-black gradient-text tracking-tight">
              {offer.discountValue}
            </span>

            {offer.discountType === "percentage" ? (
              <Percent className="w-8 h-8 text-cyan-400" />
            ) : (
              <IndianRupee className="w-8 h-8 text-cyan-400" />
            )}
          </div>

          <span className="text-gray-400 font-semibold text-lg">
            OFF
          </span>
        </div>

        {/* OFFER INFO */}
        <div className="mt-7 space-y-4">
          {/* Dates */}
          <div className="flex items-start gap-3 text-gray-300">
            <div className="bg-indigo-500/10 p-2 rounded-xl">
              <CalendarDays className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="text-sm">
              <p className="font-medium text-white">
                Offer Duration
              </p>

              <p className="text-gray-400 mt-1">
                {offer.startDate
                  ? new Date(offer.startDate).toLocaleDateString()
                  : "N/A"}{" "}
                →{" "}
                {offer.endDate
                  ? new Date(offer.endDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Min Purchase */}
          <div className="flex items-start gap-3 text-gray-300">
            <div className="bg-cyan-500/10 p-2 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="text-sm">
              <p className="font-medium text-white">
                Minimum Purchase
              </p>

              <p className="text-gray-400 mt-1">
                ₹{offer.minPurchase || 0}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-3 text-gray-300">
            <div
              className={`p-2 rounded-xl ${
                isExpired
                  ? "bg-red-500/10"
                  : "bg-green-500/10"
              }`}
            >
              <Clock3
                className={`w-5 h-5 ${
                  isExpired
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              />
            </div>

            <div className="text-sm">
              <p className="font-medium text-white">
                Offer Status
              </p>

              <p
                className={`mt-1 ${
                  isExpired
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {isExpired ? "Expired" : "Active Now"}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <Zap className="w-4 h-4" />

            <span>Limited Time Deal</span>
          </div>

          {/* Button */}
          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={`/offers/${offer.slug}`}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 block text-center"
            >
              Shop Now
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default OfferCard;