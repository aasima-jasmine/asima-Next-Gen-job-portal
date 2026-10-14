import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from './StatusBadge';

const STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ Pending' },
  { value: 'reviewing', label: '🔍 Reviewing' },
  { value: 'interview', label: '🎙️ Interview' },
  { value: 'accepted', label: '✅ Accepted' },
  { value: 'rejected', label: '✕ Rejected' }
];

export default function RecruiterDashboard({ onOpenPostJob }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState('');

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getAllApplications();
      setApplications(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      await api.updateApplicationStatus(appId, {
        status: newStatus,
        notes: `Status changed to ${newStatus} on ${new Date().toLocaleDateString()}`
      });

      // Update locally
      setApplications(prev =>
        prev.map(item => item.id === appId ? { ...item, status: newStatus } : item)
      );

      setNotification(`Updated application status to "${newStatus}"!`);
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics
  const totalApps = applications.length;
  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const interviewingCount = applications.filter(a => a.status === 'interview').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '36px 0 24px 0', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '4px' }}>Employer Portal & Applications</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Review candidate applications and update candidate hiring stages in real-time.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-details" onClick={loadApplications}>
            🔄 Refresh
          </button>
          <button className="btn-apply-primary" onClick={onOpenPostJob}>
            + Post New Opening
          </button>
        </div>
      </div>

      {notification && (
        <div className="banner banner-success" style={{ marginBottom: '20px' }}>
          <span>✓ {notification}</span>
        </div>
      )}

      {error && (
        <div className="banner banner-warning" style={{ marginBottom: '20px' }}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '28px' 
      }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Total Received</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{totalApps}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Pending Review</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>{pendingCount}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>In Interviews</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc' }}>{interviewingCount}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Accepted / Hired</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>{acceptedCount}</div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="state-box">
          <div className="spinner"></div>
          <p>Loading candidate applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="state-box">
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
          <h3>No applications yet</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto 16px auto' }}>
            Submit an application from the "Find Jobs" tab to see it appear here immediately.
          </p>
        </div>
      ) : (
        <div className="recruiter-table-wrapper">
          <table className="recruiter-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Applied Position</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th>Stage Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{app.applicant?.full_name || 'Anonymous'}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {app.applicant?.email}
                    </div>
                    {app.applicant?.resume_url && (
                      <div style={{ marginTop: '4px' }}>
                        <a 
                          href={app.applicant.resume_url} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ fontSize: '0.78rem' }}
                        >
                          🔗 View Resume / Link
                        </a>
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{app.job?.title || 'Job Listing'}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      {app.job?.company} • {app.job?.location}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={app.status}
                      disabled={updatingId === app.id}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
