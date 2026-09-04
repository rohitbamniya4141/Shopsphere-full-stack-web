import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AlertMessage from '../../components/common/AlertMessage';

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [flashMessage, setFlashMessage] = useState('');

  const fetchSellers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/admin/sellers');
      setSellers(res.data.sellers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleApprove = async (id) => {
    setActionInProgress(id);
    try {
      await api.post(`/api/admin/sellers/${id}/approve`);
      setFlashMessage('Seller approved successfully');
      await fetchSellers();
    } catch (err) {
      alert(err.message || 'Failed to approve seller');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleBlock = async (id) => {
    setActionInProgress(id);
    try {
      const res = await api.post(`/api/admin/sellers/${id}/block`);
      setFlashMessage(res.data.message || 'Seller status updated');
      await fetchSellers();
    } catch (err) {
      alert(err.message || 'Failed to update seller block state');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this seller?')) return;
    setActionInProgress(id);
    try {
      await api.delete(`/api/admin/sellers/${id}/delete`);
      setFlashMessage('Seller deleted successfully');
      setSellers((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete seller');
    } finally {
      setActionInProgress(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading vendor directory..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 animate-fade-in-up">
      <AlertMessage
        type="success"
        message={flashMessage}
        onClose={() => setFlashMessage('')}
      />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"></div>
        <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 tracking-tight">Vendor Management</h1>
        <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold ml-2">
          {sellers.length} sellers
        </span>
      </div>

      {sellers.length === 0 ? (
        <EmptyState
          icon="ri-store-2-line"
          title="No Sellers Registered"
          description="Vendor registration applications will appear here."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-dark-400 uppercase text-[11px] font-semibold">
                  <th className="py-4 px-6">Shop Name</th>
                  <th className="py-4 px-6">Owner</th>
                  <th className="py-4 px-6">Email & Phone</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Products</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sellers.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-dark-900">{s.shopName}</td>
                    <td className="py-4 px-6 text-dark-700">{s.fullname}</td>
                    <td className="py-4 px-6">
                      <p className="text-dark-900">{s.email}</p>
                      {s.phone && <p className="text-xs text-dark-400">{s.phone}</p>}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          s.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : s.status === 'blocked'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {s.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-dark-900">
                      {s.products ? s.products.length : 0}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(s._id)}
                            disabled={actionInProgress === s._id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          onClick={() => handleBlock(s._id)}
                          disabled={actionInProgress === s._id}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-amber-50 text-dark-700 hover:text-amber-700 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          {s.status === 'blocked' ? 'Unblock' : 'Block'}
                        </button>

                        <button
                          onClick={() => handleDelete(s._id)}
                          disabled={actionInProgress === s._id}
                          className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-rose-50 text-dark-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete seller"
                        >
                          <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
