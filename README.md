
# 🌍♻️ EcoBin — Community E-Waste Pickup & Reward Credits Platform

### ⚡ Vite + React • 🚀 Node/Express • 🍃 MongoDB • 📦 MinIO • 🐳 Docker • 🤖 Jenkins CI/CD

EcoBin is a smart e-waste collection platform that automates pickup requests, stores images in MinIO, and rewards users for recycling — backed by a real DevOps CI/CD pipeline.

---

# ⭐ Features at a Glance

### 👥 User Platform

✏️ Register/Login (JWT)
🗑️ Book e-waste pickup
🎁 Earn Eco-Credits for each pickup
👀 Track pickup status

### 🛠 Admin Tools

✔️ Approve/Reject requests
📸 View uploaded item photos
📊 Dashboard for monitoring

### ☁️ DevOps Integration

🔄 Auto Deploy via Jenkins
🐳 Docker Image Build (Frontend + Backend)
🚚 Docker Compose Restart
🌐 GitHub → Ngrok → Jenkins Webhook instant triggers

---

# 🏗️ Tech Stack

| Layer                 | Technology              |
| --------------------  | ----------------------- |
| 🎨 Frontend          | Vite + React            |
| 🧠 Backend           | Node.js + Express       |
| 🗄 Database           | MongoDB                 |
| 📦 Object Storage    | MinIO                   |
| 🐳 Container Runtime | Docker + Docker Compose |
| 🤖 CI/CD             | Jenkins (Pipeline)      |

---

# 🗂️ Project Structure

```
EcoBin/
│
├── frontend/        🎨 Vite + React
│   ├── src/
│   ├── public/
│   └── Dockerfile
│
├── backend/         🚀 Node/Express API
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── Dockerfile
│
├── docker-compose.yml      🐳 Multi-container orchestration
├── Jenkinsfile             🤖 CI/CD pipeline script
└── README.md
```

---

# 🔄 CI/CD Pipeline — Commit → Build → Deploy 🚀

Jenkins automatically handles deployment every time you push to GitHub.

### Workflow:

1️⃣ Developer Pushes Code → GitHub
2️⃣ GitHub → Webhook → Jenkins
3️⃣ Jenkins → 🐳 Build Docker images:
ecobin-frontend
ecobin-backend
4️⃣ Jenkins → 🔁 Restart Docker Compose
5️⃣ 🎉 New version LIVE instantly

No manual build. No manual run. Fully automated.

---

# 🤖 Jenkinsfile (Pipeline)

```groovy
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker build -t ecobin-frontend ./frontend'
            }
        }

        stage('Build Backend') {
            steps {
                sh 'docker build -t ecobin-backend ./backend'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose down || true'
                sh 'docker compose up -d'
            }
        }
    }

    post {
        success { echo "🚀 Deployment Successful!" }
        failure { echo "❌ Deployment Failed." }
    }
}
```

---

# 🐳 Docker Setup

### ▶️ Start Everything


docker compose up --build -d


### ⏹ Stop Everything


docker compose down


### 🔍 Check Containers


docker ps


---

# 📦 MinIO Object Storage

### Dashboard URL

👉 [http://localhost:9001](http://localhost:9001)

### Default Credentials

🔑 User: minioadmin
🔐 Pass: minioadmin

Create Bucket → ecobin-media
All pickup photos store here.

---

# 🎨 Special Route for CI Testing

test-jenkins

Used for verifying Jenkins auto-deploy.
Update text → Push → Auto-refresh → Done. 🚀

---

# 🛠 Local Development Guides

### Frontend (Vite)


cd frontend
npm install
npm run dev


### Backend (Node/Express)


cd backend
npm install
npm start


---

# ⚡ Webhook Setup (GitHub → Jenkins)

GitHub Repo → Settings → Webhooks → Add:

```
http://your-ngrok-url/github-webhook/
```

Event: Push
Now every commit triggers CI/CD.

---

# 👨‍💻 Author

### Vinit Singh

💻 Full-Stack Developer
🐳 DevOps Learner
📍 India

---

# ⭐ If You Like This Project

Give it a star on GitHub ✨
Helps the project grow and motivates more open-source DevOps builds!

---
