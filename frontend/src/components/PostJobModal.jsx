import React, { useState } from 'react';
import { api } from '../services/api';

const CATEGORIES = ['Engineering', 'Design', 'DevOps', 'Marketing', 'Product'];
const TYPES = ['Full-time', 'Remote', 'Contract', 'Part-time', 'Internship'];

export default function PostJobModal({ isOpen, onClose, onJobCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: 'Remote',
    category: 'Engineering',
    type: 'Full-time',
    salary_range: '',
    requirements: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.description) {
      setError('Please fill in title, company, and job description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        requirements: formData.requirements
          ? formData.requirements.split(',').map(s => s.trim()).filter(Boolean)
          : []
      };

      await api.createJob(payload);
      onJobCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '2px' }}>Post a New Job Opening</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Add a listing to the Antigravity Supabase database
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="banner banner-warning" style={{ marginBottom: '16px' }}>
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Job Title <span className="req">*</span></label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Senior Backend Architect"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company Name <span className="req">*</span></label>
                <input
                  type="text"
                  name="company"
                  required
                  placeholder="e.g. Antigravity Labs"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Remote / New York, NY"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Salary Range</label>
                <input
                  type="text"
                  name="salary_range"
                  placeholder="e.g. $120,000 - $160,000"
                  value={formData.salary_range}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Key Requirements (comma separated)</label>
              <input
                type="text"
                name="requirements"
                placeholder="React, Node.js, Supabase, 4+ years exp"
                value={formData.requirements}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Description <span className="req">*</span></label>
              <textarea
                name="description"
                rows={4}
                required
                placeholder="Describe key responsibilities, team environment, and expectations..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-details" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-apply-primary" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Job Listing 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
