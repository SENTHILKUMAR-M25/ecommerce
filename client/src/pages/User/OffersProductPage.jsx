import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Tag, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  ShoppingBag, 
  Clock,
  ArrowLeft,
  LayoutGrid,
  Percent,
  IndianRupee,
  BadgePercent
} from "lucide-react";
import API from "../../services/api";
import ProductCard from "../../components/common/ProductCard";
import SkeletonCard from "../../components/common/SkeletonCard";
import CountdownTimer from "../../components/common/CountdownTimer";

const OffersProductPage = () => {
  const { slug } = useParams();
  const [offer, setOffer] = useState(null);
  const [offers, setOffers] = useState([]); // For the side listing
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all active offers for the sidebar
        const activeOffersRes = await API.get("/offers/active");
        setOffers(activeOffersRes.data.data);

        // If slug is present, fetch specific offer
        if (slug) {
          const res = await API.get(`/offers/slug/${slug}`);
          console.log("FETCHED OFFER:", res.data.data);
          setOffer(res.data.data);
        } else if (activeOffersRes.data.data.length > 0) {
          // If no slug, just set the first one as selected for the listing view
          setOffer(activeOffersRes.data.data[0]);
        }
      } catch (err) {
        console.error("Error fetching offer data:", err);
        setError(err.response?.data?.message || "Failed to load offer details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse"></div>
              ))}
            </div>
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="bg-rose-500/10 p-6 rounded-full inline-block">
            <Tag className="w-12 h-12 text-rose-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">Offer Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400">{error || "The offer you are looking for might have expired or doesn't exist."}</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-2xl font-bold transition-all shadow-xl">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = new Date(offer.endDate) < new Date();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      {/* Breadcrumbs & Header */}
      <div className="sticky top-16 z-10 bg-white dark:bg-slate-950 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          <Link to="/" className="hover:text-cyan-500 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/offers" className="hover:text-cyan-500 transition-colors">Offers</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-cyan-500">{offer.title}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              {offer.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-2">
              <BadgePercent className="w-5 h-5 text-cyan-500" />
              Exclusive deals curated just for you
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="glass-panel px-6 py-3 rounded-2xl border border-white/10 dark:border-white/5 bg-white dark:bg-slate-900 flex items-center gap-3">
               <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Ends In</p>
                  <CountdownTimer targetDate={offer.endDate} />
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Sidebar - Other Offers */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-36 space-y-6">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-lg dark:text-white">Recent Promotions</h3>
              </div>
              <div className="space-y-4">
                {offers.map((o) => (
                  <Link
                    key={o._id}
                    to={`/offers/${o.slug}`}
                    className={`block p-4 rounded-2xl transition-all border ${
                      offer._id === o._id
                        ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/30 ring-1 ring-indigo-500/20 shadow-lg"
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200"
                    }`}
                  >
                    <h4 className={`font-bold text-sm mb-1 ${offer._id === o._id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200"}`}>
                      {o.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs font-black text-slate-400">
                       <span>{o.discountValue}{o.discountType === 'percentage' ? '%' : '₹'} OFF</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            
            {/* Banner Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[16/9] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/5"
            >
              <img 
                src={offer.banner || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80"} 
                alt={offer.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/50 to-transparent flex items-center px-8 md:px-16">
                <div className="max-w-xl space-y-6">
                   <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20">
                     <Sparkles className="w-3.5 h-3.5" />
                     <span>Exclusive Promotion</span>
                   </div>
                   
                   <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
                     Save <span className="text-cyan-400">{offer.discountValue}{offer.discountType === 'percentage' ? '%' : '₹'}</span> on <br className="hidden md:block" />
                     Premium Aura
                   </h2>

                   <div className="flex flex-wrap items-center gap-8 pt-2">
                      
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Expiring</p>
                        <p className="font-bold text-white text-xl">
                          {offer.endDate ? new Date(offer.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Ongoing'}
                        </p>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Products Listing */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  Related Products
                  <span className="h-1 w-12 bg-indigo-500 rounded-full"></span>
                </h3>
              </div>

              {offer.products && offer.products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {offer.products.filter(p => p !== null).map((product) => {
                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <ProductCard product={product} offer={offer} />
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 glass-panel rounded-[2.5rem] bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
                  <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold dark:text-white">Storewide Discount Applied</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                    This offer applies to all eligible premium items in our catalog. Start exploring our collections.
                  </p>
                  <Link to="/products" className="mt-8 inline-flex items-center gap-2 bg-slate-900 dark:bg-cyan-500 text-white px-8 py-3.5 rounded-2xl font-black transition-all shadow-xl active:scale-95">
                    Browse Catalog
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Terms & Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-slate-200 dark:border-slate-800">
               <div className="space-y-2">
                 <h4 className="font-black text-sm uppercase tracking-widest text-slate-400">Rules</h4>
                 <p className="text-sm font-bold text-slate-800 dark:text-white">Min Purchase: ₹{offer.minPurchase || 0}</p>
                 <p className="text-xs text-slate-500">Apply coupon code <span className="text-indigo-500 font-bold">AURA{offer.discountValue}</span> at checkout.</p>
               </div>
               <div className="space-y-2">
                 <h4 className="font-black text-sm uppercase tracking-widest text-slate-400">Validity</h4>
                 <p className="text-sm font-bold text-slate-800 dark:text-white">Ends: {offer.endDate ? new Date(offer.endDate).toLocaleDateString() : 'N/A'}</p>
                 <p className="text-xs text-slate-500">Subject to terms and conditions of Aura Premium.</p>
               </div>
               <div className="space-y-2">
                 <h4 className="font-black text-sm uppercase tracking-widest text-slate-400">Shipping</h4>
                 <p className="text-sm font-bold text-slate-800 dark:text-white">Express Delivery Included</p>
                 <p className="text-xs text-slate-500">All discounted items eligible for priority aura shipping.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersProductPage;
