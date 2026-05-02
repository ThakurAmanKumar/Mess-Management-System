

The API base URL in development is `http://localhost:5000/api`.

Key endpoints:

- `POST /api/auth/login` — Student login
- `POST /api/auth/register` — Student registration
- `POST /api/auth/admin/login` — Admin login
- `GET /api/menu/today` — Today's menu
- `GET /api/menu` — All menus
- `POST /api/admin/menu` — (Admin) Create menu
- `POST /api/ratings` — Submit a rating
- `GET /api/ratings/analytics/average` — Average ratings

Refer to the route files under `backend/src/routes/` for full details and any additional parameters.

---

## ⚠️ Security & Environment Notes

- Do NOT commit real secrets to the repository. Use `backend/.env.local` for local-only secrets. The repository `.gitignore` already ignores `*.env` and `*.env.*.local`.
- If any secrets were pushed to a remote, rotate them immediately (Mongo URI, JWT secret, database passwords).
- Admin credentials for local testing should be created via the provided scripts: `node src/scripts/createAdmin.js` or `node src/scripts/updateAdmin.js "email" "password"`.

---

## 🧪 Testing

- Use Postman or curl to exercise API endpoints. Example (PowerShell):

```powershell
Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/admin/login' -Method Post -ContentType 'application/json' -Body (ConvertTo-Json @{ email='admin@example.com'; password='your_password' })
```

---

## 🚢 Deployment

- Frontend: Build with `npm run build` in `frontend/` and deploy to Vercel or serve from backend static files in production.
- Backend: Configure environment variables in your hosting provider (Render, Heroku, etc.) and set `NODE_ENV=production`.

Render example environment variables (do NOT store secrets in repo):

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — Strong random secret
- `FRONTEND_URL` — Production frontend URL (used for CORS)

---

## 📂 Useful Scripts

- `npm run dev` (frontend) — Start Vite dev server
- `npm run dev` (backend if configured with nodemon) — Start backend in development
- `npm run create-admin` — Create admin with values from backend `.env` (local)
- `node src/scripts/updateAdmin.js <email> <password>` — Update/create an admin programmatically (local use)

---

## 🤝 Contributing

Contributions welcome. Please open issues for bugs or feature requests, and create PRs against the `main` branch. Follow the conventional commit style for clarity.

---

## 📝 License

This project is released under the MIT License.

---

If you'd like, I can also add a shorter `README.md` in `frontend/` and `backend/` with quick start commands specific to each package.

- **Development**: `http://localhost:5000/api`
- **Production**: `https://smartmess-backend.onrender.com/api`

### Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Student registration | No |
| POST | `/auth/login` | Student login | No |
| POST | `/auth/logout` | Student logout | Yes |
| POST | `/admin/login` | Admin login | No |
| GET | `/auth/me` | Get current user | Yes |

#### Menu Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/menus/today` | Get today's menu | Yes |
| GET | `/menus/weekly` | Get weekly menu | Yes |
| GET | `/menus/date/:date` | Get menu by date | Yes |
| POST | `/admin/menus` | Create/update menu | Admin |
| DELETE | `/admin/menus/:id` | Delete menu | Admin |

#### Rating Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/ratings/my-ratings` | Get user's ratings | Yes |
| POST | `/ratings` | Create rating | Yes |
| PUT | `/ratings/:id` | Update rating | Yes |
| DELETE | `/ratings/:id` | Delete rating | Yes |
| GET | `/admin/ratings` | Get all ratings | Admin |

#### Student Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/students` | Get all students | Admin |
| PUT | `/admin/students/:id/verify` | Verify student | Admin |
| DELETE | `/admin/students/:id` | Delete student | Admin |

#### Attendance Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/attendance/today` | Get today's attendance | Yes |
| POST | `/attendance` | Mark attendance | Yes |
| GET | `/admin/attendance` | Get all attendance | Admin |

#### Complaint Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/complaints` | Get user complaints | Yes |
| POST | `/complaints` | Create complaint | Yes |
| PUT | `/complaints/:id` | Update complaint | Yes |
| GET | `/admin/complaints` | Get all complaints | Admin |
| PUT | `/admin/complaints/:id` | Update complaint status | Admin |

### Sample API Requests

#### Register Student

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "rollNumber": "21CS001",
  "hostelName": "Hostel A",
  "roomNumber": "A-101",
  "phoneNumber": "9876543210"
}
```

#### Get Today's Menu

```bash
GET /api/menus/today
Authorization: Bearer <token>
```

#### Rate a Meal

```bash
POST /api/ratings
Authorization: Bearer <token>
Content-Type: application/json

{
  "menuId": "menu-uuid",
  "mealType": "lunch",
  "rating": 4,
  "comment": "Good taste, nice quantity"
}
```

---

## 📸 Screenshots

### Landing Page
Beautiful, modern landing page with features, testimonials, and FAQ

### Student Dashboard
Clean dashboard showing today's menu, quick stats, and quick actions

### Today's Menu
View all 4 meals with ratings and ability to rate each meal

### Admin Dashboard
Comprehensive overview of students, ratings, complaints, and analytics

### Menu Management
Easy-to-use interface for creating and managing daily menus

### Rating Management
View all ratings with filters, search, and sorting options

---

## 🌐 Deployment

The application is deployed and live at:

- **Frontend**: [https://smartmesslms.vercel.app](https://smartmesslms.vercel.app)
- **Backend**: [https://smartmess-backend.onrender.com](https://smartmess-backend.onrender.com)

### Deployment Configuration

#### Frontend (Vercel)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "https://smartmess-backend.onrender.com/api"
  }
}
```

#### Backend (Render)

```yaml
services:
  - type: web
    name: smartmess-backend
    runtime: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/SmartMess.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open Pull Request**

### Coding Standards

- Use ES6+ features
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Gaurav Kumar**

- GitHub: [@ggauravky](https://github.com/ggauravky)
- Email: gkumaryadav526@gmail.com
- LinkedIn: [Gaurav Kumar](https://linkedin.com/in/ggauravky)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend library
- [Express](https://expressjs.com/) - Backend framework
- [Supabase](https://supabase.com/) - Database and authentication
- [Vercel](https://vercel.com/) - Frontend hosting
- [Render](https://render.com/) - Backend hosting
- [React Icons](https://react-icons.github.io/react-icons/) - Icon library

---

## 📞 Support

For support, email gkumaryadav526@gmail.com or create an issue in the repository.

---

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] WhatsApp notifications
- [ ] Email notifications
- [ ] Payment integration for mess bills
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Export reports to PDF/Excel
- [ ] Push notifications
- [ ] Menu suggestions based on ratings
- [ ] Nutritional information
- [ ] Allergen warnings
- [ ] QR code for attendance

---

<div align="center">

**Made with ❤️ for better campus dining**

⭐ Star this repo if you find it helpful!

</div>
