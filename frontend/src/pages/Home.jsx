import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../api/api';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [genre, setGenre] = useState('');
  const navigate = useNavigate();

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.keyword = search;
      if (category) params.category = category;
      if (genre) params.genre = genre;
      const response = await getEvents(params);
      setEvents(Array.isArray(response.data) ? response.data : response.data.content || []);
    } catch (err) {
      setError('Failed to load events. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, genre]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            Book Your <span className="gradient-text">Experience</span>
          </h1>
          <p className="hero-subtitle">
            Discover and book tickets for the hottest movies and events near you.
            Premium seats, instant confirmation.
          </p>

          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search movies, events, venues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="search-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setGenre('');
              }}
            >
              <option value="">All Categories</option>
              <option value="MOVIE">🎬 Movies</option>
              <option value="EVENT">🎪 Events</option>
            </select>

            {category === 'MOVIE' && (
              <select
                className="search-select"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                <option value="">All Genres</option>
                <option value="Action">Action</option>
                <option value="Comedy">Comedy</option>
                <option value="Drama">Drama</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Thriller">Thriller</option>
                <option value="Horror">Horror</option>
                <option value="Romance">Romance</option>
              </select>
            )}

            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Events Grid */}
      <section className="events-section">
        <div className="section-header">
          <h2 className="section-title">
            {category ? `${category === 'MOVIE' ? '🎬 Movies' : '🎪 Events'}` : '🔥 Trending Now'}
          </h2>
          <p className="section-subtitle">
            {events.length} {events.length === 1 ? 'event' : 'events'} available
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {loading ? (
          <div className="events-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="event-card skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line skeleton-title"></div>
                  <div className="skeleton-line skeleton-text"></div>
                  <div className="skeleton-line skeleton-text short"></div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎭</span>
            <h3>No events found</h3>
            <p>Try adjusting your search or check back later for new events.</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div
                key={event.eventId || event.id}
                className="event-card"
                onClick={() => navigate(`/events/${event.eventId || event.id}`)}
              >
                <div className="event-card-image">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} />
                  ) : (
                    <div className="event-card-placeholder">
                      <span>{event.category === 'MOVIE' ? '🎬' : '🎪'}</span>
                    </div>
                  )}
                  <span className={`category-badge category-${event.category?.toLowerCase()}`}>
                    {event.category}
                  </span>
                </div>
                <div className="event-card-content">
                  <h3 className="event-card-title">{event.title}</h3>
                  {event.genre && (
                    <div className="event-genre-tag" style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>🎭</span>
                      <span>{event.genre}</span>
                    </div>
                  )}
                  <div className="event-card-details">
                    <div className="event-detail-row">
                      <span>📍</span>
                      <span>{event.venue || 'Venue TBA'}</span>
                    </div>
                    <div className="event-detail-row">
                      <span>📅</span>
                      <span>{formatDate(event.dateTime)}</span>
                    </div>
                  </div>
                  <div className="event-card-footer">
                    <div className="event-price">
                      <span className="price-label">From</span>
                      <span className="price-value">₹{event.ticketPrice || 0}</span>
                    </div>
                    <div className="event-seats">
                      <span className="seats-available">
                        {event.availableSeats ?? event.totalSeats ?? '–'} seats
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
