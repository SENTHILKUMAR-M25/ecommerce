import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, RotateCcw, Star, ChevronLeft, ChevronRight, Ticket, Copy, Check } from 'lucide-react';
import API from '../../services/api';
import SkeletonCard from '../../components/common/SkeletonCard';
import ProductCard from '../../components/common/ProductCard';
import { useToast } from '../../components/common/ToastContext';
import OfferBanner from '../../components/OfferBanner';


const CouponCard = ({ coupon }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    toast(`Coupon code "${coupon.code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const isPercent = coupon.discountType === 'percentage';
  const formattedExpiry = new Date(coupon.expiryDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="relative overflow-hidden glass-panel border border-white/10 dark:border-white/5 bg-slate-950/70 p-6 rounded-3xl flex flex-col justify-between h-48 shadow-lg group hover:border-cyan-500/30 transition-all duration-300">
      {/* Decorative semi-circles on sides to simulate a real ticket */}
      <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-slate-50 dark:bg-[#080a13] -translate-y-1/2 border-r border-white/10 z-10"></div>
      <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-slate-50 dark:bg-[#080a13] -translate-y-1/2 border-l border-white/10 z-10"></div>

      {/* Background glow effects */}
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all duration-300"></div>
      <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-cyan-500/10 blur-2xl group-hover:bg-cyan-500/20 transition-all duration-300"></div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Ticket className="w-3 h-3" />
            <span>Active Discount</span>
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Expires {formattedExpiry}</span>
        </div>

        <div>
          <h3 className="text-2xl font-black text-white">
            {isPercent ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Min Purchase: <span className="text-slate-200 font-semibold">₹{coupon.minPurchase}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-white/10 pt-4 mt-2">
        <div className="bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl">
          <code className="text-sm font-black text-cyan-400 tracking-wider uppercase select-all">{coupon.code}</code>
        </div>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs shadow-md transition-all active:scale-95 ${copied
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-white hover:bg-cyan-400 hover:text-white text-slate-950'
            }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 animate-bounce" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Hero carousel images with matching themes
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=90',
      label: 'New Arrivals',
      word: 'Daily Lifestyle'
    },
    {
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1400&q=90',
      label: 'Tech Collection',
      word: 'Tech Gadgets'
    },
    {
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=90',
      label: 'Fashion Week',
      word: 'Modern Fashion'
    },
    {
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=90',
      label: 'Home & Living',
      word: 'Ambient Home'
    }
  ];

  const [slideIndex, setSlideIndex] = useState(0);
  const categoryRef = useRef(null);

  const scrollCategories = (dir) => {
    categoryRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  // Auto-advance carousel every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          API.get('/categories'),
          API.get('/products?limit=4&sort=rating')
        ]);
        setCategories(catRes.data.data);
        setFeaturedProducts(prodRes.data.data);

        try {
          const couponRes = await API.get('/coupons/active');
          setActiveCoupons(couponRes.data.data || []);
        } catch (couponErr) {
          console.error('Failed to load active coupons:', couponErr);
        }
      } catch (err) {
        console.error('Home Page loading error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    { title: 'Premium Logistics', desc: 'Secure packaging and complimentary shipping on orders over ₹150.', icon: <Truck className="w-6 h-6 text-cyan-400" /> },
    { title: 'Secure Checkouts', desc: 'Encrypted tokenized processing supporting major options.', icon: <ShieldCheck className="w-6 h-6 text-indigo-400" /> },
    { title: 'Aura Returns', desc: 'Complimentary return pickups and full refunds within 30 days.', icon: <RotateCcw className="w-6 h-6 text-violet-400" /> }
  ];

  return (
    <div className="space-y-20 pb-16">

      {/* 1. HERO BANNER with Background Image Carousel */}
      <section className="relative h-[77vh] rounded-3xl overflow-hidden shadow-2xl  flex items-center">

        {/* Background image crossfade layers */}
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              opacity: i === slideIndex ? 1 : 0,
              backgroundImage: `url('${slide.image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 0
            }}
          />
        ))}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-slate-950/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent z-10" />

        {/* Neon accent blurs */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl z-10" />

        {/* Content */}
        <div className="relative z-20 w-full px-8 md:px-16 py-16">
          <div className="max-w-2xl space-y-6">

            {/* Animated badge */}
            <AnimatePresence mode="wait">
              <motion.span
                key={slideIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="inline-block text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 px-4 py-1.5 rounded-full backdrop-blur-sm"
              >
                {slides[slideIndex].label} — Spring 2026
              </motion.span>
            </AnimatePresence>

            {/* Heading with animated word */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Redefine Your{' '}<br />
              <span className="relative inline-block h-[1.2em] overflow-hidden align-bottom w-full">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={slideIndex}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent font-black"
                  >
                    {slides[slideIndex].word}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-lg">
              Discover state-of-the-art tech gadgets, structured fashion, and ambient home styling crafted for premium minds.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/products"
                className="flex items-center justify-center space-x-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95 transition-all shadow-md"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Shop Collection</span>
              </Link>
              <Link
                to="/products"
                className="flex items-center justify-center space-x-2 px-8 py-3.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all font-semibold"
              >
                <span>Explore Categories</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
              className={`transition-all duration-300 rounded-full ${i === slideIndex
                  ? 'w-6 h-2 bg-cyan-400'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. PREMIUM BRAND PILLARS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="glass-panel p-8 rounded-3xl border border-white/10 flex items-start gap-4 hover:border-cyan-500/20 transition-all duration-300"
          >
            <div className="p-3 bg-slate-100 dark:bg-slate-900/80 rounded-2xl flex-shrink-0">
              {f.icon}
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 3. CATEGORIES CAROUSEL */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Explore Categories</h2>
            <p className="text-slate-500 mt-1">Carefully conceptualized catalogs tailored to fit your preferences.</p>
          </div>
          {/* Carousel Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => scrollCategories(-1)}
              className="p-2.5 rounded-full border border-white/10 bg-white/40 dark:bg-slate-900/60 hover:bg-cyan-500/10 hover:border-cyan-500/40 text-slate-600 dark:text-slate-300 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollCategories(1)}
              className="p-2.5 rounded-full border border-white/10 bg-white/40 dark:bg-slate-900/60 hover:bg-cyan-500/10 hover:border-cyan-500/40 text-slate-600 dark:text-slate-300 transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Carousel Row */}
        <div
          ref={categoryRef}
          className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? Array(6).fill(0).map((_, i) => (
              <div key={i} className="min-w-[260px] h-64 rounded-3xl skeleton-shimmer flex-shrink-0" />
            ))
            : (categories || []).filter(c => !c.parent).map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${c.slug}`}
                className="group relative min-w-[260px] sm:min-w-[280px] h-72 rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-lg flex-shrink-0 snap-start block active:scale-98 transition-all duration-300"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/1e293b/94a3b8?text=' + encodeURIComponent(c.name); }}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 space-y-2">
                  <h3 className="text-xl font-bold text-white">{c.name}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2">{c.description}</p>
                  <div className="text-[10px] text-cyan-400 group-hover:translate-x-1.5 transition-transform duration-300 flex items-center space-x-1 font-bold uppercase tracking-wider">
                    <span>Browse Products</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS SECTION */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Featured Selections</h2>
            <p className="text-slate-500 mt-1">Our top-rated products that deliver ultimate customer satisfaction.</p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-cyan-500 hover:text-cyan-400 flex items-center space-x-1"
          >
            <span>See All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading
            ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : featuredProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}

        </div> */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading ? (
            Array(8)
              .fill(0)
              .map((_, i) => <SkeletonCard key={i} />)
          ) : featuredProducts?.length > 0 ? (
            featuredProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))
          ) : (
            <p>No featured products found</p>
          )}
        </div>
      </section>

      {/* 5. SEASONAL PROMO BANNER / ACTIVE COUPONS */}
      <section className="space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Special Deals & Coupons</h2>
          <p className="text-slate-500 mt-1">Copy these codes at checkout to unlock instant rewards and discounts.</p>
        </div>

        {activeCoupons.length === 0 ? (
          <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 dark:border-white/5 bg-slate-950 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/80 via-slate-950 to-cyan-950/80 opacity-70"></div>
            <div className="relative space-y-3 max-w-lg">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Exclusive Promo</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Unlock ₹50 Off Your Order</h2>
              <p className="text-slate-450 leading-relaxed text-sm md:text-base">
                Use checkout coupon code <code className="text-white bg-white/10 px-2 py-0.5 rounded font-bold">WELCOME50</code> for any purchase over ₹250. Valid for this month only!
              </p>
            </div>
            <div className="relative">
              <Link
                to="/products"
                className="inline-block px-8 py-3.5 rounded-full bg-white hover:bg-cyan-400 hover:text-white text-slate-950 font-bold active:scale-95 transition-all shadow-lg"
              >
                Browse Collections
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCoupons.map((coupon) => (
              <CouponCard key={coupon._id} coupon={coupon} />
            ))}
          </div>
        )}
      </section>
      {/* 6. GLOWING TESTIMONIALS */}
      {/* <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Aura Testimonials</h2>
          <p className="text-slate-500">Read verified statements from real customers globally who love shopping on Aura.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Sarah Jenkins', role: 'Art Director', review: 'Aura is an absolute aesthetic masterpiece! The product presentation matched the beautiful delivery speed, and the premium quality of the Quantum headphones is phenomenal.', stars: 5 },
            { name: 'Ethan Hunt', role: 'UX Designer', review: 'Rarely do you find an online platform with such high levels of visual elegance and detailed descriptions. Checking out with my address book and coupon was seamless.', stars: 5 },
            { name: 'Chloe Vance', role: 'Athlete', review: 'The FlexFit running shoes are easily the best gear I have owned. Seeding script details were spot on, and customer service responded in minutes. Outstanding!', stars: 5 }
          ].map((t, i) => (
            <div key={i} className="glass-panel p-8 rounded-3xl border border-white/10 shadow-md space-y-4">
              <div className="flex items-center space-x-1">
                {Array(t.stars).fill(0).map((_, j) => <Star key={j} className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-slate-650 dark:text-slate-350 text-sm italic leading-relaxed">"{t.review}"</p>
              <div>
                <h4 className="font-bold text-sm">{t.name}</h4>
                <span className="text-[10px] text-slate-450 uppercase tracking-widest">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section> */}
    </div>
  );
};

export default Home;
