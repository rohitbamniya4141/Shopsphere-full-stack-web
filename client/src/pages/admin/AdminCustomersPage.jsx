import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/api/admin/customers');
        setCustomers(res.data.customers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading customer directory..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"></div>
        <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 tracking-tight">Customer Directory</h1>
        <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold ml-2">
          {customers.length} registered users
        </span>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon="ri-group-line"
          title="No Registered Customers"
          description="Customer accounts will appear here once users register."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-dark-400 uppercase text-[11px] font-semibold">
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6 text-center">Orders Placed</th>
                  <th className="py-4 px-6 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-xs">
                          {c.fullname ? c.fullname.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="font-bold text-dark-900">{c.fullname || 'Customer'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-dark-600">{c.email}</td>
                    <td className="py-4 px-6 text-center font-bold text-dark-900">
                      {c.orderCount || (c.orders ? c.orders.length : 0)}
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-emerald-600">
                      ₹{Number(c.totalSpent || 0).toLocaleString('en-IN')}
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
