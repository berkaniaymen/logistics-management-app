from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import Base, engine
from backend.app import models
from backend.app.routers import shipments, drivers, warehouses, customers, auth

app = FastAPI(
    title="Logistics Management API",
    description="""
    A professional logistics management system API.
    
    ## Features
    * **Shipments** — Full CRUD for managing shipments
    * **Drivers** — Manage drivers and assign shipments
    * **Warehouses** — Manage warehouse locations
    * **Customers** — Manage customer records
    * **Authentication** — JWT-based secure login system
    """,
    version="1.0.0",
    contact={
        "name": "Aymen Berkani",
        "email": "your-email@example.com",
    },
    license_info={
        "name": "MIT",
    },
)

# CORS must be added before anything else
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all database tables
Base.metadata.create_all(bind=engine)

# Register routers
app.include_router(shipments.router)
app.include_router(drivers.router)
app.include_router(warehouses.router)
app.include_router(customers.router)
app.include_router(auth.router)

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred"}
    )

@app.get("/")
def root():
    return {"message": "Logistics API running 🚀"}