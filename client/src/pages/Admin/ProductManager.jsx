import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  addAdminProduct, 
  editAdminProduct, 
  deleteAdminProduct, 
  fetchAdminCategories 
} from '../../redux/slices/adminSlice';
import { fetchProducts } from '../../redux/slices/productSlice';
import { useToast } from '../../components/common/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Plus, Edit2, Trash2, X, AlertTriangle, Sparkles } from 'lucide-react';
import API from '../../services/api';

const ProductManager = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { products, loading } = useSelector((state) => state.products);
  const { categories, actionLoading } = useSelector((state) => state.admin);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Field States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imagesInput, setImagesInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Custom Dynamic Variants Color / Size Lists
  const [colorsInput, setColorsInput] = useState('Black, Silver, Blue');
  const [sizesInput, setSizesInput] = useState('S, M, L');

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 })); // load all catalog items for editing
    dispatch(fetchAdminCategories());
  }, [dispatch]);

  const resetForm = () => {
    setName('');
    setPrice('');
    setCompareAtPrice('');
    setStock('');
    setCategory('');
    setDescription('');
    setImagesInput('');
    setUploadingImage(false);
    setColorsInput('Black, Silver, Blue');
    setSizesInput('S, M, L');
    setEditingId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    if (categories.length > 0) {
      setCategory(categories[0]._id);
    }
    setShowModal(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingId(p._id);
    setName(p.name);
    setPrice(p.price.toString());
    setCompareAtPrice(p.compareAtPrice ? p.compareAtPrice.toString() : '');
    setStock(p.stock.toString());
    setCategory(p.category?._id || '');
    setDescription(p.description);
    setImagesInput(p.images.join(', '));
    
    // Parse variants back to inputs
    const colorVar = p.variants.find(v => v.name.toLowerCase() === 'color');
    const sizeVar = p.variants.find(v => v.name.toLowerCase() === 'size');
    
    setColorsInput(colorVar ? colorVar.options.join(', ') : '');
    setSizesInput(sizeVar ? sizeVar.options.join(', ') : '');
    
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !stock || !category || !description) {
      toast('Please fill out all required catalog details.', 'error');
      return;
    }

    // Process image URLs
    const images = imagesInput
      ? imagesInput.split(',').map(s => s.trim()).filter(Boolean)
      : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80']; // default headphones placeholder

    // Build variants structure
    const variants = [];
    if (colorsInput.trim()) {
      variants.push({
        name: 'Color',
        options: colorsInput.split(',').map(s => s.trim()).filter(Boolean)
      });
    }
    if (sizesInput.trim()) {
      variants.push({
        name: 'Size',
        options: sizesInput.split(',').map(s => s.trim()).filter(Boolean)
      });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const productPayload = {
      name,
      slug,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      stock: Number(stock),
      category,
      description,
      images,
      variants
    };

    try {
      if (editingId) {
        await dispatch(editAdminProduct({ id: editingId, productData: productPayload })).unwrap();
        toast('Catalog product updated successfully!', 'success');
      } else {
        await dispatch(addAdminProduct(productPayload)).unwrap();
        toast('New product added to catalog successfully!', 'success');
      }
      setShowModal(false);
      resetForm();
      dispatch(fetchProducts({ limit: 100 })); // reload catalog
    } catch (err) {
      toast(err || 'Failed to persist product changes.', 'error');
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    setUploadingImage(true);
    try {
      const { data } = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newUrls = data.data.map(url => `http://localhost:5000${url}`);
      setImagesInput(prev => prev ? `${prev}, ${newUrls.join(', ')}` : newUrls.join(', '));
      toast('Images uploaded successfully', 'success');
    } catch (error) {
      toast('Failed to upload images', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this catalog product? This is permanent.')) {
      return;
    }

    try {
      await dispatch(deleteAdminProduct(productId)).unwrap();
      toast('Product deleted from active catalog.', 'info');
      dispatch(fetchProducts({ limit: 100 })); // reload
    } catch (err) {
      toast(err || 'Failed to delete product.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Product Catalog Editor</h1>
          <p className="text-sm text-slate-500 mt-1">Manage active listings, inventory quantities, and variants selection.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-sm shadow-md hover:shadow-cyan-500/10 transition-all active:scale-95 self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Main product catalog list table */}
      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="py-12 glass-panel border border-dashed border-slate-205 dark:border-slate-805 rounded-[2rem] text-center text-slate-400 text-sm">
          No catalog listings created. Click "Add New Product" to populate items.
        </div>
      ) : (
        <div className="glass-panel border border-white/10 rounded-[2rem] overflow-hidden shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock level</th>
                  <th className="py-3 px-4 text-center">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/30 transition-colors">
                    {/* Item details */}
                    <td className="py-3.5 px-4 flex items-center gap-3 min-w-[200px]">
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                      <div className="truncate">
                        <p className="font-bold truncate text-sm">{p.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{p.slug}</p>
                      </div>
                    </td>

                    {/* Category details */}
                    <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-300">
                      {p.category?.name || 'Unassigned'}
                    </td>

                    {/* Prices */}
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-cyan-600 dark:text-cyan-400 text-sm">₹{p.price.toFixed(2)}</span>
                      {p.compareAtPrice && p.compareAtPrice > p.price && (
                        <span className="text-[10px] text-slate-400 line-through block">₹{p.compareAtPrice.toFixed(2)}</span>
                      )}
                    </td>

                    {/* Stock level details */}
                    <td className="py-3.5 px-4">
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        p.stock > 10
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : p.stock > 0
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {p.stock > 0 ? `${p.stock} units` : 'Out of Stock'}
                      </span>
                    </td>

                    {/* Operations */}
                    <td className="py-3.5 px-4">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-full border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                          aria-label="Edit Catalog Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded-full border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          aria-label="Delete Catalog Product"
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
        </div>
      )}

      {/* Add / Edit product modal overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="relative glass-panel bg-white dark:bg-slate-950 border border-white/10 rounded-[2.5rem] w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl z-50 animate-fadeIn space-y-6">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-85 pb-4">
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-500" />
                <span>{editingId ? 'Edit Product Card' : 'Add New Product Card'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal fields form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Product Name */}
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Product Name *</span>
                  <input
                    type="text"
                    required
                    placeholder="Quantum Gaming Headset"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Category Selection *</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Stock limit */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Available Stock *</span>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Price ($) *</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="99.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* Compare Price */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Compare Price ($)</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="120.00"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* Colors variants */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-450">Colors Options (comma split)</span>
                  <input
                    type="text"
                    placeholder="Black, Silver, Blue"
                    value={colorsInput}
                    onChange={(e) => setColorsInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* Sizes variants */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-450">Sizes Options (comma split)</span>
                  <input
                    type="text"
                    placeholder="S, M, L"
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* Image URLs or Upload */}
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Product Images</span>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-600 hover:file:bg-cyan-500/20 disabled:opacity-50"
                    />
                    {uploadingImage && <span className="text-cyan-500 text-xs self-center font-bold animate-pulse">Uploading...</span>}
                  </div>
                  <input
                    type="text"
                    placeholder="http://img1.jpg, http://img2.jpg"
                    value={imagesInput}
                    onChange={(e) => setImagesInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500 text-xs text-slate-500"
                  />
                </div>

                {/* Product Description */}
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Product description *</span>
                  <textarea
                    required
                    placeholder="Provide a detailed, rich feature description..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 p-3 focus:ring-1 focus:ring-cyan-500"
                  ></textarea>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2.5 pt-4 text-xs">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border rounded-full font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-8 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-55"
                >
                  {editingId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
