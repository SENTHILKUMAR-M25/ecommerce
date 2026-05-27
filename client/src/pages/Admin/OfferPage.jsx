import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  X,
  Search,
  Pencil,
} from "lucide-react";

import API, { resolveImage } from "../../services/api";
import { useToast } from "../../components/common/ToastContext";

const SERVER_BASE =
  API.defaults.baseURL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

const OffersPage = () => {
  const { toast } = useToast();

  const [offers, setOffers] = useState([]);
  const [productList, setProductList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [searchVal, setSearchVal] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const offersPerPage = 10;

  const [editingId, setEditingId] = useState(null);

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

  /* =========================================
      FETCH
  ========================================= */

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

  /* =========================================
      FORM
  ========================================= */

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

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* =========================================
      UPLOAD
  ========================================= */

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const uploadData = new FormData();

    uploadData.append("images", file);

    try {
      setUploadingBanner(true);

      const { data } = await API.post("/upload", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = `${SERVER_BASE}${data.data[0]}`;

      setFormData((prev) => ({
        ...prev,
        banner: imageUrl,
      }));

      toast("Banner uploaded successfully!", "success");
    } catch (error) {
      toast("Failed to upload banner", "error");
    } finally {
      setUploadingBanner(false);
    }
  };

  /* =========================================
      SAVE
  ========================================= */

  const handleSaveOffer = async () => {
    try {
      if (
        !formData.title ||
        !formData.slug ||
        !formData.discountValue
      ) {
        return toast("Please fill required fields", "error");
      }

      setLoading(true);

      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minPurchase: Number(formData.minPurchase || 0),
      };

      if (editingId) {
        const res = await API.put(`/offers/${editingId}`, payload);

        setOffers((prev) =>
          prev.map((o) =>
            o._id === editingId ? res.data.data : o
          )
        );

        toast("Offer updated!", "success");
      } else {
        const res = await API.post("/offers", {
          ...payload,
          isActive: true,
        });

        setOffers((prev) => [res.data.data, ...prev]);

        toast("Offer created!", "success");
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      toast(
        error?.response?.data?.message ||
          "Something went wrong",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
      DELETE
  ========================================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this offer?")) return;

    try {
      await API.delete(`/offers/${id}`);

      setOffers((prev) =>
        prev.filter((o) => o._id !== id)
      );

      toast("Offer deleted", "success");
    } catch (error) {
      toast("Failed to delete offer", "error");
    }
  };

  /* =========================================
      TOGGLE
  ========================================= */

  const handleToggle = async (id) => {
    try {
      await API.put(`/offers/${id}/toggle`);

      fetchOffers();
    } catch (error) {
      console.log(error);
    }
  };

  /* =========================================
      EDIT
  ========================================= */

  const setEditMode = (offer) => {
    setEditingId(offer._id);

    setFormData({
      title: offer.title || "",
      slug: offer.slug || "",
      banner: offer.banner || "",
      type: offer.type || "seasonal",
      discountType:
        offer.discountType || "percentage",
      discountValue: offer.discountValue || "",
      startDate: offer.startDate?.slice(0, 16) || "",
      endDate: offer.endDate?.slice(0, 16) || "",
      minPurchase: offer.minPurchase || "",
      products: offer.products || [],
      category: offer.category || "",
      couponCode: offer.couponCode || "",
    });

    setShowModal(true);
  };

  /* =========================================
      SEARCH + PAGINATION
  ========================================= */

  const filteredOffers = offers.filter((o) =>
    o.title
      ?.toLowerCase()
      .includes(searchVal.toLowerCase())
  );

  const totalPages = Math.ceil(
    filteredOffers.length / offersPerPage
  );

  const indexOfLast = currentPage * offersPerPage;

  const indexOfFirst =
    indexOfLast - offersPerPage;

  const currentOffers = filteredOffers.slice(
    indexOfFirst,
    indexOfLast
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchVal]);

  /* =========================================
      UI
  ========================================= */

  return (
    <div className="min-h-screen p-4 md:p-8 text-white relative overflow-hidden">
      {/* BG */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/20 blur-[140px] rounded-full" />

      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/20 blur-[140px] rounded-full" />

      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Offer Management
            </h1>

            <p className="text-slate-400 mt-2">
              Manage discounts, promotions and
              seasonal campaigns
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] transition-all font-bold shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-5 h-5" />
            Create Offer
          </button>
        </div>

        {/* TOP BAR */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          {/* SEARCH */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search offers..."
              value={searchVal}
              onChange={(e) =>
                setSearchVal(e.target.value)
              }
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          <div className="text-sm text-slate-400">
            Total Offers:{" "}
            <span className="font-bold text-cyan-400">
              {filteredOffers.length}
            </span>
          </div>
        </div>

        {/* TABLE */}
        <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl">
          {/* DESKTOP */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-black dark:text-white text-xs uppercase tracking-widest">
                  <th className="px-6 py-5 text-left">
                    Offer
                  </th>

                  <th className="px-6 py-5 text-left">
                    Type
                  </th>

                  <th className="px-6 py-5 text-left">
                    Discount
                  </th>

                  <th className="px-6 py-5 text-left">
                    Duration
                  </th>

                  <th className="px-6 py-5 text-center">
                    Status
                  </th>

                  <th className="px-6 py-5 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentOffers.map((offer) => (
                  <tr
                    key={offer._id}
                    className="border-b border-white/5 hover:bg-cyan-500/[0.03] transition-all"
                  >
                    {/* OFFER */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={resolveImage(
                            offer.banner
                          )}
                          alt=""
                          className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                        />

                        <div>
                          <h2 className="font-bold text-black dark:text-white">
                            {offer.title}
                          </h2>

                          <p className="text-xs text-slate-500 mt-1">
                            /{offer.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* TYPE */}
                    <td className="px-6 py-5">
                      <span className="px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase">
                        {offer.type}
                      </span>
                    </td>

                    {/* DISCOUNT */}
                    <td className="px-6 py-5">
                      <span className="font-black text-xl text-black dark:text-white">
                        {offer.discountValue}
                        {offer.discountType ===
                        "percentage"
                          ? "%"
                          : "₹"}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-5 text-sm text-slate-400">
                      {offer.startDate
                        ? new Date(
                            offer.startDate
                          ).toLocaleDateString()
                        : "N/A"}{" "}
                      →
                      {offer.endDate
                        ? new Date(
                            offer.endDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <button
                          onClick={() =>
                            handleToggle(offer._id)
                          }
                          className={`px-4 py-2 rounded-full text-xs font-black uppercase ${
                            offer.isActive
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {offer.isActive
                            ? "Live"
                            : "Paused"}
                        </button>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() =>
                            setEditMode(offer)
                          }
                          className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-500/20"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(offer._id)
                          }
                          className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div className="lg:hidden p-4 space-y-4">
            {currentOffers.map((offer) => (
              <div
                key={offer._id}
                className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4"
              >
                <div className="flex gap-4">
                  <img
                    src={resolveImage(offer.banner)}
                    alt=""
                    className="w-24 h-24 rounded-2xl object-cover"
                  />

                  <div className="flex-1">
                    <h2 className="font-bold text-lg">
                      {offer.title}
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      /{offer.slug}
                    </p>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] uppercase font-bold">
                        {offer.type}
                      </span>

                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold">
                        {offer.discountValue}
                        {offer.discountType ===
                        "percentage"
                          ? "%"
                          : "₹"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() =>
                      handleToggle(offer._id)
                    }
                    className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase ${
                      offer.isActive
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {offer.isActive
                      ? "Live"
                      : "Paused"}
                  </button>

                  <button
                    onClick={() =>
                      setEditMode(offer)
                    }
                    className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(offer._id)
                    }
                    className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PAGINATION */}
        {filteredOffers.length > offersPerPage && (
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) => prev - 1)
              }
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 disabled:opacity-40"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;

              return (
                <button
                  key={page}
                  onClick={() =>
                    setCurrentPage(page)
                  }
                  className={`w-12 h-12 rounded-2xl font-bold transition-all ${
                    currentPage === page
                      ? "bg-cyan-500 text-white"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => prev + 1)
              }
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 40,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                y: 40,
              }}
              className="w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0B1120] p-6 md:p-8 shadow-2xl"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black">
                    {editingId
                      ? "Update Offer"
                      : "Create Offer"}
                  </h2>

                  <p className="text-slate-400 mt-1">
                    Configure premium discount
                    campaigns
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* FORM */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* TITLE */}
                <div>
                  <label className="text-xs uppercase text-slate-500 font-bold">
                    Title
                  </label>

                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                        slug: generateSlug(
                          e.target.value
                        ),
                      }))
                    }
                    className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                {/* SLUG */}
                <div>
                  <label className="text-xs uppercase text-slate-500 font-bold">
                    Slug
                  </label>

                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                {/* DISCOUNT */}
                <div>
                  <label className="text-xs uppercase text-slate-500 font-bold">
                    Discount
                  </label>

                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                {/* TYPE */}
                <div>
                  <label className="text-xs uppercase text-slate-500 font-bold">
                    Offer Type
                  </label>

                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 outline-none"
                  >
                    <option value="seasonal">
                      Seasonal
                    </option>

                    <option value="combo">
                      Combo
                    </option>

                    <option value="category">
                      Category
                    </option>

                    <option value="product">
                      Product
                    </option>

                    <option value="coupon">
                      Coupon
                    </option>
                  </select>
                </div>

                {/* DISCOUNT TYPE */}
                <div>
                  <label className="text-xs uppercase text-slate-500 font-bold">
                    Discount Type
                  </label>

                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 outline-none"
                  >
                    <option value="percentage">
                      Percentage
                    </option>

                    <option value="flat">
                      Flat
                    </option>
                  </select>
                </div>

                {/* MIN PURCHASE */}
                <div>
                  <label className="text-xs uppercase text-slate-500 font-bold">
                    Minimum Purchase
                  </label>

                  <input
                    type="number"
                    name="minPurchase"
                    value={formData.minPurchase}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none"
                  />
                </div>

                {/* START DATE */}
                <div>
                  <label className="text-xs uppercase text-slate-500 font-bold">
                    Start Date
                  </label>

                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none [color-scheme:dark]"
                  />
                </div>

                {/* END DATE */}
                <div>
                  <label className="text-xs uppercase text-slate-500 font-bold">
                    End Date
                  </label>

                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none [color-scheme:dark]"
                  />
                </div>

                {/* BANNER */}
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="text-xs uppercase text-slate-500 font-bold">
                    Banner
                  </label>

                  <div className="mt-2 rounded-2xl border border-dashed border-white/10 p-4 bg-white/5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="w-full text-sm"
                    />

                    {formData.banner && (
                      <img
                        src={resolveImage(
                          formData.banner
                        )}
                        alt=""
                        className="mt-4 w-full h-40 rounded-2xl object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-wrap gap-4 mt-10">
                <button
                  onClick={handleSaveOffer}
                  disabled={loading}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 flex items-center gap-3"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}

                  {editingId
                    ? "Update Offer"
                    : "Create Offer"}
                </button>

                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OffersPage;