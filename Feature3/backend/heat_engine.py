from datetime import datetime
import math

def calculate_heat(file):
    now = datetime.utcnow()
    
    days = (now - file.last_accessed).days

    # 🔥 Prevent negative or zero division issues
    if days < 0:
        days = 0

    now = datetime.now()

    days_since_access = (now - file.last_accessed).days
    days_since_modified = (now - file.last_modified).days

    access_score = max(0, 1 - (days_since_access / 60))
    modify_score = max(0, 1 - (days_since_modified / 90))

    size_score = min(1, math.log(file.size + 1) / 15)

    heat = 0.5 * access_score + 0.3 * modify_score + 0.2 * size_score

    return min(heat, 1)


def classify(heat_score):
    if heat_score > 0.95:
        return "Hot"
    elif heat_score > 0.55:
        return "Warm"
    else:
        return "Cold"