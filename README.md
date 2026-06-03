# ✂️ Snip — URL Shortener with Analytics

A full-stack URL shortener with real-time analytics, built as a production-ready MERN application for hackathons and portfolio projects.

---

## 🚀 Features

- **URL Shortening** — Instantly shorten long URLs with unique short codes
- **Custom Aliases** — Set memorable custom short codes (e.g. `/my-product`)
- **Analytics Dashboard** — Track clicks, devices, browsers, referrers
- **Daily Trend Chart** — Area chart of clicks over the last 30 days
- **QR Code Generation** — One-click downloadable QR codes for every link
- **Public Stats Page** — Share analytics at `/stats/:shortCode`
- **JWT Auth** — Secure signup/login with token-based authentication
- **Edit & Delete URLs** — Full CRUD for your links
- **Responsive UI** — Dark-themed, modern SaaS-style interface

---

## 🏗️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), TailwindCSS, Recharts, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcryptjs |
| Charts | Recharts |
| QR Codes | qrcode.react |

---

## 📁 Project Structure

```
url-shortener-app/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── urlController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Url.js
│   │   └── Visit.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── url.js
│   │   └── redirect.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   └── urlApi.js
│   │   ├── components/
│   │   │   ├── EditModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── QRModal.jsx
│   │   │   ├── ShortenForm.jsx
│   │   │   └── UrlCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Analytics.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── PublicStats.jsx
│   │   │   └── Signup.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

---

### 1. Clone & Setup

```bash
git clone <repo-url>
cd url-shortener-app
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm start        # or: npm run dev (with nodemon)
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/urlshortener
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

### Frontend (optional `frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
```

---

## 🌐 API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (🔒) |

### URLs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/url/shorten` | Create short URL (🔒) |
| GET | `/api/url/user/all` | Get all user URLs (🔒) |
| DELETE | `/api/url/:id` | Delete URL (🔒) |
| PUT | `/api/url/:id` | Update destination URL (🔒) |
| GET | `/api/url/analytics/:id` | Get full analytics (🔒) |
| GET | `/api/url/public/:shortCode` | Public stats (open) |
| GET | `/:shortCode` | Redirect to original URL |

🔒 = Requires `Authorization: Bearer <token>` header

---

## 📊 Analytics Tracked

- **Click count** per URL
- **Timestamp** of every visit
- **Referrer** source
- **User Agent** string
- **Device type** (Desktop / Mobile / Tablet)
- **Browser** (Chrome / Firefox / Safari / etc.)
- **Daily click trends** (last 30 days via MongoDB aggregation)

---

## 🏆 Hackathon Notes

This project demonstrates:
- Clean MVC architecture
- JWT authentication flow
- MongoDB aggregation pipelines
- Real-time analytics tracking
- Production-ready error handling
- Responsive dark-theme UI
- Modular, scalable codebase

---

Made with ❤️ using the MERN stack.
