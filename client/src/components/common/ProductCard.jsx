import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { useToast } from './ToastContext';
import { resolveImage } from '../../services/api';

const ProductCard = ({ product, offer }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { wishlistItems } = useSelector((state) => state.wishlist);

  // Price and offer handling
  const [selectedSize, setSelectedSize] = useState(product.sizeOptions?.[0]?.size ?? null);

  // Respect explicit `offer` prop first, then product.activeOffer.
  // Use state + timer so an offer that expires while the user is viewing
  // will be automatically removed from the UI.
  const rawOffer = offer || product.activeOffer;

  const computeActiveOffer = (r, nowDate = new Date()) => {
    if (!r) return null;
    if (!r.endDate) return r;
    const end = new Date(r.endDate);
    if (isNaN(end)) return r;
    return end < nowDate ? null : r;
  };

  // `now` is used to trigger a re-evaluation when an offer expires.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let timer;
    const current = rawOffer;
    if (current && current.endDate) {
      const end = new Date(current.endDate).getTime();
      const ms = end - Date.now() + 500; // small buffer
      if (ms > 0) {
        timer = setTimeout(() => setNow(Date.now()), ms);
      } else {
        // already expired, force re-eval asynchronously
        timer = setTimeout(() => setNow(Date.now()), 0);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [rawOffer]);

  const activeOffer = computeActiveOffer(rawOffer, new Date(now));

  // Base price may change depending on `sizeOptions` (per-product size pricing)
  let basePrice = product.price;
  if (product.sizeOptions?.length && selectedSize) {
    const sizeObj = product.sizeOptions.find((s) => s.size === selectedSize);
    if (sizeObj && typeof sizeObj.price === 'number') basePrice = sizeObj.price;
  }

  let displayPrice = basePrice;
  let originalPrice = product.compareAtPrice || null;
  let discountBadge = null;

  if (activeOffer) {
    if (activeOffer.discountType === 'percentage') {
      displayPrice = Math.round(basePrice - basePrice * (activeOffer.discountValue / 100));
      discountBadge = `${activeOffer.discountValue}% OFF`;
    } else {
      displayPrice = Math.round(Math.max(0, basePrice - activeOffer.discountValue));
      discountBadge = `₹${activeOffer.discountValue} OFF`;
    }
    originalPrice = originalPrice || basePrice;
  } else if (product.compareAtPrice && product.compareAtPrice > basePrice) {
    originalPrice = product.compareAtPrice;
    discountBadge = 'Sale';
  }

  const isFavorited = wishlistItems.some((item) => item.product === product._id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorited) {
      dispatch(removeFromWishlist(product._id));
      toast('Removed from wishlist.', 'info');
    } else {
      dispatch(
        addToWishlist({
          product: product._id,
          name: product.name,
          price: displayPrice,
          image: product.images?.[0],
          stock: product.stock,
          slug: product.slug,
        })
      );
      toast('Added to wishlist!', 'success');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) {
      toast('This product is out of stock!', 'error');
      return;
    }
    const defaultVars = {};
    if (product.variants?.length > 0) {
      product.variants.forEach((v) => { defaultVars[v.name] = v.options[0]; });
    }
    const variantString = Object.entries(defaultVars)
      .map(([name, opt]) => `${name}: ${opt}`)
      .join(', ');

    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: displayPrice,
        image: product.images?.[0],
        quantity: 1,
        stock: product.stock,
        variant: variantString,
      })
    );
    toast('Added to cart!', 'success');
  };

  return (
    <div className="group relative flex flex-col h-full overflow-hidden rounded-[28px] border border-white/10 dark:border-white/5 bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(6,182,212,0.18)] hover:-translate-y-1 transition-all duration-500">

  {/* Animated Glow */}
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none">
    <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full"></div>
    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-500/20 blur-3xl rounded-full"></div>
  </div>

  {/* ───────────────── IMAGE ───────────────── */}
  <div className="relative aspect-square overflow-hidden rounded-b-3xl bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">

    {/* Product Image */}
    <Link
      to={`/product/${product.slug}`}
      className="block w-full h-full"
    >
      <img
        src={resolveImage(product.images?.[0])}
        alt={product.name}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://placehold.co/600x600/0f172a/94a3b8?text=${encodeURIComponent(product.name)}`;
        }}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
    </Link>

    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-70"></div>

    {/* Discount Badge */}
    {discountBadge && (
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
        <span className="px-3 py-1 rounded-full bg-linear-to-r from-rose-500 to-pink-500 text-white text-[10px] sm:text-xs font-black tracking-wider shadow-lg uppercase">
          {discountBadge}
        </span>
      </div>
    )}

    {/* Wishlist Button */}
    <button
      onClick={handleWishlistToggle}
      className={`absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 rounded-2xl backdrop-blur-xl border transition-all duration-300 flex items-center justify-center shadow-lg ${
        isFavorited
          ? "bg-rose-500/20 border-rose-500/30 text-rose-500"
          : "bg-black/30 border-white/10 text-white hover:bg-white/20 hover:text-rose-500"
      }`}
      aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`w-4 h-4 transition ${
          isFavorited ? "fill-rose-500 scale-110" : ""
        }`}
      />
    </button>

   
<div className="absolute bottom-4  left-1/2 hidden -translate-x-1/2 translate-y-10 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:flex md:flex">
  <button
    onClick={handleAddToCart}
    disabled={product.stock === 0}
    className="flex items-center gap-2 rounded-full bg-white p-2   text-xs font-bold text-slate-900 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-cyan-500 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-900 dark:text-white"
  >
    <ShoppingBag className="h-4 w-4" />

    <span>
      {product.stock > 0 ? "Add to Cart" : "Sold Out"}
    </span>

   
  </button>
</div>
    {/* Out Of Stock */}
    {product.stock === 0 && (
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
        <span className="px-5 py-2 rounded-full bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-[3px]">
          Out Of Stock
        </span>
      </div>
    )}
  </div>

  {/* ───────────────── BODY ───────────────── */}
  <div className="relative flex flex-col flex-1 p-4 sm:p-5">

    {/* Category */}
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <span className="text-[10px] uppercase tracking-[2px] font-bold text-cyan-500">
        {product.category?.name}
      </span>

      {product.subcategory?.name && (
        <>
          <span className="text-slate-400 text-xs">•</span>

          <span className="px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] uppercase tracking-wide font-bold">
            {product.subcategory.name}
          </span>
        </>
      )}
    </div>
 <div className="flex justify-between items-center gap-2 flex-1">
    {/* Product Name */}
    <Link
      to={`/product/${product.slug}`}
      className="text-[15px] sm:text-lg font-bold leading-snug text-slate-800 dark:text-white line-clamp-2 hover:text-cyan-500 transition-colors duration-300 "
    >
      {product.name}
    </Link>

    {/* Rating */}
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />

        <span className="text-xs font-bold text-amber-500">
          {product.ratings}
        </span>
      </div>

      <span className="text-xs text-slate-400">
        {product.numOfReviews} Reviews
      </span>
    </div>
</div>
    {/* Divider */}
    <div className="my-4 h-px bg-linear-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>

    {/* Size / Band Type Selector (updates price) */}
    {product.sizeOptions?.length > 0 && (
      <div className="mb-3 flex flex-wrap gap-2">
        {product.sizeOptions.map((s) => (
          <button
            key={s.size}
            onClick={(e) => {
              e.preventDefault();
              setSelectedSize(s.size);
            }}
            className={`px-3 py-1 rounded-full border transition text-sm ${
              selectedSize === s.size
                ? 'bg-cyan-500 text-white border-cyan-500'
                : 'bg-white/50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-white/10'
            }`}
          >
            {s.size}
          </button>
        ))}
      </div>
    )}

    {/* Bottom */}
    <div className="flex items-end justify-between gap-3">

      {/* Price */}
      <div className="flex gap-4 items-baseline min-w-0">
        {originalPrice && originalPrice > displayPrice && (
          <span className="text-xs text-slate-400 line-through">
            ₹{Math.round(originalPrice).toLocaleString()}
          </span>
        )}

        <span className="text-2xl font-black bg-linear-to-r from-cyan-500 to-indigo-500 bg-clip-text text-transparent leading-none">
          ₹{Math.round(displayPrice).toLocaleString()}
        </span>
      </div>

      {/* Mobile Add Button */}
      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className="sm:hidden flex items-center justify-center w-11 h-11 rounded-2xl bg-linear-to-r from-cyan-500 to-indigo-500 text-white shadow-xl active:scale-95 transition-all duration-300 disabled:opacity-40"
      >
        <ShoppingBag className="w-4 h-4" />
      </button>
    </div>
  </div>
</div>
  );
};

export default ProductCard;
