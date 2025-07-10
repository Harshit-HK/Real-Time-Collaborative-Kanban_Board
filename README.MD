# 🧠 Real-Time Collaborative Kanban Board

A full-stack real-time Kanban board application built for efficient team collaboration, task tracking, and smart assignment. Supports live updates, drag-and-drop tasks, activity logs, and conflict detection.

---

## 🚀 Live Demo & Video

- 🔗 [**Live App**:](https://real-time-collaborative-kanban-boar.vercel.app/login)
- 🎥 [**Demo Video**: ](https://drive.google.com/file/d/1DCmfVAwGBOXnTTm8_X-sVvISrWAaA4_S/view?usp=sharing)

---

## 🖥️ Local Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```
---

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- CSS Modules (no UI libraries)
- Socket.IO client

**Backend:**
- Node.js + Express.js (ESModules)
- MongoDB + Mongoose
- Socket.IO server
- JWT authentication

---

## ✅ Features

1. 🔐 Login/Register with JWT authentication

1. 🗂️ Kanban board with three stages: To Do, In Progress, Done

1. 🧲 Drag & Drop tasks (with live status update across users)

1. 👥 Assign tasks to users manually or using Smart Assign

1. 📡 Real-time sync using Socket.IO

1. 🕵️ Live action logs panel (last 20 actions auto-updated)

1. ⚠️ Conflict handling for simultaneous task edits

1. 🧠 Smart assignment logic based on workload and priority

---
## 🧠 Smart Assign Logic

When a task is marked for Smart Assignment, the system auto-selects a user based on:

1. Task priority

1. Number of existing tasks assigned

## Algorithm:
1. High priority tasks are given to the least busy active user.

1. Medium/Low priority are balanced across users to spread workload.

## ⚔️ Conflict Handling

1. If two users edit the same task at the same time, the app detects this and:

1. Notifies both users in real-time using Socket.IO

## 🗂️ Folder structure

        📦 root
        ├── frontend/
        │   └── src/
        │       ├── components/
        │       ├── pages/
        │       └── context/
        ├── backend/
        │   ├── config/
        │   ├── controllers/
        │   ├── middleware/
        │   ├── models/
        │   ├── routes/
        │   ├── utils/
        │   └── services/

