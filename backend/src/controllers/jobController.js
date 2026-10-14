import supabase, { isConfigured, memoryStore } from '../supabaseClient.js';
import crypto from 'crypto';

// GET /api/jobs - List all jobs with optional filters
export const getJobs = async (req, res) => {
  try {
    const { search, category, type, status } = req.query;

    if (isConfigured && supabase) {
      let query = supabase.from('jobs').select('*').order('created_at', { ascending: false });

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }
      if (type && type !== 'All') {
        query = query.eq('type', type);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.json({ success: true, count: data.length, data, storage: 'supabase' });
    }

    // In-memory fallback
    let filtered = [...memoryStore.jobs];

    if (category && category !== 'All') {
      filtered = filtered.filter(j => j.category.toLowerCase() === category.toLowerCase());
    }
    if (type && type !== 'All') {
      filtered = filtered.filter(j => j.type.toLowerCase() === type.toLowerCase());
    }
    if (status) {
      filtered = filtered.filter(j => j.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({
      success: true,
      count: filtered.length,
      data: filtered,
      storage: 'demo-memory'
    });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving jobs', error: err.message });
  }
};

// GET /api/jobs/:id - Get a specific job
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
      if (error) return res.status(404).json({ success: false, message: 'Job not found' });
      return res.json({ success: true, data, storage: 'supabase' });
    }

    const job = memoryStore.jobs.find(j => j.id === id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    return res.json({ success: true, data: job, storage: 'demo-memory' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving job details', error: err.message });
  }
};

// POST /api/jobs - Create a new job listing
export const createJob = async (req, res) => {
  try {
    const { title, company, location, type, category, salary_range, description, requirements } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: title, company, location, and description.' 
      });
    }

    const parsedRequirements = Array.isArray(requirements) 
      ? requirements 
      : (typeof requirements === 'string' ? requirements.split(',').map(s => s.trim()).filter(Boolean) : []);

    const newJobPayload = {
      title,
      company,
      location,
      type: type || 'Full-time',
      category: category || 'Engineering',
      salary_range: salary_range || 'Competitive',
      description,
      requirements: parsedRequirements,
      status: 'active',
      created_at: new Date().toISOString()
    };

    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('jobs').insert([newJobPayload]).select().single();
      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Job created successfully', data, storage: 'supabase' });
    }

    // In-memory fallback
    const jobWithId = {
      id: crypto.randomUUID(),
      ...newJobPayload
    };
    memoryStore.jobs.unshift(jobWithId);

    return res.status(201).json({
      success: true,
      message: 'Job created successfully (Demo Mode)',
      data: jobWithId,
      storage: 'demo-memory'
    });
  } catch (err) {
    console.error('Error creating job:', err);
    return res.status(500).json({ success: false, message: 'Failed to create job', error: err.message });
  }
};

// DELETE /api/jobs/:id - Delete a job
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (isConfigured && supabase) {
      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (error) throw error;
      return res.json({ success: true, message: 'Job deleted successfully' });
    }

    const index = memoryStore.jobs.findIndex(j => j.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Job not found' });
    memoryStore.jobs.splice(index, 1);
    return res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete job', error: err.message });
  }
};
