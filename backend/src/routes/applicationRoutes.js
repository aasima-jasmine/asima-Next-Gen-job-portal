import express from 'express';
import { 
  applyForJob, 
  trackApplications, 
  getAllApplications, 
  updateApplicationStatus 
} from '../controllers/applicationController.js';

const router = express.Router();

// Apply for a job
router.post('/apply', applyForJob);

// Track status by email or applicationId
router.get('/track', trackApplications);

// Get all applications (Recruiter dashboard)
router.get('/', getAllApplications);

// Update application status (pending, reviewing, interview, accepted, rejected)
router.patch('/:id/status', updateApplicationStatus);

export default router;
