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

import {
  Star,
  ShoppingBag,
  Heart,
  Check,
  Plus,
  Minus,
  ArrowLeft,
  Send,
  Truck,
  ShieldCheck,
  RotateCcw,
  Zap,
} from 'lucide-react';

import API from '../../services/api';

const ProductDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { product, detailLoading, error } = useSelector(
    (state) => state.products
  );

  const { user } = useSelector((state) => state.auth);

  const { wishlistItems } = useSelector((state) => state.wishlist);

  const [activeImage, setActiveImage] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [appliedOffer, setAppliedOffer] = useState(null);

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
const [showReviewPopup, setShowReviewPopup] = useState(false);
  const isFavorited = wishlistItems.some(
    (item) => item.product === product?._id
  );

  // Fetch Product Details
  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
  }, [slug, dispatch]);

  // Set default main image & variants once product details resolve
  useEffect(() => {
    if (product) {
      const defaultVars = {};
      let initialColorImage = product.images?.[0];

      product.variants?.forEach((v) => {
        defaultVars[v.name] = v.options[0];

        if (
          v.name.toLowerCase() === 'color' &&
          product.colorImages?.length > 0
        ) {
          const mapping = product.colorImages.find(
            (m) => m.color === v.options[0]
          );

          if (mapping && mapping.image) {
            initialColorImage = mapping.image;
          }
        }
      });

      setSelectedVariants(defaultVars);
      setActiveImage(initialColorImage);
      setQuantity(1);
      setSelectedSize(product.sizes?.length > 0 ? product.sizes[0] : null);

      // Fetch related products & reviews
      const fetchExtra = async () => {
        try {
          const [relatedRes, reviewsRes, offerRes] = await Promise.all([
            API.get(`/products?category=${product.category?._id}&limit=5`),
            API.get(`/reviews/${product._id}`),
            API.get(`/offers/product/${product._id}`),
          ]);

          setAppliedOffer(offerRes.data.data);

          setRelatedProducts(
            relatedRes.data.data
              .filter((x) => x._id !== product._id)
              .slice(0, 4)
          );

          setReviews(reviewsRes.data.data);
        } catch (err) {
          console.error('Error fetching extra metadata:', err);
        }
      };

      fetchExtra();
    }
  }, [product]);

  const handleVariantSelect = (variantName, optionValue) => {
    setSelectedVariants((prev) => {
      const newVars = { ...prev, [variantName]: optionValue };

      if (
        variantName.toLowerCase() === 'color' &&
        product.colorImages?.length > 0
      ) {
        const mapping = product.colorImages.find(
          (m) => m.color === optionValue
        );

        if (mapping && mapping.image) {
          setActiveImage(mapping.image);
        }
      }

      return newVars;
    });
  };

  const calculateFinalPrice = () => {
    if (!product) return 0;
    const basePrice = selectedSize ? selectedSize.price : product.price;
    return appliedOffer
      ? appliedOffer.discountType === 'percentage'
        ? basePrice - basePrice * (appliedOffer.discountValue / 100)
        : Math.max(0, basePrice - appliedOffer.discountValue)
      : basePrice;
  };

  const activeStock = selectedSize ? selectedSize.stock : product?.stock;

  const handleWishlistToggle = () => {
    if (!product) return;

    const finalPrice = calculateFinalPrice();

    if (isFavorited) {
      dispatch(removeFromWishlist(product._id));
      toast('Product removed from wishlist.', 'info');
    } else {
      dispatch(
        addToWishlist({
          product: product._id,
          name: product.name,
          price: finalPrice,
          image: product.images[0],
          stock: product.stock,
          slug: product.slug,
        })
      );

      toast('Product added to wishlist!', 'success');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (activeStock === 0) {
      toast('Sorry, this size is out of stock!', 'error');
      return;
    }

    const variantString = Object.entries(selectedVariants)
      .filter(([name]) => name.toLowerCase() !== 'size')
      .map(([name, opt]) => `${name}: ${opt}`)
      .join(', ');

    const finalPrice = calculateFinalPrice();

    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: finalPrice,
        image: product.images[0],
        quantity,
        stock: activeStock,
        variant: [variantString, selectedSize ? `Size: ${selectedSize.size}` : ''].filter(Boolean).join(', '),
      })
    );

    toast(`Added ${quantity} item(s) to cart!`, 'success');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast('Please login to submit review!', 'error');
      return;
    }

    if (!comment.trim()) {
      toast('Please enter review text.', 'error');
      return;
    }

    try {
      setReviewSubmitLoading(true);

      await dispatch(
        submitReview({
          productId: product._id,
          reviewData: { rating, comment },
        })
      ).unwrap();

      toast('Review submitted successfully!', 'success');

      setComment('');

      const reviewsRes = await API.get(`/reviews/${product._id}`);
      setReviews(reviewsRes.data.data);

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
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">
          Product Not Found
        </h2>

        <p className="text-slate-500 text-sm">
          {error || 'Unable to load this product.'}
        </p>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>
      </div>
    );
  }

  const finalPrice = calculateFinalPrice();

  return (
    <div className="space-y-16 pb-20">

      {/* Back Button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm font-semibold hover:text-cyan-500 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Collections</span>
      </Link>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        {/* LEFT SIDE */}
        <div className="space-y-5">

          {/* Main Image */}
          <div className="relative group aspect-square rounded-[2.5rem] overflow-hidden border border-white/10 glass-panel p-3 shadow-2xl">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover rounded-[2rem] transition-transform duration-700 group-hover:scale-105"
            />

            {/* Floating Add To Cart */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
              <button
                onClick={handleAddToCart}
                disabled={activeStock === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold shadow-2xl hover:bg-cyan-500 hover:text-white transition-all duration-300 disabled:opacity-40"
              >
                <ShoppingBag className="w-4 h-4" />
                {activeStock > 0 ? 'Add to Cart' : 'Sold Out'}
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 p-1 transition-all ${
                    activeImage === img
                      ? 'border-cyan-500 scale-95 shadow-lg'
                      : 'border-white/10 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={img}
                    alt="thumb"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-7">

          {/* Category */}
          <span className="inline-flex text-xs uppercase tracking-widest text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full font-bold">
            {product.category?.name}
          </span>

          {/* Product Name */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-amber-400">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(product.ratings)
                          ? 'fill-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  ))}
              </div>

              <span className="text-sm font-bold">
                {product.ratings} Rating
              </span>

              <span className="text-xs text-slate-400">
                ({product.numOfReviews} Reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-4 border-y border-slate-100 dark:border-slate-800 py-6">

            <div className="flex items-center flex-wrap gap-4">

              <span className="text-5xl font-black text-cyan-500">
                ₹{finalPrice.toFixed(2)}
              </span>

              {(appliedOffer ||
                (product.compareAtPrice &&
                  product.compareAtPrice > product.price)) && (
                <span className="text-xl text-slate-400 line-through">
                  ₹
                  {(
                    product.compareAtPrice || product.price
                  ).toFixed(2)}
                </span>
              )}

              {appliedOffer && (
                <span className="bg-rose-500 text-white text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-wider">
                  {appliedOffer.discountType === 'percentage'
                    ? `${appliedOffer.discountValue}% OFF`
                    : `₹${appliedOffer.discountValue} OFF`}
                </span>
              )}

              <span
                className={`ml-auto px-4 py-2 rounded-full text-xs font-bold ${
                  activeStock > 0
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-rose-500/10 text-rose-500'
                }`}
              >
                {activeStock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Offer */}
            {appliedOffer && (
              <div className="bg-slate-900/40 rounded-3xl border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                    Active Offer
                  </p>

                  <h4 className="text-white font-bold text-sm mt-1">
                    {appliedOffer.title}
                  </h4>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">
                    Ends In
                  </p>

                  <CountdownTimer
                    targetDate={appliedOffer.endDate}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-slate-500 leading-relaxed text-sm">
            {product.description}
          </p>

          {/* Size Selector with Dynamic Pricing */}
          {product.sizes?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-widest font-bold text-slate-400">Size</h4>
                {selectedSize && (
                  <span className="text-xs font-bold text-slate-400">
                    {selectedSize.stock > 0 ? `${selectedSize.stock} left` : 'Out of stock'}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((s) => {
                  const isSelected = selectedSize?.size === s.size;
                  const outOfStock = s.stock === 0;
                  return (
                    <button
                      key={s.size}
                      onClick={() => !outOfStock && setSelectedSize(s)}
                      disabled={outOfStock}
                      className={`relative px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        outOfStock
                          ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
                          : isSelected
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500 shadow-lg shadow-cyan-500/20'
                          : 'border-white/10 bg-white/40 dark:bg-slate-900/40 hover:border-cyan-400 hover:text-cyan-400'
                      }`}
                    >
                      {s.size}
                      <span className={`block text-[10px] mt-0.5 font-black ${
                        isSelected ? 'text-cyan-400' : 'text-slate-400'
                      }`}>₹{s.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

       

          {/* Quantity */}
          {activeStock > 0 && (
            <div className="space-y-3">

              <h4 className="text-xs uppercase tracking-widest font-bold text-slate-400">
                Quantity
              </h4>

              <div className="flex items-center border border-white/10 dark:border-slate-800 rounded-2xl overflow-hidden w-36 bg-white/40 dark:bg-slate-900/40">

                <button
                  onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex-1 text-center font-black">{quantity}</div>

                <button
                  onClick={() => setQuantity((prev) => Math.min(prev + 1, activeStock))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">

            <button
              onClick={handleAddToCart}
              disabled={activeStock === 0}
              className="flex-1 flex items-center justify-center gap-3 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
            >
              <ShoppingBag className="w-5 h-5" />
              {activeStock === 0 ? 'Out of Stock' : 'Add To Cart'}
            </button>

            <button
              onClick={handleWishlistToggle}
              className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all ${
                isFavorited
                  ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                  : 'border-white/10 bg-white/40 dark:bg-slate-900/40 text-slate-400 hover:text-rose-500'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorited ? 'fill-rose-500' : ''
                }`}
              />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-4">

            <div className="glass-panel rounded-2xl p-4 border border-white/10 flex gap-3 items-start">
              <Truck className="w-5 h-5 text-cyan-500 mt-0.5" />

              <div>
                <h5 className="font-bold text-sm">
                  Free Delivery
                </h5>

                <p className="text-xs text-slate-400 mt-1">
                  On premium orders
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-white/10 flex gap-3 items-start">
              <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5" />

              <div>
                <h5 className="font-bold text-sm">
                  Secure Payment
                </h5>

                <p className="text-xs text-slate-400 mt-1">
                  100% encrypted checkout
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-white/10 flex gap-3 items-start">
              <RotateCcw className="w-5 h-5 text-indigo-500 mt-0.5" />

              <div>
                <h5 className="font-bold text-sm">
                  Easy Returns
                </h5>

                <p className="text-xs text-slate-400 mt-1">
                  7 days return policy
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-white/10 flex gap-3 items-start">
              <Zap className="w-5 h-5 text-amber-500 mt-0.5" />

              <div>
                <h5 className="font-bold text-sm">
                  Fast Shipping
                </h5>

                <p className="text-xs text-slate-400 mt-1">
                  Dispatch within 24hrs
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Reviews Section */}
    {/* ───────────────── CUSTOMER REVIEWS POPUP SECTION ───────────────── */}
<section className="border-t border-slate-100 dark:border-slate-800 pt-16">

  {/* Header */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">

    <div>
      <h2 className="text-3xl font-black tracking-tight">
        Customer Reviews
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        Trusted reviews from verified buyers.
      </p>
    </div>

    {/* Open Popup Button */}
    <button
      onClick={() => setShowReviewPopup(true)}
      className="inline-flex items-center text-center justify-center gap-3 px-7 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all"
    >
      <Star className="w-4 h-4 fill-white" />
      Add Reviews
    </button>
  </div>

  {/* Small Review Preview */}
 {reviews.length > 0 ? (
  <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reviews.map((rev) => (
        <div
          key={rev._id}
          className="glass-panel rounded-[2rem] border border-white/10 p-8 hover:border-cyan-500/20 transition-all"
        >

          {/* Top */}
          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-4">

              {/* Avatar */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center font-black uppercase text-slate-700 dark:text-slate-200">
                {rev.name?.charAt(0)}
              </div>

              {/* User Info */}
              <div>
                <h4 className="font-bold text-sm">
                  {rev.name}
                </h4>

                <p className="text-xs text-slate-400">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1 rounded-xl">
              <span className="font-black text-amber-500">
                {rev.rating}
              </span>

              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>

          {/* Comment */}
          <p className="text-sm text-slate-500 mt-6 leading-relaxed italic">
            "{rev.comment}"
          </p>
        </div>
      ))}
    </div>
  </div>
) : (
  <div className="py-20 text-center glass-panel rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
    <h3 className="text-xl font-bold">
      No Reviews Yet
    </h3>

    <p className="text-sm text-slate-400 mt-2">
      Be the first to review this product.
    </p>
  </div>
)}

  {/* ───────────── REVIEW POPUP MODAL ───────────── */}
  {showReviewPopup && (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md px-4 animate-fadeIn">

      {/* Modal */}
      <div className="relative w-full max-w-4xl glass-panel rounded-[2.5rem] border border-white/10 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden animate-scaleIn">

        {/* Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full"></div>

        {/* Header */}
        <div className="relative flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800">

          <div>
            <h2 className="text-3xl font-black">
              Customer Reviews
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Trusted reviews from verified buyers.
            </p>
          </div>

          {/* Close */}
          <button
            onClick={() => setShowReviewPopup(false)}
            className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[80vh] overflow-y-auto p-8">

          {/* Review Form */}
          {user && (
            <div className="glass-panel rounded-[2rem] p-8 border border-white/10 mb-10 space-y-6">

              <div>
                <h3 className="text-xl font-black">
                  Write A Review
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Share your shopping experience.
                </p>
              </div>

              <form
                onSubmit={handleReviewSubmit}
                className="space-y-6"
              >

                {/* Rating */}
                <div>
                  <label className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3 block">
                    Rating
                  </label>

                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        className="transition-all hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 transition-all ${
                            num <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3 block">
                    Review
                  </label>

                  <textarea
                    rows={5}
                    required
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                    placeholder="Share your experience..."
                    className="w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={reviewSubmitLoading}
                  className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  {reviewSubmitLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Review
                    </>
                  )}
                </button>
              </form>
            </div>
          )}          
        </div>
      </div>
    </div>
  )}
</section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8 border-t border-slate-100 dark:border-slate-800 pt-16">

          <div>
            <h2 className="text-3xl font-black">
              You May Also Like
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Explore more premium products.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;