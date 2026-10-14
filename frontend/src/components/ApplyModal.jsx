import React, { useState } from 'react';
import { api } from '../services/api';

export default function ApplyModal({ job, onClose, onApplicationSubmitted, onGoToTracker }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    resumeUrl: '',
    skills: '',
    coverLetter: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!job) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError('Please provide your full name and valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        jobId: job.id,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        resumeUrl: formData.resumeUrl.trim(),
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        coverLetter: formData.coverLetter.trim()
      };

      const result = await api.applyForJob(payload);

      setSuccessData({
        applicationId: result.data?.application?.id,
        email: formData.email.trim(),
        jobTitle: job.title,
        company: job.company
      });

      if (onApplicationSubmitted) {
        onApplicationSubmitted();
      }
    } catch (err) {
      setError(err.message || 'Error submitting application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              Applying for
            </div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '2px' }}>{job.title}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {job.company} • {job.location}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {successData ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '36px 24px' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: 'var(--accent-emerald)',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '2px solid rgba(16, 185, 129, 0.4)'
            }}>
              ✓
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Application Submitted!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>
              Your application for <strong>{successData.jobTitle}</strong> at <strong>{successData.company}</strong> has been recorded in the database.
            </p>

            <div style={{ 
              background: 'rgba(255, 255, 255, 0.04)', 
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              maxWidth: '420px',
              margin: '0 auto 24px auto',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Applicant Email:</span>
                <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{successData.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Tracking Reference:</span>
                <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{successData.applicationId}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-details" onClick={onClose}>
                Done
              </button>
              <button 
                className="btn-apply-primary"
                onClick={() => {
                  onClose();
                  if (onGoToTracker) onGoToTracker(successData.email);
                }}
              >
                Track Application Status →
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="banner banner-warning" style={{ marginBottom: '18px' }}>
                  <span>⚠️ {error}</span>
                </div>
              )}

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">
                    Full Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. sarah@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <div className="form-hint">Used for live application tracking</div>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="e.g. +1 (555) 019-2834"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Resume / Portfolio Link</label>
                  <input
                    type="url"
                    name="resumeUrl"
                    placeholder="https://github.com/you or LinkedIn"
                    value={formData.resumeUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Key Skills / Technologies</label>
                <input
                  type="text"
                  name="skills"
                  placeholder="React, TypeScript, Node.js, Supabase (comma separated)"
                  value={formData.skills}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cover Letter / Note to Recruiter</label>
                <textarea
                  name="coverLetter"
                  rows={4}
                  placeholder="Briefly introduce yourself and outline why you are excited about this role..."
                  value={formData.coverLetter}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-details" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-apply-primary" disabled={loading}>
                {loading ? 'Submitting Application...' : 'Submit Application 🚀'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
