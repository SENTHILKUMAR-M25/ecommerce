import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchAdminCategories, 
  addAdminCategory, 
  editAdminCategory, 
  deleteAdminCategory 
} from '../../redux/slices/adminSlice';
import { useToast } from '../../components/common/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Plus, Edit2, Trash2, X, FolderMinus } from 'lucide-react';
import API from '../../services/api';

// Derive server origin from API baseURL (strips /api suffix)
const SERVER_BASE = API.defaults.baseURL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';


const CategoryManager = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { categories, loading, actionLoading } = useSelector((state) => state.admin);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminCategories());
  }, [dispatch]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setImage('');
    setUploadingImage(false);
    setEditingId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (c) => {
    setEditingId(c._id);
    setName(c.name);
    setDescription(c.description);
    setImage(c.image);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description) {
      toast('Please enter name and description fields.', 'error');
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const imgUrl = image.trim() || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80'; // fallback architecture image

    const catPayload = { name, slug, description, image: imgUrl };

    try {
      if (editingId) {
        await dispatch(editAdminCategory({ id: editingId, catData: catPayload })).unwrap();
        toast('Category updated successfully!', 'success');
      } else {
        await dispatch(addAdminCategory(catPayload)).unwrap();
        toast('New category created successfully!', 'success');
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast(err || 'Failed to save category changes.', 'error');
    }
  };

  const handleDelete = async (catId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this category? If products are linked to it, they might become unassigned.')) {
      return;
    }

    try {
      await dispatch(deleteAdminCategory(catId)).unwrap();
      toast('Category deleted from active index.', 'info');
    } catch (err) {
      toast(err || 'Failed to delete category.', 'error');
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;
    
    const formData = new FormData();
    formData.append('images', files[0]);

    setUploadingImage(true);
    try {
      const { data } = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newUrls = data.data.map(url => `${SERVER_BASE}${url}`);
      setImage(newUrls[0]);
      toast('Image uploaded successfully', 'success');
    } catch (error) {
      toast('Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Category Manager</h1>
          <p className="text-sm text-slate-500 mt-1">Manage active catalog categories, descriptions, and thumbnails.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-sm shadow-md hover:shadow-cyan-500/10 transition-all active:scale-95 self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Category</span>
        </button>
      </div>

      {/* Main categories Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : categories.length === 0 ? (
        <div className="py-12 glass-panel border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] text-center text-slate-400 text-sm">
          No categories exist. Click "Create Category" to initialize sections.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((c) => (
            <div
              key={c._id}
              className="glass-panel border border-white/10 rounded-[2.5rem] overflow-hidden p-4 shadow-xl flex flex-col justify-between h-[360px] hover:border-cyan-500/30 transition-all duration-500 group"
            >
              <div className="space-y-4">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-800">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="px-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-lg text-slate-800 dark:text-white truncate flex-1">{c.name}</h3>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-full inline-block">
                    {c.slug}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-medium">
                    {c.description}
                  </p>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpenEditModal(c)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:bg-cyan-500 hover:text-white transition-all duration-300 font-bold text-[11px] uppercase tracking-wider"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Modify</span>
                </button>
                
                <button
                  onClick={() => handleDelete(c._id)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white transition-all duration-300 font-bold text-[11px] uppercase tracking-wider"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit category modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="relative glass-panel bg-white dark:bg-slate-950 border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl z-50 animate-fadeIn space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-85 pb-4">
              <h2 className="text-xl font-extrabold">
                {editingId ? 'Edit Category card' : 'Create Category card'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3.5 text-xs">
                {/* Category Name */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-450">Category Name *</span>
                  <input
                    type="text"
                    required
                    placeholder="Minimalist Home Decor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* Thumbnail Image URL or Upload */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-450">Thumbnail Image</span>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-600 hover:file:bg-cyan-500/20 disabled:opacity-50"
                    />
                    {uploadingImage && <span className="text-cyan-500 text-xs self-center font-bold animate-pulse">Uploading...</span>}
                  </div>
                  <input
                    type="text"
                    placeholder="https://unsplash.com/photo-123"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500 text-xs text-slate-500"
                  />
                  {/* Live Image Preview */}
                  {image && (
                    <div className="mt-2 w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                      <img
                        src={image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-450">Category Description *</span>
                  <textarea
                    required
                    placeholder="Provide a descriptive section summary..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 p-3 focus:ring-1 focus:ring-cyan-500"
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4.5 py-2 border rounded-full font-bold"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-55"
                >
                  {editingId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
