# VIT-SANDISK-Hackathon
# 🧠 AI-Powered Storage Intelligence System
### Smart Memory Engine for Hot, Warm, and Cold Data

Modern systems store massive amounts of files, but **not all files are equally important or frequently accessed**. Our project introduces an **AI-powered storage intelligence system** that analyzes user files and classifies them into **Hot, Warm, and Cold memory**, enabling smarter storage optimization.

The system scans files, analyzes usage patterns, calculates a **heat score**, and generates **recommendations for optimal storage placement**.

---

# 🚀 Problem Statement

In modern computing systems:

- Frequently accessed files should stay on **fast storage (SSD)**.
- Rarely accessed files should move to **slow storage (HDD / archive)**.
- Current systems **do not intelligently classify user data**.

This leads to:

- Poor storage utilization
- Wasted high-speed storage
- Inefficient memory management

Our solution introduces an **AI-driven storage heatmap system** that identifies which files deserve faster memory.

---

# 🧠 Core Idea

We simulate a **human-brain-inspired memory model**:

| Memory Type | Meaning |
|--------------|--------|
| 🔥 Hot | Frequently used & recently accessed |
| 🟠 Warm | Moderately used |
| 🔵 Cold | Rarely used / archival |

Each file gets a **Heat Score (0 → 1)** calculated from:

- Recency of access
- Last modification time
- File size
- Access frequency

The system then recommends **optimal storage placement**.

---

# ✨ Key Features

## 1️⃣ Storage Scanner
Scans user storage folders and indexes files into the system.

Collected metadata:
- File name
- File path
- File size
- Created time
- Last accessed time

---

## 2️⃣ AI Heat Score Engine
Each file receives a **Heat Score** based on usage patterns.

Example formula:
Heat Score = 0.6 * Recency Score + 0.3 * Modification Score + 0.1 * Size Score

The score ranges between **0 and 1**.

---

## 3️⃣ Memory Classification Engine
Based on the Heat Score:

| Heat Score | Memory Type |
|------------|-------------|
| > 0.95 | 🔥 Hot |
| > 0.55 | 🟠 Warm |
| ≤ 0.55 | 🔵 Cold |

This mimics **multi-tier storage systems used in data centers**.

---

## 4️⃣ Smart Storage Recommendation System

The system suggests optimal storage for each file:

| Memory Type | Recommendation |
|-------------|---------------|
| Hot | Keep on SSD |
| Warm | Standard storage |
| Cold | Move to archival / HDD |

---

## 5️⃣ File Heatmap Visualization

A visual dashboard shows **file activity as a heatmap**:

| Color | Meaning |
|------|--------|
| 🔥 Red | Hot Files |
| 🟠 Orange | Warm Files |
| 🔵 Blue | Cold Files |

This allows users to **instantly understand storage usage patterns**.

---

## 6️⃣ Storage Analytics Dashboard

Provides summary statistics:
Hot Files : X
Warm Files : Y
Cold Files : Z

This helps users quickly see how their storage is distributed.

---


---

# 🛠️ Tech Stack

### Backend
- **FastAPI**
- **Python**
- **SQLAlchemy**
- **SQLite**

### Frontend
- **HTML**
- **CSS**
- **JavaScript**

### Data Processing
- File metadata analysis
- Heat score computation
- Storage classification algorithms

---

# 📂 Project Structure
Feature3
│
├── backend
│ ├── main.py
│ ├── database.py
│ ├── models.py
│ ├── scanner.py
│ ├── heat_engine.py
│ └── recommendation.py
│
├── storage
│ └── (files to analyze)
│
├── frontend
│ └── index.html
│
└── README.md

---

# ⚙️ How to Run the Project

## 1️⃣ Install Dependencies
pip install fastapi uvicorn sqlalchemy

---

## 2️⃣ Start the Backend
uvicorn backend.main:app --reload

Server runs on:
http://127.0.0.1:8000

---

## 3️⃣ Open API Docs
http://127.0.0.1:8000/docs

---

## 4️⃣ Open Frontend

Open the HTML dashboard in a browser:
frontend/index.html

---

# 📊 API Endpoints

## Scan Files
POST /scan

Scans the storage folder and indexes files.

---

## Analyze Files
GET /summary

Returns counts of:

- Hot files
- Warm files
- Cold files

---

# 🎯 Example Output
{
"name": "report.pdf",
"heat_score": 0.92,
"memory_type": "Warm",
"recommendation": "Standard storage"
}
