import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function CheckoutPage() {
  const { user, setCartCount } = useAuth();
  const [cart, setCart] = useState([]);
  const [bill, setBill] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchCheckoutData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/checkout');
      setCart(res.data.cart || []);
      setBill(res.data.bill || 0);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Cart is empty')) {
        navigate('/cart');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const handleRazorpayPayment = async () => {
    setError('');
    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const res = await api.post('/payment/create-order');
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to initialize payment');
      }

      const { order, key } = res.data;

      // 2. Open Razorpay modal
      const options = {
        key: key || 'rzp_test_default',
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'ShopSphere',
        description: 'Payment for ShopSphere Luxury Bags',
        image: '/images/1bag.png',
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const verifyRes = await api.post('/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              setCartCount(0);
              navigate('/orders', {
                state: { successMessage: 'Payment verified! Your order has been placed.' }
              });
            } else {
              setError(verifyRes.data.message || 'Payment verification failed');
            }
          } catch (err) {
            setError(err.message || 'Payment verification failed');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.fullname || '',
          email: user?.email || '',
          contact: user?.contact || ''
        },
        theme: {
          color: '#d97706' // brand-600
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(response.error?.description || 'Payment Failed. Please try again.');
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Failed to process payment');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Preparing checkout..." />;
  }

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const totalDiscount = cart.reduce((sum, item) => sum + Number(item.discount || 0), 0);
  const platformFee = 20;

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 animate-fade-in-up">
      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"></div>
        <h1 className="text-4xl font-serif font-bold text-dark-900 tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Customer Info & Order Items */}
        <div className="lg:col-span-7 space-y-8">
          {/* Customer & Shipping Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-dark-900 mb-5 flex items-center gap-2">
              <i className="ri-user-location-line text-brand-600 text-xl"></i>
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div className="p-4 rounded-xl bg-ivory-200 border border-ivory-300">
                <p className="text-xs text-dark-500 font-semibold uppercase tracking-wider">Customer Name</p>
                <p className="font-bold text-dark-900 mt-1">{user?.fullname || '—'}</p>
              </div>
              <div className="p-4 rounded-xl bg-ivory-200 border border-ivory-300">
                <p className="text-xs text-dark-500 font-semibold uppercase tracking-wider">Email Address</p>
                <p className="font-bold text-dark-900 mt-1 truncate">{user?.email || '—'}</p>
              </div>
            </div>
          </Card>

          {/* Items Review */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-dark-900 flex items-center gap-2">
                <i className="ri-shopping-bag-3-line text-brand-600 text-xl"></i>
                Order Items ({cart.length})
              </h3>
              <Link to="/cart" className="text-xs font-bold uppercase tracking-wider text-brand-600 hover:text-brand-700">
                Edit Cart
              </Link>
            </div>

            <div className="divide-y divide-gray-100 border-t border-gray-100">
              {cart.map((item, idx) => (
                <div key={`${item._id}-${idx}`} className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-brand-600 uppercase tracking-wider">{item.category}</p>
                    <p className="text-sm font-semibold text-dark-900 truncate mt-0.5">{item.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-extrabold text-dark-900">
                      ₹{(Number(item.price) - Number(item.discount || 0)).toLocaleString('en-IN')}
                    </p>
                    {Number(item.discount) > 0 && (
                      <p className="text-xs text-dark-400 line-through font-medium">₹{Number(item.price).toLocaleString('en-IN')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Payment Breakdown Card */}
        <div className="lg:col-span-5 sticky top-24">
          <Card className="p-6 sm:p-8 border-t-4 border-t-brand-500">
            <h3 className="text-xl font-serif font-bold text-dark-900 tracking-tight mb-6">Payment Summary</h3>

            <div className="space-y-4 text-sm text-dark-600 border-b border-gray-100 pb-6">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-dark-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Total Discount</span>
                  <span>-₹{totalDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping & Handling</span>
                <span className="font-semibold text-dark-900">₹{platformFee}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline py-5 border-b border-gray-100 mb-6">
              <span className="text-base font-bold text-dark-900">Total Payable</span>
              <span className="text-3xl font-extrabold text-brand-600 tracking-tight">₹{bill.toLocaleString('en-IN')}</span>
            </div>

            <Button
              onClick={handleRazorpayPayment}
              disabled={isProcessing}
              isLoading={isProcessing}
              variant="primary"
              fullWidth
              size="lg"
              icon="ri-secure-payment-line"
            >
              Pay ₹{bill.toLocaleString('en-IN')}
            </Button>

            <div className="mt-6 space-y-2 text-center text-xs text-dark-400 font-medium">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600">
                <i className="ri-shield-check-fill text-base"></i>
                <span>256-bit SSL Encrypted Transaction</span>
              </div>
              <p>Supports UPI, Credit/Debit Cards, NetBanking, and Wallets</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
