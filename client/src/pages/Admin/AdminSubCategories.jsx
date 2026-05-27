import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminSubCategories,
  addAdminSubCategory,
  editAdminSubCategory,
  deleteAdminSubCategory,
  fetchAdminCategories,
} from "../../redux/slices/adminSlice";
import { useToast } from "../../components/common/ToastContext";
import API, { resolveImage } from "../../services/api";
import { Plus, Pencil, Trash2, FolderTree, ImagePlus, X } from "lucide-react";

const SERVER_BASE =
  API.defaults.baseURL?.replace(/\/api\/?$/, "") || "http://localhost:5000";

const AdminSubCategories = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { subcategories, categories, loading, actionLoading } = useSelector(
    (state) => state.admin
  );

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    category: "",
  });

  useEffect(() => {
    dispatch(fetchAdminSubCategories());
    dispatch(fetchAdminCategories());
  }, [dispatch]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("images", file);
      const { data } = await API.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = data.data?.[0];
      if (url) {
        setFormData((prev) => ({ ...prev, image: `${SERVER_BASE}${url}` }));
        toast("Image uploaded successfully", "success");
      }
    } catch {
      toast("Image upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category) {
      toast("Name and parent category are required.", "error");
      return;
    }
    try {
      if (editingId) {
        await dispatch(editAdminSubCategory({ id: editingId, subData: formData })).unwrap();
        toast("Subcategory updated successfully!", "success");
      } else {
        await dispatch(addAdminSubCategory(formData)).unwrap();
        toast("Subcategory created successfully!", "success");
      }
      resetForm();
      setShowModal(false);
    } catch (err) {
      toast(err || "Failed to save subcategory.", "error");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      image: item.image || "",
      category: item.category?._id || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subcategory? This cannot be undone.")) return;
    try {
      await dispatch(deleteAdminSubCategory(id)).unwrap();
      toast("Subcategory deleted.", "info");
    } catch (err) {
      toast(err || "Failed to delete subcategory.", "error");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", image: "", category: "" });
  };

  return (
    <div className="space-y-8 pb-20">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-sky-500 flex items-center justify-center shadow-xl shadow-cyan-500/20">
            <FolderTree size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Subcategory Manager
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage all ecommerce subcategories.
            </p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-cyan-500/20"
        >
          <Plus size={18} />
          Create Subcategory
        </button>
      </div>

      {/* TABLE */}
      <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-lg">

        {/* DESKTOP */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 text-slate-500 uppercase text-[11px] tracking-widest">
                <th className="px-6 py-5 text-left">Image</th>
                <th className="px-6 py-5 text-left">Name</th>
                <th className="px-6 py-5 text-left">Category</th>
                <th className="px-6 py-5 text-left">Description</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-16 text-slate-400">Loading…</td></tr>
              ) : subcategories.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-slate-400">No subcategories yet. Click "Create Subcategory" to add one.</td></tr>
              ) : subcategories.map((item) => (
                <tr key={item._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-cyan-500/[0.03] transition-all">
                  <td className="px-6 py-5">
                    <img
                      src={resolveImage(item.image)}
                      alt={item.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/64x64/1e293b/94a3b8?text=IMG"; }}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <h3 className="font-bold text-slate-800 dark:text-white">{item.name}</h3>
                    <p className="text-[10px] text-cyan-500 uppercase font-bold tracking-widest mt-1">{item.slug}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-widest">
                      {item.category?.name || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-5 max-w-sm">
                    <p className="line-clamp-2 text-slate-500 leading-relaxed">{item.description || "No description"}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="lg:hidden p-4 space-y-4">
          {loading ? (
            <p className="text-center py-12 text-slate-400 text-sm">Loading…</p>
          ) : subcategories.length === 0 ? (
            <p className="text-center py-12 text-slate-400 text-sm">No subcategories yet.</p>
          ) : subcategories.map((item) => (
            <div key={item._id} className="rounded-3xl border border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-4">
              <div className="flex gap-4">
                <img
                  src={resolveImage(item.image)}
                  alt={item.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/1e293b/94a3b8?text=IMG"; }}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-lg text-slate-800 dark:text-white">{item.name}</h2>
                      <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mt-1">{item.slug}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase shrink-0">
                      {item.category?.name || "—"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-3 line-clamp-2">{item.description || "No description"}</p>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 py-2.5 rounded-2xl bg-blue-500/10 text-blue-500 font-bold hover:bg-blue-500 hover:text-white transition-all text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex-1 py-2.5 rounded-2xl bg-rose-500/10 text-rose-500 font-bold hover:bg-rose-500 hover:text-white transition-all text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white dark:bg-slate-950 border border-white/10 shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-950 z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                  {editingId ? "Edit Subcategory" : "Create Subcategory"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">Fill all required fields carefully.</p>
              </div>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL FORM */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">

              {/* NAME */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-slate-400">Subcategory Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Men's Shirts"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-5 py-3 outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />
              </div>

              {/* PARENT CATEGORY */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-slate-400">Parent Category *</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-5 py-3 outline-none focus:ring-2 focus:ring-cyan-500 transition"
                >
                  <option value="">Select parent category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* IMAGE */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-slate-400">Image</label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl py-6 cursor-pointer hover:border-cyan-500 hover:bg-cyan-500/5 transition">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  <ImagePlus size={24} className="text-cyan-500" />
                  <span className="text-sm font-bold text-slate-500">
                    {uploading ? "Uploading…" : "Click to upload image"}
                  </span>
                  <span className="text-xs text-slate-400">PNG · JPG · WEBP</span>
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="Or paste image URL directly"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-5 py-3 outline-none focus:ring-2 focus:ring-cyan-500 transition text-sm"
                />
                {formData.image && (
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img
                      src={resolveImage(formData.image)}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/96x96/1e293b/94a3b8?text=IMG"; }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-slate-400">Description</label>
                <textarea
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of this subcategory…"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-5 py-4 outline-none focus:ring-2 focus:ring-cyan-500 transition resize-none"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black shadow-lg hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-60"
                >
                  {actionLoading ? "Saving…" : editingId ? "Update Subcategory" : "Create Subcategory"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubCategories;
