pipeline {
    agent any

    environment {
        // optional: tag add karne ke liye
        FRONTEND_IMAGE = "ecobin-frontend"
        BACKEND_IMAGE  = "ecobin-backend"
    }

    triggers {
      githunPush()
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Cloning repo from GitHub..."
                checkout scm
            }
        }

        stage('Build Frontend Image') {
            steps {
                echo "Building frontend Docker image..."
                sh """
                  docker build -t ${FRONTEND_IMAGE}:latest ./frontend
                """
            }
        }

        stage('Build Backend Image') {
            steps {
                echo "Building backend Docker image..."
                sh """
                  docker build -t ${BACKEND_IMAGE}:latest ./backend
                """
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                echo "Starting containers with docker-compose..."
                sh """
                  docker compose down || true
                  docker compose up -d
                """
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline success: New frontend & backend containers running."
        }
        failure {
            echo "❌ Pipeline failed: Check console output in Jenkins."
        }
    }
}
