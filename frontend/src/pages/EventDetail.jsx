import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent, getEventSeats, createBooking } from '../api/api';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventRes, seatsRes] = await Promise.all([
          getEvent(id),
          getEventSeats(id),
        ]);
        setEvent(eventRes.data);
        setSeats(Array.isArray(seatsRes.data) ? seatsRes.data : []);
      } catch (err) {
        setError('Failed to load event details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSeatSelect = (seat) => {
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => (s.seatId || s.id) === (seat.seatId || seat.id));
      if (exists) {
        return prev.filter((s) => (s.seatId || s.id) !== (seat.seatId || seat.id));
      }
      return [...prev, seat];
    });
  };

  const totalPrice = selectedSeats.length * (event?.ticketPrice || 0);
  const isDeadlinePassed = event?.bookingDeadline && new Date() > new Date(event.bookingDeadline);

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (selectedSeats.length === 0) return;
    setShowPaymentModal(true);
  };

  const confirmBooking = async () => {
    setBookingLoading(true);
    setError('');
    try {
      const bookingData = {
        userId: user.userId,
        eventId: parseInt(id),
        seatIds: selectedSeats.map((s) => s.seatId || s.id),
      };
      await createBooking(bookingData);
      setBookingSuccess(true);
      setShowPaymentModal(false);
      setTimeout(() => navigate('/my-bookings'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Booking failed. Please try again.');
      setShowPaymentModal(false);
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="empty-state">
        <span className="empty-icon">😕</span>
        <h3>Event not found</h3>
        <p>The event you're looking for doesn't exist or has been removed.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      {/* Booking Success Banner */}
      {bookingSuccess && (
        <div className="alert alert-success booking-success-alert">
          <span>🎉</span> Booking confirmed! Redirecting to your bookings...
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="event-detail-layout">
        {/* Event Info */}
        <div className="event-info-section">
          <div className="event-detail-card">
            <div className="event-detail-image">
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.title} />
              ) : (
                <div className="event-detail-placeholder">
                  <span>{event.category === 'MOVIE' ? '🎬' : '🎪'}</span>
                </div>
              )}
            </div>
            <div className="event-detail-info">
              <span className={`category-badge category-${event.category?.toLowerCase()}`}>
                {event.category}
              </span>
              <h1 className="event-detail-title">{event.title}</h1>
              <p className="event-detail-description">{event.description}</p>

              <div className="event-meta-grid">
                <div className="event-meta-item">
                  <span className="meta-icon">📍</span>
                  <div>
                    <span className="meta-label">Venue</span>
                    <span className="meta-value">{event.venue}</span>
                  </div>
                </div>
                <div className="event-meta-item">
                  <span className="meta-icon">📅</span>
                  <div>
                    <span className="meta-label">Date & Time</span>
                    <span className="meta-value">{formatDate(event.dateTime)}</span>
                  </div>
                </div>
                <div className="event-meta-item">
                  <span className="meta-icon">💰</span>
                  <div>
                    <span className="meta-label">Price per Ticket</span>
                    <span className="meta-value">₹{event.ticketPrice}</span>
                  </div>
                </div>
                <div className="event-meta-item">
                  <span className="meta-icon">💺</span>
                  <div>
                    <span className="meta-label">Available Seats</span>
                    <span className="meta-value">{event.availableSeats ?? event.totalSeats ?? '–'}</span>
                  </div>
                </div>
                {event.genre && (
                  <div className="event-meta-item">
                    <span className="meta-icon">🎭</span>
                    <div>
                      <span className="meta-label">Genre</span>
                      <span className="meta-value">{event.genre}</span>
                    </div>
                  </div>
                )}
                {event.bookingDeadline && (
                  <div className="event-meta-item">
                    <span className="meta-icon">⏰</span>
                    <div>
                      <span className="meta-label">Booking Deadline</span>
                      <span className={`meta-value ${isDeadlinePassed ? 'text-danger' : ''}`}>
                        {formatDate(event.bookingDeadline)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seat Selection */}
        <div className="seat-selection-section">
          <div className="glass-card">
            <h2 className="section-title">🎫 Select Your Seats</h2>
            {isDeadlinePassed && (
              <div className="alert alert-error">
                <span>⏰</span> Booking deadline has passed for this event. No new bookings are accepted.
              </div>
            )}
            {!user && (
              <div className="alert alert-info">
                <span>ℹ️</span> Please <a href="/login" className="auth-link">login</a> to book seats.
              </div>
            )}
            <SeatMap
              seats={seats}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              disabled={!user || bookingSuccess || isDeadlinePassed}
            />
          </div>
        </div>

        {/* Booking Summary */}
        {selectedSeats.length > 0 && (
          <div className="booking-summary-section">
            <div className="glass-card booking-summary">
              <h3>🧾 Booking Summary</h3>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Event</span>
                  <span>{event.title}</span>
                </div>
                <div className="summary-row">
                  <span>Seats ({selectedSeats.length})</span>
                  <span>{selectedSeats.map((s) => s.seatNumber).join(', ')}</span>
                </div>
                <div className="summary-row">
                  <span>Price per Ticket</span>
                  <span>₹{event.ticketPrice}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row summary-total">
                  <span>Total Amount</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <button
                className="btn btn-primary btn-full btn-glow"
                onClick={handleBookNow}
                disabled={bookingSuccess || bookingLoading || isDeadlinePassed}
              >
                {bookingLoading ? (
                  <span className="btn-loading">
                    <span className="loading-spinner-sm"></span> Processing...
                  </span>
                ) : (
                  `🎟️ Book Now - ₹${totalPrice.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💳 Confirm Payment</h2>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-summary">
                <div className="payment-event">
                  <h3>{event.title}</h3>
                  <p>{formatDate(event.dateTime)}</p>
                  <p>📍 {event.venue}</p>
                </div>
                <div className="payment-details">
                  <div className="summary-row">
                    <span>Seats</span>
                    <span>{selectedSeats.map((s) => s.seatNumber).join(', ')}</span>
                  </div>
                  <div className="summary-row">
                    <span>{selectedSeats.length} × ₹{event.ticketPrice}</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row summary-total">
                    <span>Total</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-glow" onClick={confirmBooking} disabled={bookingLoading}>
                {bookingLoading ? (
                  <span className="btn-loading">
                    <span className="loading-spinner-sm"></span> Processing...
                  </span>
                ) : (
                  '✅ Confirm & Pay'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
