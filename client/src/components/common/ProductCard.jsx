import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { useToast } from './ToastContext';

const ProductCard = ({ product, offer }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { wishlistItems } = useSelector((state) => state.wishlist);

  // Calculate Offer Price if offer is provided
  // Priority: 1. Manual prop, 2. Backend provided activeOffer
  const currentOffer = offer || product.activeOffer;
  let displayPrice = product.price;
  let originalPrice = product.compareAtPrice || product.price;
  let discountBadge = null;

  if (currentOffer) {
    if (currentOffer.discountType === 'percentage') {
      displayPrice = product.price - (product.price * (currentOffer.discountValue / 100));
      discountBadge = `${currentOffer.discountValue}% OFF`;
    } else {
      displayPrice = Math.max(0, product.price - currentOffer.discountValue);
      discountBadge = `₹${currentOffer.discountValue} OFF`;
    }
  }

  const isFavorited = wishlistItems.some((item) => item.product === product._id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorited) {
      dispatch(removeFromWishlist(product._id));
      toast('Product removed from wishlist.', 'info');
    } else {
      dispatch(
        addToWishlist({
          product: product._id,
          name: product.name,
          price: displayPrice,
          image: product.images[0],
          stock: product.stock,
          slug: product.slug,
        })
      );
      toast('Product added to wishlist!', 'success');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) {
      toast('Sorry, this product is currently out of stock!', 'error');
      return;
    }

    // Compile default variants if any (first option of each variant)
    const defaultVars = {};
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        defaultVars[v.name] = v.options[0];
      });
    }

    const variantString = Object.entries(defaultVars)
      .map(([name, opt]) => `${name}: ${opt}`)
      .join(', ');

    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: displayPrice,
        image: product.images[0],
        quantity: 1,
        stock: product.stock,
        variant: variantString,
      })
    );

    toast('Added item to shopping cart!', 'success');
  };

  return (
    <div className="glass-panel p-3 rounded-3xl border border-white/10 hover:border-cyan-500/20 glass-panel-hover flex flex-col h-full justify-between transition-all duration-300">
      <div>
        <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 group">
          <Link to={`/product/${product.slug}`} className="block w-full h-full">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 animate-fadeIn"
            />
          </Link>
          {(discountBadge || (product.compareAtPrice && product.compareAtPrice > product.price)) && (
            <span className="absolute top-3.5 left-3.5 bg-rose-500 text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider z-10">
              {discountBadge || 'Sale'}
            </span>
          )}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-3.5 right-3.5 p-2 rounded-full border transition-all z-10 backdrop-blur-md cursor-pointer ${
              isFavorited
                ? 'border-rose-500/20 bg-rose-500/20 text-rose-500 hover:bg-rose-500/30'
                : 'border-white/10 bg-black/40 text-slate-300 hover:text-rose-500 hover:bg-white/20'
            }`}
            aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
        <div className="px-2 space-y-1">
          <span className="text-[10px] text-slate-450 uppercase font-bold tracking-widest">
            {product.category?.name}
          </span>
          <Link
            to={`/product/${product.slug}`}
            className="block text-lg font-bold truncate hover:text-cyan-500 transition-colors"
          >
            {product.name}
          </Link>
          <div className="flex items-center space-x-1.5 pt-0.5">
            <Star className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />
            <span className="text-sm font-bold">{product.ratings}</span>
            <span className="text-xs text-slate-400">({product.numOfReviews})</span>
          </div>
        </div>
      </div>
      <div className="px-2 pt-3 flex justify-between items-center gap-2">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400">₹{Math.round(displayPrice)}</span>
          {(discountBadge || (product.compareAtPrice && product.compareAtPrice > product.price)) && (
            <span className="text-sm text-slate-400 line-through">₹{originalPrice}</span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="px-3.5 py-2 text-xs font-bold rounded-full bg-slate-900 hover:bg-cyan-500 dark:bg-slate-800 dark:hover:bg-cyan-600 text-white transition-all disabled:opacity-40 flex items-center gap-1 active:scale-95 cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
