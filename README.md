# 🚚 Logistics Management App — Detention Tracker

A full-stack logistics management system with a **Detention Time Tracker** — solving a billion-dollar problem in the trucking industry. Built with **FastAPI** and **React**, deployed live on Railway and Vercel.

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🖥️ Frontend | [logistics-management-app.vercel.app](https://logistics-management-app.vercel.app) |
| 🔌 API | [web-production-bd20b.up.railway.app](https://web-production-bd20b.up.railway.app) |
| 📄 API Docs | [web-production-bd20b.up.railway.app/docs](https://web-production-bd20b.up.railway.app/docs) |
| 💻 GitHub | [github.com/berkaniaymen/logistics-management-app](https://github.com/berkaniaymen/logistics-management-app) |

---

## 🚛 The Problem We Solve

Truck drivers lose **$11,000–$19,000 per year** in unpaid detention fees. When a driver arrives at a shipper or receiver, they get 2 hours of free waiting time. After that, they are owed detention pay — but brokers dispute claims because there is no timestamped proof.

**Our solution:** A simple check-in/check-out system that automatically tracks detention time, calculates the amount owed, and generates a professional PDF report with server-side timestamps that drivers can send directly to brokers.

---

## ✨ Features

### 🔐 Authentication
- JWT-based login system
- Password hashing with Argon2
- Protected routes

### 📦 Core Logistics
- **Shipments** — Full CRUD with status tracking
- **Drivers** — Manage drivers and assign shipments
- **Warehouses** — Manage warehouse locations
- **Customers** — Manage customer records

### 🚛 Detention Tracker
- **Loads Manager** — Create and assign loads to drivers with shipper details
- **Driver View** — One-tap check-in/check-out with live countdown timer
- **Real-time Alerts** — Browser notification when 2-hour free time expires
- **Automatic Calculation** — Detention minutes and dollar amount calculated server-side
- **Dispatcher Dashboard** — Live view of all active detentions with elapsed time
- **PDF Report Generator** — Professional timestamped detention reports for broker disputes

### 📊 Dashboard
- Overview of all shipments, drivers, warehouses, and customers

---

## 🏗️ Architecture

```
logistics-management-app/
├── backend/
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── routers/
│       │   ├── shipments.py
│       │   ├── drivers.py
│       │   ├── warehouses.py
│       │   ├── customers.py
│       │   ├── auth.py
│       │   ├── loads.py
│       │   └── detention.py
│       └── core/
│           ├── config.py
│           ├── security.py
│           ├── dependencies.py
│           └── exceptions.py
├── frontend/
│   └── src/
│       ├── api/axios.js
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Shipments.jsx
│       │   ├── LoadsManager.jsx
│       │   ├── DriverView.jsx
│       │   └── DetentionDashboard.jsx
│       └── components/
│           └── Navbar.jsx
├── requirements.txt
├── Procfile
└── vercel.json
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| Auth | JWT + Argon2 |
| PDF Generation | ReportLab |
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Routing | React Router |
| Backend Hosting | Railway |
| Frontend Hosting | Vercel |

---

## 🚀 Getting Started

### Backend Setup

```bash
git clone https://github.com/berkaniaymen/logistics-management-app.git
cd logistics-management-app
pip install -r requirements.txt
```

Create `.env` file:
```
DATABASE_URL=postgresql://user:password@localhost:5432/yourdb
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

```bash
uvicorn backend.app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

### Detention Tracker
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/loads/` | Create a load |
| GET | `/loads/` | Get all loads |
| POST | `/detention/checkin` | Driver checks in — starts timer |
| POST | `/detention/checkout/{id}` | Driver checks out — calculates detention |
| GET | `/detention/active` | All active detentions with live timers |
| GET | `/detention/{id}/report` | Download detention PDF report |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register |
| POST | `/auth/login` | Login — returns JWT |

---

## 💰 Business Model

| Plan | Price | Target |
|------|-------|--------|
| Free | $0/month | Individual drivers |
| Pro | $9/month | Owner-operators |
| Fleet | $49/month | Small fleets (5-20 trucks) |
| Enterprise | Custom | Large carriers |

**Revenue potential:** 500 fleet customers x $49/month = **$294,000/year**

---

## 👨‍💻 Author

**Aymen Berkani**
- GitHub: [@berkaniaymen](https://github.com/berkaniaymen/logistics-management-app)

---

## 📄 License

MIT License