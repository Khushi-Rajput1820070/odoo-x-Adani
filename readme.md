# 🛠️ GearGuard  
### The Ultimate Maintenance Tracker

> A smart maintenance management system that seamlessly connects **Equipment**, **Maintenance Teams**, and **Requests** — built to digitize and optimize breakdown handling and preventive maintenance.

---

## 📌 Problem Statement

Organizations managing machines, vehicles, and technical assets often rely on manual or fragmented systems to handle maintenance.  
This leads to:
- Poor visibility of asset health
- Unclear responsibility for repairs
- Delayed breakdown resolution
- No structured preventive maintenance planning

The challenge is to build a **smart, Odoo-like maintenance module** that can:
- Track all company assets
- Manage corrective and preventive maintenance
- Assign work to the right teams
- Provide real-time visibility and intelligent UX

---

## 💡 Our Solution: GearGuard

**GearGuard** is a role-based maintenance tracking platform that manages the **entire lifecycle of a maintenance request**, from issue reporting to repair completion.

It is designed around the core philosophy defined in the problem statement:

> **Equipment (what is broken) → Teams (who fix it) → Requests (the work to be done)**

---

## 🎯 Objectives Achieved

✔ Centralized equipment registry  
✔ Specialized maintenance teams  
✔ Corrective & preventive maintenance flows  
✔ Smart auto-fill & automation  
✔ Visual Kanban & Calendar views  
✔ Complete audit trail of repairs  

---

## 👥 User Roles

### 👤 User (Employee / Operator)
- Creates maintenance requests
- Reports breakdowns
- Tracks request progress

### 🧑‍🔧 Technician
- Belongs to a maintenance team
- Picks assigned requests
- Executes repairs
- Logs work duration

### 🧑‍💼 Manager / Admin
- Oversees all equipment and requests
- Assigns technicians
- Schedules preventive maintenance
- Reviews completed work

---

## 🗂️ Core Functional Areas

### 🧾 Equipment Management
- Central database of all company assets
- Equipment tracking by:
  - Department
  - Assigned employee
- Each equipment has:
  - Name & serial number
  - Purchase date & warranty
  - Physical location
  - Assigned maintenance team
  - Default responsible technician

---

### 👥 Maintenance Teams
- Multiple specialized teams supported
  - Mechanics
  - Electricians
  - IT Support
- Technicians are linked to teams
- Requests routed automatically to the correct team

---

### 📋 Maintenance Requests

#### Request Types
- **Corrective** – Unplanned breakdown repair
- **Preventive** – Scheduled routine maintenance

#### Key Request Fields
- Subject (issue description)
- Equipment (affected asset)
- Maintenance team (auto-filled)
- Scheduled date (for preventive)
- Duration (hours spent)
- Status (lifecycle stage)

---

## 🔄 Functional Workflows

### 🔴 Flow 1: Breakdown (Corrective Maintenance)

1. Any user creates a request
2. User selects equipment
3. System automatically fetches:
   - Equipment category
   - Responsible maintenance team
4. Request starts in **New**
5. Technician or manager assigns the task
6. Status moves to **In Progress**
7. Technician repairs equipment
8. Technician records **hours spent**
9. Request moves to **Repaired**

---

### 🟢 Flow 2: Routine Checkup (Preventive Maintenance)

1. Manager creates a **Preventive** request
2. Scheduled date is selected
3. Request appears in the **Calendar View**
4. Technician performs maintenance on scheduled date
5. Duration is logged
6. Request is marked **Repaired**

---

## 🧩 User Interface & Views

### 🗃️ Maintenance Kanban Board
- Primary workspace for technicians
- Requests grouped by stages:
  - New
  - In Progress
  - Repaired
  - Scrap
- Drag & Drop between stages
- Visual indicators:
  - Technician avatar
  - Overdue requests highlighted in red

---

### 📆 Calendar View
- Displays all **Preventive Maintenance** requests
- Click on a date to schedule new maintenance
- Helps technicians plan upcoming work

---

### 📊 Smart Views & UX Enhancements

#### 🔘 Smart Button (Equipment View)
- “Maintenance” button on each equipment
- Opens all related maintenance requests
- Badge shows count of open requests

#### 🗑️ Scrap Logic
- If a request is moved to **Scrap**:
  - Equipment is marked as unusable
  - Logical flag or note is added
  - Prevents future assignments

---

## ✨ Smart & Automation Features

- Auto-fill maintenance team based on equipment
- Role-based visibility of requests
- Intelligent grouping & filtering
- Visual status indicators
- Real-time updates across views

---

## 🧠 Why GearGuard Stands Out

- Fully aligned with problem statement
- Covers both **corrective and preventive** maintenance
- Strong focus on **UX & workflow clarity**
- Smart features beyond basic CRUD
- Designed like a real-world enterprise module

---

## 📌 Real-World Impact

- Faster breakdown resolution
- Clear ownership of maintenance tasks
- Reduced asset downtime
- Better preventive planning
- Scalable for any organization size

---

## 🏁 Hackathon Summary

**GearGuard** is not just a form-based system —  
it is a **complete, intelligent maintenance management module** built with real operational challenges in mind.

---

### 🚀 Built by **Team MVT**
*From breakdown to repair — fully tracked.*
