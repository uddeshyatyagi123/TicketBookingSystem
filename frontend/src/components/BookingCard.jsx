const BookingCard = ({ booking, onCancel }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'PENDING':
        return 'status-pending';
      default:
        return '';
    }
  };

  const seatNumbers = Array.isArray(booking.seatNumbers)
    ? booking.seatNumbers.join(', ')
    : typeof booking.seatNumbers === 'string'
    ? booking.seatNumbers
    : booking.seats
    ? booking.seats.map((s) => s.seatNumber).join(', ')
    : 'N/A';

  return (
    <div className="booking-card">
      <div className="booking-card-header">
        <div className="booking-event-info">
          <h3 className="booking-event-title">{booking.eventTitle || booking.event?.title || 'Event'}</h3>
          <span className={`status-badge ${getStatusClass(booking.status)}`}>
            {booking.status}
          </span>
        </div>
      </div>

      <div className="booking-card-body">
        <div className="booking-detail">
          <span className="detail-icon">📅</span>
          <span className="detail-text">{formatDate(booking.eventDateTime || booking.event?.dateTime)}</span>
        </div>
        <div className="booking-detail">
          <span className="detail-icon">📍</span>
          <span className="detail-text">{booking.eventVenue || booking.event?.venue || 'N/A'}</span>
        </div>
        <div className="booking-detail">
          <span className="detail-icon">💺</span>
          <span className="detail-text">Seats: {seatNumbers}</span>
        </div>
        <div className="booking-detail">
          <span className="detail-icon">🆔</span>
          <span className="detail-text">Booking #{booking.bookingId || booking.id}</span>
        </div>
      </div>

      <div className="booking-card-footer">
        <div className="booking-amount">
          <span className="amount-label">Total</span>
          <span className="amount-value">₹{booking.totalAmount?.toFixed(2) || '0.00'}</span>
        </div>
        {booking.status?.toUpperCase() === 'CONFIRMED' && onCancel && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onCancel(booking.bookingId || booking.id)}
          >
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
