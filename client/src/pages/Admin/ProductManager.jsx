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
import API, { resolveImage } from '../../services/api';

// Derive server origin from API baseURL (strips /api suffix)
const SERVER_BASE = API.defaults.baseURL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';


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
  const [colorMap, setColorMap] = useState([]); // [{ color: 'Red', image: 'url' }]

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
    setColorMap([]);
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
    setColorMap(p.colorImages || []);
    
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
      variants,
      colorImages: colorMap
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
      
      const newUrls = data.data.map(url => `${SERVER_BASE}${url}`);
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
        <div className="py-12 glass-panel border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] text-center text-slate-400 text-sm">
          No catalog listings created. Click "Add New Product" to populate items.
        </div>
      ) : (
        <div className="glass-panel border border-white/10 rounded-[2rem] overflow-hidden shadow-lg p-0 sm:p-6 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock level</th>
                  <th className="py-3 px-4 text-center">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 block sm:table-row-group">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/30 transition-colors block sm:table-row p-4 sm:p-0">
                    {/* Item details */}
                    <td className="py-1 sm:py-3.5 px-0 sm:px-4 flex items-center gap-3 sm:table-cell mb-2 sm:mb-0">
                      <div className="flex items-center gap-3 w-full">
                        <img src={resolveImage(p.images[0])} alt={p.name}
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/1e293b/94a3b8?text=IMG`; }}
                          className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl object-cover border border-white/10 shadow-sm" />
                        <div className="truncate flex-1">
                          <p className="font-bold truncate text-sm sm:text-xs text-slate-800 dark:text-slate-100">{p.name}</p>
                          <p className="text-[10px] text-slate-400 truncate uppercase tracking-tighter">{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category details */}
                    <td className="py-1 sm:py-3.5 px-0 sm:px-4 sm:table-cell flex items-center justify-between sm:justify-start">
                      <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase mr-2">Category</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg sm:bg-transparent sm:px-0">
                        {p.category?.name || 'Unassigned'}
                      </span>
                    </td>

                    {/* Prices */}
                    <td className="py-1 sm:py-3.5 px-0 sm:px-4 sm:table-cell flex items-center justify-between sm:justify-start">
                      <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase mr-2">Price</span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-black text-cyan-600 dark:text-cyan-400 text-sm">₹{p.price.toFixed(2)}</span>
                        {p.compareAtPrice && p.compareAtPrice > p.price && (
                          <span className="text-[10px] text-slate-400 line-through">₹{p.compareAtPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </td>

                    {/* Stock level details */}
                    <td className="py-1 sm:py-3.5 px-0 sm:px-4 sm:table-cell flex items-center justify-between sm:justify-start">
                      <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase mr-2">Inventory</span>
                      <span className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${
                        p.stock > 10
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : p.stock > 0
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {p.stock > 0 ? `${p.stock} Units` : 'Out of Stock'}
                      </span>
                    </td>

                    {/* Operations */}
                    <td className="py-2 sm:py-3.5 px-0 sm:px-4 sm:table-cell mt-2 sm:mt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                      <div className="flex justify-end sm:justify-center items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-2 sm:p-1.5 rounded-xl sm:rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 transition-all text-[10px] font-bold uppercase sm:normal-case"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="sm:hidden">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-2 sm:p-1.5 rounded-xl sm:rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-all text-[10px] font-bold uppercase sm:normal-case"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sm:hidden">Delete</span>
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
                   <div className="flex gap-3 mb-3">
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl py-4 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer group">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 mb-1" />
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-cyan-600">
                        {uploadingImage ? 'Uploading...' : 'Upload Files'}
                      </span>
                    </label>
                  </div> 

                  {/* Image Gallery Preview */}
                  {imagesInput.trim() && (
                    <div className="flex flex-wrap gap-2 mb-3 max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      {imagesInput.split(',').map(s => s.trim()).filter(Boolean).map((url, idx) => (
                        <div key={idx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-white/20 shadow-sm">
                          <img src={resolveImage(url)} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => {
                              const urls = imagesInput.split(',').map(s => s.trim()).filter(Boolean);
                              const filtered = urls.filter((_, i) => i !== idx);
                              setImagesInput(filtered.join(', '));
                            }}
                            className="absolute inset-0 bg-rose-500/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Separate URLs with commas (e.g. http://img1.jpg, http://img2.jpg)"
                    value={imagesInput}
                    onChange={(e) => setImagesInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 focus:ring-1 focus:ring-cyan-500 text-[10px] text-slate-500"
                  />
                </div>

                {/* Color Visual Mapping (New Section) */}
                {colorsInput.trim() && (
                  <div className="space-y-3 sm:col-span-2 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-450">Color Visual Mapping</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {colorsInput.split(',').map(s => s.trim()).filter(Boolean).map(color => {
                        const currentMap = colorMap.find(m => m.color === color);
                        const productImages = imagesInput.split(',').map(img => img.trim()).filter(Boolean);
                        
                        return (
                          <div key={color} className="flex flex-col gap-1.5 p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-white/10">
                            <span className="font-bold text-[10px] text-slate-400">{color} Showcase image:</span>
                            <select
                              value={currentMap?.image || ''}
                              onChange={(e) => {
                                const newMap = colorMap.filter(m => m.color !== color);
                                if (e.target.value) {
                                  newMap.push({ color, image: e.target.value });
                                }
                                setColorMap(newMap);
                              }}
                              className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg py-1 px-2 text-[10px] border border-slate-100 dark:border-slate-800"
                            >
                              <option value="">No Mapping (Show Main)</option>
                              {productImages.map((img, idx) => (
                                <option key={idx} value={img}>Image {idx + 1} ({img.split('/').pop()})</option>
                              ))}
                            </select>
                            {currentMap?.image && (
                              <img src={resolveImage(currentMap.image)} className="w-8 h-8 rounded-md object-cover mt-1 border border-cyan-500/30" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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
