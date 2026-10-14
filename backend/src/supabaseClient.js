import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

export const isConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_KEY && 
  !SUPABASE_URL.includes('your-project-id') &&
  !SUPABASE_KEY.includes('your-supabase')
);

let supabase = null;

if (isConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase client initialized with URL:', SUPABASE_URL);
  } catch (err) {
    console.warn('⚠️ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not set or using placeholders. In-memory demo store is active for immediate zero-config testing.');
}

// In-Memory fallback store with initial seed data
export const memoryStore = {
  jobs: [
    {
      id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      title: 'Senior Full-Stack Engineer',
      company: 'Antigravity Labs',
      location: 'Remote, US / Global',
      type: 'Full-time',
      category: 'Engineering',
      salary_range: '$140,000 - $180,000',
      description: 'Lead the development of next-generation distributed applications and high-throughput AI interfaces. You will architect scalable Node.js microservices and React dashboards.',
      requirements: ['5+ years experience in React & Node.js', 'PostgreSQL / Supabase expertise', 'RESTful & GraphQL API design', 'Docker & Cloud Deployment'],
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
      title: 'AI Product Designer (UI/UX)',
      company: 'Nexus Systems',
      location: 'San Francisco, CA / Hybrid',
      type: 'Full-time',
      category: 'Design',
      salary_range: '$120,000 - $155,000',
      description: 'Shape intuitive user experiences for our multimodal AI agents. Collaborate with engineers and product leads to turn complex algorithmic flows into delightful interfaces.',
      requirements: ['Portfolio displaying modern web apps', 'Figma mastery with interactive prototypes', 'Deep understanding of design systems', 'Passion for human-computer interaction'],
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
      title: 'Cloud DevOps & Security Architect',
      company: 'HyperScale Cloud',
      location: 'New York, NY / Remote',
      type: 'Full-time',
      category: 'DevOps',
      salary_range: '$150,000 - $195,000',
      description: 'Design secure, scalable infrastructure across multi-cloud environments. Automate CI/CD pipelines, monitor observability, and ensure 99.99% system availability.',
      requirements: ['Kubernetes, Docker & Terraform', 'AWS / GCP production management', 'SOC2 compliance experience', 'Zero-trust network architecture'],
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
      title: 'Frontend React Specialist',
      company: 'Quantum Interactive',
      location: 'Austin, TX / Remote',
      type: 'Contract',
      category: 'Engineering',
      salary_range: '$75 - $95 / hr',
      description: 'Build high-performance web components with dynamic animations, state management, and real-time WebSocket interactions.',
      requirements: ['Expertise in React 18+, TypeScript, Vite', 'CSS Animations, Canvas or Three.js is a plus', 'Accessibility (a11y) compliance'],
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
      title: 'Growth Marketing Manager',
      company: 'VenturePulse',
      location: 'Remote',
      type: 'Full-time',
      category: 'Marketing',
      salary_range: '$90,000 - $125,000',
      description: 'Drive user acquisition, developer community engagement, and product-led growth experiments across digital channels.',
      requirements: ['3+ years in B2B SaaS growth marketing', 'Data-driven mindset with Google Analytics & Mixpanel', 'Content and developer marketing experience'],
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 6).toISOString()
    }
  ],
  applicants: [
    {
      id: 'd8b2e35f-1490-4a87-b5b4-d53381a6e9a1',
      full_name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      phone: '+1 (555) 234-5678',
      resume_url: 'https://linkedin.com/in/alexmorgan-dev',
      skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
      bio: 'Full-stack engineer passionate about building responsive web apps with real-time architectures.',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ],
  applications: [
    {
      id: 'app-999-sample',
      job_id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      applicant_id: 'd8b2e35f-1490-4a87-b5b4-d53381a6e9a1',
      cover_letter: 'I have 6 years of experience building modern React and Node.js products. I love the mission of Antigravity and would love to contribute!',
      status: 'reviewing',
      notes: 'Profile reviewed by hiring manager. Strong portfolio.',
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ]
};

export default supabase;
