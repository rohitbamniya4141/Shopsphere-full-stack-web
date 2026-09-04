import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AlertMessage from '../../components/common/AlertMessage';

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [flashMessage, setFlashMessage] = useState('');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/seller/products');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setDeletingId(productId);
    try {
      await api.delete(`/api/seller/products/${productId}`);
      setFlashMessage('Product deleted successfully');
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading your products..." />;
  }

  const getImageSrc = (p) => {
    if (!p.image) return '/images/1bag.png';
    if (p.image.startsWith('data:') || p.image.startsWith('http')) return p.image;
    if (p.image.startsWith('/images/')) return p.image;
    return `/images/${p.image}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 animate-fade-in-up">
      <AlertMessage
        type="success"
        message={flashMessage}
        onClose={() => setFlashMessage('')}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"></div>
            <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 tracking-tight">
              Product Inventory
            </h1>
          </div>
          <p className="text-dark-400 text-sm ml-5 sm:ml-6">
            Manage your store items, update stock, and pricing ({products.length} products)
          </p>
        </div>

        <Link
          to="/seller/products/create"
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
        >
          <i className="ri-add-line text-base"></i>
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon="ri-box-3-line"
          title="No Products In Inventory"
          description="You haven't listed any products yet. Add your first bag to start selling!"
          actionText="Add Product"
          actionLink="/seller/products/create"
        />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-dark-400 uppercase text-[11px] font-semibold">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => {
                  const finalPrice = Number(p.price) - Number(p.discount || 0);
                  const isOutOfStock = Number(p.stock) <= 0;

                  return (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageSrc(p)}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-contain bg-gray-50 p-1 flex-shrink-0 border border-gray-100"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/1bag.png';
                            }}
                          />
                          <span className="font-bold text-dark-900 line-clamp-1 max-w-xs">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-brand-50 text-brand-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-dark-900">
                        ₹{finalPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6 text-dark-500">
                        {Number(p.discount) > 0 ? `₹${p.discount}` : '—'}
                      </td>
                      <td className="py-4 px-6">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600">
                            0 (Out of stock)
                          </span>
                        ) : Number(p.stock) <= 5 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600">
                            {p.stock} units left
                          </span>
                        ) : (
                          <span className="font-semibold text-emerald-600">{p.stock} in stock</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/seller/products/edit/${p._id}`}
                            className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-brand-50 text-dark-600 hover:text-brand-600 flex items-center justify-center transition-colors"
                            title="Edit product"
                          >
                            <i className="ri-pencil-line text-sm"></i>
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id)}
                            disabled={deletingId === p._id}
                            className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-rose-50 text-dark-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete product"
                          >
                            {deletingId === p._id ? (
                              <div className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <i className="ri-delete-bin-line text-sm"></i>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
