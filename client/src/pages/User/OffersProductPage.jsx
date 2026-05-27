import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Sparkles,
  ChevronRight,
  ShoppingBag,
  Clock,
  ArrowLeft,
  Zap,
  Shield,
  Truck,
  RotateCcw,
  Flame,
  Gift,
  Star,
  Crown,
  ArrowUpRight,
} from "lucide-react";

import API from "../../services/api";
import ProductCard from "../../components/common/ProductCard";
import SkeletonCard from "../../components/common/SkeletonCard";
import CountdownTimer from "../../components/common/CountdownTimer";

/* -------------------------------------------------------------------------- */
/* Loading View */
/* -------------------------------------------------------------------------- */

const LoadingView = () => (
  <div className="min-h-screen bg-[#030712] overflow-hidden relative px-4 py-10">
    <div className="absolute inset-0">
      <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-500/10 blur-[120px] rounded-full" />
    </div>

    <div className="max-w-7xl mx-auto relative z-10 space-y-10">
      <div className="h-[380px] rounded-[3rem] bg-slate-900/70 border border-white/5 animate-pulse" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-5 hidden lg:block">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-3xl bg-slate-900/70 border border-white/5 animate-pulse"
            />
          ))}
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Error View */
/* -------------------------------------------------------------------------- */

const ErrorView = ({ error }) => (
  <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6">
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-10 text-center"
    >
      <div className="w-24 h-24 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
        <Tag className="w-10 h-10 text-rose-400" />
      </div>

      <h2 className="text-3xl font-black text-white mb-3">
        Offer Not Available
      </h2>

      <p className="text-slate-400 text-sm leading-relaxed">
        {error ||
          "This promotion has expired or is no longer available."}
      </p>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-slate-900 font-bold hover:scale-105 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
    </motion.div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Main Page */
/* -------------------------------------------------------------------------- */

const OffersProductPage = () => {
  const { slug } = useParams();

  const [offer, setOffer] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const activeOffersRes = await API.get("/offers/active");
        setOffers(activeOffersRes.data.data);

        if (slug) {
          const res = await API.get(`/offers/slug/${slug}`);
          setOffer(res.data.data);
        } else if (activeOffersRes.data.data.length > 0) {
          setOffer(activeOffersRes.data.data[0]);
        }
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            "Failed to load offer details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) return <LoadingView />;
  if (error || !offer) return <ErrorView error={error} />;

  const discountLabel =
    offer.discountType === "percentage"
      ? `${offer.discountValue}% OFF`
      : `₹${offer.discountValue} OFF`;

  const endDateLabel = offer.endDate
    ? new Date(offer.endDate).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Ongoing";

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden relative pb-28">
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-cyan-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[140px] rounded-full" />
      </div>

      {/* HEADER */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl bg-slate-950/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400 font-bold">
            <Link to="/" className="hover:text-cyan-400 transition-colors">
              Home
            </Link>

            <ChevronRight className="w-3 h-3" />

            <Link
              to="/offers"
              className="hover:text-cyan-400 transition-colors"
            >
              Offers
            </Link>

            <ChevronRight className="w-3 h-3" />

            <span className="text-cyan-400 truncate max-w-[160px]">
              {offer.title}
            </span>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-4 px-5 py-3 rounded-full border border-cyan-500/20 bg-cyan-500/5">
            <div className="w-10 h-10 rounded-full bg-cyan-500/15 flex items-center justify-center">
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="leading-none">
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">
                Offer Ends In
              </p>

              <CountdownTimer targetDate={offer.endDate} />
            </div>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[3rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)]"
        >
          {/* Image */}
          <img
            src={
              offer.banner ||
              "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=90"
            }
            alt={offer.title}
            className="w-full h-[650px] object-cover scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />

          {/* Floating Glass */}
          <div className="absolute top-8 right-8 hidden lg:flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl">
            <Flame className="w-5 h-5 text-orange-400" />

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">
                Trending
              </p>
              <p className="font-black text-white">
                Limited Time Deal
              </p>
            </div>
          </div>

          {/* CONTENT */}
          <div className="absolute inset-0 flex items-center px-8 md:px-16">
            <div className="max-w-2xl">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 backdrop-blur-xl text-cyan-300 text-[10px] font-black uppercase tracking-[0.22em]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Premium Aura Exclusive
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-5xl md:text-7xl font-black leading-[0.95] tracking-tight"
              >
                {offer.title}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-slate-300 text-lg leading-relaxed max-w-xl"
              >
                Discover premium products curated for this exclusive campaign.
                Unlock elite savings with lightning-fast delivery.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-10 flex flex-wrap gap-10"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black mb-2">
                    Discount
                  </p>

                  <h2 className="text-5xl font-black bg-gradient-to-r from-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                    {discountLabel}
                  </h2>
                </div>

                <div className="hidden md:block w-px bg-white/10" />

                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black mb-2">
                    Valid Until
                  </p>

                  <h2 className="text-2xl font-bold text-white">
                    {endDateLabel}
                  </h2>
                </div>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-slate-900 font-black hover:scale-105 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shop Now
                </Link>

                <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-bold">
                  <Gift className="w-4 h-4 text-cyan-400" />
                  Explore Benefits
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              {/* Heading */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />

                <h3 className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-black">
                  Active Campaigns
                </h3>
              </div>

              {/* Offers */}
              <div className="space-y-4">
                {offers.map((o) => {
                  const isActive = offer._id === o._id;

                  return (
                    <Link
                      key={o._id}
                      to={`/offers/${o.slug}`}
                      className={`group block p-5 rounded-[2rem] border transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border-cyan-400/30 shadow-[0_0_40px_rgba(6,182,212,0.15)]"
                          : "bg-white/5 border-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            isActive
                              ? "bg-cyan-400 text-black"
                              : "bg-white/10 text-slate-400"
                          }`}
                        >
                          <Tag className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-black text-white truncate">
                            {o.title}
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <BadgePercent className="w-3.5 h-3.5 text-cyan-400" />

                            <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 font-bold">
                              {o.discountValue}
                              {o.discountType === "percentage"
                                ? "%"
                                : "₹"}{" "}
                              OFF
                            </p>
                          </div>
                        </div>

                        <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Trust */}
              <div className="rounded-[2rem] border border-white/5 bg-white/5 p-6 space-y-5 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />

                  <h3 className="font-black text-white">
                    Aura Benefits
                  </h3>
                </div>

                {[
                  {
                    icon: Shield,
                    label: "Verified Premium Products",
                  },
                  {
                    icon: Truck,
                    label: "Free Priority Shipping",
                  },
                  {
                    icon: RotateCcw,
                    label: "Easy 30-Day Returns",
                  },
                  {
                    icon: Star,
                    label: "Exclusive Member Rewards",
                  },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>

                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <div className="lg:col-span-3 space-y-12">
            {/* Top */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <h2 className="text-3xl font-black flex items-center gap-3">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  Featured Products
                </h2>

                <p className="text-slate-400 mt-2">
                  Curated products included in this premium promotion
                </p>
              </div>

              {offer.products?.length > 0 && (
                <div className="px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs uppercase tracking-[0.22em] font-black">
                  {offer.products.filter(Boolean).length} Products
                </div>
              )}
            </div>

            {/* Products */}
            <AnimatePresence mode="wait">
              {offer.products?.filter(Boolean).length > 0 ? (
                <motion.div
                  key="products"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7"
                >
                  {offer.products.filter(Boolean).map((product, idx) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: idx * 0.08,
                        duration: 0.45,
                      }}
                    >
                      <ProductCard product={product} offer={offer} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-[3rem] border border-dashed border-white/10 bg-white/5 backdrop-blur-2xl py-24 text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10 text-slate-500" />
                  </div>

                  <h3 className="text-3xl font-black mb-3">
                    Storewide Discount
                  </h3>

                  <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
                    This promotion applies to eligible items across the
                    entire catalog.
                  </p>

                  <Link
                    to="/products"
                    className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-black hover:scale-105 transition-all"
                  >
                    Browse Products
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* INFO CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
              {[
                {
                  label: "Minimum Order",
                  value: `₹${offer.minPurchase || 0}`,
                  sub: "Required to unlock deal",
                  icon: Gift,
                },
                {
                  label: "Offer Expiry",
                  value: endDateLabel,
                  sub: "Promotion limited time",
                  icon: Clock,
                },
                {
                  label: "Shipping",
                  value: "Express Delivery",
                  sub: "Priority Aura dispatch",
                  icon: Truck,
                },
              ].map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className="rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/10 transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-5">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>

                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-black mb-3">
                      {card.label}
                    </p>

                    <h3 className="text-xl font-black text-white">
                      {card.value}
                    </h3>

                    <p className="text-sm text-slate-400 mt-2">
                      {card.sub}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersProductPage;