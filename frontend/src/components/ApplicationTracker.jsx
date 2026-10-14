import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from './StatusBadge';

const STEPS = [
  { key: 'pending', label: 'Application Submitted', desc: 'Received & Queued' },
  { key: 'reviewing', label: 'Profile Review', desc: 'Assessed by Team' },
  { key: 'interview', label: 'Interview Stage', desc: 'Technical & Culture' },
  { key: 'decision', label: 'Decision', desc: 'Offer / Conclusion' }
];

export default function ApplicationTracker({ initialEmail }) {
  const [searchQuery, setSearchQuery] = useState(initialEmail || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setSearchQuery(initialEmail);
      handleSearch(initialEmail);
    }
  }, [initialEmail]);

  const handleSearch = async (queryToUse) => {
    const q = (queryToUse !== undefined ? queryToUse : searchQuery).trim();
    if (!q) {
      setError('Please provide an email address or Application ID.');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const isEmail = q.includes('@');
      const params = isEmail ? { email: q } : { applicationId: q };
      const response = await api.trackApplications(params);
      setResults(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to search applications.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStepProgressIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 0;
    if (s === 'reviewing') return 1;
    if (s === 'interview') return 2;
    if (s === 'accepted' || s === 'rejected') return 3;
    return 0;
  };

  return (
    <div className="container tracker-section">
      <div className="tracker-search-box">
        <h2 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>
          Track Your Application Status
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto' }}>
          Enter the email address you applied with or your Application ID to view live recruitment milestones.
        </p>

        <form 
          className="tracker-search-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <input
            type="text"
            placeholder="Enter your email (e.g. alex.morgan@example.com) or Application ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ borderRadius: 'var(--radius-md)' }}
          />
          <button 
            type="submit" 
            className="btn-apply-primary"
            style={{ padding: '0 24px', whiteSpace: 'nowrap' }}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Track 🔍'}
          </button>
        </form>

        {/* Quick test buttons */}
        <div style={{ marginTop: '14px', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          Quick Demo Query: {' '}
          <button
            type="button"
            onClick={() => {
              setSearchQuery('alex.morgan@example.com');
              handleSearch('alex.morgan@example.com');
            }}
            style={{ 
              background: 'none', 
              color: 'var(--accent-cyan)', 
              textDecoration: 'underline', 
              padding: 0,
              fontSize: '0.82rem'
            }}
          >
            alex.morgan@example.com (Sample Candidate)
          </button>
        </div>
      </div>

      {error && (
        <div className="banner banner-warning" style={{ marginBottom: '24px', justifyContent: 'center' }}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {loading && (
        <div className="state-box">
          <div className="spinner"></div>
          <p>Querying Supabase application records...</p>
        </div>
      )}

      {/* Results List */}
      {!loading && hasSearched && results.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#cbd5e1' }}>
            Found {results.length} Application{results.length === 1 ? '' : 's'}
          </h3>

          {results.map((app) => {
            const currentStepIdx = getStepProgressIndex(app.status);
            const isRejected = (app.status || '').toLowerCase() === 'rejected';

            return (
              <div key={app.id} className="app-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', marginBottom: '4px' }}>
                      {app.job?.title || 'Position Title'}
                    </h3>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.95rem' }}>
                      {app.job?.company || 'Company'} • {app.job?.location || 'Remote'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge status={app.status} />
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                      Ref: {app.id}
                    </div>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="timeline-stepper">
                  {STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIdx || (idx === currentStepIdx && app.status === 'accepted');
                    const isActive = idx === currentStepIdx && !isCompleted;
                    const isRejectedStep = idx === 3 && isRejected;

                    let nodeClass = 'step-node';
                    if (isCompleted) nodeClass += ' completed';
                    else if (isActive) nodeClass += ' active';
                    if (isRejectedStep) nodeClass += ' rejected-step';

                    return (
                      <div key={step.key} className={nodeClass}>
                        <div className="step-circle">
                          {isCompleted ? '✓' : isRejectedStep ? '✕' : (idx + 1)}
                        </div>
                        <div className="step-label">{step.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Status details & notes */}
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  marginTop: '16px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Submitted: </span>
                      <span>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Candidate: </span>
                      <span>{app.applicant?.full_name || 'Applicant'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Recruiter Feedback: </span>
                      <span style={{ color: '#a5b4fc', fontStyle: 'italic' }}>
                        {app.notes || 'Application is being processed by the hiring team.'}
                      </span>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <strong>Cover Note: </strong>
                      "{app.coverLetter}"
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty result */}
      {!loading && hasSearched && results.length === 0 && (
        <div className="state-box">
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📂</div>
          <h3 style={{ marginBottom: '8px' }}>No Applications Found</h3>
          <p style={{ maxWidth: '440px', margin: '0 auto 16px auto' }}>
            We could not find any active job applications matching "<strong>{searchQuery}</strong>". Please verify your email or submit a new application.
          </p>
        </div>
      )}
    </div>
  );
}
