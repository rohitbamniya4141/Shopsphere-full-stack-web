import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function SellerStorePage() {
  const { id } = useParams();
  const [storeData, setStoreData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/api/sellers/${id}/store`);
        setStoreData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStore();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading seller storefront..." />;
  }

  if (!storeData || !storeData.seller) {
    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <EmptyState
          icon="ri-store-2-line"
          title="Store Not Found"
          description="This seller store does not exist or is currently inactive."
          actionText="Back to Shop"
          actionLink="/shop"
        />
      </div>
    );
  }

  const { seller, products } = storeData;

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 animate-fade-in-up">
      {/* Store Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-dark-900 text-white shadow-xl relative overflow-hidden mb-12">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-3xl flex items-center justify-center shadow-lg shadow-brand-500/30 flex-shrink-0">
              <i className="ri-store-2-fill"></i>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  Verified Partner
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {seller.shopName}
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-md">
                {seller.shopDescription || 'Specializing in premium bags, backpacks, and accessories.'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xl font-extrabold text-brand-400">{products.length}</span>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-0.5">Catalog Items</p>
          </div>
        </div>

        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Catalog Title */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-dark-900 tracking-tight">Products from this Seller</h2>
          <p className="text-xs text-dark-400 mt-0.5">Browse all products supplied by {seller.shopName}</p>
        </div>
        <Link to="/shop" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
          View All Platform Bags &rarr;
        </Link>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <EmptyState
          icon="ri-box-3-line"
          title="No Products Available"
          description="This seller currently has no products in stock."
          actionText="Explore Other Bags"
          actionLink="/shop"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
