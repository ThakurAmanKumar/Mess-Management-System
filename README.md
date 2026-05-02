# Mess Management System

## Summary
A full-stack Mess Management System for student meal management, attendance, complaints, ratings and admin controls. This repository includes a Node.js/Express backend and a React frontend (Vite) — designed for deployment or local development.

## Key Features
- User authentication (students & admin)
- Menu management (today/weekly menus)
- Meal rating system
- Attendance, complaints, and notifications
- Admin scripts for creating/updating admin accounts

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React (Vite) with JSX components and CSS modules
- Dev tooling: npm, vite, (optional: nodemon)

## Repository Structure
- `backend/` — legacy and current server files, scripts, controllers, models, routes, and configuration
  - `backend/src/` — main server and modular code (`controllers`, `models`, `routes`, `scripts`)
  - `backend/scripts/` — admin utility scripts (`createAdmin.js`, `resetAdminPassword.js`, etc.)
  - `backend/server.js` & `backend/src/server.js` — entrypoints
- `frontend/` — React app (Vite) with components, pages, services, and styles
- `frontend_root.html`, `landing_module.js` — misc frontend assets

## Prerequisites
- Node.js >= 16
- npm (or yarn)
- MongoDB instance (local or cloud)

## Environment Variables (typical)
- `MONGO_URI` — MongoDB connection string
- `PORT` — backend port (e.g., 5000)
- `JWT_SECRET` — JSON Web Token secret
- Any other keys referenced in `backend/config` or `backend/src/config`

## Setup & Run (local)
1. Backend
```bash
cd backend
npm install
# development (with nodemon if configured)
npm run dev
# or
npm start
```

2. Frontend
```bash
cd frontend
npm install
npm run dev
# build for production
npm run build
```

3. Combined (Windows example)
```powershell
cd c:\Users\LENOVO\Downloads\Mess-Management-System_Project\backend
npm install
start cmd /k "npm run dev"
cd ..\frontend
npm install
npm run dev
```

## Admin Utilities
See `backend/scripts/` for utilities to create or reset admin accounts:
- `createAdmin.js` — create initial admin
- `resetAdminPassword.js` — reset password
- `recreateAdmin.js`, `updateAdmin.js`, `checkAdmin.js`

Run them via `node` (ensure `MONGO_URI` and other env vars are set):
```bash
node backend/src/scripts/createAdmin.js
```

## API Overview
Routes are organized under `backend/src/routes/` (examples):
- `authRoutes` — login/register
- `menuRoutes` — menu CRUD and fetching
- `ratingRoutes` — meal ratings
- `adminRoutes`, `studentRoutes` — role-specific endpoints

For full API details, inspect the route files in `backend/src/routes/`.

## Contributing
- Open issues for bugs or feature requests
- Follow existing code style (JSX + CSS modules in frontend, modular controllers/models in backend)

## Notes & Next Steps
- Verify environment variables used in `backend/config` and `backend/src/config` before running
- Add `README.md` (this file is `redmi.md` per request) into source control and optionally add a detailed API document

## License & Contact
Specify a license in the repo (e.g., MIT) and add a `CONTRIBUTING.md` for collaboration guidelines.

---
If you'd like, I can:
- rename this to `README.md` and update repo links
- expand any section (detailed API list, example env file, or run scripts)
