# 💼 Smart Job Portal

> A full-stack MERN web application connecting job seekers with recruiters through a secure, scalable platform.

---

## 🚀 Features

### For Job Seekers
- Register and build a professional profile
- Upload resume (PDF) to Cloudinary cloud storage
- Search & filter jobs by keyword, location, skills, job type, experience
- Apply to jobs with cover letter
- Track application status in real-time (applied → review → shortlisted → interview → offered/rejected)
- View full application timeline with notes and interview scheduling
- Withdraw applications

### For Recruiters
- Register company profile
- Post, edit, and manage job listings
- Set job status (active / closed / draft) with deadlines
- View all applications per job with full candidate profiles
- Update candidate status with notes — triggers automatic email notifications
- Schedule interviews with date/time
- Dashboard with job stats (views, application count)

### For Admins
- Full platform overview dashboard with charts
- View all users, jobs, and applications
- Activate / deactivate user accounts
- Visual analytics: applications by status (pie chart), jobs by category (bar chart)

### Platform
- JWT-based role authentication (jobseeker / recruiter / admin)
- Automated email notifications via Nodemailer
- Cloud-based resume & photo storage via Cloudinary
- Forgot / Reset password flow
- Fully responsive design

---

## 🛠 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, React Router v6, Recharts |
| Backend     | Node.js, Express.js                 |
| Database    | MongoDB (Mongoose ODM)              |
| Auth        | JWT (jsonwebtoken + bcryptjs)       |
| File Upload | Multer + Cloudinary                 |
| Email       | Nodemailer (Gmail SMTP)             |
| Styling     | Custom CSS with CSS Variables       |

---

## 📁 Project Structure

```
smart-job-portal/
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── cloudinary.js       # Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── authController.js   # Register, login, forgot/reset password
│   │   ├── userController.js   # Profile, resume/photo upload
│   │   ├── jobController.js    # CRUD for jobs + search/filter
│   │   ├── applicationController.js  # Apply, status updates, withdraw
│   │   └── adminController.js  # Admin stats, user management
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT protect + role authorization
│   ├── models/
│   │   ├── User.js             # Job seeker + recruiter unified model
│   │   ├── Job.js              # Job posting with full-text search index
│   │   └── Application.js      # Application with status history
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── recruiterRoutes.js
│   │   ├── applicationRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── emailService.js     # Email templates + send utility
│   │   └── generateToken.js    # JWT token generator
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Express app entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   └── common/
│       │       ├── Navbar.js
│       │       └── Footer.js
│       ├── context/
│       │   └── AuthContext.js  # Global auth state + axios token injection
│       ├── pages/
│       │   ├── Home.js              # Landing page with hero + job search
│       │   ├── Jobs.js              # Job listings with filters
│       │   ├── JobDetail.js         # Single job view + apply modal
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Dashboard.js         # Role-based dashboard
│       │   ├── Profile.js           # Profile editor + resume upload
│       │   ├── Applications.js      # Job seeker: all applications + timeline
│       │   ├── PostJob.js           # Recruiter: create job posting
│       │   ├── EditJob.js           # Recruiter: edit job posting
│       │   ├── MyJobs.js            # Recruiter: manage all jobs
│       │   ├── JobApplications.js   # Recruiter: review applicants
│       │   ├── AdminDashboard.js    # Admin: charts, users, jobs, apps
│       │   ├── ForgotPassword.js
│       │   ├── ResetPassword.js
│       │   └── NotFound.js
│       ├── styles/
│       │   └── global.css
│       ├── App.js                   # Routes + protected route guards
│       └── index.js
│
├── package.json                # Root: concurrently dev script
├── .gitignore
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (free tier works)
- Gmail account with App Password enabled

### 1. Clone & Install

```bash
# Install all dependencies at once
npm run install-all
```

Or manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment Variables

Copy the example file and fill in your values:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/smartjobportal
JWT_SECRET=your_very_long_random_secret_key
JWT_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=Smart Job Portal <noreply@smartjobportal.com>

CLIENT_URL=http://localhost:3000
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail"

### 3. Run the Application

```bash
# Run both backend and frontend concurrently
npm run dev
```

- Backend API: http://localhost:5000
- Frontend App: http://localhost:3000

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| PUT | `/api/auth/reset-password/:token` | Reset password |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/upload-resume` | Upload resume to Cloudinary |
| POST | `/api/users/upload-photo` | Upload profile photo |
| PUT | `/api/users/change-password` | Change password |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs (with filters) |
| GET | `/api/jobs/:id` | Get job details |
| POST | `/api/jobs` | Create job (recruiter) |
| PUT | `/api/jobs/:id` | Update job (recruiter) |
| DELETE | `/api/jobs/:id` | Delete job (recruiter) |
| GET | `/api/jobs/myjobs` | Get recruiter's own jobs |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Apply for a job |
| GET | `/api/applications/my` | Get applicant's applications |
| GET | `/api/applications/job/:jobId` | Get job's applications (recruiter) |
| PUT | `/api/applications/:id/status` | Update status (recruiter) |
| PUT | `/api/applications/:id/withdraw` | Withdraw application |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/:id/toggle` | Activate/deactivate user |
| GET | `/api/admin/jobs` | All jobs |
| GET | `/api/admin/applications` | All applications |

---

## 🌐 Deployment

### Backend (Railway / Render / Heroku)
1. Set all environment variables in the dashboard
2. Set `NODE_ENV=production`
3. Deploy the `/backend` folder

### Frontend (Vercel / Netlify)
1. Build: `cd frontend && npm run build`
2. Set environment variable: `REACT_APP_API_URL=https://your-backend.railway.app`
3. Update `proxy` in `frontend/package.json` or use the env variable for API calls

---

## 📧 Email Notifications

Automated emails are sent for:
- ✅ Welcome email on registration
- 📋 Application received confirmation (to applicant)
- 🔔 New application alert (to recruiter)
- 📬 Status update notifications (to applicant on every status change)
- 🔑 Password reset links

---

## 🔒 Security Features

- Passwords hashed with bcryptjs (salt rounds: 10)
- JWT tokens with configurable expiry
- Role-based route protection (jobseeker / recruiter / admin)
- Account activation/deactivation by admin
- Duplicate application prevention (MongoDB unique index)
- Input validation on all API endpoints
- CORS configured for specific origins

---

## 🧪 Test Accounts (after seeding)

You can manually create test accounts via the Register page with roles:
- **jobseeker** — default role
- **recruiter** — select during registration
- **admin** — manually set `role: "admin"` in MongoDB

---

## 📝 License

MIT License — free to use for educational and commercial purposes.
