from fastapi import FastAPI
from sqlalchemy import text
from backend.app.database import engine
from backend.app import models
Base.metadata.create_all(bind=engine)
app = FastAPI()

@app.get("/")
def root():
    return {"message": "Logistics API running 🚀"}

@app.get("/shipments")
def get_shipments():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT * FROM logistics.shipments"))
        shipments = [dict(row._mapping) for row in result]
    return shipments

from pydantic import BaseModel
from datetime import date

class ShipmentCreate(BaseModel):
    customer_id: int
    driver_id: int
    warehouse_id: int
    shipment_status: str
    shipment_date: date
    delivery_date: date | None = None
    distance_km: float
    shipping_cost: float
    order_id: int | None = None


@app.post("/shipments")
def create_shipment(shipment: ShipmentCreate):
    with engine.connect() as connection:
        connection.execute(
            text("""
                INSERT INTO logistics.shipments
                (customer_id, driver_id, warehouse_id, shipment_status,
                 shipment_date, delivery_date, distance_km, shipping_cost, order_id)
                VALUES
                (:customer_id, :driver_id, :warehouse_id, :shipment_status,
                 :shipment_date, :delivery_date, :distance_km, :shipping_cost, :order_id)
            """),
            shipment.dict()
        )
        connection.commit()

    return {"message": "Shipment created successfully"}


from fastapi import FastAPI
from backend.app.routers import shipments

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
app.include_router(shipments.router)
from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred"}
    )
from backend.app.database import Base, engine
Base.metadata.create_all(bind=engine)
from backend.app.routers import drivers
app.include_router(drivers.router)
from backend.app.routers import warehouses, customers
app.include_router(warehouses.router)
app.include_router(customers.router)
from backend.app.routers import auth
app.include_router(auth.router)