import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { useToast } from '../../components/common/ToastContext';
import { ShoppingCart, Trash2, Heart, ShoppingBag } from 'lucide-react';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const handleMoveToCart = (item) => {
    if (item.stock === 0) {
      toast('Item is out of stock. Cannot move to cart.', 'error');
      return;
    }

    // Add to cart
    dispatch(addToCart({
      product: item.product,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      stock: item.stock,
      variant: '' // default no variant
    }));

    // Remove from wishlist
    dispatch(removeFromWishlist(item.product));
    
    toast('Moved item to shopping cart!', 'success');
  };

  const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId));
    toast('Item removed from wishlist.', 'info');
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="text-5xl">💖</div>
        <h2 className="text-2xl font-extrabold tracking-tight">Your Wishlist is Empty</h2>
        <p className="text-slate-500 text-sm">
          Keep track of luxury articles you love by saving them in your personalized wishlist.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold transition-all shadow-md active:scale-95"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Browse Catalogue</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <h1 className="text-3xl font-extrabold tracking-tight">My Wishlist</h1>
      <p className="text-sm text-slate-500">A collection of premium items you have favorited and saved for later.</p>

      <div className="glass-panel border border-white/10 rounded-[2rem] overflow-hidden shadow-lg p-6 space-y-6">
        {wishlistItems.map((item) => (
          <div
            key={item.product}
            className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/85 last:border-b-0 last:pb-0"
          >
            {/* Item image & details */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-base hover:text-cyan-500 transition-colors">
                  <Link to={`/product/${item.slug}`}>{item.name}</Link>
                </h3>
                <span className={`text-xs font-bold ${item.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Pricing & Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className="font-extrabold text-cyan-650 dark:text-cyan-400">₹{item.price.toFixed(2)}</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  disabled={item.stock === 0}
                  onClick={() => handleMoveToCart(item)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-cyan-500 dark:bg-slate-800 dark:hover:bg-cyan-600 text-white font-bold text-xs transition-all shadow disabled:opacity-40"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>

                <button
                  onClick={() => handleRemove(item.product)}
                  className="p-2 rounded-full border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-500 dark:hover:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
