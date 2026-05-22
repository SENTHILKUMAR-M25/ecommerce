import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Tag,
  Calendar,
  Percent,
  IndianRupee,
  Sparkles,
  Loader2,
} from "lucide-react";

import API from "../../services/api";
import { useToast } from "../../components/common/ToastContext";

const OffersPage = () => {
  const [loading, setLoading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    banner: "",
    type: "seasonal",
    discountType: "percentage",
    discountValue: "",
    startDate: "",
    endDate: "",
    minPurchase: "",
    products: [],
    category: "",
    couponCode: "",
  });

  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      slug: "",
      banner: "",
      type: "seasonal",
      discountType: "percentage",
      discountValue: "",
      startDate: "",
      endDate: "",
      minPurchase: "",
      products: [],
      category: "",
      couponCode: "",
    });
  };

  /* =========================
      BANNER UPLOAD
  ========================= */

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("images", file); // Backend expects 'images' field

    try {
      setUploadingBanner(true);
      const { data } = await API.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Assuming backend returns an array in data.data
      const imageUrl = `http://localhost:5000${data.data[0]}`;
      setFormData((prev) => ({ ...prev, banner: imageUrl }));
      toast("Banner uploaded successfully!", "success");
    } catch (error) {
      console.error("Upload error:", error);
      toast("Failed to upload banner", "error");
    } finally {
      setUploadingBanner(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  useEffect(() => {
    // Only auto-generate if the slug is empty or was previously auto-generated from title
    // For simplicity here, we'll just update it if the user hasn't typed anything in slug yet
    if (formData.title && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(formData.title) }));
    }
  }, [formData.title]);

  const [offers, setOffers] = useState([]);
  const [productList, setProductList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  /* =========================
      FETCH DATA
  ========================= */

  useEffect(() => {
    fetchOffers();
    fetchSupportData();
  }, []);

  const fetchSupportData = async () => {
    try {
      const prodRes = await API.get("/products");
      setProductList(prodRes.data.data);

      const catRes = await API.get("/categories");
      setCategoryList(catRes.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);

      const res = await API.get("/offers");

      setOffers(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      HANDLE INPUT
  ========================= */

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* =========================
      CREATE OFFER
  ========================= */

  const handleSaveOffer = async () => {
    try {
      // VALIDATION
      if (!formData.title || !formData.slug || !formData.discountValue || !formData.type || !formData.discountType) {
        return toast("Please fill out all required fields (Title, Slug, Type, Discount)", "error");
      }

      setLoading(true);

      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minPurchase: formData.minPurchase ? Number(formData.minPurchase) : 0,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      if (editingId) {
        const res = await API.put(`/offers/${editingId}`, payload);
        setOffers((prev) => prev.map(o => o._id === editingId ? res.data.data : o));
        toast("Offer updated successfully!", "success");
      } else {
        const res = await API.post("/offers", { ...payload, isActive: true });
        setOffers((prev) => [res.data.data, ...prev]);
        toast("Offer created successfully!", "success");
      }

      resetForm();
    } catch (error) {
      console.error("DEBUG -> Offer Action Error:", error);
      const message = typeof error === 'string' ? error : error.response?.data?.message || "Something went wrong while connecting to the server.";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      TOGGLE OFFER
  ========================= */

  const handleToggle = async (id) => {
    try {
      await API.put(`/offers/${id}/toggle`);
      fetchOffers();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    try {
      setLoading(true);
      await API.delete(`/offers/${id}`);
      setOffers(prev => prev.filter(o => o._id !== id));
      toast("Offer deleted successfully", "success");
    } catch (error) {
      toast("Failed to delete offer", "error");
    } finally {
      setLoading(false);
    }
  };

  const setEditMode = (offer) => {
    setEditingId(offer._id);
    
    // Helper to format ISO date for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatDateTime = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = (new Date(date - tzOffset)).toISOString().slice(0, 16);
      return localISOTime;
    };

    setFormData({
      title: offer.title || "",
      slug: offer.slug || "",
      banner: offer.banner || "",
      type: offer.type || "seasonal",
      discountType: offer.discountType || "percentage",
      discountValue: offer.discountValue || "",
      startDate: formatDateTime(offer.startDate),
      endDate: formatDateTime(offer.endDate),
      minPurchase: offer.minPurchase || "",
      products: offer.products || [],
      category: offer.category || "",
      couponCode: offer.couponCode || "",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/20 blur-[140px] rounded-full" />

      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/20 blur-[140px] rounded-full" />

      <div className="relative z-10 p-6 md:p-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">
            Offer Management
          </h1>

          <p className="text-gray-400 mt-3 text-lg">
            Create and manage premium e-commerce offers
          </p>
        </motion.div>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* TITLE */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Offer Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    title: val,
                    slug: generateSlug(val)
                  }));
                }}
                placeholder="e.g. Summer Bonanza"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all placeholder:text-slate-600"
              />
            </div>

            {/* SLUG */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Offer Slug
              </label>

              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="summer-bonanza"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all placeholder:text-slate-600"
              />
            </div>

            {/* BANNER UPLOAD */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Banner Media {uploadingBanner && <span className="text-cyan-400 animate-pulse">(Uploading...)</span>}
              </label>

              <div className="flex flex-col gap-3">
                <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 h-12 flex items-center px-4 hover:border-cyan-500/30 transition-all">
                   <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={uploadingBanner}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                   />
                   <div className="flex items-center gap-2 text-slate-400 group-hover:text-cyan-400 transition-colors">
                     <Plus className="w-4 h-4" />
                     <span className="text-xs font-bold truncate">
                       {formData.banner ? "Change Banner File" : "Choose Banner File"}
                     </span>
                   </div>
                </div>
                
                {formData.banner && (
                  <div className="relative w-full h-12 rounded-lg overflow-hidden border border-white/5">
                    <img src={formData.banner} alt="Preview" className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center px-3 bg-black/40">
                      <p className="text-[10px] text-emerald-400 font-mono truncate">{formData.banner}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TYPE */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Offer Type
              </label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all appearance-none cursor-pointer"
              >
                <option value="seasonal" className="bg-slate-900 text-white">Seasonal Promotion</option>
                <option value="combo" className="bg-slate-900 text-white">Combo Bundle</option>
                <option value="category" className="bg-slate-900 text-white">Category Special</option>
                <option value="product" className="bg-slate-900 text-white">Product Specific</option>
                <option value="coupon" className="bg-slate-900 text-white">Coupon Code Based</option>
              </select>
            </div>

            {/* DISCOUNT TYPE */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Discount Strategy
              </label>

              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all appearance-none cursor-pointer"
              >
                <option value="percentage" className="bg-slate-900 text-white">Percentage (%)</option>
                <option value="flat" className="bg-slate-900 text-white">Flat Amount (₹)</option>
              </select>
            </div>

            {/* DISCOUNT VALUE */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Amount / Percent
              </label>

              <div className="relative">
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all placeholder:text-slate-600"
                />

                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                   {formData.discountType === "percentage" ? (
                     <Percent className="w-5 h-5" />
                   ) : (
                     <IndianRupee className="w-5 h-5" />
                   )}
                </div>
              </div>
            </div>

            {/* START DATE */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Launch Date & Time
              </label>

              <div className="relative">
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all [color-scheme:dark]"
                />

                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* END DATE */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Expiration Date & Time
              </label>

              <div className="relative">
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all [color-scheme:dark]"
                />

                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* MIN PURCHASE */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Minimum Spend (₹)
              </label>

              <input
                type="number"
                name="minPurchase"
                value={formData.minPurchase}
                onChange={handleChange}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all placeholder:text-slate-600"
              />
            </div>

            {/* CONDITIONAL PRODUCT SELECTION */}
            {formData.type === "product" && (
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Targeted Products <span className="text-slate-500 text-[10px] ml-2">(Hold Ctrl to select multiple)</span>
                </label>
                <select
                  multiple
                  name="products"
                  value={formData.products}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData(prev => ({ ...prev, products: values }));
                  }}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all h-32 scrollbar-thin scrollbar-thumb-cyan-500/20"
                >
                  {productList.map(p => (
                    <option key={p._id} value={p._id} className="bg-slate-900 text-white p-2 border-b border-white/5 last:border-0">{p.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-wider ml-1">
                   Inventory matching — {formData.products.length} units selected
                </p>
              </div>
            )}

            {/* CONDITIONAL CATEGORY SELECTION */}
            {formData.type === "category" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Target Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="text-slate-500">Pick a category</option>
                  {categoryList.map(c => (
                    <option key={c._id} value={c.name} className="bg-slate-900 text-white">{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* CONDITIONAL COUPON CODE */}
            {formData.type === "coupon" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  name="couponCode"
                  value={formData.couponCode}
                  onChange={handleChange}
                  placeholder="e.g. SUMMER50"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all placeholder:text-slate-600 font-mono tracking-widest uppercase"
                />
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-white/10 pt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveOffer}
              disabled={loading}
              className="flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-indigo-600 px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-cyan-500/20 disabled:opacity-50 hover:shadow-cyan-500/40 transition-all text-white"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                editingId ? <Sparkles className="w-5 h-5" /> : <Plus className="w-5 h-5" />
              )}
              <span>{editingId ? "Update Offer" : "Initialize Offer"}</span>
            </motion.button>

            {editingId && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetForm}
                className="flex items-center gap-3 bg-white/5 border border-white/10 px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all text-slate-400"
              >
                <span>Cancel</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* OFFER LIST */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <motion.div
              key={offer._id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="group glass-panel rounded-3xl p-8 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden bg-white/5 backdrop-blur-md"
            >
              {/* Decorative Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full group-hover:bg-cyan-500/20 transition-all" />
              
              <div className="relative z-10 space-y-6">
                {/* TOP: Title & Status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-cyan-500/10 p-3.5 rounded-2xl border border-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
                      <Tag className="text-cyan-400 w-6 h-6" />
                    </div>

                    <div>
                      <h2 className="font-black text-xl text-white tracking-tight leading-tight">
                        {offer.title}
                      </h2>

                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        {offer.type} Selection
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditMode(offer)}
                      className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/30 transition-all"
                      title="Edit Offer"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(offer._id)}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/30 transition-all"
                      title="Delete Offer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(offer._id)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all shadow-sm ${
                        offer.isActive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {offer.isActive ? "Live" : "Paused"}
                    </button>
                  </div>
                </div>

                {/* MIDDLE: Discount Display */}
                <div className="py-4 border-y border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
                    <span className="text-3xl font-black text-white">
                      {offer.discountValue}{offer.discountType === "percentage" ? "%" : "₹"}
                    </span>
                    <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest ml-1">Reduction</span>
                  </div>

                  {offer.slug && (
                    <div className="text-[10px] bg-white/5 px-3 py-1 rounded-lg border border-white/5 text-slate-400 font-mono">
                      /{offer.slug}
                    </div>
                  )}
                </div>

                {/* BOTTOM: Meta Details */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-slate-400">
                     <Calendar className="w-4 h-4 text-cyan-500/50" />
                     <p className="text-xs font-bold">
                        {offer.startDate ? new Date(offer.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'} 
                        <span className="mx-2 text-slate-700">→</span>
                        {offer.endDate ? new Date(offer.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                     </p>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400">
                     <IndianRupee className="w-4 h-4 text-cyan-500/50" />
                     <p className="text-xs font-bold">
                        Min. Order: ₹{offer.minPurchase || 0}
                     </p>
                  </div>

                  {offer.type === 'coupon' && offer.couponCode && (
                    <div className="flex items-center gap-3 text-amber-400 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
                       <Tag className="w-4 h-4" />
                       <p className="text-xs font-black uppercase tracking-widest leading-none">
                          CODE: {offer.couponCode}
                       </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OffersPage;