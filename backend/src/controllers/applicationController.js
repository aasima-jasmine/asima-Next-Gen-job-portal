import supabase, { isConfigured, memoryStore } from '../supabaseClient.js';
import crypto from 'crypto';

// POST /api/apply - Apply for a job
export const applyForJob = async (req, res) => {
  try {
    const { jobId, fullName, email, phone, resumeUrl, coverLetter, skills, bio } = req.body;

    if (!jobId || !fullName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required application details: jobId, fullName, and email are mandatory.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const parsedSkills = Array.isArray(skills)
      ? skills
      : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);

    if (isConfigured && supabase) {
      // 1. Verify job exists
      const { data: job, error: jobError } = await supabase.from('jobs').select('id, title, company').eq('id', jobId).single();
      if (jobError || !job) {
        return res.status(404).json({ success: false, message: 'Specified job does not exist.' });
      }

      // 2. Find or create applicant
      let applicantId;
      const { data: existingApplicant, error: findError } = await supabase
        .from('applicants')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (findError) throw findError;

      if (existingApplicant) {
        applicantId = existingApplicant.id;
        // Update contact or resume if provided
        await supabase
          .from('applicants')
          .update({
            full_name: fullName,
            phone: phone || existingApplicant.phone,
            resume_url: resumeUrl || existingApplicant.resume_url,
            skills: parsedSkills.length ? parsedSkills : existingApplicant.skills,
            updated_at: new Date().toISOString()
          })
          .eq('id', applicantId);
      } else {
        const { data: newApplicant, error: createApplicantError } = await supabase
          .from('applicants')
          .insert([{
            full_name: fullName,
            email: cleanEmail,
            phone: phone || null,
            resume_url: resumeUrl || null,
            skills: parsedSkills,
            bio: bio || null
          }])
          .select()
          .single();

        if (createApplicantError) throw createApplicantError;
        applicantId = newApplicant.id;
      }

      // 3. Check if already applied to this specific job
      const { data: existingApp, error: appCheckError } = await supabase
        .from('applications')
        .select('id, status')
        .eq('job_id', jobId)
        .eq('applicant_id', applicantId)
        .maybeSingle();

      if (appCheckError) throw appCheckError;
      if (existingApp) {
        return res.status(409).json({
          success: false,
          message: 'You have already applied for this position.',
          applicationId: existingApp.id,
          currentStatus: existingApp.status
        });
      }

      // 4. Create application
      const { data: application, error: appError } = await supabase
        .from('applications')
        .insert([{
          job_id: jobId,
          applicant_id: applicantId,
          cover_letter: coverLetter || '',
          status: 'pending',
          notes: 'Application received'
        }])
        .select()
        .single();

      if (appError) throw appError;

      return res.status(201).json({
        success: true,
        message: `Application submitted successfully for ${job.title} at ${job.company}!`,
        data: {
          application,
          job,
          applicant: { id: applicantId, full_name: fullName, email: cleanEmail }
        },
        storage: 'supabase'
      });
    }

    // In-memory fallback
    const job = memoryStore.jobs.find(j => j.id === jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Specified job does not exist.' });
    }

    let applicant = memoryStore.applicants.find(a => a.email.toLowerCase() === cleanEmail);
    if (applicant) {
      applicant.full_name = fullName;
      if (phone) applicant.phone = phone;
      if (resumeUrl) applicant.resume_url = resumeUrl;
      if (parsedSkills.length) applicant.skills = parsedSkills;
    } else {
      applicant = {
        id: crypto.randomUUID(),
        full_name: fullName,
        email: cleanEmail,
        phone: phone || '',
        resume_url: resumeUrl || '',
        skills: parsedSkills,
        bio: bio || '',
        created_at: new Date().toISOString()
      };
      memoryStore.applicants.push(applicant);
    }

    // Check duplicate
    const alreadyApplied = memoryStore.applications.find(
      a => a.job_id === jobId && a.applicant_id === applicant.id
    );
    if (alreadyApplied) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an application for this role.',
        applicationId: alreadyApplied.id,
        currentStatus: alreadyApplied.status
      });
    }

    const newApplication = {
      id: 'app-' + Math.floor(100000 + Math.random() * 900000),
      job_id: jobId,
      applicant_id: applicant.id,
      cover_letter: coverLetter || '',
      status: 'pending',
      notes: 'Application received',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.applications.unshift(newApplication);

    return res.status(201).json({
      success: true,
      message: `Application submitted successfully for ${job.title} at ${job.company}!`,
      data: {
        application: newApplication,
        job: { id: job.id, title: job.title, company: job.company },
        applicant: { id: applicant.id, full_name: applicant.full_name, email: applicant.email }
      },
      storage: 'demo-memory'
    });

  } catch (err) {
    console.error('Error applying for job:', err);
    return res.status(500).json({ success: false, message: 'Failed to process application', error: err.message });
  }
};

// GET /api/applications/track - Track applications by email or applicationId
export const trackApplications = async (req, res) => {
  try {
    const { email, applicationId } = req.query;

    if (!email && !applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either an email or an applicationId to track applications.'
      });
    }

    if (isConfigured && supabase) {
      let query = supabase
        .from('applications')
        .select(`
          id,
          status,
          cover_letter,
          notes,
          created_at,
          updated_at,
          jobs:job_id (
            id,
            title,
            company,
            location,
            type,
            salary_range
          ),
          applicants:applicant_id (
            id,
            full_name,
            email,
            phone,
            resume_url
          )
        `);

      if (applicationId) {
        query = query.eq('id', applicationId);
      } else if (email) {
        // Find applicant first or filter through joined table
        const { data: applicant } = await supabase.from('applicants').select('id').eq('email', email.trim().toLowerCase()).maybeSingle();
        if (!applicant) {
          return res.json({ success: true, count: 0, data: [], message: 'No applications found for this email address.' });
        }
        query = query.eq('applicant_id', applicant.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      return res.json({
        success: true,
        count: data.length,
        data: data.map(item => ({
          id: item.id,
          status: item.status,
          coverLetter: item.cover_letter,
          notes: item.notes,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          job: item.jobs,
          applicant: item.applicants
        })),
        storage: 'supabase'
      });
    }

    // In-memory fallback
    let matches = [];
    if (applicationId) {
      matches = memoryStore.applications.filter(a => a.id.toLowerCase() === applicationId.trim().toLowerCase());
    } else if (email) {
      const applicant = memoryStore.applicants.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
      if (applicant) {
        matches = memoryStore.applications.filter(a => a.applicant_id === applicant.id);
      }
    }

    const formatted = matches.map(app => {
      const job = memoryStore.jobs.find(j => j.id === app.job_id) || {};
      const applicant = memoryStore.applicants.find(a => a.id === app.applicant_id) || {};
      return {
        id: app.id,
        status: app.status,
        coverLetter: app.cover_letter,
        notes: app.notes,
        createdAt: app.created_at,
        updatedAt: app.updated_at,
        job: {
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          salary_range: job.salary_range
        },
        applicant: {
          id: applicant.id,
          full_name: applicant.full_name,
          email: applicant.email,
          phone: applicant.phone,
          resume_url: applicant.resume_url
        }
      };
    });

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted,
      storage: 'demo-memory'
    });
  } catch (err) {
    console.error('Error tracking applications:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve application tracking data', error: err.message });
  }
};

// GET /api/applications - List all applications (for Recruiter / Dashboard)
export const getAllApplications = async (req, res) => {
  try {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          cover_letter,
          notes,
          created_at,
          updated_at,
          jobs:job_id (
            id,
            title,
            company,
            location,
            type,
            category
          ),
          applicants:applicant_id (
            id,
            full_name,
            email,
            phone,
            resume_url,
            skills
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({
        success: true,
        count: data.length,
        data: data.map(item => ({
          id: item.id,
          status: item.status,
          coverLetter: item.cover_letter,
          notes: item.notes,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          job: item.jobs,
          applicant: item.applicants
        })),
        storage: 'supabase'
      });
    }

    // In-memory fallback
    const list = memoryStore.applications.map(app => {
      const job = memoryStore.jobs.find(j => j.id === app.job_id) || {};
      const applicant = memoryStore.applicants.find(a => a.id === app.applicant_id) || {};
      return {
        id: app.id,
        status: app.status,
        coverLetter: app.cover_letter,
        notes: app.notes,
        createdAt: app.created_at,
        updatedAt: app.updated_at,
        job: {
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          category: job.category
        },
        applicant: {
          id: applicant.id,
          full_name: applicant.full_name,
          email: applicant.email,
          phone: applicant.phone,
          resume_url: applicant.resume_url,
          skills: applicant.skills
        }
      };
    });

    return res.json({
      success: true,
      count: list.length,
      data: list,
      storage: 'demo-memory'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve applications', error: err.message });
  }
};

// PATCH /api/applications/:id/status - Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'reviewing', 'interview', 'accepted', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Choose from: ${validStatuses.join(', ')}`
      });
    }

    if (isConfigured && supabase) {
      const updateData = { status, updated_at: new Date().toISOString() };
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, message: `Application status updated to ${status}`, data, storage: 'supabase' });
    }

    // In-memory fallback
    const app = memoryStore.applications.find(a => a.id === id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    app.status = status;
    if (notes !== undefined) app.notes = notes;
    app.updated_at = new Date().toISOString();

    return res.json({
      success: true,
      message: `Application status updated to ${status}`,
      data: app,
      storage: 'demo-memory'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update application status', error: err.message });
  }
};
