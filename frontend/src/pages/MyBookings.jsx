import { useState, useEffect } from 'react';
import { getUserBookings, cancelBooking } from '../api/api';
import { useAuth } from '../context/AuthContext';
import BookingCard from '../components/BookingCard';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getUserBookings(user.userId);
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to load bookings. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchBookings();
    }
  }, [user]);

  const handleCancel = async (bookingId) => {
    setCancelConfirm(bookingId);
  };

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      await cancelBooking(cancelConfirm);
      setBookings((prev) =>
        prev.map((b) =>
          (b.bookingId || b.id) === cancelConfirm
            ? { ...b, status: 'CANCELLED' }
            : b
        )
      );
      setCancelConfirm(null);
    } catch (err) {
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'CONFIRMED') return b.status?.toUpperCase() === 'CONFIRMED';
    if (filter === 'CANCELLED') return b.status?.toUpperCase() === 'CANCELLED';
    if (filter === 'UPCOMING') {
      const eventDate = new Date(b.eventDateTime || b.event?.dateTime);
      return b.status?.toUpperCase() === 'CONFIRMED' && eventDate > new Date();
    }
    if (filter === 'PAST') {
      const eventDate = new Date(b.eventDateTime || b.event?.dateTime);
      return eventDate <= new Date();
    }
    return true;
  });

  return (
    <div className="my-bookings-page">
      <div className="page-header">
        <h1 className="page-title">🎫 My Bookings</h1>
        <p className="page-subtitle">View and manage your ticket bookings</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['ALL', 'UPCOMING', 'CONFIRMED', 'PAST', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            className={`filter-tab ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab === 'ALL' && '📋 '}
            {tab === 'UPCOMING' && '🔮 '}
            {tab === 'CONFIRMED' && '✅ '}
            {tab === 'PAST' && '📜 '}
            {tab === 'CANCELLED' && '❌ '}
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {loading ? (
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🎭</span>
          <h3>No bookings found</h3>
          <p>
            {filter === 'ALL'
              ? "You haven't made any bookings yet. Explore events and book your first ticket!"
              : `No ${filter.toLowerCase()} bookings found.`}
          </p>
        </div>
      ) : (
        <div className="bookings-grid">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.bookingId || booking.id}
              booking={booking}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirm && (
        <div className="modal-overlay" onClick={() => setCancelConfirm(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Cancel Booking</h2>
              <button className="modal-close" onClick={() => setCancelConfirm(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to cancel this booking? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setCancelConfirm(null)}>
                Keep Booking
              </button>
              <button className="btn btn-danger" onClick={confirmCancel} disabled={cancelling}>
                {cancelling ? (
                  <span className="btn-loading">
                    <span className="loading-spinner-sm"></span> Cancelling...
                  </span>
                ) : (
                  'Yes, Cancel It'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
