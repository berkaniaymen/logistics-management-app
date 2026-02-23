from pydantic import BaseModel
from typing import Optional

# --- Shipment Schemas ---
class ShipmentBase(BaseModel):
    origin: str
    destination: str
    status: str

class ShipmentCreate(ShipmentBase):
    pass

class ShipmentUpdate(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    status: Optional[str] = None
    driver_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    customer_id: Optional[int] = None

class Shipment(ShipmentBase):
    id: int
    driver_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    customer_id: Optional[int] = None

    class Config:
        from_attributes = True

# --- Driver Schemas ---
class DriverBase(BaseModel):
    name: str
    phone: str
    license_number: str

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    license_number: Optional[str] = None

class Driver(DriverBase):
    id: int
    shipments: list[Shipment] = []

    class Config:
        from_attributes = True

# --- Warehouse Schemas ---
class WarehouseBase(BaseModel):
    name: str
    location: str
    capacity: int

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[int] = None

class Warehouse(WarehouseBase):
    id: int
    shipments: list[Shipment] = []

    class Config:
        from_attributes = True

# --- Customer Schemas ---
class CustomerBase(BaseModel):
    name: str
    email: str
    phone: str

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class Customer(CustomerBase):
    id: int
    shipments: list[Shipment] = []

    class Config:
        from_attributes = True