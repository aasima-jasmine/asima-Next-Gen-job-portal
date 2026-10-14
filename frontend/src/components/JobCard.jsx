import React from 'react';

export default function JobCard({ job, onSelectJob, onApplyJob }) {
  const companyInitial = job.company ? job.company.charAt(0).toUpperCase() : 'A';
  const requirementsList = Array.isArray(job.requirements) 
    ? job.requirements.slice(0, 3) 
    : [];

  return (
    <div className="job-card">
      <div>
        <div className="job-header">
          <div className="company-logo-avatar">
            {companyInitial}
          </div>
          <span className="job-type-pill">{job.type || 'Full-time'}</span>
        </div>

        <h3 className="job-title">{job.title}</h3>
        <div className="job-company">{job.company}</div>

        <div className="job-meta-row">
          <div className="job-meta-item">
            <span>📍</span>
            <span>{job.location}</span>
          </div>
          <div className="job-meta-item">
            <span>🏷️</span>
            <span>{job.category || 'General'}</span>
          </div>
        </div>

        <p className="job-description-excerpt">
          {job.description}
        </p>

        {requirementsList.length > 0 && (
          <div className="job-skills-tags">
            {requirementsList.map((req, i) => (
              <span key={i} className="skill-tag">{req}</span>
            ))}
            {job.requirements.length > 3 && (
              <span className="skill-tag">+{job.requirements.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      <div className="job-footer">
        <div className="job-salary">
          {job.salary_range || 'Competitive'}
        </div>
        <div className="job-actions">
          <button className="btn-details" onClick={() => onSelectJob(job)}>
            Details
          </button>
          <button className="btn-apply-primary" onClick={() => onApplyJob(job)}>
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}
