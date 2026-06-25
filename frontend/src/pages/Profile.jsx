import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUser, updateUser } from '../api/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await getUser(user.userId);
        setProfile(response.data);
        setForm({ name: response.data.name || '', phone: response.data.phone || '' });
      } catch (err) {
        setError('Failed to load profile.');
        setProfile(user);
        setForm({ name: user.name || '', phone: user.phone || '' });
      } finally {
        setLoading(false);
      }
    };
    if (user?.userId) fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await updateUser(user.userId, form);
      setProfile(response.data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      // Update localStorage
      const updatedUser = { ...user, name: form.name, phone: form.phone };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const displayProfile = profile || user;

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">👤 My Profile</h1>
        <p className="page-subtitle">Manage your account information</p>
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

      <div className="profile-card glass-card">
        <div className="profile-avatar">
          <div className="avatar-circle">
            <span>{displayProfile?.name?.charAt(0)?.toUpperCase() || '?'}</span>
          </div>
          <div className="profile-name-section">
            <h2>{displayProfile?.name}</h2>
            <span className={`role-badge role-${displayProfile?.role?.toLowerCase()}`}>
              {displayProfile?.role}
            </span>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-wrapper">
                <span className="input-icon">📱</span>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="profile-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <span className="btn-loading">
                    <span className="loading-spinner-sm"></span> Saving...
                  </span>
                ) : (
                  '💾 Save Changes'
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setEditing(false);
                  setForm({ name: displayProfile?.name || '', phone: displayProfile?.phone || '' });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="profile-field">
              <span className="field-icon">✉️</span>
              <div>
                <span className="field-label">Email</span>
                <span className="field-value">{displayProfile?.email}</span>
              </div>
            </div>
            <div className="profile-field">
              <span className="field-icon">👤</span>
              <div>
                <span className="field-label">Name</span>
                <span className="field-value">{displayProfile?.name}</span>
              </div>
            </div>
            <div className="profile-field">
              <span className="field-icon">📱</span>
              <div>
                <span className="field-label">Phone</span>
                <span className="field-value">{displayProfile?.phone || 'Not set'}</span>
              </div>
            </div>
            <div className="profile-field">
              <span className="field-icon">🏷️</span>
              <div>
                <span className="field-label">Role</span>
                <span className="field-value">{displayProfile?.role}</span>
              </div>
            </div>
            <div className="profile-actions">
              <button className="btn btn-primary" onClick={() => setEditing(true)}>
                ✏️ Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
