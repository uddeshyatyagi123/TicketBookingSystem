import { useState, useEffect } from 'react';
import { getDashboardStats } from '../api/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await getDashboardStats();
        setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard stats.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      icon: '🎫',
      label: 'Total Bookings',
      value: stats?.totalBookings ?? 0,
      gradient: 'gradient-purple',
    },
    {
      icon: '💰',
      label: 'Total Revenue',
      value: `₹${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      gradient: 'gradient-green',
    },
    {
      icon: '🎬',
      label: 'Total Events',
      value: stats?.totalEvents ?? 0,
      gradient: 'gradient-blue',
    },
    {
      icon: '👥',
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      gradient: 'gradient-orange',
    },
    {
      icon: '💺',
      label: 'Booked Seats',
      value: stats?.bookedSeats ?? stats?.totalBookedSeats ?? 0,
      gradient: 'gradient-red',
    },
    {
      icon: '🟢',
      label: 'Available Seats',
      value: stats?.availableSeats ?? stats?.totalAvailableSeats ?? 0,
      gradient: 'gradient-teal',
    },
  ];

  return (
    <div className="admin-dashboard-page">
      <div className="page-header">
        <h1 className="page-title">📊 Admin Dashboard</h1>
        <p className="page-subtitle">Overview of your booking platform</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className={`stat-card ${card.gradient}`}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
