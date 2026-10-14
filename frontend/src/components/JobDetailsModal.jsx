import React from 'react';

export default function JobDetailsModal({ job, onClose, onApply }) {
  if (!job) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="job-type-pill" style={{ marginBottom: '8px', display: 'inline-block' }}>
              {job.type} • {job.category}
            </span>
            <h2 style={{ fontSize: '1.45rem', marginBottom: '4px' }}>{job.title}</h2>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 500, fontSize: '1rem' }}>
              {job.company}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Quick Stats Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
            gap: '12px', 
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '24px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Location</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>📍 {job.location}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Compensation</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-emerald)' }}>
                💰 {job.salary_range || 'Competitive'}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Role Type</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>⚡ {job.type}</div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '10px', color: '#fff' }}>About the Role</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.65', whiteSpace: 'pre-line' }}>
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {Array.isArray(job.requirements) && job.requirements.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '10px', color: '#fff' }}>Candidate Qualifications</h4>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.7' }}>
                {job.requirements.map((req, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ 
            background: 'rgba(99, 102, 241, 0.08)', 
            border: '1px solid rgba(99, 102, 241, 0.2)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            color: '#c7d2fe'
          }}>
            ℹ️ Applications are directly submitted to the Antigravity Supabase database and tracked with your email address.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-details" onClick={onClose}>
            Close
          </button>
          <button 
            className="btn-apply-primary"
            onClick={() => {
              onClose();
              onApply(job);
            }}
          >
            Apply for this Position 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
