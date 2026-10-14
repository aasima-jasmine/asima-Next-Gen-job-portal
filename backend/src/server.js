import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import { applyForJob } from './controllers/applicationController.js';
import { isConfigured } from './supabaseClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for easy debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
// Direct alias for POST /api/apply as specifically stated in requirements
app.post('/api/apply', applyForJob);

// System & Health Status Endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    system: 'Antigravity Job Portal API',
    database: isConfigured ? 'Supabase (Live Connected)' : 'Demo In-Memory Mode (Set .env for Supabase)',
    supabaseConfigured: isConfigured,
    timestamp: new Date().toISOString()
  });
});

// Default Root
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Antigravity Job Portal API is running!',
    endpoints: {
      jobs: 'GET /api/jobs',
      jobDetails: 'GET /api/jobs/:id',
      postJob: 'POST /api/jobs',
      apply: 'POST /api/apply',
      track: 'GET /api/applications/track?email=your@email.com',
      allApplications: 'GET /api/applications',
      updateStatus: 'PATCH /api/applications/:id/status',
      status: 'GET /api/status'
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Antigravity Job Portal Backend listening on:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   Database Mode: ${isConfigured ? 'Connected to Supabase' : 'Zero-config Demo Store'}`);
  console.log(`===============================================`);
});

export default app;
