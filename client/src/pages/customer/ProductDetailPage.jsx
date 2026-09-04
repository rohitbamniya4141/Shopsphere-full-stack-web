import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user, setCartCount, setWishlistCount } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [flashMessage, setFlashMessage] = useState({ type: '', text: '' });

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/products/${id}`);
      setData(res.data);
      setInWishlist(res.data.inWishlist || false);
    } catch (err) {
      console.error(err);
      navigate('/shop');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading || !data) {
    return <LoadingSpinner fullScreen text="Loading product details..." />;
  }

  const { product, reviews, avgRating, hasPurchased, hasReviewed, relatedProducts } = data;
  const finalPrice = Number(product.price) - Number(product.discount || 0);
  const isOutOfStock = Number(product.stock) <= 0;

  const getImageSrc = () => {
    if (!product.image) return '/images/1bag.png';
    if (product.image.startsWith('data:') || product.image.startsWith('http')) return product.image;
    if (product.image.startsWith('/images/')) return product.image;
    return `/images/${product.image}`;
  };

  const handleAddToCart = async () => {
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
      setFlashMessage({ type: 'success', text: `Added "${product.name}" to cart!` });
    } catch (err) {
      setFlashMessage({ type: 'error', text: err.message });
    } finally {
      setIsAddingCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/');
      return;
    }
    if (isOutOfStock) return;
    try {
      const res = await api.post(`/api/cart/add/${product._id}`);
      if (res.data.cartCount !== undefined) {
        setCartCount(res.data.cartCount);
      }
      navigate('/checkout');
    } catch (err) {
      setFlashMessage({ type: 'error', text: err.message });
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/');
      return;
    }
    try {
      const res = await api.post(`/api/wishlist/toggle/${product._id}`);
      setInWishlist(res.data.inWishlist);
      if (res.data.wishlistCount !== undefined) {
        setWishlistCount(res.data.wishlistCount);
      }
      setFlashMessage({
        type: 'success',
        text: res.data.inWishlist ? 'Added to wishlist' : 'Removed from wishlist'
      });
    } catch (err) {
      setFlashMessage({ type: 'error', text: err.message });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await api.post(`/api/products/${product._id}/review`, {
        rating: Number(rating),
        comment
      });
      setComment('');
      setFlashMessage({ type: 'success', text: 'Thank you for your review!' });
      await fetchProduct();
    } catch (err) {
      setFlashMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 animate-fade-in-up">
      <AlertMessage
        type={flashMessage.type}
        message={flashMessage.text}
        onClose={() => setFlashMessage({ type: '', text: '' })}
      />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dark-400 mb-10">
        <Link to="/shop" className="hover:text-brand-500 transition-colors">
          Shop
        </Link>
        <i className="ri-arrow-right-s-line text-sm"></i>
        <Link
          to={`/shop?category=${encodeURIComponent(product.category || 'General')}`}
          className="hover:text-brand-500 transition-colors"
        >
          {product.category || 'General'}
        </Link>
        <i className="ri-arrow-right-s-line text-sm"></i>
        <span className="text-dark-900 truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
        {/* Left: Product Image */}
        <div className="lg:col-span-6 lg:col-start-1">
          <div className="sticky top-28 relative pt-[110%] rounded-[2rem] bg-ivory-200 border border-ivory-300 shadow-sm overflow-hidden flex items-center justify-center">
            <img
              src={getImageSrc()}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-contain p-8 mix-blend-multiply transition-transform duration-700 hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/1bag.png';
              }}
            />

            {/* Badges Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
              {Number(product.discount) > 0 && (
                <Badge variant="warning" className="bg-dark-900 text-white border-dark-900 shadow-lg px-4 py-1.5 font-bold">
                  ₹{product.discount} OFF
                </Badge>
              )}
              {isOutOfStock ? (
                <Badge variant="danger" className="shadow-lg px-4 py-1.5 font-bold">Sold Out</Badge>
              ) : Number(product.stock) <= 5 ? (
                <Badge variant="warning" className="shadow-lg px-4 py-1.5 font-bold">Only {product.stock} Left</Badge>
              ) : null}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-dark-500 hover:text-rose-500 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10 border border-gray-100"
            >
              <i className={`${inWishlist ? 'ri-heart-fill text-rose-500' : 'ri-heart-line'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="lg:col-span-6 lg:col-start-7 flex flex-col justify-center">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
                {product.category || 'General'}
              </span>

              {avgRating > 0 ? (
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={star <= Math.round(avgRating) ? 'ri-star-fill' : 'ri-star-line text-gray-300'}
                      ></i>
                    ))}
                  </div>
                  <span className="text-dark-900">{avgRating.toFixed(1)}</span>
                  <span className="text-dark-400 font-normal underline decoration-gray-300 underline-offset-2">({reviews.length} reviews)</span>
                </div>
              ) : (
                <span className="text-xs font-medium text-dark-400 uppercase tracking-wider">No reviews yet</span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-dark-900 tracking-tight leading-[1.1] mb-6">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="flex flex-col mb-8">
              {Number(product.discount) > 0 && (
                <span className="text-base text-dark-400 line-through font-medium mb-1">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
              )}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl sm:text-5xl font-extrabold text-dark-900 tracking-tight">
                  ₹{finalPrice.toLocaleString('en-IN')}
                </span>
                {Number(product.discount) > 0 && (
                  <Badge variant="success" className="bg-emerald-50 text-emerald-700 px-3 py-1 font-bold">
                    Save ₹{product.discount}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-dark-400 mt-2 font-medium tracking-wide">Taxes included. Free shipping on orders over ₹20,000.</span>
            </div>

            {/* Description */}
            <p className="text-dark-600 text-base leading-relaxed mb-10 max-w-lg">
              {product.description ||
                'Designed with premium materials, this bag seamlessly combines timeless elegance with everyday functionality. Features durable stitching, refined hardware, and ample compartments.'}
            </p>

            {/* Seller Information Card */}
            {product.seller && (
              <div className="p-5 rounded-2xl bg-ivory-200 border border-ivory-300 flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-bold text-sm">
                    <i className="ri-store-2-fill"></i>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400 font-medium">Sold by</p>
                    <p className="text-sm font-bold text-dark-900">{product.seller.shopName}</p>
                  </div>
                </div>
                <Link
                  to={`/seller/${product.seller._id}`}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 uppercase tracking-wider"
                >
                  Visit Store &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Stock & Purchase Buttons */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            {/* Stock indicator */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              {isOutOfStock ? (
                <span className="text-rose-600 flex items-center gap-1.5">
                  <i className="ri-close-circle-fill text-sm"></i> Currently Out of Stock
                </span>
              ) : Number(product.stock) <= 5 ? (
                <span className="text-orange-600 flex items-center gap-1.5">
                  <i className="ri-alarm-warning-fill text-sm"></i> Only {product.stock} units left in stock!
                </span>
              ) : (
                <span className="text-emerald-600 flex items-center gap-1.5">
                  <i className="ri-checkbox-circle-fill text-sm"></i> In Stock ({product.stock} available)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingCart}
                isLoading={isAddingCart}
                variant="outline"
                size="lg"
                icon="ri-shopping-bag-line"
                fullWidth
              >
                Add to Cart
              </Button>

              <Button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                variant="primary"
                size="lg"
                icon="ri-flashlight-line"
                fullWidth
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="border-t border-gray-100 pt-12 mb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-dark-900 tracking-tight">Customer Reviews</h2>
            <p className="text-dark-400 text-xs sm:text-sm mt-0.5">
              Real feedback from verified buyers ({reviews.length} reviews)
            </p>
          </div>
        </div>

        {/* Review Form for Verified Buyers */}
        {hasPurchased && !hasReviewed && (
          <form
            onSubmit={handleReviewSubmit}
            className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm mb-10 animate-fade-in"
          >
            <h3 className="text-base font-bold text-dark-900 mb-1">Write a Review</h3>
            <p className="text-dark-400 text-xs mb-4">
              You purchased this item! Share your thoughts to help other shoppers.
            </p>

            <div className="space-y-4">
              {/* Star Rating Picker */}
              <div>
                <label className="text-xs font-semibold text-dark-600 block mb-1.5">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-2xl text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <i className={star <= rating ? 'ri-star-fill' : 'ri-star-line'}></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="text-xs font-semibold text-dark-600 block mb-1.5">Your Feedback</label>
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How is the quality, stitching, and space?"
                  className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview || !comment.trim()}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white btn-primary cursor-pointer disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="p-8 rounded-2xl bg-gray-50 text-center text-dark-400 text-sm">
            <i className="ri-chat-1-line text-2xl mb-1 block"></i>
            No reviews yet. Be the first verified buyer to leave a review!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-xs">
                      {rev.user?.fullname ? rev.user.fullname.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-dark-900">{rev.user?.fullname || 'Customer'}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <i className="ri-checkbox-circle-fill"></i> Verified Purchase
                      </span>
                    </div>
                  </div>
                  <div className="flex text-amber-400 text-xs">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i key={star} className={star <= rev.rating ? 'ri-star-fill' : 'ri-star-line'}></i>
                    ))}
                  </div>
                </div>
                <p className="text-dark-600 text-xs leading-relaxed mt-2">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="border-t border-gray-100 pt-12">
          <h2 className="text-2xl font-bold text-dark-900 tracking-tight mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
