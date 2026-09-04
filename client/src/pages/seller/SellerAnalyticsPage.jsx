import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function SellerAnalyticsPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/api/seller/analytics');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading || !data) {
    return <LoadingSpinner fullScreen text="Compiling seller performance analytics..." />;
  }

  const {
    totalRevenue = 0,
    totalOrders = 0,
    avgOrderValue = 0,
    totalUnitsSold = 0,
    pendingOrders = 0,
    deliveredOrders = 0,
    monthlyLabels = [],
    monthlyRevenue = [],
    monthlyOrders = [],
    categoryLabels = [],
    categorySales = [],
    statusLabels = [],
    statusCounts = [],
    topProducts = []
  } = data;

  // Chart configs
  const revenueChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: monthlyRevenue,
        borderColor: '#d4882e',
        backgroundColor: 'rgba(212, 136, 46, 0.15)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5
      }
    ]
  };

  const ordersChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Orders Count',
        data: monthlyOrders,
        backgroundColor: '#3b82f6',
        borderRadius: 8
      }
    ]
  };

  const categoryChartData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categorySales,
        backgroundColor: ['#d4882e', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b'],
        borderWidth: 0
      }
    ]
  };

  const statusChartData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusCounts,
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 animate-fade-in-up">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 tracking-tight">Seller Analytics</h1>
        </div>
        <p className="text-dark-400 text-sm ml-5 sm:ml-6">
          Real-time performance metrics, sales velocity, and category breakdowns.
        </p>
      </div>

      {/* KPI Cards (6 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-dark-400 block mb-1">
            Total Revenue
          </span>
          <p className="text-xl font-extrabold text-dark-900">₹{Number(totalRevenue).toLocaleString('en-IN')}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-dark-400 block mb-1">
            Total Orders
          </span>
          <p className="text-xl font-extrabold text-dark-900">{totalOrders.toLocaleString('en-IN')}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-dark-400 block mb-1">
            Avg Order Value
          </span>
          <p className="text-xl font-extrabold text-dark-900">₹{Number(avgOrderValue).toLocaleString('en-IN')}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-dark-400 block mb-1">
            Units Sold
          </span>
          <p className="text-xl font-extrabold text-dark-900">{totalUnitsSold.toLocaleString('en-IN')}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-dark-400 block mb-1">
            Pending Orders
          </span>
          <p className="text-xl font-extrabold text-amber-600">{pendingOrders}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-dark-400 block mb-1">
            Delivered Orders
          </span>
          <p className="text-xl font-extrabold text-emerald-600">{deliveredOrders}</p>
        </div>
      </div>

      {/* Charts Grid 1: Revenue Line & Orders Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wider">Monthly Revenue</h3>
              <p className="text-xs text-dark-400 mt-0.5">Last 12 months trend</p>
            </div>
            <i className="ri-line-chart-fill text-brand-500 text-lg"></i>
          </div>
          <div className="h-64">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wider">Monthly Orders</h3>
              <p className="text-xs text-dark-400 mt-0.5">Order volume per month</p>
            </div>
            <i className="ri-bar-chart-fill text-blue-500 text-lg"></i>
          </div>
          <div className="h-64">
            <Bar data={ordersChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Charts Grid 2: Categories & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wider">Revenue by Category</h3>
              <p className="text-xs text-dark-400 mt-0.5">Category distribution</p>
            </div>
            <i className="ri-pie-chart-fill text-purple-500 text-lg"></i>
          </div>
          <div className="h-64 flex items-center justify-center">
            {categorySales.length === 0 ? (
              <span className="text-xs text-dark-400">No category sales yet</span>
            ) : (
              <Doughnut data={categoryChartData} options={{ maintainAspectRatio: false }} />
            )}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wider">Order Status Distribution</h3>
              <p className="text-xs text-dark-400 mt-0.5">Lifecycle state breakdown</p>
            </div>
            <i className="ri-donut-chart-fill text-emerald-500 text-lg"></i>
          </div>
          <div className="h-64 flex items-center justify-center">
            {statusCounts.length === 0 ? (
              <span className="text-xs text-dark-400">No orders recorded yet</span>
            ) : (
              <Doughnut data={statusChartData} options={{ maintainAspectRatio: false }} />
            )}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      {topProducts && topProducts.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-xs">
          <h3 className="text-base font-bold text-dark-900 uppercase tracking-wider mb-4">
            Top Performing Products
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-dark-400 uppercase font-semibold">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Product Name</th>
                  <th className="pb-3 pr-4 text-center">Units Sold</th>
                  <th className="pb-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 pr-4 text-dark-400 font-medium">{idx + 1}</td>
                    <td className="py-3 pr-4 font-bold text-dark-900">{p.name || 'Product'}</td>
                    <td className="py-3 pr-4 text-center text-dark-700 font-semibold">{p.totalSold}</td>
                    <td className="py-3 text-right font-extrabold text-emerald-600">
                      ₹{Number(p.totalRevenue || 0).toLocaleString('en-IN')}
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
