import { useState, useEffect } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../api/api';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    title: '',
    description: '',
    category: 'MOVIE',
    genre: '',
    venue: '',
    dateTime: '',
    bookingDeadline: '',
    ticketPrice: '',
    totalSeats: '',
    imageUrl: '',
  };

  const [form, setForm] = useState(emptyForm);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await getEvents();
      setEvents(Array.isArray(response.data) ? response.data : response.data.content || []);
    } catch (err) {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingEvent(null);
    setShowForm(true);
  };

  const openEditForm = (event) => {
    setForm({
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'MOVIE',
      genre: event.genre || '',
      venue: event.venue || '',
      dateTime: event.dateTime ? event.dateTime.slice(0, 16) : '',
      bookingDeadline: event.bookingDeadline ? event.bookingDeadline.slice(0, 16) : '',
      ticketPrice: event.ticketPrice || '',
      totalSeats: event.totalSeats || '',
      imageUrl: event.imageUrl || '',
    });
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.venue || !form.dateTime || !form.ticketPrice || !form.totalSeats) {
      setError('Please fill in all required fields');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        ticketPrice: parseFloat(form.ticketPrice),
        totalSeats: parseInt(form.totalSeats),
      };
      if (editingEvent) {
        await updateEvent(editingEvent.eventId || editingEvent.id, payload);
        setSuccess('Event updated successfully!');
      } else {
        await createEvent(payload);
        setSuccess('Event created successfully!');
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(deleteConfirm.eventId || deleteConfirm.id);
      setDeleteConfirm(null);
      setSuccess('Event deleted successfully!');
      fetchEvents();
    } catch (err) {
      setError('Failed to delete event.');
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="admin-events-page">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">🎬 Manage Events</h1>
            <p className="page-subtitle">Create, edit, and manage your events</p>
          </div>
          <button className="btn btn-primary" onClick={openCreateForm}>
            ➕ Create Event
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span>✅</span> {success}
        </div>
      )}

      {/* Event Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? '✏️ Edit Event' : '➕ Create New Event'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      name="title"
                      className="form-input"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Event title"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      name="category"
                      className="form-input"
                      value={form.category}
                      onChange={handleChange}
                    >
                      <option value="MOVIE">🎬 Movie</option>
                      <option value="EVENT">🎪 Event</option>
                    </select>
                  </div>
                  {form.category === 'MOVIE' && (
                    <div className="form-group">
                      <label className="form-label">Genre</label>
                      <input
                        type="text"
                        name="genre"
                        className="form-input"
                        value={form.genre}
                        onChange={handleChange}
                        placeholder="e.g., Action, Comedy, Sci-Fi"
                      />
                    </div>
                  )}
                  <div className="form-group form-group-full">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-input form-textarea"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe the event..."
                      rows={3}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Venue *</label>
                    <input
                      type="text"
                      name="venue"
                      className="form-input"
                      value={form.venue}
                      onChange={handleChange}
                      placeholder="e.g., PVR Cinemas"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="dateTime"
                      className="form-input"
                      value={form.dateTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Booking Deadline</label>
                    <input
                      type="datetime-local"
                      name="bookingDeadline"
                      className="form-input"
                      value={form.bookingDeadline}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ticket Price (₹) *</label>
                    <input
                      type="number"
                      name="ticketPrice"
                      className="form-input"
                      value={form.ticketPrice}
                      onChange={handleChange}
                      placeholder="299"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Seats *</label>
                    <input
                      type="number"
                      name="totalSeats"
                      className="form-input"
                      value={form.totalSeats}
                      onChange={handleChange}
                      placeholder="100"
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">Image URL</label>
                    <input
                      type="url"
                      name="imageUrl"
                      className="form-input"
                      value={form.imageUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <span className="btn-loading">
                      <span className="loading-spinner-sm"></span> Saving...
                    </span>
                  ) : editingEvent ? (
                    '💾 Update Event'
                  ) : (
                    '➕ Create Event'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events Table */}
      {loading ? (
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🎭</span>
          <h3>No events yet</h3>
          <p>Create your first event to get started!</p>
          <button className="btn btn-primary" onClick={openCreateForm}>
            ➕ Create Event
          </button>
        </div>
      ) : (
        <div className="admin-table-wrapper glass-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Venue</th>
                <th>Date</th>
                <th>Price</th>
                <th>Seats</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.eventId || event.id}>
                  <td>
                    <div className="table-event-info">
                      <strong>{event.title}</strong>
                      {event.genre && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '2px' }}>
                          Genre: {event.genre}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`category-badge category-${event.category?.toLowerCase()}`}>
                      {event.category}
                    </span>
                  </td>
                  <td>{event.venue}</td>
                  <td>{formatDate(event.dateTime)}</td>
                  <td className="price-cell">₹{event.ticketPrice}</td>
                  <td>{event.availableSeats ?? event.totalSeats ?? '–'} / {event.totalSeats}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditForm(event)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteConfirm(event)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ Delete Event</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
