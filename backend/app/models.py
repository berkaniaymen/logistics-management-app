from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String)
    license_number = Column(String, unique=True)
    shipments = relationship("Shipment", back_populates="driver")

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