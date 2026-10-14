// API client service for Antigravity Job Portal

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
  // 1. Jobs
  async getJobs(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.type && params.type !== 'All') query.append('type', params.type);

    const res = await fetch(`${API_BASE}/jobs?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  async getJobById(id) {
    const res = await fetch(`${API_BASE}/jobs/${id}`);
    if (!res.ok) throw new Error('Failed to fetch job details');
    return res.json();
  },

  async createJob(jobData) {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create job');
    return data;
  },

  // 2. Applications & Apply
  async applyForJob(applicationData) {
    const res = await fetch(`${API_BASE}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit application');
    return data;
  },

  // 3. Track Status
  async trackApplications({ email, applicationId }) {
    const query = new URLSearchParams();
    if (email) query.append('email', email);
    if (applicationId) query.append('applicationId', applicationId);

    const res = await fetch(`${API_BASE}/applications/track?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to track applications');
    return data;
  },

  // 4. Recruiter / Admin: View all & update status
  async getAllApplications() {
    const res = await fetch(`${API_BASE}/applications`);
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  },

  async updateApplicationStatus(id, { status, notes }) {
    const res = await fetch(`${API_BASE}/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update application status');
    return data;
  },

  // 5. System Health & Supabase check
  async getStatus() {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (!res.ok) return { status: 'offline', database: 'Unreachable' };
      return res.json();
    } catch {
      return { status: 'offline', database: 'Backend server not responding' };
    }
  }
};
