from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
try:
    from backend.database import SessionLocal, engine
    from backend.models import Base, File
    from backend.scanner import scan_storage_folder
    from backend.heat_engine import calculate_heat, classify
    from backend.recommendation import generate_recommendation
except ModuleNotFoundError:
    from database import SessionLocal, engine
    from models import Base, File
    from scanner import scan_storage_folder
    from heat_engine import calculate_heat, classify
    from recommendation import generate_recommendation

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hot vs Cold Memory Brain Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/scan")
def scan(db: Session = Depends(get_db)):

    files = scan_storage_folder()

    for f in files:
        existing = db.query(File).filter(File.path == f["path"]).first()

        if not existing:
            db_file = File(
                name=f["name"],
                path=f["path"],
                created_at=f["created_at"],
                last_accessed=f["last_accessed"],
                last_modified=f["last_modified"],
                open_count=0,
                size=f["size"]
            )
            db.add(db_file)
        else:
            existing.name = f["name"]
            existing.created_at = f["created_at"]
            existing.last_accessed = f["last_accessed"]
            existing.last_modified = f["last_modified"]
            existing.size = f["size"]

    db.commit()

    return {"message": f"{len(files)} files scanned successfully"}

@app.get("/analyze")
def analyze(db: Session = Depends(get_db)):
    files = db.query(File).all()

    result = []

    for file in files:
        heat = calculate_heat(file)
        memory_type = classify(heat)
        recommendation = generate_recommendation(file, memory_type)

        result.append({
            "id": file.id,
            "name": file.name,
            "path": file.path,
            "heat_score": round(heat, 3),
            "memory_type": memory_type,
            "recommendation": recommendation,
            "size": file.size,
            "open_count": file.open_count,
            "created_at": file.created_at.isoformat() if file.created_at else None,
            "last_accessed": file.last_accessed.isoformat() if file.last_accessed else None,
            "last_modified": file.last_modified.isoformat() if file.last_modified else None
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