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

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/api/admin/analytics');
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
    return <LoadingSpinner fullScreen text="Compiling platform business intelligence..." />;
  }

  const {
    totalRevenue = 0,
    totalOrders = 0,
    avgOrderValue = 0,
    totalItemsSold = 0,
    totalSellers = 0,
    monthlyLabels = [],
    monthlyRevenue = [],
    monthlyOrders = [],
    dailyLabels = [],
    dailySales = [],
    categoryLabels = [],
    categorySales = [],
    topSellers = [],
    topProducts = [],
    topCustomers = []
  } = data;

  const revenueChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Platform Revenue (₹)',
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
        label: 'Platform Orders',
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

  const dailyChartData = {
    labels: dailyLabels,
    datasets: [
      {
        label: 'Daily Sales (₹)',
        data: dailySales,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.35,
        borderWidth: 2
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
          <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 tracking-tight">
            Platform Business Intelligence
          </h1>
        </div>
        <p className="text-dark-400 text-sm ml-5 sm:ml-6">
          Aggregated quantitative metrics, cross-seller performance, and revenue trends.
        </p>
      </div>

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-dark-400 block mb-1">
            Platform Revenue
          </span>
          <p className="text-2xl font-extrabold text-dark-900">₹{Number(totalRevenue).toLocaleString('en-IN')}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-dark-400 block mb-1">
            Total Orders
          </span>
          <p className="text-2xl font-extrabold text-dark-900">{totalOrders.toLocaleString('en-IN')}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-dark-400 block mb-1">
            Average Order Value (AOV)
          </span>
          <p className="text-2xl font-extrabold text-dark-900">₹{Number(avgOrderValue).toLocaleString('en-IN')}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-dark-400 block mb-1">
            Total Items Sold
          </span>
          <p className="text-2xl font-extrabold text-dark-900">{totalItemsSold.toLocaleString('en-IN')}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-dark-400 block mb-1">
            Active Sellers
          </span>
          <p className="text-2xl font-extrabold text-dark-900">{totalSellers}</p>
        </div>
      </div>

      {/* Charts Grid 1: Revenue Line & Orders Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wider">Revenue Velocity</h3>
              <p className="text-xs text-dark-400 mt-0.5">Monthly platform volume (12 months)</p>
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
              <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wider">Orders Throughput</h3>
              <p className="text-xs text-dark-400 mt-0.5">Monthly order counts</p>
            </div>
            <i className="ri-bar-chart-fill text-blue-500 text-lg"></i>
          </div>
          <div className="h-64">
            <Bar data={ordersChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Charts Grid 2: Category Breakdown & Daily Sales Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wider">Revenue by Category</h3>
              <p className="text-xs text-dark-400 mt-0.5">Product segment distribution</p>
            </div>
            <i className="ri-pie-chart-fill text-purple-500 text-lg"></i>
          </div>
          <div className="h-64 flex items-center justify-center">
            {categorySales.length === 0 ? (
              <span className="text-xs text-dark-400">No category sales recorded yet</span>
            ) : (
              <Doughnut data={categoryChartData} options={{ maintainAspectRatio: false }} />
            )}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wider">Recent Daily Trend</h3>
              <p className="text-xs text-dark-400 mt-0.5">Sales over recent active days</p>
            </div>
            <i className="ri-pulse-line text-emerald-500 text-lg"></i>
          </div>
          <div className="h-64">
            <Line data={dailyChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Top Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Sellers */}
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs">
          <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <i className="ri-store-2-fill text-brand-500"></i>
            Top Sellers
          </h3>
          {topSellers.length === 0 ? (
            <p className="text-xs text-dark-400 text-center py-6">No seller sales yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {topSellers.map((s, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-dark-900">{s.shopName || 'Shop'}</span>
                    <span className="text-dark-400 text-[10px] block">{s.orderCount} orders</span>
                  </div>
                  <span className="font-extrabold text-emerald-600">
                    ₹{Number(s.totalRevenue || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs">
          <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <i className="ri-box-3-fill text-blue-500"></i>
            Top Products
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-xs text-dark-400 text-center py-6">No product sales yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {topProducts.map((p, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="truncate max-w-[140px]">
                    <span className="font-bold text-dark-900 truncate block">{p.name || 'Product'}</span>
                    <span className="text-dark-400 text-[10px] block">{p.totalSold} sold</span>
                  </div>
                  <span className="font-extrabold text-emerald-600">
                    ₹{Number(p.totalRevenue || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs">
          <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <i className="ri-user-star-fill text-purple-500"></i>
            Top Customers
          </h3>
          {topCustomers.length === 0 ? (
            <p className="text-xs text-dark-400 text-center py-6">No customer data yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {topCustomers.map((c, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-dark-900">{c.fullname || 'Customer'}</span>
                    <span className="text-dark-400 text-[10px] block">{c.orderCount} orders</span>
                  </div>
                  <span className="font-extrabold text-emerald-600">
                    ₹{Number(c.totalSpent || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
