# 🚀 Antigravity Job Portal

A full-stack job portal web application featuring a modern **React.js** frontend, a scalable **Node.js Express** backend, and **Supabase (PostgreSQL)** database with 3 interconnected tables: `jobs`, `applicants`, and `applications`.

---

## 🏗️ Project Architecture

```
practice2/
├── backend/
│   ├── .env                    # PORT=3000, SUPABASE_URL, SUPABASE_KEY
│   ├── .env.example
│   ├── package.json
│   ├── schema.sql              # Supabase DDL for 3 tables, RLS & seed data
│   └── src/
│       ├── server.js           # Express API server entry
│       ├── supabaseClient.js   # Supabase client + zero-config fallback
│       ├── controllers/
│       │   ├── jobController.js
│       │   └── applicationController.js
│       └── routes/
│           ├── jobRoutes.js
│           └── applicationRoutes.js
├── frontend/
│   ├── .env                    # Frontend environment configuration
│   ├── index.html              # Outfit & Plus Jakarta Sans typography
│   ├── package.json            # Vite + React 18
│   ├── vite.config.js          # Dev server with proxy to :3000
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             # Main interactive application
│       ├── index.css           # Glassmorphic dark design system
│       ├── services/
│       │   └── api.js          # REST client
│       └── components/
│           ├── Navbar.jsx
│           ├── JobList.jsx
│           ├── JobCard.jsx
│           ├── JobDetailsModal.jsx
│           ├── ApplyModal.jsx
│           ├── ApplicationTracker.jsx
│           ├── RecruiterDashboard.jsx
│           ├── PostJobModal.jsx
│           └── StatusBadge.jsx
└── README.md
```

---

## 🗄️ Database Architecture (Supabase 3 Tables)

The Supabase database consists of 3 relational tables located in `backend/schema.sql`:

1. **`jobs`**:
   - `id` (UUID, Primary Key)
   - `title` (VARCHAR)
   - `company` (VARCHAR)
   - `location` (VARCHAR)
   - `type` (VARCHAR - Full-time, Remote, Contract, etc.)
   - `category` (VARCHAR - Engineering, Design, DevOps, Marketing, Product)
   - `salary_range` (VARCHAR)
   - `description` (TEXT)
   - `requirements` (TEXT[])
   - `status` (VARCHAR - active / closed)
   - `created_at` (TIMESTAMPTZ)

2. **`applicants`**:
   - `id` (UUID, Primary Key)
   - `full_name` (VARCHAR)
   - `email` (VARCHAR, Unique)
   - `phone` (VARCHAR)
   - `resume_url` (TEXT)
   - `skills` (TEXT[])
   - `bio` (TEXT)
   - `created_at` (TIMESTAMPTZ)

3. **`applications`**:
   - `id` (UUID, Primary Key)
   - `job_id` (UUID, Foreign Key -> `jobs.id`)
   - `applicant_id` (UUID, Foreign Key -> `applicants.id`)
   - `cover_letter` (TEXT)
   - `status` (VARCHAR - `pending`, `reviewing`, `interview`, `accepted`, `rejected`)
   - `notes` (TEXT)
   - `created_at` & `updated_at` (TIMESTAMPTZ)

---

## ⚡ Setup & Run Instructions

### 1. Backend Setup
```bash
cd backend
npm install
```

Configure your `.env` file in `backend/.env`:
```env
PORT=3000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-role-key
```

> **Note:** If you run before setting Supabase keys, the backend automatically activates an **in-memory demo database** so you can immediately explore and test all functionality without blockers!

Start the backend:
```bash
npm start
# or for live reloading:
npm run dev
```

### 2. Setting Up Supabase
1. Go to [https://supabase.com](https://supabase.com) and create a project.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `backend/schema.sql`, copy all contents, paste into the SQL editor, and click **Run**.
4. Copy your **Project URL** and **anon public key** from `Project Settings > API` into `backend/.env`.

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/jobs` | Get all jobs (supports `?search=`, `?category=`, `?type=`) |
| `GET` | `/api/jobs/:id` | Get single job details |
| `POST` | `/api/jobs` | Post a new job |
| `DELETE` | `/api/jobs/:id` | Delete a job |
| `POST` | `/api/apply` | Apply for a job (creates/updates applicant & inserts application) |
| `GET` | `/api/applications/track` | Track applications by `?email=` or `?applicationId=` |
| `GET` | `/api/applications` | List all applications (Employer portal) |
| `PATCH` | `/api/applications/:id/status` | Update candidate status (`pending`, `reviewing`, `interview`, `accepted`, `rejected`) |
| `GET` | `/api/status` | Health check & Supabase connection info |

---

## ✨ Key Features
- **Job Listings**: Real-time keyword search, category filter pills, work type dropdown, and salary badges.
- **Job Details**: In-depth modal with job specifications and qualifications.
- **Job Application Form**: Clean form with validation, resume/link input, skill tags, and cover letter.
- **Application Status Tracker**: Visual 4-step progress stepper (Application Submitted -> Profile Review -> Interview Stage -> Decision).
- **Employer Portal**: View received applications and update candidate hiring stages in real time with 1 click.
