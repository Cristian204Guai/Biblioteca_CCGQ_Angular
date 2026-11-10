pipeline {
    // 'agent any' le dice a Jenkins que ejecute el pipeline en cualquier
    // nodo/agente disponible. Si solo tienes un servidor Jenkins, usará ese.
    agent any

    // ───────────────────────────────────────────────────────────────
    // TRIGGERS: define qué dispara automáticamente el pipeline
    // ───────────────────────────────────────────────────────────────
    triggers {
        // Se ejecuta cuando GitHub envía un webhook de "push" a Jenkins.
        // Requiere: (1) el plugin "GitHub" instalado en Jenkins y
        // (2) un webhook configurado en el repo apuntando a
        // http://TU_JENKINS/github-webhook/
        githubPush()
    }

    // ───────────────────────────────────────────────────────────────
    // TOOLS: herramientas que Jenkins debe poner disponibles en el PATH
    // ───────────────────────────────────────────────────────────────
    tools {
        // 'NodeJS-20' es el NOMBRE que le diste a la instalación de Node.js
        // en Manage Jenkins > Tools. Debe coincidir exactamente.
        // Requiere el plugin "NodeJS". Esto habilita los comandos node y npm.
        nodejs 'NodeJS-20'
    }

    // ───────────────────────────────────────────────────────────────
    // STAGES: las etapas del pipeline, se ejecutan en orden secuencial
    // ───────────────────────────────────────────────────────────────
    stages {

        // ETAPA 1: Obtener el código fuente
        stage('Checkout') {
            steps {
                // 'checkout scm' clona el repositorio y la rama que disparó
                // el pipeline, usando la configuración del propio job
                // (así no hay que repetir la URL del repo aquí).
                checkout scm
            }
        }

        // ETAPA 2: Instalar dependencias
        stage('Install Dependencies') {
            steps {
                echo 'Instalando paquetes de npm...'
                // 'npm ci' (clean install) es mejor que 'npm install' en CI porque:
                //  - Instala EXACTAMENTE lo que dice package-lock.json
                //  - Borra node_modules antes de instalar (build limpio)
                //  - Falla si package.json y el lock no coinciden
                //  - Es más rápido y reproducible
                sh 'npm ci'
            }
        }

        // ETAPA 3: Compilar la aplicación
        stage('Build & Test') {
            steps {
                echo 'Compilando aplicación Angular para validar sintaxis y tipos...'
                // El '--' separa los argumentos de npm de los del script:
                // lo que va después se le pasa directamente a 'ng build'.
                // '--configuration=production' activa optimizaciones: minificación,
                // tree-shaking, AOT, etc. Si hay errores de TypeScript o de
                // plantillas, el build falla y el pipeline se detiene aquí.
                sh 'npm run build -- --configuration=production'
            }
        }

        // ETAPA 4: Disparar el despliegue en Render
        stage('Trigger Render Deploy') {
            steps {
                echo 'Notificando a Render para iniciar el despliegue...'

                // withCredentials inyecta un secreto guardado en Jenkins como
                // variable de entorno, SOLO dentro de este bloque.
                //  - credentialsId: el ID del "Secret text" en Jenkins
                //  - variable: nombre de la variable de entorno resultante
                // Jenkins además enmascara (****) el valor en los logs.
                withCredentials([string(credentialsId: 'RENDER_DEPLOY_HOOK', variable: 'RENDER_HOOK_URL')]) {

                    // Se hace un POST al Deploy Hook de Render, que es una URL
                    // secreta que, al ser llamada, inicia un nuevo despliegue.
                    // Se usan comillas simples en Groovy y comillas dobles en
                    // el shell para que sea el SHELL quien expanda $RENDER_HOOK_URL,
                    // evitando que el secreto se interpole en Groovy (más seguro).
                    sh 'curl -X POST "$RENDER_HOOK_URL"'
                }
            }
        }
    }

    // ───────────────────────────────────────────────────────────────
    // POST: acciones que se ejecutan al terminar el pipeline,
    // según su resultado
    // ───────────────────────────────────────────────────────────────
    post {
        // Solo se ejecuta si TODAS las etapas terminaron bien
        success {
            echo 'Pipeline ejecutado con éxito. El despliegue en Render ha iniciado.'
        }
        // Se ejecuta si cualquier etapa falló
        failure {
            echo 'Ocurrió un error en las pruebas o compilación. No se desplegó en Render.'
        }
    }
}
