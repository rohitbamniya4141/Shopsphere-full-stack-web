import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AlertMessage from '../../components/common/AlertMessage';

export default function WishlistPage() {
  const { setWishlistCount } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flashMessage, setFlashMessage] = useState('');

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/wishlist');
      setWishlist(res.data.wishlist || []);
      setWishlistCount(res.data.wishlist ? res.data.wishlist.length : 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleWishlistChange = (product, inWishlist) => {
    if (!inWishlist) {
      setWishlist((prev) => prev.filter((p) => p._id !== product._id));
      setFlashMessage(`Removed "${product.name}" from wishlist`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading your wishlist..." />;
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <EmptyState
          icon="ri-heart-line"
          title="Your Wishlist is Empty"
          description="Save the bags you love to your wishlist and revisit them anytime."
          actionText="Discover Bags"
          actionLink="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 animate-fade-in-up">
      <AlertMessage
        type="success"
        message={flashMessage}
        onClose={() => setFlashMessage('')}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"></div>
        <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 tracking-tight">Saved Wishlist</h1>
        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold ml-2">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            isWishlisted={true}
            onWishlistChange={handleWishlistChange}
            onCartChange={(p) => setFlashMessage(`Added "${p.name}" to cart`)}
          />
        ))}
      </div>
    </div>
  );
}
