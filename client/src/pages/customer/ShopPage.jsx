import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AlertMessage from '../../components/common/AlertMessage';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const priceParam = searchParams.get('price') || '';
  const sortParam = searchParams.get('sort') || 'popular';
  const pageParam = parseInt(searchParams.get('page')) || 1;

  // Local state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParam);
  const [flashMessage, setFlashMessage] = useState('');

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/products', {
        params: {
          search: searchParam,
          category: categoryParam,
          price: priceParam,
          sort: sortParam,
          page: pageParam,
          limit: 24
        }
      });
      setProducts(res.data.products || []);
      setCategories(res.data.categories || []);
      setTotalCount(res.data.totalCount || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchParam, categoryParam, priceParam, sortParam, pageParam]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val) {
        updated.set(key, val);
      } else {
        updated.delete(key);
      }
    });
    // Reset to page 1 on filter changes
    if (!newParams.page) {
      updated.delete('page');
    }
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-12 animate-fade-in-up">
      <AlertMessage
        type="success"
        message={flashMessage}
        onClose={() => setFlashMessage('')}
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"></div>
            <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 tracking-tight">
              Explore Collection
            </h1>
          </div>
          <p className="text-dark-400 text-sm ml-5 sm:ml-6">
            Handcrafted luxury bags for every style & occasion ({totalCount} items found)
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search bags, backpacks, accessories..."
            className="w-full pl-11 pr-24 py-3 rounded-xl bg-ivory-100 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-sm"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
            <i className="ri-search-2-line text-lg"></i>
          </div>
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-dark-900 hover:bg-brand-600 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Controls Row */}
      <div className="bg-white rounded-3xl border border-gray-100/80 p-5 shadow-sm mb-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
          <button
            onClick={() => updateFilters({ category: '' })}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
              !categoryParam
                ? 'bg-dark-900 text-white border-dark-900 shadow-md'
                : 'bg-ivory-100 text-dark-600 border-gray-200 hover:border-brand-500 hover:text-brand-600'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilters({ category: cat })}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
                categoryParam === cat
                  ? 'bg-dark-900 text-white border-dark-900 shadow-md'
                  : 'bg-ivory-100 text-dark-600 border-gray-200 hover:border-brand-500 hover:text-brand-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Price Filter & Sorting Dropdowns */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end flex-wrap">
          {/* Price Range */}
          <div className="relative">
            <select
              value={priceParam}
              onChange={(e) => updateFilters({ price: e.target.value })}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-full bg-ivory-100 border border-gray-200 text-xs font-bold uppercase tracking-wider text-dark-900 focus:outline-none focus:border-brand-500 hover:border-brand-300 cursor-pointer transition-colors shadow-sm"
            >
              <option value="">All Prices</option>
              <option value="0-1000">Under ₹1,000</option>
              <option value="1000-3000">₹1,000 – ₹3,000</option>
              <option value="3000+">Above ₹3,000</option>
            </select>
            <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none text-lg"></i>
          </div>

          {/* Sort Option */}
          <div className="relative">
            <select
              value={sortParam}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-full bg-ivory-100 border border-gray-200 text-xs font-bold uppercase tracking-wider text-dark-900 focus:outline-none focus:border-brand-500 hover:border-brand-300 cursor-pointer transition-colors shadow-sm"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none text-lg"></i>
          </div>

          {/* Clear Filters (if active) */}
          {(searchParam || categoryParam || priceParam || sortParam !== 'popular') && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-2 py-1 cursor-pointer flex items-center gap-1"
            >
              <i className="ri-close-circle-line text-sm"></i>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Products Grid / Loading / Empty */}
      {isLoading ? (
        <LoadingSpinner text="Loading collection..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon="ri-search-line"
          title="No Products Found"
          description="We couldn't find any products matching your selected search and filters."
          actionText="Clear All Filters"
          onAction={clearFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onCartChange={(p) => setFlashMessage(`Added "${p.name}" to cart`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => updateFilters({ page: Math.max(1, pageParam - 1) })}
                disabled={pageParam <= 1}
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-dark-600 hover:border-brand-500 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
              >
                <i className="ri-arrow-left-s-line text-lg"></i>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => updateFilters({ page: num })}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    pageParam === num
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-dark-600 hover:border-brand-500'
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                onClick={() => updateFilters({ page: Math.min(totalPages, pageParam + 1) })}
                disabled={pageParam >= totalPages}
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-dark-600 hover:border-brand-500 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
              >
                <i className="ri-arrow-right-s-line text-lg"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
