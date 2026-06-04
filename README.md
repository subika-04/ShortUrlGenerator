# ✂️ URL Shortener with Analytics

A full-stack URL Shortener application built with the MERN stack. Track clicks, devices, locations, and trends with a beautiful dark-themed dashboard.

---

## 🚀 Features

### Core Features
- URL Shortening — Shorten any long URL with unique codes  
- Custom Aliases — Create memorable short URLs (e.g., `/my-product`)  
- QR Code Generation — Download QR codes for every link  
- Link Expiry — Set expiration dates and times  
- Link Suspension — Suspend links for specific periods  
- Bulk URL Shortening — Shorten multiple URLs at once (CSV support)  
- Token Expiration — JWT tokens expire in 10 minutes for security  

---

### 📊 Analytics
- Click Tracking — Full visit history per URL  
- Device Analytics — Desktop / Mobile / Tablet breakdown  
- Browser Analytics — Chrome / Firefox / Safari / Edge  
- Geolocation — Country-level location tracking  
- Daily Trends — 30-day click area chart  
- Hourly Heatmap — 7-day hour/day heatmap  
- Referrer Tracking — Traffic source analysis  
- Unique vs Returning — Visitor fingerprinting  

---

### 👤 User Dashboard
- Search & Filter — Find URLs easily  
- Sort — By date, clicks, newest, oldest  
- Copy to Clipboard — One-click copy  
- Public Stats Page — Share analytics at `/stats/:code`  
- Dark Mode — Beautiful dark-themed UI  
- Responsive — Works on all devices  

---

## 🏗️ Tech Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React (Vite), TailwindCSS, Framer Motion, Recharts |
| Backend   | Node.js, Express.js |
| Database  | MongoDB (Mongoose) |
| Auth      | JWT (10 min expiry), bcryptjs |
| Charts    | Recharts |
| QR Codes  | qrcode.react |

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
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

---

### 1. Clone & Install
```bash
git clone <repo-url>
cd url-shortener-app
```

---

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/urlshortener
JWT_SECRET=your_super_secret_key_change_this
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

Run backend:
```bash
npm start
```

---

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env`:
```env
VITE_API_URL=http://localhost:5000
```

Run frontend:
```bash
npm run dev
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/urlshortener
JWT_SECRET=your_super_secret_key_change_this
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

---

## 🌐 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/signup | Register user | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/me | Get user | Yes |

---

### URLs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/url/shorten | Create short URL | Yes |
| POST | /api/url/bulk | Bulk shorten | Yes |
| GET | /api/url/user/all | Get user URLs | Yes |
| PUT | /api/url/:id | Update URL | Yes |
| DELETE | /api/url/:id | Delete URL | Yes |
| PATCH | /api/url/expiry/:id | Update expiry | Yes |
| GET | /api/url/analytics/:id | Analytics | Yes |
| GET | /api/url/public/:code | Public stats | No |
| GET | /:shortCode | Redirect | No |

---

## 📊 Analytics Tracked

- Click count per URL  
- Visit timestamps  
- Referrer source  
- Device type detection  
- Browser detection  
- Operating system detection  
- Country-level geolocation  
- Daily click trends (30 days)  
- Hourly heatmap (7 days)  
- Unique vs returning visitors  

---

## 🎨 UI Features

- Dark mode by default  
- Framer Motion animations  
- Responsive design  
- Toast notifications  
- Copy to clipboard  
- QR code download  
- Loading states  
- Error handling  

---

## 🏆 Hackathon Checklist

### Mandatory
- [x] Signup/Login
- [x] Protected routes
- [x] URL shortening
- [x] Unique short codes
- [x] Redirect working
- [x] Analytics tracking
- [x] Delete/Edit URLs
- [x] Copy short URL

### Bonus
- [x] QR code generation
- [x] Expiry system
- [x] Geolocation tracking
- [x] Device analytics
- [x] Charts dashboard
- [x] Public stats page
- [x] Bulk shortening
- [x] Deployment (Render + Vercel)

---

## 📸 Demo
[View Demo Video Here]

---

## 🌍 Deployment

### Backend (Render)
- Connect GitHub repo  
- Build: npm install  
- Start: npm start  

### Frontend (Vercel)
- Framework: Vite  
- Build: npm run build  
- Output: dist  

---

## 📝 License
MIT  

---

## 🙏 Acknowledgments
- MongoDB  
- React  
- Node.js  
- This project is part of a hackathon run by https://katomaran.com


Deployment Link:https://short-url-generator-alpha.vercel.app/
Video Link:https://www.loom.com/share/c43a642f815f4378b6f80a889bb73d8
