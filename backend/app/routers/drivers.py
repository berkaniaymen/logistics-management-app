from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas

router = APIRouter(prefix="/drivers", tags=["Drivers"])

# CREATE
@router.post("/")
def create_driver(driver: schemas.DriverCreate, db: Session = Depends(get_db)):
    db_driver = models.Driver(**driver.dict())
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver

# GET ALL
@router.get("/")
def get_drivers(db: Session = Depends(get_db)):
    return db.query(models.Driver).all()

# GET ONE
@router.get("/{driver_id}")
def get_driver(driver_id: int, db: Session = Depends(get_db)):
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

# UPDATE
@router.put("/{driver_id}")
def update_driver(driver_id: int, updated: schemas.DriverUpdate, db: Session = Depends(get_db)):
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    for key, value in updated.dict(exclude_unset=True).items():
        setattr(driver, key, value)
    db.commit()
    db.refresh(driver)
    return driver

# DELETE
@router.delete("/{driver_id}")
def delete_driver(driver_id: int, db: Session = Depends(get_db)):
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    db.delete(driver)
    db.commit()
    return {"message": "Driver deleted successfully"}

# ASSIGN SHIPMENT TO DRIVER
@router.put("/{driver_id}/assign/{shipment_id}")
def assign_shipment(driver_id: int, shipment_id: int, db: Session = Depends(get_db)):
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    shipment.driver_id = driver_id
    db.commit()
    db.refresh(shipment)
    return {"message": f"Shipment {shipment_id} assigned to driver {driver_id}"}