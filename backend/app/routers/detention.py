from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.core.dependencies import get_current_user
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

@router.post("/checkin")
def checkin(data: schemas.DetentionCheckin, db: Session = Depends(get_db),
            current_user=Depends(get_current_user)):
    load = db.query(models.Load).filter(models.Load.id == data.load_id).first()
    if not load:
        raise NotFoundError("Load")
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

@router.post("/checkout/{event_id}")
def checkout(event_id: int, data: schemas.DetentionCheckout,
             db: Session = Depends(get_db),
             current_user=Depends(get_current_user)):
    event = db.query(models.DetentionEvent).filter(
        models.DetentionEvent.id == event_id).first()
    if not event:
        raise NotFoundError("Detention event")
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
               current_user=Depends(get_current_user)):
    events = db.query(models.DetentionEvent).filter(
        models.DetentionEvent.status == "active").all()
    result = []
    for event in events:
        now = datetime.now(timezone.utc)
        checkin = event.checkin_time
        if checkin.tzinfo is None:
            from datetime import timezone as tz
            checkin = checkin.replace(tzinfo=tz.utc)
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
    return db.query(models.DetentionEvent).filter(
        models.DetentionEvent.load_id == load_id).all()

@router.get("/driver/{driver_id}")
def get_by_driver(driver_id: int, db: Session = Depends(get_db),
                  current_user=Depends(get_current_user)):
    return db.query(models.DetentionEvent).filter(
        models.DetentionEvent.driver_id == driver_id).all()

@router.get("/{event_id}/report")
def generate_report(event_id: int, db: Session = Depends(get_db),
                    current_user=Depends(get_current_user)):
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.lib.units import inch

    event = db.query(models.DetentionEvent).filter(
        models.DetentionEvent.id == event_id).first()
    if not event:
        raise NotFoundError("Detention event")

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