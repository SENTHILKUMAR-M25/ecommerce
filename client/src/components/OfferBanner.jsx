import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Flame,
  Loader2,
  BadgePercent,
} from "lucide-react";

import OfferCard from "./OfferCard";
import API from "../services/api";

const OfferBanner = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);

      const res = await API.get("/offers/active");

      setOffers(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20 px-4 md:px-8 overflow-hidden bg-[#070B14]">
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-[420px] h-[420px] bg-cyan-500/10 blur-[150px] rounded-full" />

      <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-indigo-500/10 blur-[150px] rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* TOP BADGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center mb-6"
        >
          <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 backdrop-blur-xl">
            <Flame className="text-cyan-400 w-4 h-4" />

            <span className="text-sm text-cyan-300 font-medium">
              Exclusive Limited Time Deals
            </span>
          </div>
        </motion.div>

        {/* HEADING */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <div className="flex justify-center mb-5">
            <div className="bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 p-4 rounded-3xl border border-white/10">
              <Sparkles className="text-cyan-400 w-8 h-8" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black gradient-text leading-tight">
            Active Offers
          </h1>

          <p className="text-gray-400 mt-5 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Unlock premium discounts, seasonal sales, combo
            offers, and exclusive shopping rewards curated
            specially for you.
          </p>
        </motion.div>

        {/* LOADING */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />

            <p className="mt-4 text-gray-400 text-lg">
              Loading premium offers...
            </p>
          </div>
        ) : offers.length > 0 ? (
          <>
            {/* STATS */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-between items-center mb-8 flex-wrap gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/10 p-3 rounded-2xl border border-cyan-500/10">
                  <BadgePercent className="text-cyan-400 w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {offers.length} Active Offers
                  </h3>

                  <p className="text-gray-400 text-sm">
                    Best premium deals available now
                  </p>
                </div>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300">
                Updated in real-time
              </div>
            </motion.div>

            {/* OFFERS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
              {offers.map((offer, index) => (
                <motion.div
                  key={offer._id}
                  initial={{ opacity: 0, y: 45 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                  }}
                >
                  <OfferCard offer={offer} />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          /* EMPTY STATE */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel rounded-[32px] p-14 text-center border border-white/10 max-w-3xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                <Sparkles className="w-12 h-12 text-cyan-400" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white">
              No Active Offers
            </h2>

            <p className="text-gray-400 mt-4 text-lg leading-relaxed">
              New premium deals, festive discounts, combo
              bundles, and exclusive offers will appear here
              soon 🚀
            </p>

            <button className="mt-8 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:scale-105 transition">
              Explore Products
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default OfferBanner;