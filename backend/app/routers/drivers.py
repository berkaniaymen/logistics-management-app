from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.core.exceptions import NotFoundError

router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.post("/")
def create_driver(driver: schemas.DriverCreate, db: Session = Depends(get_db)):
    db_driver = models.Driver(**driver.dict())
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver

@router.get("/")
def get_drivers(db: Session = Depends(get_db)):
    return db.query(models.Driver).all()

@router.get("/{driver_id}")
def get_driver(driver_id: int, db: Session = Depends(get_db)):
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise NotFoundError("Driver")
    return driver

@router.put("/{driver_id}")
def update_driver(driver_id: int, updated: schemas.DriverUpdate, db: Session = Depends(get_db)):
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise NotFoundError("Driver")
    for key, value in updated.dict(exclude_unset=True).items():
        setattr(driver, key, value)
    db.commit()
    db.refresh(driver)
    return driver

@router.delete("/{driver_id}")
def delete_driver(driver_id: int, db: Session = Depends(get_db)):
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise NotFoundError("Driver")
    db.delete(driver)
    db.commit()
    return {"message": "Driver deleted successfully"}

@router.put("/{driver_id}/assign/{shipment_id}")
def assign_shipment(driver_id: int, shipment_id: int, db: Session = Depends(get_db)):
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not driver:
        raise NotFoundError("Driver")
    if not shipment:
        raise NotFoundError("Shipment")
    shipment.driver_id = driver_id
    db.commit()
    db.refresh(shipment)
    return {"message": f"Shipment {shipment_id} assigned to driver {driver_id}"}