# ResuMatch - [ATS] 🚀

A recruiting platform where candidates upload resumes, and hiring managers use parsing filters to quickly match applicants to specific jobs based on keyword frequency. 
---

## 🛠️ Tech Stack

### Frontend
* **Core**: React - Vite 
* **Styling**: Tailwind CSS , CSS3
* **Routing**: React Router DOM v7


### Backend
* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB Atlas 
* **Authentication**: JSON Web Tokens (JWT) 
* **File Uploads**: Multer
* **Document Parsing**: 
  * `pdf-parse` (for PDF text extraction)
  * `mammoth` (for DOCX text extraction)


---

## 🌟 Core Features

* **Dual-Role Dashboards**: Dedicated workspaces for **Recruiters** (applicant tracking, ATS analysis, statistics, filtering) and **Candidates** (profile building, resume upload, job applications, tracking status).
* **Intelligent Resume Parsing Engine**: Extracts text from PDF and Word (.docx) resumes automatically upon upload.
* **ATS Matching & Scoring Engine**: Compares applicant resumes against job description requirements, highlighting key matching skills, missing keywords, and calculating a percentage score.
* **Email Notifications**: Integrated email sender to alert candidates of application status updates, interview schedules, or feedback.
* **Advanced Filters & Analytics**: Visual charts for applications, hired candidates, and dynamic search/filter panels for resume databases.

---

## 📂 Project Structure

```text
├── 📁 backend
│   ├── 📁 config
│   │   └── 📄 db.js                 # MongoDB connection config
│   ├── 📁 controllers
│   │   ├── 📄 applicationController.js
│   │   ├── 📄 authController.js
│   │   ├── 📄 candidateController.js
│   │   ├── 📄 jobController.js
│   │   └── 📄 resumeController.js   # Resume upload and parse orchestration
│   ├── 📁 data                      # Local fallback storage (db.json)
│   ├── 📁 middleware
│   │   ├── 📄 authMiddleware.js     # JWT validation
│   │   └── 📄 uploadMiddleware.js   # Multer file handler
│   ├── 📁 models                    # Mongoose Schemas (User, Job, Candidate, Application)
│   ├── 📁 routes                    # Express API endpoints
│   ├── 📁 utils
│   │   ├── 📄 matchEngine.js        # ATS scoring and keyword overlap logic
│   │   ├── 📄 mockDb.js             # Fallback JSON database helper
│   │   ├── 📄 resumeParser.js       # PDF and DOCX parsing handler
│   │   ├── 📄 sendEmail.js          # Nodemailer config & template sender
│   │   └── 📄 testSendEmail.js
│   ├── ⚙️ package.json
│   └── 📄 server.js                 # Entry point
├── 📁 frontend
│   ├── 📁 public
│   ├── 📁 src
│   │   ├── 📁 assets
│   │   ├── 📁 components            # Reusable UI widgets (Cards, Tables, Panels)
│   │   ├── 📁 context               # AuthContext state manager
│   │   ├── 📁 pages                 # Views (Dashboards, Auth, Landing page, Upload page)
│   │   ├── 📁 services              # Axios API instance configuration
│   │   ├── 📄 App.jsx
│   │   └── 📄 main.jsx
│   ├── ⚙️ .gitignore
│   ├── 🌐 index.html
│   ├── ⚙️ package.json
│   ├── 📄 tailwind.config.js
│   └── 📄 vite.config.js
├── ⚙️ .gitignore                     # Root gitignore protecting secrets
└── 📝 README.md
```

---

## ⚙️ Installation & Local Setup

### Prerequisites
* [Node.js](https://nodejs.org/) installed (v18+ recommended)
* A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database cluster

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder and add the following keys:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
  
   ```
4. Start the backend server:
   * **Development mode**: `npm run dev`
   * **Production mode**: `npm start`

---

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Build the application for production:
   ```bash
   npm run build
   ```

---

## 🚀 Deployment Guide

### Backend (Render)
1. Set the **Root Directory** to `backend`.
2. The **Build Command** will automatically run `npm run build` (or set to `npm install`).
3. Set the **Start Command** to `node server.js`.
4. Configure all environment variables (`MONGODB_URI`, `JWT_SECRET`, `PORT=5000`) in Render's dashboard.

### Frontend (Vercel)
1. Set the **Root Directory** to `frontend`.
2. Framework Preset will be automatically detected as `Vite`.
3. Set the **Environment Variable**: `VITE_API_URL` to your live Render backend URL (e.g. `https://resumatch-1-vyj3.onrender.com`).
