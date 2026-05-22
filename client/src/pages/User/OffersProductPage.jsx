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
  BadgePercent,
  Zap,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import API from "../../services/api";
import ProductCard from "../../components/common/ProductCard";
import SkeletonCard from "../../components/common/SkeletonCard";
import CountdownTimer from "../../components/common/CountdownTimer";
import SEO from "../../components/common/SEO";

/* ------------------------------------------------------------------ */
/* Animated skeleton loader                                              */
/* ------------------------------------------------------------------ */
const LoadingView = () => (
  <div className="min-h-screen bg-white dark:bg-slate-950 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="h-[320px] rounded-[2.5rem] bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="space-y-4 hidden lg:block">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Not-found / error view                                               */
/* ------------------------------------------------------------------ */
const ErrorView = ({ error }) => (
  <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-8">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 max-w-md"
    >
      <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
        <Tag className="w-12 h-12 text-rose-400" />
      </div>
      <div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">No Active Offer</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {error || "The offer you're looking for might have expired or doesn't exist."}
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-full font-bold transition-all hover:scale-105 shadow-xl"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
    </motion.div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Main Page                                                            */
/* ------------------------------------------------------------------ */
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
        console.error("Error fetching offer:", err);
        setError(err.response?.data?.message || "Failed to load offer details");
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <SEO
        title={`${offer.title} — Exclusive Deal`}
        description={`Save ${discountLabel} on premium Aura products. Offer ends ${endDateLabel}.`}
        image={offer.banner}
        keywords="offers, discounts, deals, premium shopping, Aura"
      />

      {/* ── STICKY PAGE HEADER ── */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            <Link to="/" className="hover:text-cyan-500 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/offers" className="hover:text-cyan-500 transition-colors">Offers</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-cyan-600 dark:text-cyan-400 truncate max-w-[160px]">{offer.title}</span>
          </nav>

          {/* Countdown pill */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-50 to-indigo-50 dark:from-cyan-900/20 dark:to-indigo-900/20 border border-cyan-200 dark:border-cyan-500/20 px-5 py-2.5 rounded-full self-start sm:self-auto">
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-0.5">Offer Ends In</span>
              <CountdownTimer targetDate={offer.endDate} />
            </div>
          </div>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2.5rem] aspect-[16/7] shadow-2xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-200 dark:border-white/5 group"
        >
          <img
            src={
              offer.banner ||
              "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=85"
            }
            alt={offer.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[4s] ease-out"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />

          {/* Banner content */}
          <div className="absolute inset-0 flex items-center px-10 md:px-16">
            <div className="max-w-xl space-y-5">
              {/* Badge */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Exclusive Aura Promotion
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tight"
              >
                {offer.title}
              </motion.h1>

              {/* Discount + expiry row */}
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-6 pt-2"
              >
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-0.5">Savings</p>
                  <p className="text-3xl font-black text-cyan-400">{discountLabel}</p>
                </div>
                <div className="w-px bg-white/15 hidden sm:block" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-0.5">Valid Until</p>
                  <p className="text-xl font-bold text-white">{endDateLabel}</p>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-cyan-400 hover:text-white px-7 py-3 rounded-full font-bold text-sm transition-all shadow-xl active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shop the Sale
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── BODY: SIDEBAR + MAIN ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

          {/* ── SIDEBAR ── */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Section label */}
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Live Promotions
                </h3>
              </div>

              <div className="space-y-3">
                {offers.map((o) => {
                  const isActive = offer._id === o._id;
                  return (
                    <Link
                      key={o._id}
                      to={`/offers/${o.slug}`}
                      className={`group flex items-start gap-3.5 p-4 rounded-2xl transition-all duration-300 border ${
                        isActive
                          ? "bg-white dark:bg-slate-900 border-indigo-400/30 ring-4 ring-indigo-500/5 shadow-xl shadow-indigo-100/30 dark:shadow-none"
                          : "bg-white/60 dark:bg-slate-900/40 border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl flex-shrink-0 transition-colors ${
                          isActive
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500"
                        }`}
                      >
                        <Tag className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`font-bold text-sm leading-tight truncate ${
                            isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {o.title}
                        </p>
                        <p
                          className={`text-[10px] font-black uppercase tracking-widest mt-1 ${
                            isActive ? "text-indigo-500" : "text-slate-400"
                          }`}
                        >
                          {o.discountValue}
                          {o.discountType === "percentage" ? "%" : "₹"} off
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 flex-shrink-0 ml-auto mt-0.5 transition-transform group-hover:translate-x-0.5 ${
                          isActive ? "text-indigo-400" : "text-slate-300"
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Trust badges */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                {[
                  { icon: Shield, label: "Verified Deals" },
                  { icon: Truck, label: "Free Express Shipping" },
                  { icon: RotateCcw, label: "30-Day Returns" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    <Icon className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="lg:col-span-3 space-y-12">

            {/* Section heading */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Offer Products
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Handpicked items included in this promotion
                </p>
              </div>
              {offer.products?.length > 0 && (
                <span className="text-xs font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-full">
                  {offer.products.filter(Boolean).length} items
                </span>
              )}
            </div>

            {/* Product grid */}
            <AnimatePresence mode="wait">
              {offer.products && offer.products.filter(Boolean).length > 0 ? (
                <motion.div
                  key="products"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {offer.products.filter(Boolean).map((product, idx) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07, duration: 0.4 }}
                    >
                      <ProductCard product={product} offer={offer} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-5"
                >
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-10 h-10 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Storewide Discount</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-sm mx-auto">
                      This offer applies to all eligible items in our catalog. Start browsing to find your discount.
                    </p>
                  </div>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    Browse All Products
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Offer info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-slate-200 dark:border-slate-800/60">
              {[
                {
                  label: "Minimum Order",
                  value: `₹${offer.minPurchase || 0}`,
                  sub: "Required for this promotion",
                  color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
                },
                {
                  label: "Valid Until",
                  value: endDateLabel,
                  sub: "Terms & conditions apply",
                  color: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
                },
                {
                  label: "Shipping",
                  value: "Express Included",
                  sub: "Priority Aura delivery",
                  color: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-1"
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
                  <p className={`text-base font-black ${card.color}`}>{card.value}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{card.sub}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersProductPage;
