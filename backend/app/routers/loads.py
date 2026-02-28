from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.core.dependencies import get_current_user
from backend.app.core.exceptions import NotFoundError

router = APIRouter(prefix="/loads", tags=["Loads"])

@router.post("/")
def create_load(load: schemas.LoadCreate, db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    db_load = models.Load(**load.dict())
    db.add(db_load)
    db.commit()
    db.refresh(db_load)
    return db_load

@router.get("/")
def get_loads(db: Session = Depends(get_db),
              current_user=Depends(get_current_user)):
    return db.query(models.Load).all()

@router.get("/{load_id}")
def get_load(load_id: int, db: Session = Depends(get_db),
             current_user=Depends(get_current_user)):
    load = db.query(models.Load).filter(models.Load.id == load_id).first()
    if not load:
        raise NotFoundError("Load")
    return load

@router.put("/{load_id}")
def update_load(load_id: int, updated: schemas.LoadUpdate,
                db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    load = db.query(models.Load).filter(models.Load.id == load_id).first()
    if not load:
        raise NotFoundError("Load")
    for key, value in updated.dict(exclude_unset=True).items():
        setattr(load, key, value)
    db.commit()
    db.refresh(load)
    return load

@router.delete("/{load_id}")
def delete_load(load_id: int, db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    load = db.query(models.Load).filter(models.Load.id == load_id).first()
    if not load:
        raise NotFoundError("Load")
    db.delete(load)
    db.commit()
    return {"message": "Load deleted successfully"}