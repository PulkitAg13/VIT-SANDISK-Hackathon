from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend.models import Base, File
from backend.scanner import generate_sample_files
from backend.heat_engine import calculate_heat, classify
from backend.recommendation import generate_recommendation
from datetime import datetime

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hot vs Cold Memory Brain Engine")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/load-sample-data")
def load_sample_data(db: Session = Depends(get_db)):
    files = generate_sample_files()

    for f in files:
        db_file = File(
            name=f["name"],
            path=f["path"],
            created_at=f["created_at"],
            last_accessed=f["last_accessed"],
            open_count=f["open_count"],
            size=f["size"]
        )
        db.add(db_file)

    db.commit()
    return {"message": "Sample data loaded"}

@app.get("/analyze")
def analyze_files(db: Session = Depends(get_db)):
    files = db.query(File).all()

    result = []

    for file in files:
        heat = calculate_heat(file)
        memory_type = classify(heat)
        recommendation = generate_recommendation(file, memory_type)

        result.append({
            "name": file.name,
            "heat_score": round(heat, 3),
            "memory_type": memory_type,
            "recommendation": recommendation
        })

    return result

@app.get("/summary")
def summary(db: Session = Depends(get_db)):
    files = db.query(File).all()

    hot = warm = cold = 0

    for file in files:
        heat = calculate_heat(file)
        memory_type = classify(heat)

        if memory_type == "Hot":
            hot += 1
        elif memory_type == "Warm":
            warm += 1
        else:
            cold += 1

    return {
        "Hot": hot,
        "Warm": warm,
        "Cold": cold
    }