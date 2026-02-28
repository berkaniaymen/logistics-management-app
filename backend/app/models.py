from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Float
from sqlalchemy.sql import func
class Driver(Base):
    __tablename__ = "drivers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String)
    license_number = Column(String, unique=True)
    shipments = relationship("Shipment", back_populates="driver")
    loads = relationship("Load", back_populates="driver")

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    capacity = Column(Integer)
    shipments = relationship("Shipment", back_populates="warehouse")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True)
    phone = Column(String)
    shipments = relationship("Shipment", back_populates="customer")
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    origin = Column(String, index=True)
    destination = Column(String, index=True)
    status = Column(String, default="pending")
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    driver = relationship("Driver", back_populates="shipments")
    warehouse = relationship("Warehouse", back_populates="shipments")
    customer = relationship("Customer", back_populates="shipments")

    from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Float
from sqlalchemy.sql import func

class Load(Base):
    __tablename__ = "loads"

    id = Column(Integer, primary_key=True, index=True)
    load_number = Column(String, unique=True, index=True)
    shipper_name = Column(String, index=True)
    shipper_address = Column(String)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, server_default=func.now())
    driver = relationship("Driver", back_populates="loads")
    detention_events = relationship("DetentionEvent", back_populates="load")

class DetentionEvent(Base):
    __tablename__ = "detention_events"

    id = Column(Integer, primary_key=True, index=True)
    load_id = Column(Integer, ForeignKey("loads.id"))
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    checkin_time = Column(DateTime, nullable=False)
    checkout_time = Column(DateTime, nullable=True)
    free_time_minutes = Column(Integer, default=120)
    detention_rate = Column(Float, default=50.0)
    detention_minutes = Column(Integer, default=0)
    detention_amount = Column(Float, default=0.0)
    status = Column(String, default="active")
    notes = Column(String, nullable=True)
    load = relationship("Load", back_populates="detention_events")