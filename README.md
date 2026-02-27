# 🚚 Logistics Management App

A full-stack logistics management system built with **FastAPI** and **React**. This project demonstrates production-style backend architecture, JWT authentication, and a modern React dashboard — deployed live with Railway and Vercel.

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🖥️ Frontend | [logistics-management-app.vercel.app](https://logistics-management-app.vercel.app) |
| 🔌 API | [web-production-bd20b.up.railway.app](https://web-production-bd20b.up.railway.app) |
| 📄 API Docs | [web-production-bd20b.up.railway.app/docs](https://web-production-bd20b.up.railway.app/docs) |

---

## ✨ Features

- 📦 **Shipments** — Full CRUD with status tracking (Pending, In Transit, Delivered)
- 🚗 **Drivers** — Manage drivers and assign them to shipments
- 🏢 **Warehouses** — Manage warehouse locations and capacity
- 👥 **Customers** — Manage customer records
- 🔐 **Authentication** — JWT-based login system with password hashing
- 🛡️ **Protected Routes** — Secure endpoints requiring valid tokens
- 📊 **Dashboard** — Overview of all system statistics
- 🌍 **Deployed** — Live backend on Railway, frontend on Vercel

---

## 🏗️ Architecture

```
logistics-management-app/
├── backend/
│   └── app/
│       ├── main.py              # FastAPI entry point
│       ├── database.py          # SQLAlchemy setup
│       ├── models.py            # Database models
│       ├── schemas.py           # Pydantic schemas
│       ├── routers/
│       │   ├── shipments.py
│       │   ├── drivers.py
│       │   ├── warehouses.py
│       │   ├── customers.py
│       │   └── auth.py
│       ├── services/
│       └── core/
│           ├── config.py        # Pydantic settings
│           ├── security.py      # JWT + password hashing
│           ├── dependencies.py  # Auth dependency
│           └── exceptions.py    # Custom exceptions
├── frontend/
│   └── src/
│       ├── api/
│       │   └── axios.js         # Axios configuration
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   └── Shipments.jsx
│       └── components/
│           └── Navbar.jsx
├── requirements.txt
├── Procfile
└── .env                         # Not committed
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | REST API framework |
| PostgreSQL | Relational database |
| SQLAlchemy | ORM |
| Pydantic | Data validation |
| python-jose | JWT tokens |
| passlib (argon2) | Password hashing |
| uvicorn | ASGI server |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| React Router | Client-side routing |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Railway | Backend + PostgreSQL hosting |
| Vercel | Frontend hosting |
| GitHub | Version control |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/berkaniaymen/logistics-management-app.git
cd logistics-management-app

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
touch .env
```

Add these variables to your `.env` file:
```
DATABASE_URL=postgresql://user:password@localhost:5432/yourdb
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

```bash
# Run the backend
uvicorn backend.app.main:app --reload
```

API will be available at `http://127.0.0.1:8000`
API docs at `http://127.0.0.1:8000/docs`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT token |

### Shipments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/shipments/` | Get all shipments | No |
| GET | `/shipments/{id}` | Get one shipment | No |
| POST | `/shipments/` | Create a shipment | ✅ Yes |
| PUT | `/shipments/{id}` | Update a shipment | ✅ Yes |
| DELETE | `/shipments/{id}` | Delete a shipment | ✅ Yes |

### Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/drivers/` | Get all drivers |
| GET | `/drivers/{id}` | Get one driver |
| POST | `/drivers/` | Create a driver |
| PUT | `/drivers/{id}` | Update a driver |
| DELETE | `/drivers/{id}` | Delete a driver |
| PUT | `/drivers/{id}/assign/{shipment_id}` | Assign shipment to driver |

### Warehouses & Customers
Same CRUD pattern as Drivers.

---

## 🔐 Authentication Flow

1. Register via `POST /auth/register`
2. Login via `POST /auth/login` — returns a JWT token
3. Include token in request headers: `Authorization: Bearer <token>`
4. Protected routes will return `401 Unauthorized` without a valid token

---

## 👨‍💻 Author

**Aymen Berkani**
- GitHub: [@berkaniaymen](https://github.com/berkaniaymen)

---

## 📄 License

This project is licensed under the MIT License.