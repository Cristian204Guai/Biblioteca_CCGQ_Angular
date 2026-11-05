pipeline {
    agent any

    tools {
        // Asegúrate de tener configurado Node.js en Manage Jenkins > Tools
        nodejs 'NodeJS-20' 
    }

    stages {
        stage('Checkout') {
            steps {
                // Descarga el código del repositorio
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Instalando paquetes de npm...'
                sh 'npm ci'
            }
        }

        stage('Build & Test') {
            steps {
                echo 'Compilando aplicación Angular para validar sintaxis y tipos...'
                sh 'npm run build -- --configuration=production'
            }
        }

        stage('Trigger Render Deploy') {
            steps {
                echo 'Notificando a Render para iniciar el despliegue...'
                withCredentials([string(credentialsId: 'RENDER_DEPLOY_HOOK', variable: 'RENDER_HOOK_URL')]) {
                    // Envía una petición POST al endpoint de Render
                    sh 'curl -X POST "$RENDER_HOOK_URL"'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline ejecutado con éxito. El despliegue en Render ha iniciado.'
        }
        failure {
            echo 'Ocurrió un error en las pruebas o compilación. No se desplegó en Render.'
        }
    }
}