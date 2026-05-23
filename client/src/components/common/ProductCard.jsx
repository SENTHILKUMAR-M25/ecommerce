import React from 'react';
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

  // Calculate offer price — manual prop takes priority over backend activeOffer
  const currentOffer = offer || product.activeOffer;
  let displayPrice = product.price;
  let originalPrice = product.compareAtPrice || null;
  let discountBadge = null;

  if (currentOffer) {
    if (currentOffer.discountType === 'percentage') {
      displayPrice = product.price - product.price * (currentOffer.discountValue / 100);
      discountBadge = `${currentOffer.discountValue}% OFF`;
    } else {
      displayPrice = Math.max(0, product.price - currentOffer.discountValue);
      discountBadge = `₹${currentOffer.discountValue} OFF`;
    }
    originalPrice = originalPrice || product.price;
  } else if (product.compareAtPrice && product.compareAtPrice > product.price) {
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
    <div className="glass-panel rounded-2xl sm:rounded-3xl border border-white/10 hover:border-cyan-500/20 glass-panel-hover flex flex-col h-full transition-all duration-300 overflow-hidden">

      {/* ── IMAGE ── */}
      <div className="relative aspect-square overflow-hidden group bg-slate-100 dark:bg-slate-900">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={resolveImage(product.images?.[0])}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/400x400/1e293b/94a3b8?text=${encodeURIComponent(product.name)}`;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Discount badge */}
        {discountBadge && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-rose-500 text-white text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-bold uppercase tracking-wider z-10 leading-tight">
            {discountBadge}
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full border transition-all z-10 backdrop-blur-md cursor-pointer ${
            isFavorited
              ? 'border-rose-500/30 bg-rose-500/20 text-rose-500'
              : 'border-white/10 bg-black/40 text-slate-300 hover:text-rose-500 hover:bg-white/20'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-3.5 gap-2">

        {/* Category */}
        <span className="text-[9px] sm:text-[10px] text-cyan-600 dark:text-cyan-400 uppercase font-bold tracking-widest truncate">
          {product.category?.name}
        </span>

        {/* Product name */}
        <Link
          to={`/product/${product.slug}`}
          className="text-sm sm:text-base font-bold leading-tight line-clamp-2 hover:text-cyan-500 transition-colors flex-1"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
          <span className="text-xs font-bold">{product.ratings}</span>
          <span className="text-[10px] sm:text-xs text-slate-400">({product.numOfReviews})</span>
        </div>

        {/* ── PRICE + CART ── */}
        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-white/5 dark:border-slate-800/60">
          {/* Price */}
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="text-base sm:text-lg font-extrabold text-cyan-600 dark:text-cyan-400 leading-none">
              ₹{Math.round(displayPrice).toLocaleString()}
            </span>
            {originalPrice && originalPrice > displayPrice && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through leading-none">
                ₹{Math.round(originalPrice).toLocaleString()}
              </span>
            )}
          </div>

          {/* Cart button — icon only on xs, icon+text on sm+ */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-full bg-slate-900 hover:bg-cyan-500 dark:bg-slate-800 dark:hover:bg-cyan-600 text-white transition-all disabled:opacity-40 active:scale-95 cursor-pointer"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">
              {product.stock > 0 ? 'Add' : 'Sold Out'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
