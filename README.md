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