import React, { useState, useMemo } from 'react';
import JobCard from './JobCard';

const CATEGORIES = ['All', 'Engineering', 'Design', 'DevOps', 'Marketing', 'Product'];
const TYPES = ['All', 'Full-time', 'Remote', 'Contract', 'Part-time', 'Internship'];

export default function JobList({ jobs, loading, error, onSelectJob, onApplyJob, onRefresh }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Filter jobs locally or through server query
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchCategory = selectedCategory === 'All' || 
        job.category?.toLowerCase() === selectedCategory.toLowerCase();
      
      const matchType = selectedType === 'All' || 
        job.type?.toLowerCase() === selectedType.toLowerCase();

      const q = search.trim().toLowerCase();
      const matchSearch = !q || 
        job.title?.toLowerCase().includes(q) ||
        job.company?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q) ||
        job.description?.toLowerCase().includes(q);

      return matchCategory && matchType && matchSearch;
    });
  }, [jobs, search, selectedCategory, selectedType]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedType('All');
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">
          <span>⚡</span> Next-Gen Tech Careers at Scale
        </div>
        <h1 className="hero-title">
          Explore Your Next Role with <span className="hero-title-gradient">Antigravity</span>
        </h1>
        <p className="hero-subtitle">
          Curated opportunities from world-class engineering and AI teams. Apply seamlessly, track application milestones in real-time.
        </p>
      </section>

      {/* Filter and Search Bar */}
      <div className="search-filter-card">
        <div className="search-row">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by role, company name, skill, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select 
            className="filter-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {TYPES.map(t => (
              <option key={t} value={t}>{t === 'All' ? 'All Work Types' : t}</option>
            ))}
          </select>

          <button 
            className="btn-details" 
            onClick={onRefresh} 
            title="Refresh listings"
            style={{ padding: '11px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🔄</span> Refresh
          </button>
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Showing <strong style={{ color: '#fff' }}>{filteredJobs.length}</strong> available position{filteredJobs.length === 1 ? '' : 's'}
        </p>
        {(search || selectedCategory !== 'All' || selectedType !== 'All') && (
          <button 
            onClick={clearFilters}
            style={{ background: 'none', color: 'var(--accent-cyan)', fontSize: '0.85rem' }}
          >
            Clear filters ✕
          </button>
        )}
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="state-box">
          <div className="spinner"></div>
          <p>Loading available positions from Antigravity database...</p>
        </div>
      )}

      {error && !loading && (
        <div className="banner banner-warning" style={{ justifyContent: 'center' }}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Jobs Grid */}
      {!loading && filteredJobs.length > 0 && (
        <div className="jobs-grid">
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onSelectJob={onSelectJob}
              onApplyJob={onApplyJob}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredJobs.length === 0 && (
        <div className="state-box">
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔎</div>
          <h3 style={{ marginBottom: '8px' }}>No matches found</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto 20px auto' }}>
            We couldn't find any job openings matching your search criteria. Try modifying your search filters.
          </p>
          <button className="btn-details" onClick={clearFilters}>
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
