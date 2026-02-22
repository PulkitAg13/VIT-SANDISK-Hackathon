from datetime import datetime
import math

def normalize(value, max_value):
    if max_value == 0:
        return 0
    return value / max_value

def calculate_heat(file):
    days = (datetime.utcnow() - file.last_accessed).days

    recency_score = 1 / (days + 1)
    frequency_score = math.log(file.open_count + 1)
    size_score = math.log(file.size + 1)

    heat = 0.5 * recency_score + 0.4 * frequency_score + 0.1 * size_score

    return heat

def classify(heat_score):
    if heat_score > 0.7:
        return "Hot"
    elif heat_score > 0.3:
        return "Warm"
    else:
        return "Cold"