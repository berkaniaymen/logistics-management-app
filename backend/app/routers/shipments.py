from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.core.dependencies import get_current_user
from backend.app.core.exceptions import NotFoundError

router = APIRouter(prefix="/shipments", tags=["Shipments"])

@router.post("/")
def create_shipment(shipment: schemas.ShipmentCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_shipment = models.Shipment(**shipment.dict())
    db.add(db_shipment)
    db.commit()
    db.refresh(db_shipment)
    return db_shipment

@router.get("/")
def get_shipments(db: Session = Depends(get_db)):
    return db.query(models.Shipment).all()

@router.get("/{shipment_id}")
def get_shipment(shipment_id: int, db: Session = Depends(get_db)):
    shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not shipment:
        raise NotFoundError("Shipment")
    return shipment

@router.put("/{shipment_id}")
def update_shipment(shipment_id: int, updated: schemas.ShipmentUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not shipment:
        raise NotFoundError("Shipment")
    for key, value in updated.dict(exclude_unset=True).items():
        setattr(shipment, key, value)
    db.commit()
    db.refresh(shipment)
    return shipment

@router.delete("/{shipment_id}")
def delete_shipment(shipment_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not shipment:
        raise NotFoundError("Shipment")
    db.delete(shipment)
    db.commit()
    return {"message": "Shipment deleted successfully"}