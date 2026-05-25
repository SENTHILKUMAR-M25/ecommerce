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

  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    category: "",
  });

  // ── Fetch on mount ───────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchAdminSubCategories());
    dispatch(fetchAdminCategories());
  }, [dispatch]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("images", file); // server uses upload.array('images')

      const { data } = await API.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Response shape: { success: true, data: ['/uploads/images-xxx.jpg'] }
      const url = data.data?.[0];
      if (url) {
        setFormData((prev) => ({
          ...prev,
          image: `${SERVER_BASE}${url}`,
        }));
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
        await dispatch(
          editAdminSubCategory({ id: editingId, subData: formData })
        ).unwrap();
        toast("Subcategory updated successfully!", "success");
      } else {
        await dispatch(addAdminSubCategory(formData)).unwrap();
        toast("Subcategory created successfully!", "success");
      }
      resetForm();
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subcategory? This cannot be undone."))
      return;
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

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-16">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
          <FolderTree size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Sub-Category Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and manage subcategories linked to parent categories.
          </p>
        </div>
      </div>

      {/* ── Create / Edit Form ── */}
      <div className="glass-panel rounded-[2rem] p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold">
            {editingId ? "Edit Subcategory" : "Create Subcategory"}
          </h2>
          {editingId && (
            <button
              onClick={resetForm}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 gap-6 text-xs"
        >
          {/* Name */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Subcategory Name *
            </span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Men's Shirts"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 px-4 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Parent Category */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Parent Category *
            </span>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 px-4 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="">Select parent category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Subcategory Image
            </span>

            {/* Drop zone */}
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl py-8 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow">
                <ImagePlus size={22} />
              </div>
              <span className="font-bold text-sm text-slate-500 group-hover:text-indigo-500 transition">
                {uploading ? "Uploading…" : "Click to upload image"}
              </span>
              <span className="text-[10px] text-slate-400">
                PNG · JPG · WEBP
              </span>
            </label>

            {/* URL fallback */}
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Or paste an image URL directly"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 px-4 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-500"
            />

            {/* Preview */}
            {formData.image && (
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow">
                <img
                  src={resolveImage(formData.image)}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/128x128/1e293b/94a3b8?text=IMG";
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, image: "" }))
                  }
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Description
            </span>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of this subcategory…"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 px-4 py-3 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex gap-3 pt-2">
            <button
              type="submit"
              disabled={actionLoading}
              className="px-7 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-full font-bold text-xs shadow hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={14} />
              {editingId ? "Save Changes" : "Create Subcategory"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 border rounded-full font-bold text-xs"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Subcategory Table ── */}
      <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/10 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-900/20">
              <tr className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="p-5">Image</th>
                <th className="p-5">Name / Slug</th>
                <th className="p-5">Parent Category</th>
                <th className="p-5">Description</th>
                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-10 text-slate-400"
                  >
                    Loading subcategories…
                  </td>
                </tr>
              ) : subcategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-10 text-slate-400"
                  >
                    No subcategories yet. Create one above.
                  </td>
                </tr>
              ) : (
                subcategories.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition"
                  >
                    {/* Image */}
                    <td className="p-5">
                      <img
                        src={resolveImage(item.image)}
                        alt={item.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/56x56/1e293b/94a3b8?text=IMG";
                        }}
                      />
                    </td>

                    {/* Name + slug */}
                    <td className="p-5">
                      <p className="font-bold text-sm text-slate-800 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mt-0.5">
                        {item.slug}
                      </p>
                    </td>

                    {/* Parent category */}
                    <td className="p-5">
                      <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-[10px] uppercase tracking-wider">
                        {item.category?.name || "—"}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="p-5 text-slate-500 max-w-xs">
                      <p className="line-clamp-2 leading-relaxed">
                        {item.description || "—"}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSubCategories;