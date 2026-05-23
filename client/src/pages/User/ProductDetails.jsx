import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductBySlug, submitReview } from '../../redux/slices/productSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { useToast } from '../../components/common/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductCard from '../../components/common/ProductCard';
import CountdownTimer from '../../components/common/CountdownTimer';
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
  const [appliedOffer, setAppliedOffer] = useState(null);
  
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
      // Auto-set first option for each variant
      const defaultVars = {};
      let initialColorImage = product.images[0];

      product.variants.forEach((v) => {
        defaultVars[v.name] = v.options[0];
        // If this is a color variant and has a mapping, use it for initial active image
        if (v.name.toLowerCase() === 'color' && product.colorImages?.length > 0) {
          const mapping = product.colorImages.find(m => m.color === v.options[0]);
          if (mapping && mapping.image) {
            initialColorImage = mapping.image;
          }
        }
      });
      
      setSelectedVariants(defaultVars);
      setActiveImage(initialColorImage);
      setQuantity(1);

      // Fetch related products & reviews
      const fetchExtra = async () => {
        try {
          const [relatedRes, reviewsRes, offerRes] = await Promise.all([
            API.get(`/products?category=${product.category?._id}&limit=5`),
            API.get(`/reviews/${product._id}`),
            API.get(`/offers/product/${product._id}`)
          ]);
          setAppliedOffer(offerRes.data.data);
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
    setSelectedVariants((prev) => {
      const newVars = { ...prev, [variantName]: optionValue };
      
      // If we just selected a color, check if there's a mapped image for it
      if (variantName.toLowerCase() === 'color' && product.colorImages?.length > 0) {
        const mapping = product.colorImages.find(m => m.color === optionValue);
        if (mapping && mapping.image) {
          setActiveImage(mapping.image);
        }
      }
      
      return newVars;
    });
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    const finalPrice = appliedOffer
      ? appliedOffer.discountType === 'percentage'
        ? product.price - (product.price * (appliedOffer.discountValue / 100))
        : Math.max(0, product.price - appliedOffer.discountValue)
      : product.price;

    if (isFavorited) {
      dispatch(removeFromWishlist(product._id));
      toast('Product removed from wishlist.', 'info');
    } else {
      dispatch(addToWishlist({
        product: product._id,
        name: product.name,
        price: finalPrice,
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

    const finalPrice = appliedOffer
      ? appliedOffer.discountType === 'percentage'
        ? product.price - (product.price * (appliedOffer.discountValue / 100))
        : Math.max(0, product.price - appliedOffer.discountValue)
      : product.price;

    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: finalPrice,
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
          <div className="flex flex-col gap-4 border-y border-slate-100 dark:border-slate-800/80 py-6">
            <div className="flex items-baseline space-x-3.5">
              <span className="text-4xl font-black text-cyan-600 dark:text-cyan-400">
                ₹{appliedOffer 
                  ? (appliedOffer.discountType === 'percentage' 
                      ? (product.price - (product.price * (appliedOffer.discountValue / 100))).toFixed(2)
                      : Math.max(0, product.price - appliedOffer.discountValue).toFixed(2))
                  : product.price.toFixed(2)}
              </span>
              {(appliedOffer || (product.compareAtPrice && product.compareAtPrice > product.price)) && (
                <span className="text-lg text-slate-400 line-through font-medium">₹{(product.compareAtPrice || product.price).toFixed(2)}</span>
              )}
              
              {appliedOffer && (
                <span className="bg-rose-500 text-white text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-wider ml-2">
                  {appliedOffer.discountType === 'percentage' ? `${appliedOffer.discountValue}%` : `₹${appliedOffer.discountValue}`} OFF
                </span>
              )}

              {/* Stock availability indicators */}
              <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${
                product.stock > 0 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : 'bg-rose-500/10 text-rose-500'
              }`}>
                {product.stock > 0 ? `In Stock` : 'Out of Stock'}
              </span>
            </div>

            {appliedOffer && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5 mt-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Offer</p>
                  <p className="text-sm font-bold text-white">{appliedOffer.title}</p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ending In</p>
                  <CountdownTimer targetDate={appliedOffer.endDate} />
                </div>
              </div>
            )}
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

      {/* ── CUSTOMER FEEDBACK & REVIEWS ── */}
      <section className="border-t border-slate-100 dark:border-slate-800/80 pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Customer Feedback</h2>
            <p className="text-slate-500 text-sm mt-1">Authentic experiences from verified community members.</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-full">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>100% Verified Community</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Summary & Form (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Rating Summary Card */}
            <div className="glass-panel p-8 rounded-[2rem] border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors" />
              
              <div className="relative space-y-4 text-center">
                <div className="inline-flex items-end gap-1">
                  <h3 className="text-6xl font-black gradient-text tracking-tighter">{product.ratings || 0}</h3>
                  <span className="text-slate-400 font-bold mb-2">/ 5</span>
                </div>
                
                <div className="flex justify-center gap-1.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`w-6 h-6 ${s <= Math.round(product.ratings) ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-800'}`} 
                    />
                  ))}
                </div>
                
                <div className="pt-2">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Based on {reviews.length} total reviews</p>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">94% Recommend this item</p>
                </div>
              </div>

              {/* Stars Distribution Bar */}
              <div className="mt-8 space-y-3">
                {[5, 4, 3, 2, 1].map((s) => {
                  const count = reviews.filter(r => Math.round(r.rating) === s).length;
                  const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <span className="text-xs font-bold w-3 text-slate-400">{s}</span>
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            s >= 4 ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : s === 3 ? 'bg-amber-400' : 'bg-slate-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold w-8 text-right text-slate-450">{Math.round(percent)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submission Form Component */}
            <div className="glass-panel p-8 rounded-[2rem] border border-white/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Write a Review</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Join the discussion</p>
                </div>
              </div>

              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Rating Score</label>
                    <div className="flex gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onMouseEnter={() => setRating(num)}
                          onClick={() => setRating(num)}
                          className={`group transition-all duration-300 ${num <= rating ? 'scale-110' : 'scale-90 opacity-40'}`}
                        >
                          <Star 
                            className={`w-7 h-7 transition-all ${
                              num <= rating ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]' : 'text-slate-400'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Your Feedback</label>
                    <textarea
                      required
                      placeholder="What did you like or dislike about this product? Your honest feedback helps others make better choices."
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-400"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitLoading}
                    className="w-full flex items-center justify-center space-x-3 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {reviewSubmitLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Private Review</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                    <Heart className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm">Sign in to Review</h5>
                    <p className="text-xs text-slate-450 px-4">You must be logged in to leave a verified purchase review.</p>
                  </div>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                  >
                    Secure Login
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Reviews List (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 glass-panel border border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] text-center space-y-4 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-xl">
                  <Star className="w-10 h-10 text-slate-200" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">No reviews yet</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">Be the first to share your thoughts on this product and help the community!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5 max-h-[1000px] overflow-y-auto pr-4 scrollbar-hide">
                {reviews.map((rev, idx) => (
                  <div 
                    key={rev._id} 
                    className="glass-panel p-8 rounded-[2.5rem] border border-white/10 space-y-5 group hover:border-cyan-500/30 transition-all duration-500 animate-fadeIn"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 font-extrabold shadow-sm border border-white/5 uppercase">
                          {rev.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{rev.name}</h4>
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <Check className="w-2.5 h-2.5" />
                              Verified
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">
                            Reviewed on {new Date(rev.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20">
                        <span className="text-sm font-black text-amber-500">{rev.rating.toFixed(1)}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </div>
                    </div>

                    <div className="relative pl-0 sm:pl-16">
                      {/* Decorative quote mark */}
                      <svg className="absolute top-0 left-0 -mt-2 ml-4 w-10 h-10 text-slate-100 dark:text-slate-800/50 -z-10" fill="currentColor" viewBox="0 0 32 32">
                        <path d="M10 8v8l-4 8H2l4-8V8h4zm12 0v8l-4 8h-4l4-8V8h4z" />
                      </svg>
                      
                      <p className="text-sm sm:text-base text-slate-650 dark:text-slate-350 leading-relaxed font-medium italic">
                        "{rev.comment}"
                      </p>
                    </div>

                   
                  </div>
                ))}
              </div>
            )}
          </div>
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
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
