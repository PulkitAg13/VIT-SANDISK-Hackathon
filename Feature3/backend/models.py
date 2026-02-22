from sqlalchemy import Column, Integer, String, DateTime
from backend.database import Base
from datetime import datetime

class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_accessed = Column(DateTime)
    open_count = Column(Integer, default=0)
    size = Column(Integer)