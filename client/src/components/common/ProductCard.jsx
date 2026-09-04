import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({
  product,
  isWishlisted = false,
  onWishlistChange,
  onCartChange
}) {
  const { user, setCartCount, setWishlistCount } = useAuth();
  const [inWishlist, setInWishlist] = useState(isWishlisted);
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const navigate = useNavigate();

  const finalPrice = Number(product.price) - Number(product.discount || 0);
  const isOutOfStock = Number(product.stock) <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/');
      return;
    }
    if (isOutOfStock || isAddingCart) return;

    setIsAddingCart(true);
    try {
      const res = await api.post(`/api/cart/add/${product._id}`);
      if (res.data.cartCount !== undefined) {
        setCartCount(res.data.cartCount);
      }
      if (onCartChange) onCartChange(product);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingCart(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/');
      return;
    }
    if (isTogglingWishlist) return;

    setIsTogglingWishlist(true);
    try {
      const res = await api.post(`/api/wishlist/toggle/${product._id}`);
      setInWishlist(res.data.inWishlist);
      if (res.data.wishlistCount !== undefined) {
        setWishlistCount(res.data.wishlistCount);
      }
      if (onWishlistChange) onWishlistChange(product, res.data.inWishlist);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  // Image source helper (handles base64, static images, or fallback)
  const getImageSrc = () => {
    if (!product.image) return '/images/1bag.png';
    if (product.image.startsWith('data:') || product.image.startsWith('http')) {
      return product.image;
    }
    if (product.image.startsWith('/images/')) {
      return product.image;
    }
    return `/images/${product.image}`;
  };

  return (
    <div className="product-card group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-dark-900/5 transition-all duration-500 flex flex-col overflow-hidden relative h-full">
      {/* Top Media & Tags */}
      <Link to={`/product/${product._id}`} className="relative pt-[100%] bg-ivory-100 overflow-hidden block">
        <img
          src={getImageSrc()}
          alt={product.name}
          className="product-image absolute inset-0 w-full h-full object-contain p-6 mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/1bag.png';
          }}
        />

        {/* Discount Badge */}
        {Number(product.discount) > 0 && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-dark-900 text-white shadow-md tracking-widest uppercase">
              ₹{product.discount} OFF
            </span>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 shadow-sm tracking-wider">
              SOLD OUT
            </span>
          ) : Number(product.stock) <= 5 ? (
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 shadow-sm tracking-wider">
              ONLY {product.stock} LEFT
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-dark-400 hover:text-rose-500 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
          title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <i className={`${inWishlist ? 'ri-heart-fill text-rose-500' : 'ri-heart-line'} text-lg`}></i>
        </button>
      </Link>

      {/* Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
        <div>
          {/* Category & Seller */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600">
              {product.category || 'General'}
            </span>
            {product.seller && (
              <span className="text-[10px] uppercase tracking-wider text-dark-400 font-semibold truncate max-w-[100px]">
                {product.seller.shopName || 'ShopSphere'}
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/product/${product._id}`} className="block">
            <h3 className="text-base font-serif font-bold text-dark-900 line-clamp-2 leading-tight group-hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-end justify-between mt-2 pt-4 border-t border-gray-100/60">
          <div className="flex flex-col">
            {Number(product.discount) > 0 && (
              <span className="text-[11px] font-semibold text-dark-400 line-through mb-0.5">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-lg font-bold text-dark-900 tracking-tight">
              ₹{finalPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingCart}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-dark-900 hover:bg-brand-600 text-white shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0'
            }`}
            title={isOutOfStock ? "Out of stock" : "Add to cart"}
          >
            {isAddingCart ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <i className="ri-shopping-bag-line text-lg"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
