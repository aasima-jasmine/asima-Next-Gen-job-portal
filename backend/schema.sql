-- =======================================================================
-- ANTIGRAVITY JOB PORTAL - SUPABASE DATABASE SCHEMA
-- Tables: 1. jobs, 2. applicants, 3. applications
-- =======================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if needed (cascade to clean dependencies)
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS applicants CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;

-- =======================================================================
-- TABLE 1: JOBS
-- =======================================================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'Full-time', -- 'Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'
    category VARCHAR(100) NOT NULL DEFAULT 'Engineering', -- 'Engineering', 'Design', 'Product', 'Marketing', etc.
    salary_range VARCHAR(100),
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'closed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================================
-- TABLE 2: APPLICANTS
-- =======================================================================
CREATE TABLE applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    resume_url TEXT,
    skills TEXT[] DEFAULT '{}',
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================================
-- TABLE 3: APPLICATIONS
-- =======================================================================
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    cover_letter TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'reviewing', 'interview', 'accepted', 'rejected'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_job_applicant UNIQUE (job_id, applicant_id)
);

-- =======================================================================
-- INDEXES FOR FAST QUERYING
-- =======================================================================
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_applicants_email ON applicants(email);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);

-- =======================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enabling public read and insert for the job portal demo
-- =======================================================================
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Allow public read & write to jobs
CREATE POLICY "Allow public read jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Allow public insert jobs" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update jobs" ON jobs FOR UPDATE USING (true);

-- Allow public read & write to applicants
CREATE POLICY "Allow public read applicants" ON applicants FOR SELECT USING (true);
CREATE POLICY "Allow public insert applicants" ON applicants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update applicants" ON applicants FOR UPDATE USING (true);

-- Allow public read & write to applications
CREATE POLICY "Allow public read applications" ON applications FOR SELECT USING (true);
CREATE POLICY "Allow public insert applications" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update applications" ON applications FOR UPDATE USING (true);

-- =======================================================================
-- SEED SAMPLE DATA
-- =======================================================================
INSERT INTO jobs (title, company, location, type, category, salary_range, description, requirements) VALUES
(
    'Senior Full-Stack Engineer',
    'Antigravity Labs',
    'Remote, US / Global',
    'Full-time',
    'Engineering',
    '$140,000 - $180,000',
    'Lead the development of next-generation distributed applications and high-throughput AI interfaces. You will architect scalable Node.js microservices and React dashboards.',
    ARRAY['5+ years experience in React & Node.js', 'Strong experience with PostgreSQL / Supabase', 'RESTful & GraphQL API design', 'Docker & Cloud Deployment']
),
(
    'AI Product Designer (UI/UX)',
    'Nexus Systems',
    'San Francisco, CA / Hybrid',
    'Full-time',
    'Design',
    '$120,000 - $155,000',
    'Shape intuitive user experiences for our multimodal AI agents. Collaborate with engineers and product leads to turn complex algorithmic flows into delightful interfaces.',
    ARRAY['Portfolio displaying modern web apps', 'Figma mastery with interactive prototypes', 'Deep understanding of design systems', 'Passion for human-computer interaction']
),
(
    'Cloud DevOps & Security Architect',
    'HyperScale Cloud',
    'New York, NY / Remote',
    'Full-time',
    'DevOps',
    '$150,000 - $195,000',
    'Design secure, scalable infrastructure across multi-cloud environments. Automate CI/CD pipelines, monitor observability, and ensure 99.99% system availability.',
    ARRAY['Kubernetes, Docker & Terraform', 'AWS / GCP production management', 'SOC2 compliance experience', 'Zero-trust network architecture']
),
(
    'Frontend React Specialist',
    'Quantum Interactive',
    'Austin, TX / Remote',
    'Contract',
    'Engineering',
    '$75 - $95 / hr',
    'Build high-performance web components with dynamic animations, state management, and real-time WebSocket interactions.',
    ARRAY['Expertise in React 18+, TypeScript, Vite', 'CSS Animations, Canvas or Three.js is a plus', 'Accessibility (a11y) compliance']
),
(
    'Growth Marketing Manager',
    'VenturePulse',
    'Remote',
    'Full-time',
    'Marketing',
    '$90,000 - $125,000',
    'Drive user acquisition, developer community engagement, and product-led growth experiments across digital channels.',
    ARRAY['3+ years in B2B SaaS growth marketing', 'Data-driven mindset with Google Analytics & Mixpanel', 'Content and developer marketing experience']
);

-- Sample Applicant
INSERT INTO applicants (id, full_name, email, phone, resume_url, skills, bio) VALUES
(
    'd8b2e35f-1490-4a87-b5b4-d53381a6e9a1',
    'Alex Morgan',
    'alex.morgan@example.com',
    '+1 (555) 234-5678',
    'https://linkedin.com/in/alexmorgan-dev',
    ARRAY['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    'Full-stack engineer passionate about building responsive web apps with real-time architectures.'
);

-- Sample Application linked to the first job
INSERT INTO applications (job_id, applicant_id, cover_letter, status, notes) VALUES
(
    (SELECT id FROM jobs WHERE title = 'Senior Full-Stack Engineer' LIMIT 1),
    'd8b2e35f-1490-4a87-b5b4-d53381a6e9a1',
    'I have 6 years of experience building modern React and Node.js products. I love the mission of Antigravity and would love to contribute!',
    'reviewing',
    'Great portfolio; scheduled for code review'
);
