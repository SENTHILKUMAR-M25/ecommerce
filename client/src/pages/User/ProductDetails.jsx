import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductBySlug, submitReview } from '../../redux/slices/productSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { useToast } from '../../components/common/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Star, ShoppingBag, Heart, Check, Plus, Minus, ArrowLeft, Send } from 'lucide-react';
import API from '../../services/api';

const ProductDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { product, detailLoading, error } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const [activeImage, setActiveImage] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  const isFavorited = wishlistItems.some(item => item.product === product?._id);

  // Fetch Product Details
  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
  }, [slug, dispatch]);

  // Set default main image & variants once product details resolve
  useEffect(() => {
    if (product) {
      setActiveImage(product.images[0]);
      
      // Auto-set first option for each variant
      const defaultVars = {};
      product.variants.forEach((v) => {
        defaultVars[v.name] = v.options[0];
      });
      setSelectedVariants(defaultVars);
      setQuantity(1);

      // Fetch related products & reviews
      const fetchExtra = async () => {
        try {
          const [relatedRes, reviewsRes] = await Promise.all([
            API.get(`/products?category=${product.category?._id}&limit=5`),
            API.get(`/reviews/${product._id}`)
          ]);
          // Filter out current product from related list
          setRelatedProducts(relatedRes.data.data.filter(x => x._id !== product._id).slice(0, 4));
          setReviews(reviewsRes.data.data);
        } catch (err) {
          console.error('Error fetching additional product metadata:', err);
        }
      };
      fetchExtra();
    }
  }, [product]);

  const handleVariantSelect = (variantName, optionValue) => {
    setSelectedVariants((prev) => ({ ...prev, [variantName]: optionValue }));
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isFavorited) {
      dispatch(removeFromWishlist(product._id));
      toast('Product removed from wishlist.', 'info');
    } else {
      dispatch(addToWishlist({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        stock: product.stock,
        slug: product.slug
      }));
      toast('Product added to wishlist!', 'success');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.stock === 0) {
      toast('Sorry, this product is currently out of stock!', 'error');
      return;
    }

    // Compile variant string e.g., "Size: M, Color: Black"
    const variantString = Object.entries(selectedVariants)
      .map(([name, opt]) => `${name}: ${opt}`)
      .join(', ');

    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity,
      stock: product.stock,
      variant: variantString
    }));

    toast(`Added ${quantity} item(s) to shopping cart!`, 'success');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast('Please log in to submit a review!', 'error');
      return;
    }

    if (!comment.trim()) {
      toast('Please enter a review description.', 'error');
      return;
    }

    try {
      setReviewSubmitLoading(true);
      await dispatch(submitReview({
        productId: product._id,
        reviewData: { rating, comment }
      })).unwrap();

      toast('Thank you! Review published successfully.', 'success');
      setComment('');
      
      // Refresh reviews list
      const reviewsRes = await API.get(`/reviews/${product._id}`);
      setReviews(reviewsRes.data.data);
      
      // Update local rating summary
      dispatch(fetchProductBySlug(slug));
    } catch (err) {
      toast(err || 'Failed to submit review.', 'error');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  if (detailLoading) return <LoadingSpinner size="lg" />;
  if (error || !product) {
    return (
      <div className="py-16 text-center space-y-4">
        <h3 className="text-xl font-bold">Error Loading Product</h3>
        <p className="text-slate-500 max-w-sm mx-auto text-sm">{error || 'Product not found.'}</p>
        <Link to="/products" className="inline-block px-6 py-2 border rounded-full font-bold">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Back button */}
      <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-cyan-500 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Collections</span>
      </Link>

      {/* Main product presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Side: Images selectors */}
        <div className="space-y-4">
          <div className="aspect-square rounded-[2rem] overflow-hidden border border-white/10 glass-panel shadow-lg p-2.5">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover rounded-[1.8rem] animate-fadeIn"
            />
          </div>

          {/* Thumbnails list */}
          {product.images.length > 1 && (
            <div className="flex gap-3 justify-center">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white dark:bg-slate-900 ${
                    activeImage === img ? 'border-cyan-500 scale-95 shadow-md' : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover rounded-xl" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full font-bold">
              {product.category?.name}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight pt-1">{product.name}</h1>
            
            {/* Rating Stars Summary */}
            <div className="flex items-center space-x-2 pt-1">
              <div className="flex items-center text-amber-400">
                {Array(5).fill(0).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4.5 h-4.5 ${
                      i < Math.round(product.ratings) ? 'fill-amber-400' : 'text-slate-250 dark:text-slate-700'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm font-bold">{product.ratings} Stars</span>
              <span className="text-xs text-slate-400">({product.numOfReviews} verified reviews)</span>
            </div>
          </div>

          {/* Pricing tags */}
          <div className="flex items-baseline space-x-3.5 border-y border-slate-100 dark:border-slate-800/80 py-4">
            <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">${product.price.toFixed(2)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-base text-slate-400 line-through">${product.compareAtPrice.toFixed(2)}</span>
            )}
            
            {/* Stock availability indicators */}
            <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${
              product.stock > 0 
                ? 'bg-emerald-500/10 text-emerald-500' 
                : 'bg-rose-500/10 text-rose-500'
            }`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Temporarily Out of Stock'}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
            {product.description}
          </p>

          {/* Variants Selectors */}
          {product.variants.map((v) => (
            <div key={v.name} className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{v.name}</span>
              <div className="flex flex-wrap gap-2.5">
                {v.options.map((opt) => {
                  const isSelected = selectedVariants[v.name] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleVariantSelect(v.name, opt)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500 shadow-md'
                          : 'border-white/10 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:border-slate-400'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity selector & Shop Buttons */}
          <div className="pt-4 space-y-4">
            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Quantity</span>
                <div className="flex items-center border border-white/10 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 rounded-xl overflow-hidden w-32">
                  <button
                    onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors w-10 flex justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-bold text-sm select-none">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(prev + 1, product.stock))}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors w-10 flex justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center space-x-2.5 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:shadow-lg disabled:opacity-50 text-white font-bold transition-all shadow-md active:scale-98"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Shopping Cart</span>
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`p-3.5 rounded-full border transition-all ${
                  isFavorited
                    ? 'border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-550/20'
                    : 'border-white/10 bg-white/40 dark:bg-slate-900/40 text-slate-400 hover:text-rose-500'
                }`}
                aria-label="Add to wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-slate-100 dark:border-slate-800/80 pt-12">
        {/* Left Side: Rating summary */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Verified Feedback</h2>
            <p className="text-slate-500 text-sm mt-1">Read reviews left by genuine verified purchasers.</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 text-center space-y-2">
            <h3 className="text-5xl font-black gradient-text">{product.ratings}</h3>
            <div className="flex justify-center text-amber-400">
              {Array(5).fill(0).map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 ${
                    i < Math.round(product.ratings) ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'
                  }`} 
                />
              ))}
            </div>
            <p className="text-xs text-slate-450 uppercase tracking-wider font-bold pt-1">
              Average out of {reviews.length} reviews
            </p>
          </div>

          {/* Submit review Form */}
          {user ? (
            <form onSubmit={handleReviewSubmit} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <h4 className="font-bold text-sm tracking-wider uppercase text-slate-400">Submit Your Review</h4>
              
              {/* Rating selection stars */}
              <div className="space-y-1">
                <span className="text-xs text-slate-450">Stars Score</span>
                <div className="flex gap-1.5 text-amber-400 pt-0.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className="hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${num <= rating ? 'fill-amber-400' : 'text-slate-250 dark:text-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-450">Review Comment</span>
                <textarea
                  placeholder="Share your experience details..."
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-805 bg-white/40 dark:bg-slate-900/40 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={reviewSubmitLoading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-cyan-500 dark:hover:bg-cyan-400 hover:text-white transition-all disabled:opacity-55"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Review</span>
              </button>
            </form>
          ) : (
            <div className="glass-panel p-6 rounded-3xl border border-white/10 text-center space-y-3.5">
              <p className="text-xs text-slate-450 font-medium">Have you purchased this product?</p>
              <Link
                to="/login"
                className="inline-block px-6 py-2 border border-slate-200 dark:border-slate-800 rounded-full font-bold text-xs hover:border-cyan-500"
              >
                Log In to Review
              </Link>
            </div>
          )}
        </div>

        {/* Right Side: Reviews list */}
        <div className="lg:col-span-2 space-y-6 max-h-[500px] overflow-y-auto pr-2">
          {reviews.length === 0 ? (
            <div className="py-12 glass-panel border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center text-slate-400 text-sm">
              No product reviews have been posted yet. Be the first to review!
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{rev.name}</h4>
                    <span className="text-[10px] text-slate-450">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <div className="flex text-amber-400">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-250 dark:text-slate-700'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8 border-t border-slate-100 dark:border-slate-800/80 pt-12 animate-fadeIn">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">You May Also Like</h2>
            <p className="text-slate-500 text-sm mt-1">Discover other premium articles in the same product category.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div 
                key={p._id}
                className="glass-panel p-3 rounded-3xl border border-white/10 hover:border-cyan-500/20 glass-panel-hover"
              >
                <Link to={`/product/${p.slug}`} className="block relative aspect-square rounded-2xl overflow-hidden mb-4">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="px-2 space-y-1">
                  <Link to={`/product/${p.slug}`} className="block text-base font-bold truncate hover:text-cyan-500 transition-colors">
                    {p.name}
                  </Link>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-extrabold text-cyan-600 dark:text-cyan-400">${p.price}</span>
                    <Link
                      to={`/product/${p.slug}`}
                      className="px-3.5 py-1.5 text-[10px] font-bold rounded-full bg-slate-900 hover:bg-cyan-500 dark:bg-slate-800 dark:hover:bg-cyan-600 text-white transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
