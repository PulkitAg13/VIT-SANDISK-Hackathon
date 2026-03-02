def generate_recommendation(file, memory_type):
    if memory_type == "Cold" and file.size > 5000000:
        return "Recommend compression to save space."
    elif memory_type == "Cold":
        return "Consider archiving this file."
    elif memory_type == "Hot":
        return "Keep on SSD for fast access."
    else:
        return "No action needed."