import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchProducts, setFilters, resetFilters } from '../../redux/slices/productSlice';
import SkeletonCard from '../../components/common/SkeletonCard';
import ProductCard from '../../components/common/ProductCard';
import { Link } from 'react-router-dom';
import { Star, Filter, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import API from '../../services/api';

const ProductListings = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  
  const { products, loading, pages, currentPage, filters } = useSelector((state) => state.products);
  const [categories, setCategories] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch categories for sidebar selection
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/categories');
        setCategories(res.data.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Sync URL search query parameters if present (e.g. from homepage category clicks)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const catParam = queryParams.get('category');
    if (catParam) {
      dispatch(setFilters({ category: catParam }));
    }
  }, [location.search, dispatch]);

  // Main Effect: Fetch products whenever active filters or page index change
  useEffect(() => {
    const apiParams = {
      page: currentPage,
      limit: 6,
      keyword: filters.keyword,
      category: filters.category,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      ratingMin: filters.ratingMin,
      sort: filters.sort
    };
    dispatch(fetchProducts(apiParams));
  }, [filters, currentPage, dispatch]);

  const handleFilterChange = (updates) => {
    dispatch(setFilters(updates));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= pages) {
      dispatch(setFilters({ page: pageNum })); // Redux slice doesn't explicitly track page in filters but fetchProducts maps it
      // Standard dispatch will re-trigger product fetching because we fetch on current filters + page
      const apiParams = {
        page: pageNum,
        limit: 6,
        keyword: filters.keyword,
        category: filters.category,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        ratingMin: filters.ratingMin,
        sort: filters.sort
      };
      dispatch(fetchProducts(apiParams));
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Shop Premium Products</h1>
          <p className="text-sm text-slate-500 mt-1">Browse our modern catalog featuring verified luxury craftsmanship.</p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Mobile Filter toggle button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center justify-center space-x-2 px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-sm font-bold bg-white dark:bg-slate-900 w-full"
          >
            <Filter className="w-4 h-4 text-cyan-500" />
            <span>Filters</span>
          </button>

          {/* Sort selector */}
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange({ sort: e.target.value })}
            className="px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm w-full md:w-48"
          >
            <option value="newest">Sort: Newest</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="rating">Ratings: Highest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>
        </div>
      </div>

      {/* Main catalog panel */}
      <div className="flex gap-8 items-start">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden md:block w-64 glass-panel border border-white/10 p-6 rounded-3xl sticky top-20 flex-shrink-0">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <Filter className="w-4.5 h-4.5 text-cyan-500" />
              <span>Filters</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Categories */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm tracking-wider uppercase text-slate-400">Category</h4>
              <div className="space-y-2">
                <button
                  onClick={() => handleFilterChange({ category: '' })}
                  className={`block text-sm font-medium text-left w-full transition-all ${
                    filters.category === '' ? 'text-cyan-500 pl-1 font-bold' : 'text-slate-650 dark:text-slate-350 hover:text-cyan-500'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => handleFilterChange({ category: c.slug })}
                    className={`block text-sm font-medium text-left w-full transition-all ${
                      filters.category === c.slug ? 'text-cyan-500 pl-1 font-bold' : 'text-slate-650 dark:text-slate-350 hover:text-cyan-500'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price bounds */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm tracking-wider uppercase text-slate-400">Price Bounds ($)</h4>
              <div className="flex gap-2.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange({ priceMin: e.target.value })}
                  className="w-full text-center py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/40 dark:bg-slate-900/40 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange({ priceMax: e.target.value })}
                  className="w-full text-center py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/40 dark:bg-slate-900/40 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Star ratings */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm tracking-wider uppercase text-slate-400">Ratings</h4>
              <div className="space-y-2">
                {[4, 3, 2].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleFilterChange({ ratingMin: num.toString() })}
                    className={`flex items-center gap-2 text-sm w-full text-left transition-all ${
                      filters.ratingMin === num.toString() ? 'text-cyan-500 font-bold' : 'text-slate-650 dark:text-slate-350 hover:text-cyan-500'
                    }`}
                  >
                    <div className="flex items-center text-amber-400">
                      {Array(num).fill(0).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
                      {Array(5 - num).fill(0).map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-slate-250 dark:text-slate-700" />)}
                    </div>
                    <span>& Up</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filters Slide Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-40 md:hidden flex justify-end">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
            <div className="relative w-72 h-full bg-white dark:bg-slate-950 p-6 flex flex-col z-50">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <h3 className="font-bold flex items-center gap-2">
                  <Filter className="w-4.5 h-4.5 text-cyan-500" />
                  <span>Filters</span>
                </h3>
                <button
                  onClick={() => {
                    handleResetFilters();
                    setShowMobileFilters(false);
                  }}
                  className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Mobile Filter Options */}
              <div className="space-y-6 flex-grow overflow-y-auto pr-1">
                {/* Categories */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs tracking-wider uppercase text-slate-400">Category</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => { handleFilterChange({ category: '' }); setShowMobileFilters(false); }}
                      className={`block text-sm font-medium w-full text-left ${filters.category === '' ? 'text-cyan-500 font-bold' : ''}`}
                    >
                      All Categories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c._id}
                        onClick={() => { handleFilterChange({ category: c.slug }); setShowMobileFilters(false); }}
                        className={`block text-sm font-medium w-full text-left ${filters.category === c.slug ? 'text-cyan-500 font-bold' : ''}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price bounds */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs tracking-wider uppercase text-slate-400">Price Bounds</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange({ priceMin: e.target.value })}
                      className="w-full text-center py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/40 dark:bg-slate-900/40 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange({ priceMax: e.target.value })}
                      className="w-full text-center py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/40 dark:bg-slate-900/40 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Ratings */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs tracking-wider uppercase text-slate-400">Ratings</h4>
                  <div className="space-y-2">
                    {[4, 3, 2].map((num) => (
                      <button
                        key={num}
                        onClick={() => { handleFilterChange({ ratingMin: num.toString() }); setShowMobileFilters(false); }}
                        className={`flex items-center gap-2 text-sm w-full text-left ${filters.ratingMin === num.toString() ? 'text-cyan-500 font-bold' : ''}`}
                      >
                        <div className="flex items-center text-amber-400">
                          {Array(num).fill(0).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
                        </div>
                        <span>& Up</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-md mt-6"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Product listing Grid */}
        <div className="flex-1 space-y-8">
          {/* Active filter badges display */}
          {(filters.keyword || filters.category || filters.priceMin || filters.priceMax || filters.ratingMin) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Active Criteria:</span>
              
              {filters.keyword && (
                <span className="text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full flex items-center gap-1 font-semibold">
                  <span>Keyword: "{filters.keyword}"</span>
                  <button onClick={() => handleFilterChange({ keyword: '' })} className="hover:text-cyan-600">×</button>
                </span>
              )}

              {filters.category && (
                <span className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full flex items-center gap-1 font-semibold">
                  <span>Category: {filters.category}</span>
                  <button onClick={() => handleFilterChange({ category: '' })} className="hover:text-indigo-600">×</button>
                </span>
              )}

              {(filters.priceMin || filters.priceMax) && (
                <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1 font-semibold">
                  <span>Price: ${filters.priceMin || '0'} - ${filters.priceMax || 'Max'}</span>
                  <button onClick={() => handleFilterChange({ priceMin: '', priceMax: '' })} className="hover:text-emerald-600">×</button>
                </span>
              )}

              {filters.ratingMin && (
                <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1 font-semibold">
                  <span>Rating: {filters.ratingMin}+ Stars</span>
                  <button onClick={() => handleFilterChange({ ratingMin: '' })} className="hover:text-amber-650">×</button>
                </span>
              )}
            </div>
          )}

          {/* Grid display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : products.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-4">
                <div className="text-4xl">🛸</div>
                <h3 className="text-xl font-bold">No Premium Products Found</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm">
                  We couldn't locate any products matching your specific active filters. Try loosening your bounds or typing a different keyword.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-sm active:scale-95 transition-all shadow-md"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {!loading && products.length > 0 && pages > 1 && (
            <div className="flex justify-center items-center space-x-4 pt-8">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 rounded-full border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-slate-600 dark:text-slate-350"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-sm font-bold">
                Page {currentPage} of {pages}
              </span>

              <button
                disabled={currentPage === pages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2 rounded-full border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-slate-600 dark:text-slate-350"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListings;
