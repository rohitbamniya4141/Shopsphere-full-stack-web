import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AlertMessage from '../../components/common/AlertMessage';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

export default function CartPage() {
  const { setCartCount } = useAuth();
  const [cart, setCart] = useState([]);
  const [bill, setBill] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(null);
  const [flashMessage, setFlashMessage] = useState('');
  const navigate = useNavigate();

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/cart');
      setCart(res.data.cart || []);
      setBill(res.data.bill || 0);
      setCartCount(res.data.cart ? res.data.cart.length : 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (productId) => {
    setIsRemoving(productId);
    try {
      const res = await api.post(`/api/cart/remove/${productId}`);
      setCart(res.data.cart || []);
      setBill(res.data.bill || 0);
      setCartCount(res.data.cartCount !== undefined ? res.data.cartCount : res.data.cart.length);
      setFlashMessage('Item removed from cart');
    } catch (err) {
      console.error(err);
    } finally {
      setIsRemoving(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading your cart..." />;
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <EmptyState
          icon="ri-shopping-bag-line"
          title="Your Cart is Empty"
          description="Looks like you haven't added any bags to your cart yet. Explore our handcrafted collection!"
          actionText="Start Shopping"
          actionLink="/shop"
        />
      </div>
    );
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const totalDiscount = cart.reduce((sum, item) => sum + Number(item.discount || 0), 0);
  const platformFee = 20;

  const hasOutOfStock = cart.some((item) => Number(item.stock) <= 0);

  const getImageSrc = (item) => {
    if (!item.image) return '/images/1bag.png';
    if (item.image.startsWith('data:') || item.image.startsWith('http')) return item.image;
    if (item.image.startsWith('/images/')) return item.image;
    return `/images/${item.image}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 animate-fade-in-up">
      <AlertMessage
        type="success"
        message={flashMessage}
        onClose={() => setFlashMessage('')}
      />

      {/* Page Title */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"></div>
        <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 tracking-tight">Shopping Cart</h1>
        <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold ml-2">
          {cart.length} {cart.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {hasOutOfStock && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm mb-6 flex items-center gap-3">
          <i className="ri-error-warning-fill text-xl"></i>
          <span>
            One or more items in your cart are currently out of stock. Please remove them before proceeding to checkout.
          </span>
        </div>
      )}

      {/* Grid: Cart Items + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item, idx) => {
            const finalPrice = Number(item.price) - Number(item.discount || 0);
            const isOutOfStock = Number(item.stock) <= 0;

            return (
              <div
                key={`${item._id}-${idx}`}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center gap-5 hover:shadow-md transition-all"
              >
                {/* Product Thumbnail */}
                <Link
                  to={`/product/${item._id}`}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-50 p-2 flex items-center justify-center flex-shrink-0 overflow-hidden"
                >
                  <img
                    src={getImageSrc(item)}
                    alt={item.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/1bag.png';
                    }}
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                    {item.category || 'General'}
                  </span>
                  <Link to={`/product/${item._id}`}>
                    <h3 className="text-base font-bold text-dark-900 truncate hover:text-brand-600 transition-colors mt-0.5">
                      {item.name}
                    </h3>
                  </Link>

                  {isOutOfStock && (
                    <span className="inline-block mt-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      Out of Stock
                    </span>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline justify-center sm:justify-start gap-2 mt-2">
                    <span className="text-base font-extrabold text-dark-900">
                      ₹{finalPrice.toLocaleString('en-IN')}
                    </span>
                    {Number(item.discount) > 0 && (
                      <>
                        <span className="text-xs text-dark-400 line-through">
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          -₹{item.discount}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item._id)}
                  disabled={isRemoving === item._id}
                  className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-rose-50 text-dark-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove from cart"
                >
                  {isRemoving === item._id ? (
                    <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <i className="ri-delete-bin-line text-lg"></i>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Right: Order Summary Card */}
        <div className="lg:col-span-4 sticky top-24">
          <Card className="p-6 sm:p-7 border-t-4 border-t-dark-900">
            <h3 className="text-xl font-serif font-bold text-dark-900 tracking-tight mb-6">Order Summary</h3>

            <div className="space-y-4 text-sm text-dark-600 border-b border-gray-100 pb-6">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} items)</span>
                <span className="font-semibold text-dark-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount Savings</span>
                  <span>-₹{totalDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping & Handling</span>
                <span className="font-semibold text-dark-900">₹{platformFee}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline py-5 border-b border-gray-100 mb-6">
              <span className="text-base font-bold text-dark-900">Total Amount</span>
              <span className="text-3xl font-extrabold text-dark-900 tracking-tight">₹{bill.toLocaleString('en-IN')}</span>
            </div>

            <Button
              onClick={() => navigate('/checkout')}
              disabled={hasOutOfStock}
              variant="primary"
              fullWidth
              size="lg"
              icon="ri-arrow-right-line"
            >
              Proceed to Checkout
            </Button>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-dark-400 font-medium">
              <i className="ri-shield-check-fill text-emerald-500 text-lg"></i>
              <span>Secure Encrypted Checkout</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
