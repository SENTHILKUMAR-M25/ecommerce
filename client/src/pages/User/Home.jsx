import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Copy,
  Check,
  Sparkles,
  Star,
  Zap,
  Crown,
} from "lucide-react";

import API from "../../services/api";

import SkeletonCard from "../../components/common/SkeletonCard";
import ProductCard from "../../components/common/ProductCard";

import { useToast } from "../../components/common/ToastContext";

const CouponCard = ({ coupon }) => {
  const { toast } = useToast();

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);

    setCopied(true);

    toast(`Coupon "${coupon.code}" copied successfully`, "success");

    setTimeout(() => setCopied(false), 2000);
  };

  const isPercent = coupon.discountType === "percentage";

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-[0_10px_50px_rgba(0,0,0,0.45)] group"
    >
      {/* Glow */}
      <div className="absolute -top-20 -right-20 w-52 h-52 bg-cyan-500/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-indigo-500/10 blur-3xl rounded-full" />

      {/* Ticket circles */}
      <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-[#080b14] -translate-y-1/2 border-r border-white/10" />

      <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-[#080b14] -translate-y-1/2 border-l border-white/10" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] uppercase tracking-widest font-black">
              <Ticket className="w-3.5 h-3.5" />
              Active Coupon
            </span>

            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Limited Offer
            </span>
          </div>

          <div>
            <h2 className="text-4xl font-black text-white">
              {isPercent
                ? `${coupon.discountValue}% OFF`
                : `₹${coupon.discountValue} OFF`}
            </h2>

            <p className="text-sm text-slate-400 mt-2">
              Minimum purchase ₹{coupon.minPurchase}
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-dashed border-white/10 pt-5">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <code className="text-cyan-400 font-black tracking-widest">
              {coupon.code}
            </code>
          </div>

          <button
            onClick={handleCopy}
            className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              copied
                ? "bg-emerald-500 text-white"
                : "bg-white text-slate-900 hover:bg-cyan-400 hover:text-white"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const { toast } = useToast();

  const [categories, setCategories] = useState([]);

  const [featuredProducts, setFeaturedProducts] = useState([]);

  const [activeCoupons, setActiveCoupons] = useState([]);

  const [loading, setLoading] = useState(true);

  const [slideIndex, setSlideIndex] = useState(0);

  const categoryRef = useRef(null);

  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop",
      title: "Luxury Tech",
      subtitle: "Premium Smart Gadgets",
    },

    {
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
      title: "Modern Fashion",
      subtitle: "Discover Your Style",
    },

    {
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop",
      title: "Audio Experience",
      subtitle: "Immersive Sound Quality",
    },

    {
      image:
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1600&auto=format&fit=crop",
      title: "Street Collection",
      subtitle: "Next Generation Lifestyle",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [catRes, prodRes, couponRes] = await Promise.all([
          API.get("/categories"),
          API.get("/products?limit=8&sort=-rating"),
          API.get("/coupons/active"),
        ]);

        setCategories(catRes.data.data || []);

        setFeaturedProducts(prodRes.data.data || []);

        setActiveCoupons(couponRes.data.data || []);
      } catch (err) {
        console.error(err);

        toast("Failed to load homepage", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scrollCategories = (dir) => {
    categoryRef.current?.scrollBy({
      left: dir * 320,
      behavior: "smooth",
    });
  };

  const features = [
    {
      title: "Fast Delivery",
      desc: "Lightning fast premium shipping worldwide.",
      icon: <Truck className="w-7 h-7 text-cyan-400" />,
    },

    {
      title: "Secure Payments",
      desc: "Protected encrypted payment infrastructure.",
      icon: <ShieldCheck className="w-7 h-7 text-indigo-400" />,
    },

    {
      title: "Easy Returns",
      desc: "Simple and stress-free return policy.",
      icon: <RotateCcw className="w-7 h-7 text-violet-400" />,
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* HERO */}
      <section className="relative h-[85vh] overflow-hidden rounded-[2.5rem]">
        {/* BG Images */}
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              slideIndex === i ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* overlays */}
        <div className="absolute inset-0 bg-black/60 z-10" />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />

        {/* glow */}
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl z-10 animate-pulse" />

        <div className="absolute bottom-20 right-20 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl z-10" />

        {/* content */}
        <div className="relative z-20 h-full flex items-center px-8 md:px-16">
          <div className="max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={slideIndex}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs uppercase tracking-[0.25em] font-black">
                  <Sparkles className="w-4 h-4" />
                  New Collection 2026
                </span>

                <h1 className="text-5xl md:text-7xl font-black leading-tight text-white">
                  {slides[slideIndex].title}
                </h1>

                <p className="text-xl text-slate-300 max-w-xl leading-relaxed">
                  {slides[slideIndex].subtitle}
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link
                    to="/products"
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-cyan-500/20"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Shop Now
                  </Link>

                  <Link
                    to="/products"
                    className="px-8 py-4 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl text-white font-bold flex items-center gap-2 hover:bg-white/20 transition-all"
                  >
                    Explore
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
              className={`transition-all duration-300 rounded-full ${
                i === slideIndex
                  ? "w-10 h-2 bg-cyan-400"
                  : "w-2 h-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <motion.div
            whileHover={{ y: -6 }}
            key={i}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8"
          >
            <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative z-10 flex gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                {feature.icon}
              </div>

              <div>
                <h3 className="text-xl font-black">
                  {feature.title}
                </h3>

                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* CATEGORIES */}
      <section className="space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black tracking-tight">
              Shop Categories
            </h2>

            <p className="text-slate-500 mt-2">
              Browse premium collections curated for modern shopping.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => scrollCategories(-1)}
              className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-cyan-500/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => scrollCategories(1)}
              className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-cyan-500/10 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={categoryRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
        >
          {loading
            ? Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="min-w-[280px] h-[340px] rounded-[2rem] bg-white/5 animate-pulse"
                  />
                ))
            : categories
                .filter((c) => !c.parent)
                .map((category) => (
                  <Link
                    key={category._id}
                    to={`/products?category=${category.slug}`}
                    className="group relative min-w-[280px] h-[340px] overflow-hidden rounded-[2rem] border border-white/10"
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white">
                          {category.name}
                        </h3>

                        <p className="text-sm text-slate-300 line-clamp-2">
                          {category.description}
                        </p>

                        <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold pt-2 group-hover:translate-x-2 transition-all">
                          Browse Now
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-4xl font-black tracking-tight">
              Featured Products
            </h2>

            <p className="text-slate-500 mt-2">
              Top rated products loved by our customers.
            </p>
          </div>

          <Link
            to="/products"
            className="flex items-center gap-2 text-cyan-500 font-bold"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array(8)
              .fill(0)
              .map((_, i) => <SkeletonCard key={i} />)
          ) : featuredProducts?.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-16 text-slate-500">
              No featured products available
            </div>
          )}
        </div>
      </section>

      {/* DEALS */}
      <section className="space-y-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight">
            Exclusive Coupons
          </h2>

          <p className="text-slate-500 mt-2">
            Save more with premium offers and discount rewards.
          </p>
        </div>

        {activeCoupons?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeCoupons.map((coupon) => (
              <CouponCard key={coupon._id} coupon={coupon} />
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-violet-500/10 p-12">
            <div className="absolute -top-20 right-0 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs uppercase tracking-widest font-black">
                  <Zap className="w-4 h-4" />
                  Mega Offer
                </span>

                <h2 className="text-4xl font-black">
                  Get ₹50 OFF Instantly
                </h2>

                <p className="text-slate-400 leading-relaxed">
                  Use coupon code{" "}
                  <span className="font-black text-cyan-400">
                    WELCOME50
                  </span>{" "}
                  during checkout and unlock special discounts on your first
                  order.
                </p>
              </div>

              <Link
                to="/products"
                className="px-8 py-4 rounded-full bg-white text-slate-950 font-black hover:bg-cyan-400 hover:text-white transition-all shadow-xl"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        )}
      </section>

    
    </div>
  );
};

export default Home;