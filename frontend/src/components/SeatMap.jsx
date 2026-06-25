import { useMemo } from 'react';

const SeatMap = ({ seats = [], selectedSeats = [], onSeatSelect, disabled = false }) => {
  const seatsByRow = useMemo(() => {
    const rows = {};
    seats.forEach((seat) => {
      const row = seat.seatNumber ? seat.seatNumber.charAt(0) : 'A';
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });
    Object.keys(rows).forEach((row) => {
      rows[row].sort((a, b) => {
        const numA = parseInt(a.seatNumber.substring(1));
        const numB = parseInt(b.seatNumber.substring(1));
        return numA - numB;
      });
    });
    return rows;
  }, [seats]);

  const getSeatStatus = (seat) => {
    const isSelected = selectedSeats.some((s) => {
      const sId = s.id || s.seatId;
      const seatId = seat.id || seat.seatId;
      return sId && seatId && sId === seatId;
    });
    if (isSelected) {
      return 'selected';
    }
    if (seat.booked || seat.status === 'BOOKED') {
      return 'booked';
    }
    return 'available';
  };

  const handleSeatClick = (seat) => {
    if (disabled) return;
    const status = getSeatStatus(seat);
    if (status === 'booked') return;
    if (onSeatSelect) {
      onSeatSelect(seat);
    }
  };

  const sortedRows = Object.keys(seatsByRow).sort();

  return (
    <div className="seat-map">
      <div className="screen-indicator">
        <div className="screen-curve"></div>
        <span className="screen-label">SCREEN</span>
      </div>

      <div className="seats-container">
        {sortedRows.map((row) => (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>
            <div className="row-seats">
              {seatsByRow[row].map((seat) => {
                const status = getSeatStatus(seat);
                return (
                  <button
                    key={seat.seatId || seat.id}
                    className={`seat seat-${status}`}
                    onClick={() => handleSeatClick(seat)}
                    disabled={disabled || status === 'booked'}
                    title={`${seat.seatNumber} - ${status}`}
                  >
                    <span className="seat-number">{seat.seatNumber}</span>
                  </button>
                );
              })}
            </div>
            <span className="row-label">{row}</span>
          </div>
        ))}
      </div>

      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-box legend-available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-box legend-selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-box legend-booked"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
