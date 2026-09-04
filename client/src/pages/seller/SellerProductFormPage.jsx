import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';

export default function SellerProductFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discount: '0',
    category: 'Backpacks',
    stock: '10',
    bgcolor: '#F3F4F6',
    panelcolor: '#FFFFFF',
    textcolor: '#111827',
    image: '',
    description: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/api/products/${id}`);
          const p = res.data.product;
          setFormData({
            name: p.name || '',
            price: p.price || '',
            discount: p.discount || '0',
            category: p.category || 'Backpacks',
            stock: p.stock !== undefined ? p.stock : '10',
            bgcolor: p.bgcolor || '#F3F4F6',
            panelcolor: p.panelcolor || '#FFFFFF',
            textcolor: p.textcolor || '#111827',
            image: p.image || '',
            description: p.description || ''
          });
          if (p.image) {
            setImagePreview(p.image.startsWith('data:') || p.image.startsWith('http') ? p.image : `/images/${p.image}`);
          }
        } catch (err) {
          setError(err.message || 'Failed to load product for editing');
        } finally {
          setIsFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.price || formData.stock === '') {
      setError('Product name, price, and stock are required');
      return;
    }

    setIsLoading(true);
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      if (imageFile) {
        submitData.append('imageFile', imageFile);
      }

      if (isEditMode) {
        await api.put(`/api/seller/products/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/api/seller/products/create', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate('/seller/products');
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <LoadingSpinner fullScreen text="Loading product..." />;
  }

  const categories = ['Backpacks', 'Laptop Bags', 'Office Bags', 'Travel Bags', 'Accessories'];

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-14 animate-fade-in-up">
      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"></div>
          <div>
            <h1 className="text-3xl font-bold text-dark-900 tracking-tight">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-xs sm:text-sm text-dark-400 mt-0.5">
              {isEditMode ? 'Update product pricing, inventory and details' : 'Fill in the specifications to list a new bag'}
            </p>
          </div>
        </div>

        <Link
          to="/seller/products"
          className="text-xs font-semibold text-dark-500 hover:text-dark-900 uppercase tracking-wider"
        >
          Cancel &larr;
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-dark-700 uppercase tracking-wider mb-2 block">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Classic Vintage Leather Backpack"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-dark-700 uppercase tracking-wider mb-2 block">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-dark-700 uppercase tracking-wider mb-2 block">
                Original Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="2999"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-dark-700 uppercase tracking-wider mb-2 block">
                Discount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="200"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-dark-700 uppercase tracking-wider mb-2 block">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="10"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-dark-700 uppercase tracking-wider mb-2 block">
              Product Description
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe craftsmanship, compartment capacity, durability..."
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
            ></textarea>
          </div>

          {/* Image Upload / URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div>
              <label className="text-xs font-bold text-dark-700 uppercase tracking-wider mb-2 block">
                Upload Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-dark-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
              />
              <p className="text-[11px] text-dark-400 mt-1">Or provide image URL / filename below:</p>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => {
                  setFormData({ ...formData, image: e.target.value });
                  setImagePreview(e.target.value);
                }}
                placeholder="e.g. 1bag.png or https://..."
                className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
              />
            </div>

            {/* Preview Box */}
            <div>
              <label className="text-xs font-bold text-dark-700 uppercase tracking-wider mb-2 block">
                Image Preview
              </label>
              <div className="w-full h-36 rounded-2xl bg-gray-50 border border-gray-200 p-2 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/1bag.png';
                    }}
                  />
                ) : (
                  <span className="text-xs text-dark-400">No image chosen yet</span>
                )}
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <Link
              to="/seller/products"
              className="px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-dark-700 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white btn-primary flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <i className="ri-checkbox-circle-line text-base"></i>
              )}
              {isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
