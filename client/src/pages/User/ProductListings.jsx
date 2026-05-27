import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchProducts, setFilters, resetFilters } from '../../redux/slices/productSlice';
import SkeletonCard from '../../components/common/SkeletonCard';
import ProductCard from '../../components/common/ProductCard';
import { Star, Filter, RotateCcw, ChevronLeft, ChevronRight, Search, X, SlidersHorizontal, PackageSearch } from 'lucide-react';
import API from '../../services/api';

const LIMIT = 12;

/* ─── Reusable Filter Panel Content ─── */
const FilterContent = ({ filters, categories, subCategories, handleFilterChange, onClose }) => (
  <div className="space-y-7">
    {/* Categories */}
    <div className="space-y-3">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</h4>
      <div className="space-y-1.5">
        <button
          onClick={() => { handleFilterChange({ category: '', subCategory: '' }); onClose?.(); }}
          className={`flex items-center gap-2 text-sm w-full text-left px-3 py-2 rounded-xl transition-all ${filters.category === ''
              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
            }`}
        >
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c._id}
            onClick={() => { handleFilterChange({ category: c.slug, subCategory: '' }); onClose?.(); }}
            className={`flex items-center gap-2 text-sm w-full text-left px-3 py-2 rounded-xl transition-all ${filters.category === c.slug
                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
              }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>

    {/* Sub Categories - Only show if category is selected */}
    {filters.category && subCategories.length > 0 && (
      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sub Category</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => { handleFilterChange({ subCategory: '' }); onClose?.(); }}
            className={`flex items-center gap-2 text-sm w-full text-left px-3 py-2 rounded-xl transition-all ${filters.subCategory === ''
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
              }`}
          >
            All Sub Categories
          </button>
          {subCategories.map((sc) => (
            <button
              key={sc._id}
              onClick={() => { handleFilterChange({ subCategory: sc.slug }); onClose?.(); }}
              className={`flex items-center gap-2 text-sm w-full text-left px-3 py-2 rounded-xl transition-all ${filters.subCategory === sc.slug
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                }`}
            >
              {sc.name}
            </button>
          ))}
        </div>
      </div>
    )}
    {/* Price */}
    <div className="space-y-3">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price Range (₹)</h4>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min"
          value={filters.priceMin}
          onChange={(e) => handleFilterChange({ priceMin: e.target.value })}
          className="w-full text-center py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/40 dark:bg-slate-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <span className="self-center text-slate-400 text-xs font-bold">to</span>
        <input
          type="number"
          placeholder="Max"
          value={filters.priceMax}
          onChange={(e) => handleFilterChange({ priceMax: e.target.value })}
          className="w-full text-center py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/40 dark:bg-slate-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
    </div>

    {/* Ratings */}
    <div className="space-y-3">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Min Rating</h4>
      <div className="space-y-1">
        {[4, 3, 2].map((num) => (
          <button
            key={num}
            onClick={() => { handleFilterChange({ ratingMin: filters.ratingMin === num.toString() ? '' : num.toString() }); onClose?.(); }}
            className={`flex items-center gap-2.5 text-sm w-full text-left px-3 py-2 rounded-xl transition-all ${filters.ratingMin === num.toString()
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
              }`}
          >
            <div className="flex items-center gap-0.5 text-amber-400">
              {Array(num).fill(0).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
              {Array(5 - num).fill(0).map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />)}
            </div>
            <span>& Up</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Main Page ─── */
const ProductListings = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { products, loading, pages, currentPage, filters } = useSelector((s) => s.products);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.keyword || '');

  // Fetch categories
  useEffect(() => {
    API.get('/categories')
      .then((res) => setCategories(res.data.data))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (filters.category) {
      const selectedCategory = categories.find((c) => c.slug === filters.category);
      if (selectedCategory) {
        API.get(`/subcategories/category/${selectedCategory._id}`)
          .then((res) => setSubCategories(res.data.data))
          .catch((err) => {
            console.error('Failed to load subcategories', err);
            setSubCategories([]);
          });
      }
    } else {
      setSubCategories([]);
    }
  }, [filters.category, categories]);

  // Sync URL category param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) dispatch(setFilters({ category: cat }));
  }, [location.search, dispatch]);

  // Fetch products on filter/page change
  useEffect(() => {
    dispatch(fetchProducts({
      page: currentPage,
      limit: LIMIT,
      keyword: filters.keyword,
      category: filters.category,
      subcategory: filters.subCategory,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      ratingMin: filters.ratingMin,
      sort: filters.sort,
    }));
  }, [filters, currentPage, dispatch]);

  const handleFilterChange = (updates) => dispatch(setFilters(updates));
  const handleResetFilters = () => { dispatch(resetFilters()); setSearchInput(''); };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange({ keyword: searchInput });
  };

  const handlePageChange = (p) => {
    if (p < 1 || p > pages) return;
    dispatch(fetchProducts({
      page: p,
      limit: LIMIT,
      keyword: filters.keyword,
      category: filters.category,
      subcategory: filters.subCategory,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      ratingMin: filters.ratingMin,
      sort: filters.sort,
    }));
  };

  const hasActiveFilters = filters.keyword || filters.category || filters.subCategory || filters.priceMin || filters.priceMax || filters.ratingMin;

  // Build page number array (show max 5 pages around current)
  const getPageNumbers = () => {
    const range = [];
    const delta = 2;
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(pages, currentPage + delta); i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className="pb-16 space-y-0">

      {/* ── PAGE HEADER ── */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Shop All Products</h1>
        <p className="text-sm text-slate-500 mt-1">Browse our modern catalog featuring verified luxury craftsmanship.</p>
      </div>

      {/* ── SEARCH + SORT BAR ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-60 pl-10 pr-10 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); handleFilterChange({ keyword: '' }); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange({ sort: e.target.value })}
          className="px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm sm:w-48 cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="priceAsc">Price: Low → High</option>
          <option value="priceDesc">Price: High → Low</option>
          <option value="rating">Top Rated</option>
          <option value="oldest">Oldest First</option>
        </select>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className="md:hidden flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm font-bold"
        >
          <SlidersHorizontal className="w-4 h-4 text-cyan-500" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0" />
          )}
        </button>
      </div>

      {/* ── ACTIVE FILTER CHIPS ── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap text-lg items-center gap-2 mb-5">
          <span className="text-[15px] font-bold uppercase tracking-widest text-slate-400">Active:</span>

          {filters.keyword && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full font-semibold">
              "{filters.keyword}"
              <button onClick={() => { handleFilterChange({ keyword: '' }); setSearchInput(''); }} className="hover:opacity-70"><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-semibold">
              {categories.find((c) => c.slug === filters.category)?.name || filters.category}
              <button onClick={() => handleFilterChange({ category: '', subCategory: '' })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.subCategory && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full font-semibold">
              {subCategories.find((sc) => sc.slug === filters.subCategory)?.name || filters.subCategory}
              <button onClick={() => handleFilterChange({ subCategory: '' })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
            </span>
          )}
          {(filters.priceMin || filters.priceMax) && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
              ₹{filters.priceMin || '0'} – ₹{filters.priceMax || '∞'}
              <button onClick={() => handleFilterChange({ priceMin: '', priceMax: '' })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.ratingMin && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-semibold">
              {filters.ratingMin}★ & Up
              <button onClick={() => handleFilterChange({ ratingMin: '' })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-bold px-2 py-1 rounded-full hover:bg-rose-500/10 transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            Clear all
          </button>
        </div>
      )}

      {/* ── SIDEBAR + GRID LAYOUT ── */}
      <div className="flex gap-7 items-start">

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-60 flex-shrink-0 glass-panel border border-white/10 rounded-3xl p-5 sticky top-20">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-500" />
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
          <FilterContent
            filters={filters}
            categories={categories}
            subCategories={subCategories}
            handleFilterChange={handleFilterChange}
          />
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Product count */}
          {!loading && products.length > 0 && (
            <p className="text-xs text-slate-400 font-semibold">
              Showing <span className="text-slate-700 dark:text-slate-200 font-bold">{products.length}</span> products
              {pages > 1 && <> · Page <span className="text-slate-700 dark:text-slate-200 font-bold">{currentPage}</span> of {pages}</>}
            </p>
          )}

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {loading ? (
              Array(LIMIT).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : products.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-5 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <PackageSearch className="w-10 h-10 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">No Products Found</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                    Try adjusting your filters or search term to find what you're looking for.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              products.map((p) => <ProductCard key={p._id} product={p} />)
            )}
          </div>

          {/* ── PAGINATION ── */}
          {!loading && products.length > 0 && pages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4">
              {/* Prev */}
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 rounded-full border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* First page + ellipsis */}
              {getPageNumbers()[0] > 1 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className="w-9 h-9 rounded-full text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    1
                  </button>
                  {getPageNumbers()[0] > 2 && <span className="text-slate-400 text-sm px-1">…</span>}
                </>
              )}

              {/* Numbered pages */}
              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${p === currentPage
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md shadow-cyan-500/20 border-transparent'
                      : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  {p}
                </button>
              ))}

              {/* Last page + ellipsis */}
              {getPageNumbers().at(-1) < pages && (
                <>
                  {getPageNumbers().at(-1) < pages - 1 && <span className="text-slate-400 text-sm px-1">…</span>}
                  <button
                    onClick={() => handlePageChange(pages)}
                    className="w-9 h-9 rounded-full text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    {pages}
                  </button>
                </>
              )}

              {/* Next */}
              <button
                disabled={currentPage === pages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2 rounded-full border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE BOTTOM-SHEET FILTER DRAWER ── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />

          {/* Sheet */}
          <div className="relative w-full bg-white dark:bg-slate-950 rounded-t-[2rem] px-5 pt-4 pb-8 z-10 max-h-[80vh] flex flex-col shadow-2xl">
            {/* Handle */}
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5" />

            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-cyan-500" />
                Filters
              </h3>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={() => { handleResetFilters(); setShowMobileFilters(false); }}
                    className="text-xs text-rose-500 font-bold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable filter options */}
            <div className="overflow-y-auto flex-1 pr-1">
              <FilterContent
                filters={filters}
                categories={categories}
                subCategories={subCategories}
                handleFilterChange={handleFilterChange}
                onClose={() => setShowMobileFilters(false)}
              />
            </div>

            {/* Apply button */}
            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full mt-5 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-sm shadow-lg hover:shadow-cyan-500/25 active:scale-95 transition-all"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListings;
