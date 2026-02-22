from sqlalchemy.future import select
from app.db.models import File

async def create_file(db, file_data):
    db.add(file_data)
    await db.commit()
    await db.refresh(file_data)
    return file_data

async def get_all_files(db):
    result = await db.execute(select(File))
    return result.scalars().all()

async def get_file_by_path(db, path: str):
    result = await db.execute(select(File).where(File.path == path))
    return result.scalars().first()