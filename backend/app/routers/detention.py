from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.core.dependencies import get_current_user, require_dispatcher, require_driver
from backend.app.core.exceptions import NotFoundError
from datetime import datetime, timezone
import io

router = APIRouter(prefix="/detention", tags=["Detention"])

def calculate_detention(checkin: datetime, checkout: datetime,
                        free_time_minutes: int, rate: float):
    total_minutes = int((checkout - checkin).total_seconds() / 60)
    detention_minutes = max(0, total_minutes - free_time_minutes)
    detention_amount = round((detention_minutes / 60) * rate, 2)
    return detention_minutes, detention_amount

@router.post("/checkin/")
def checkin(data: schemas.DetentionCheckin, db: Session = Depends(get_db),
            current_user=Depends(require_driver)):
    # Driver can only check in for themselves
    if current_user.driver_id != data.driver_id:
        raise HTTPException(status_code=403, detail="You can only check in for yourself")

    load = db.query(models.Load).filter(models.Load.id == data.load_id).first()
    if not load:
        raise NotFoundError("Load")

    # Driver can only check in on loads assigned to them
    if load.driver_id != current_user.driver_id:
        raise HTTPException(status_code=403, detail="This load is not assigned to you")

    event = models.DetentionEvent(
        load_id=data.load_id,
        driver_id=data.driver_id,
        checkin_time=datetime.now(timezone.utc),
        free_time_minutes=data.free_time_minutes,
        detention_rate=data.detention_rate,
        notes=data.notes,
        status="active"
    )
    db.add(event)
    load.status = "in_transit"
    db.commit()
    db.refresh(event)
    return event

@router.post("/checkout/{event_id}/")
def checkout(event_id: int, data: schemas.DetentionCheckout,
             db: Session = Depends(get_db),
             current_user=Depends(require_driver)):
    event = db.query(models.DetentionEvent).filter(
        models.DetentionEvent.id == event_id).first()
    if not event:
        raise NotFoundError("Detention event")

    # Driver can only check out their own events
    if event.driver_id != current_user.driver_id:
        raise HTTPException(status_code=403, detail="You can only check out your own events")

    checkout_time = datetime.now(timezone.utc)
    detention_minutes, detention_amount = calculate_detention(
        event.checkin_time, checkout_time,
        event.free_time_minutes, event.detention_rate
    )
    event.checkout_time = checkout_time
    event.detention_minutes = detention_minutes
    event.detention_amount = detention_amount
    event.status = "completed"
    if data.notes:
        event.notes = data.notes
    db.commit()
    db.refresh(event)
    return event

@router.get("/active")
def get_active(db: Session = Depends(get_db),
               current_user=Depends(require_dispatcher)):
    # Only dispatchers see all active detentions
    events = db.query(models.DetentionEvent).filter(
        models.DetentionEvent.status == "active").all()
    result = []
    for event in events:
        now = datetime.now(timezone.utc)
        checkin = event.checkin_time
        if checkin.tzinfo is None:
            checkin = checkin.replace(tzinfo=timezone.utc)
        elapsed_minutes = int((now - checkin).total_seconds() / 60)
        detention_minutes = max(0, elapsed_minutes - event.free_time_minutes)
        result.append({
            "id": event.id,
            "load_id": event.load_id,
            "driver_id": event.driver_id,
            "checkin_time": event.checkin_time,
            "elapsed_minutes": elapsed_minutes,
            "free_time_remaining": max(0, event.free_time_minutes - elapsed_minutes),
            "detention_minutes": detention_minutes,
            "detention_amount": round((detention_minutes / 60) * event.detention_rate, 2),
            "status": event.status,
        })
    return result

@router.get("/load/{load_id}")
def get_by_load(load_id: int, db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    # Drivers can only see events for their own loads
    if current_user.role == "driver":
        load = db.query(models.Load).filter(models.Load.id == load_id).first()
        if not load or load.driver_id != current_user.driver_id:
            raise HTTPException(status_code=403, detail="Access denied")
    return db.query(models.DetentionEvent).filter(
        models.DetentionEvent.load_id == load_id).all()

@router.get("/driver/{driver_id}")
def get_by_driver(driver_id: int, db: Session = Depends(get_db),
                  current_user=Depends(get_current_user)):
    # Drivers can only see their own history
    if current_user.role == "driver" and current_user.driver_id != driver_id:
        raise HTTPException(status_code=403, detail="You can only view your own detention history")
    return db.query(models.DetentionEvent).filter(
        models.DetentionEvent.driver_id == driver_id).all()

@router.get("/{event_id}/report")
def generate_report(event_id: int, db: Session = Depends(get_db),
                    current_user=Depends(get_current_user)):
    from reportlab.lib.pagesizes import letter # type: ignore
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle # type: ignore
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.lib.units import inch # type: ignore

    event = db.query(models.DetentionEvent).filter(
        models.DetentionEvent.id == event_id).first()
    if not event:
        raise NotFoundError("Detention event")

    # Drivers can only download their own reports
    if current_user.role == "driver" and event.driver_id != current_user.driver_id:
        raise HTTPException(status_code=403, detail="Access denied")

    driver = db.query(models.Driver).filter(
        models.Driver.id == event.driver_id).first()
    load = db.query(models.Load).filter(
        models.Load.id == event.load_id).first()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                            rightMargin=0.75*inch, leftMargin=0.75*inch,
                            topMargin=0.75*inch, bottomMargin=0.75*inch)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('T', parent=styles['Title'], fontSize=22,
                                 textColor=colors.HexColor('#1a1a2e'))
    body_style = ParagraphStyle('B', parent=styles['Normal'], fontSize=10, leading=16)
    story = []

    story.append(Paragraph("DETENTION TIME REPORT", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#4a4a8a')))
    story.append(Spacer(1, 0.2*inch))

    data = [
        ["Field", "Details"],
        ["Report ID", f"DET-{event.id:05d}"],
        ["Load Number", load.load_number if load else "N/A"],
        ["Shipper", load.shipper_name if load else "N/A"],
        ["Shipper Address", load.shipper_address if load else "N/A"],
        ["Driver", driver.name if driver else "N/A"],
        ["Driver Phone", driver.phone if driver else "N/A"],
        ["Check-In Time", event.checkin_time.strftime("%Y-%m-%d %H:%M:%S UTC")],
        ["Check-Out Time", event.checkout_time.strftime("%Y-%m-%d %H:%M:%S UTC") if event.checkout_time else "Still Active"],
        ["Free Time Allowed", f"{event.free_time_minutes} minutes"],
        ["Total Detention Time", f"{event.detention_minutes} minutes ({round(event.detention_minutes/60, 2)} hours)"],
        ["Detention Rate", f"${event.detention_rate}/hour"],
        ["TOTAL AMOUNT OWED", f"${event.detention_amount}"],
        ["Status", event.status.upper()],
    ]

    table = Table(data, colWidths=[2.5*inch, 4*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1a1a2e')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.white, colors.HexColor('#f4f4f4')]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cccccc')),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#27ae60')),
        ('TEXTCOLOR', (0,-1), (-1,-1), colors.white),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,-1), (-1,-1), 11),
    ]))
    story.append(table)
    story.append(Spacer(1, 0.3*inch))

    if event.notes:
        story.append(Paragraph(f"Notes: {event.notes}", body_style))

    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("This report was automatically generated by the Logistics Management System.", body_style))
    story.append(Paragraph("Timestamps are recorded server-side and cannot be altered.", body_style))

    doc.build(story)
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf",
                             headers={"Content-Disposition": f"attachment; filename=detention-report-{event_id}.pdf"})

@router.get("/stats/summary")
def get_stats(db: Session = Depends(get_db),
              current_user=Depends(require_dispatcher)):
    from sqlalchemy import func

    total_events = db.query(models.DetentionEvent).count()
    completed_events = db.query(models.DetentionEvent).filter(
        models.DetentionEvent.status == "completed").count()
    active_events = db.query(models.DetentionEvent).filter(
        models.DetentionEvent.status == "active").count()

    total_amount = db.query(func.sum(models.DetentionEvent.detention_amount)).scalar() or 0
    total_minutes = db.query(func.sum(models.DetentionEvent.detention_minutes)).scalar() or 0
    avg_detention = db.query(func.avg(models.DetentionEvent.detention_minutes)).scalar() or 0

    total_loads = db.query(models.Load).count()
    pending_loads = db.query(models.Load).filter(models.Load.status == "pending").count()
    completed_loads = db.query(models.Load).filter(models.Load.status == "completed").count()

    total_shipments = db.query(models.Shipment).count()
    total_drivers = db.query(models.Driver).count()
    total_customers = db.query(models.Customer).count()
    total_warehouses = db.query(models.Warehouse).count()

    recent_events = db.query(models.DetentionEvent).order_by(
        models.DetentionEvent.id.desc()).limit(10).all()

    loads = db.query(models.Load).all()
    shipper_map = {}
    for load in loads:
        events = db.query(models.DetentionEvent).filter(
            models.DetentionEvent.load_id == load.id).all()
        for event in events:
            if load.shipper_name not in shipper_map:
                shipper_map[load.shipper_name] = {
                    "shipper": load.shipper_name,
                    "total_detention_minutes": 0,
                    "total_amount": 0,
                    "events": 0
                }
            shipper_map[load.shipper_name]["total_detention_minutes"] += event.detention_minutes
            shipper_map[load.shipper_name]["total_amount"] += event.detention_amount
            shipper_map[load.shipper_name]["events"] += 1

    return {
        "detention": {
            "total_events": total_events,
            "completed_events": completed_events,
            "active_events": active_events,
            "total_amount": round(total_amount, 2),
            "total_minutes": total_minutes,
            "avg_detention_minutes": round(avg_detention, 1),
        },
        "loads": {
            "total": total_loads,
            "pending": pending_loads,
            "completed": completed_loads,
        },
        "overview": {
            "total_shipments": total_shipments,
            "total_drivers": total_drivers,
            "total_customers": total_customers,
            "total_warehouses": total_warehouses,
        },
        "recent_events": [
            {
                "id": e.id,
                "load_id": e.load_id,
                "driver_id": e.driver_id,
                "detention_minutes": e.detention_minutes,
                "detention_amount": e.detention_amount,
                "status": e.status,
                "checkin_time": e.checkin_time,
            } for e in recent_events
        ],
        "shipper_stats": list(shipper_map.values()),
    }