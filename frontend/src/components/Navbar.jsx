import React from 'react';

export default function Navbar({ activeTab, setActiveTab, onOpenPostJob, systemStatus }) {
  const isLiveSupabase = systemStatus?.supabaseConfigured;

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <div className="brand" onClick={() => setActiveTab('jobs')}>
          <div className="brand-icon">▲</div>
          <div className="brand-title">
            Antigravity<span>Careers</span>
          </div>
        </div>

        <div className="nav-links">
          <button 
            className={`nav-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <span>💼</span> Find Jobs
          </button>
          
          <button 
            className={`nav-btn ${activeTab === 'track' ? 'active' : ''}`}
            onClick={() => setActiveTab('track')}
          >
            <span>📍</span> Track Status
          </button>

          <button 
            className={`nav-btn ${activeTab === 'recruiter' ? 'active' : ''}`}
            onClick={() => setActiveTab('recruiter')}
          >
            <span>📊</span> Employer Portal
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            className="system-status-pill" 
            title={isLiveSupabase ? "Supabase Live Connected" : "In-Memory Demo Active (Set .env for Supabase)"}
          >
            <span className="status-dot"></span>
            <span>{isLiveSupabase ? 'Supabase Live' : 'Demo DB Active'}</span>
          </div>

          <button className="nav-cta" onClick={onOpenPostJob}>
            + Post a Job
          </button>
        </div>
      </div>
    </nav>
  );
}
