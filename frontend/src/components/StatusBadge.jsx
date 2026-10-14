import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = (status || 'pending').toLowerCase();

  const config = {
    pending: { label: 'Pending Review', icon: '⏳', className: 'pending' },
    reviewing: { label: 'In Review', icon: '🔍', className: 'reviewing' },
    interview: { label: 'Interview Scheduled', icon: '🎙️', className: 'interview' },
    accepted: { label: 'Accepted', icon: '✅', className: 'accepted' },
    rejected: { label: 'Not Selected', icon: '✕', className: 'rejected' }
  };

  const item = config[normalized] || { label: status, icon: '•', className: 'pending' };

  return (
    <span className={`status-badge ${item.className}`}>
      <span>{item.icon}</span>
      <span>{item.label}</span>
    </span>
  );
}
