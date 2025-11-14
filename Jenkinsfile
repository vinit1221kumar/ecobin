pipeline {
    agent any

    environment {
        // optional: tag add karne ke liye
        FRONTEND_IMAGE = "ecobin-frontend"
        BACKEND_IMAGE  = "ecobin-backend"
    }

    // NOTE:
    // - Agar NORMAL pipeline job hai → ye rakho
    // - Agar MULTIBRANCH pipeline job hai → poora triggers block hata do
    triggers {
        githubPush()   // FIXED: githunPush() -> githubPush()
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
                  # yahan decide karo: docker compose ya docker-compose
                  docker compose -f docker-compose.yml down || true
                  docker compose -f docker-compose.yml up -d --build --force-recreate
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