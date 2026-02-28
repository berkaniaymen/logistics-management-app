from datetime import datetime
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

        # --- User Schemas ---
class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str


# --- Load Schemas ---
class LoadBase(BaseModel):
    load_number: str
    shipper_name: str
    shipper_address: str
    driver_id: Optional[int] = None
    shipment_id: Optional[int] = None

class LoadCreate(LoadBase):
    pass

class LoadUpdate(BaseModel):
    load_number: Optional[str] = None
    shipper_name: Optional[str] = None
    shipper_address: Optional[str] = None
    driver_id: Optional[int] = None
    status: Optional[str] = None

class Load(LoadBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Detention Schemas ---
class DetentionCheckin(BaseModel):
    load_id: int
    driver_id: int
    free_time_minutes: Optional[int] = 120
    detention_rate: Optional[float] = 50.0
    notes: Optional[str] = None

class DetentionCheckout(BaseModel):
    notes: Optional[str] = None

class DetentionEvent(BaseModel):
    id: int
    load_id: int
    driver_id: int
    checkin_time: datetime
    checkout_time: Optional[datetime] = None
    free_time_minutes: int
    detention_rate: float
    detention_minutes: int
    detention_amount: float
    status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True