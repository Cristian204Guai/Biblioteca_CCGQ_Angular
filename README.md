# 📚 Biblioteca Angular - Guía de Proyecto e Integración Continua (CI/CD)

Aplicación web desarrollada con [Angular](https://angular.dev/) que cuenta con un pipeline completo de Integración y Despliegue Continuo (CI/CD) implementado con **Jenkins**, **Docker**, **Webhook Relay**, **GitHub** y **Render**.

---

## 📑 Tabla de Contenidos

1. [Arquitectura del Flujo CI/CD](#-arquitectura-del-flujo-cicd)
2. [Prerrequisitos](#-prerrequisitos)
3. [Paso a Paso: Replicación del Entorno CI/CD](#-paso-a-paso-replicaci%C3%B3n-del-entorno-cicd)
   - [Paso 1: Instalación de Jenkins en Docker](#paso-1-instalaci%C3%B3n-de-jenkins-en-docker)
   - [Paso 2: Configuración de NodeJS en Jenkins](#paso-2-configuraci%C3%B3n-de-nodejs-en-jenkins)
   - [Paso 3: Configuración de Webhook Relay](#paso-3-configuraci%C3%B3n-de-webhook-relay)
   - [Paso 4: Configuración del Webhook en GitHub](#paso-4-configuraci%C3%B3n-del-webhook-en-github)
   - [Paso 5: Configuración del Servicio y Deploy Hook en Render](#paso-5-configuraci%C3%B3n-del-servicio-y-deploy-hook-en-render)
   - [Paso 6: Creación de Credenciales en Jenkins](#paso-6-creaci%C3%B3n-de-credenciales-en-jenkins)
   - [Paso 7: El archivo Jenkinsfile](#paso-7-el-archivo-jenkinsfile)
   - [Paso 8: Creación del Pipeline en Jenkins](#paso-8-creaci%C3%B3n-del-pipeline-en-jenkins)
4. [Validación del Flujo Completo](#-validaci%C3%B3n-del-flujo-completo)
5. [Desarrollo Local con Angular](#-desarrollo-local-con-angular)
6. [Resolución de Problemas Comunes](#-resoluci%C3%B3n-de-problemas-comunes)

---

## 🏗 Arquitectura del Flujo CI/CD

El objetivo de esta integración es que cada `git push` realizado en la rama principal dispare automáticamente una validación de compilación en un Jenkins local (mediante túnel con Webhook Relay) y, solo si la compilación es exitosa, se ordene a Render el despliegue automático de la aplicación.

```
+-----------------------------------------------------------------------------------------+
|                                    FLUJO CI/CD                                          |
+-----------------------------------------------------------------------------------------+
                                                                                           
   [Desarrollador]                                                                        
          │                                                                                
          │  git push                                                                      
          ▼                                                                                
     ┌─────────┐                ┌──────────────────┐                                       
     │ GitHub  │ ──(Webhook)──> │  Webhook Relay   │ (Túnel hacia localhost)               
     └─────────┘                └─────────┬────────┘                                       
                                          │                                                
                                          │ POST http://localhost:8080/github-webhook/     
                                          ▼                                                
                             ┌──────────────────────────┐                                  
                             │     Jenkins (Docker)     │                                  
                             │  1. Checkout SCM         │                                  
                             │  2. npm ci               │                                  
                             │  3. npm run build (Prod) │                                  
                             └────────────┬─────────────┘                                  
                                          │                                                
                                          │ ¿Build Exitoso?                                
                                          │ curl -X POST $RENDER_DEPLOY_HOOK               
                                          ▼                                                
                                   ┌──────────────┐                                        
                                   │    Render    │ ──> [App Desplegada en Producción]     
                                   └──────────────┘                                        
```

---

## 📋 Prerrequisitos

Antes de iniciar, asegúrate de contar con:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.
- Cuenta activa en [GitHub](https://github.com/) con el repositorio del proyecto subido.
- Cuenta en [Webhook Relay](https://webhookrelay.com/) (permite recibir webhooks en entornos locales sin IP pública fija).
- Cuenta en [Render](https://render.com/) para el hosting del sitio.
- [Node.js](https://nodejs.org/) (versión 20 o superior) y Git instalados localmente si deseas probar en local.

---

## 🚀 Paso a Paso: Replicación del Entorno CI/CD

### Paso 1: Instalación de Jenkins en Docker

1. **Crear una red de Docker** (opcional pero recomendado):
   ```bash
   docker network create jenkins-net
   ```

2. **Crear y ejecutar el contenedor de Jenkins**:
   Ejecuta el siguiente comando en tu terminal para levantar Jenkins persistiendo los datos en un volumen:

   ```bash
   docker run -d \
     --name jenkins-server \
     --restart unless-stopped \
     --network jenkins-net \
     -p 8080:8080 \
     -p 50000:50000 \
     -v jenkins_home:/var/jenkins_home \
     jenkins/jenkins:lts-jdk17
   ```

   * **`-p 8080:8080`**: Puerto para acceder a la interfaz web de Jenkins.
   * **`-p 50000:50000`**: Puerto para la comunicación con agentes de Jenkins.
   * **`-v jenkins_home:/var/jenkins_home`**: Volumen Docker para que la configuración no se pierda al reiniciar el contenedor.

3. **Obtener la clave de desbloqueo inicial**:
   ```bash
   docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
   ```
   Copia el token alfanumérico que aparece en la terminal.

4. **Instalación Inicial vía Web**:
   - Abre tu navegador en `http://localhost:8080`.
   - Pega la contraseña obtenida.
   - Selecciona **"Install suggested plugins"** (Instalar plugins recomendados).
   - Crea tu usuario administrador y finaliza la configuración inicial.

---

### Paso 2: Configuración de NodeJS en Jenkins

El pipeline compilará la aplicación Angular con `npm`, por lo que Jenkins necesita tener Node.js disponible:

1. Ve a **Manage Jenkins** (Administrar Jenkins) > **Plugins** > pestaña **Available plugins**.
2. Busca e instala el plugin **NodeJS Plugin**.
3. Reinicia Jenkins si es solicitado.
4. Una vez instalado, ve a **Manage Jenkins** > **Tools** (Herramientas).
5. Desplázate hasta la sección **NodeJS** y haz clic en **Add NodeJS**:
   - **Name**: `NodeJS-20` *(Nota: Debe coincidir exactamente con este nombre, ya que es el utilizado en el `Jenkinsfile`)*.
   - Marca la casilla **Install automatically**.
   - **Version**: Selecciona una versión de **NodeJS 20.x** (LTS).
6. Haz clic en **Save** (Guardar).

---

### Paso 3: Configuración de Webhook Relay

Dado que Jenkins se ejecuta en tu máquina local (`localhost:8080`), GitHub no puede enviarle notificaciones directamente. Webhook Relay genera una URL pública en internet y reenvía el tráfico a tu Jenkins local.

#### 3.1 Obtención de la URL en Webhook Relay
1. Ingresa a [Webhook Relay](https://webhookrelay.com/) e inicia sesión.
2. Ve a la sección **Buckets** y haz clic en **New Bucket** (o usa el Default):
   - Nómbralo, por ejemplo, `jenkins-github-relay`.
3. En la sección **Inputs**, Webhook Relay te proporcionará una **URL pública**, similar a:
   ```
   https://my-relay-subdomain.hooks.webhookrelay.com
   ```
   *Guarda esta URL, la usarás en GitHub.*
4. En la sección **Outputs** del mismo Bucket:
   - Configura el destino interno: `http://localhost:8080/github-webhook/`
5. Ve a **Access Tokens** en el panel de Webhook Relay y genera una nueva **Key** y **Secret**.

#### 3.2 Instalación del plugin Webhook Relay en Jenkins
1. En Jenkins, ve a **Manage Jenkins** > **Plugins** > **Available plugins**.
2. Busca e instala el plugin **Webhook Relay**.
3. Ve a **Manage Jenkins** > **System** > sección **Webhook Relay**:
   - Ingresa el **Key** y el **Secret** que obtuviste en Webhook Relay.
   - Asegúrate de que el bucket seleccionado sea el que creaste.
   - Guarda los cambios. El agente del plugin mantendrá la conexión abierta para recibir los eventos.

---

### Paso 4: Configuración del Webhook en GitHub

1. Entra a tu repositorio en [GitHub](https://github.com/).
2. Ve a **Settings** > **Webhooks** > **Add webhook**.
3. Llena los siguientes campos:
   - **Payload URL**: Pega la URL pública que te dio Webhook Relay (ejemplo: `https://my-relay-subdomain.hooks.webhookrelay.com`).
   - **Content type**: Selecciona `application/json`.
   - **Which events would you like to trigger this webhook?**: Selecciona **Just the push event** (Solo eventos de push).
   - **Active**: Asegúrate de que esté marcado.
4. Haz clic en **Add webhook**.
5. GitHub enviará un ping de prueba. Si todo está correcto, verás una marca verde junto al webhook.

---

### Paso 5: Configuración del Servicio y Deploy Hook en Render

1. Entra a [Render](https://render.com/) e inicia sesión.
2. Haz clic en **New +** y selecciona **Static Site**.
3. Conecta tu repositorio de GitHub.
4. Configura el servicio con los siguientes parámetros:
   - **Name**: `biblioteca-angular` (o el nombre que desees).
   - **Branch**: `main` (o tu rama de producción).
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist/biblioteca/browser` *(o `dist/biblioteca` según tu versión de Angular)*.
5. **IMPORTANTE - Desactivar Auto-Deploy**:
   - En la configuración del servicio en Render, desplázate a **Auto-Deploy** y márcalo como **No**.
   - *¿Por qué?* Queremos que el despliegue se realice **únicamente si Jenkins aprueba el build y las pruebas**, no directamente desde GitHub.
6. **Obtener el Deploy Hook**:
   - En el menú del servicio en Render, ve a **Settings**.
   - Busca la sección **Deploy Hook**.
   - Haz clic en **Create Deploy Hook** (o copia la URL generada).
   - La URL tendrá un formato como:
     ```
     https://api.render.com/deploy/srv-xxxxxxxxxxxxxxxx?key=yyyyyyyyyy
     ```
   - Guarda esta URL, la guardaremos de forma segura en Jenkins.

---

### Paso 6: Creación de Credenciales en Jenkins

Para proteger la URL del Deploy Hook de Render y evitar exponerla en el código público:

1. En Jenkins, ve a **Manage Jenkins** > **Credentials**.
2. Haz clic en el dominio **(global)** dentro de *Stores scoped to Jenkins*.
3. Haz clic en **Add Credentials** (Agregar credenciales):
   - **Kind**: Selecciona `Secret text`.
   - **Scope**: `Global (Jenkins, nodes, items, all child items, etc.)`.
   - **Secret**: Pega la URL completa del Deploy Hook de Render obtenida en el Paso 5.
   - **ID**: `RENDER_DEPLOY_HOOK` *(Nota: Debe coincidir exactamente con este nombre, ya que es el ID referenciado en el `Jenkinsfile`)*.
   - **Description**: `Render Deploy Hook URL para Biblioteca`.
4. Haz clic en **Create**.

---

### Paso 7: El archivo Jenkinsfile

El archivo [`Jenkinsfile`](./Jenkinsfile) ubicado en la raíz del repositorio define todo el ciclo de vida del pipeline como código:

```groovy
pipeline {
    agent any

    // Disparador automático por Webhook de GitHub
    triggers {
        githubPush()
    }

    // Herramienta NodeJS configurada previamente en Jenkins Tools
    tools {
        nodejs 'NodeJS-20'
    }

    stages {
        // Etapa 1: Clona el repositorio
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // Etapa 2: Instalación limpia y reproducible de dependencias
        stage('Install Dependencies') {
            steps {
                echo 'Instalando paquetes de npm...'
                sh 'npm ci'
            }
        }

        // Etapa 3: Compilación estricta para validar sintaxis y tipos
        stage('Build & Test') {
            steps {
                echo 'Compilando aplicación Angular para validar sintaxis y tipos...'
                sh 'npm run build -- --configuration=production'
            }
        }

        // Etapa 4: Notificación a Render solo si el build anterior pasó
        stage('Trigger Render Deploy') {
            steps {
                echo 'Notificando a Render para iniciar el despliegue...'
                withCredentials([string(credentialsId: 'RENDER_DEPLOY_HOOK', variable: 'RENDER_HOOK_URL')]) {
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
```

---

### Paso 8: Creación del Pipeline en Jenkins

1. En el panel principal de Jenkins, haz clic en **New Item** (Nueva Tarea).
2. Asigna un nombre (ej. `Biblioteca-Pipeline`), selecciona **Pipeline** y haz clic en **OK**.
3. En la pestaña **General**:
   - Puedes marcar **GitHub project** y poner la URL de tu repositorio (ej. `https://github.com/tu-usuario/biblioteca`).
4. En la sección **Build Triggers**:
   - Marca la casilla **GitHub hook trigger for GITScm polling**.
5. En la sección **Pipeline**:
   - **Definition**: Selecciona `Pipeline script from SCM`.
   - **SCM**: Selecciona `Git`.
   - **Repository URL**: Ingresa la URL de tu repositorio de GitHub (ej. `https://github.com/tu-usuario/biblioteca.git`).
   - **Credentials**: Si tu repositorio es privado, agrega tus credenciales de GitHub (con un Personal Access Token). Si es público, puedes dejarlo en `none`.
   - **Branch Specifier**: `*/main` (o la rama donde trabajes).
   - **Script Path**: `Jenkinsfile` (ruta al archivo en la raíz del proyecto).
6. Haz clic en **Save**.

---

## 🧪 Validación del Flujo Completo

Para comprobar que todo el sistema funciona de extremo a extremo:

1. Haz un cambio simple en tu código (por ejemplo, en `src/app/components/navbar/navbar.html`).
2. Sube el cambio a GitHub:
   ```bash
   git add .
   git commit -m "test: verificacion de pipeline CI/CD automatico"
   git push origin main
   ```
3. **Observa el proceso**:
   - En **Webhook Relay**: Verás el registro del evento `push` recibido desde GitHub y reenviado a Jenkins.
   - En **Jenkins**: El pipeline iniciará automáticamente:
     - Etapa `Checkout`: Descarga el commit.
     - Etapa `Install Dependencies`: Ejecuta `npm ci`.
     - Etapa `Build & Test`: Ejecuta la compilación de Angular en producción.
     - Etapa `Trigger Render Deploy`: Realiza la petición POST a Render con la credencial inyectada.
   - En **Render**: En el dashboard del servicio verás que un nuevo despliegue inicia automáticamente.
4. Si provocas un error intencional de sintaxis en TypeScript y haces `push`, Jenkins detendrá el pipeline en la etapa de compilación y **Render no desplegará**, protegiendo tu entorno de producción.

---

## 💻 Desarrollo Local con Angular

Si deseas correr o compilar el proyecto en tu máquina local sin usar Jenkins:

### Servidor de desarrollo
```bash
ng serve
```
Navega a `http://localhost:4200/`. La aplicación recarga automáticamente ante cualquier cambio.

### Compilar el proyecto
```bash
ng build
```
Los archivos de salida se almacenarán en la carpeta `dist/`.

### Ejecutar pruebas unitarias
```bash
ng test
```

---

## 🛠 Resolución de Problemas Comunes

| Síntoma | Posible Causa | Solución |
| :--- | :--- | :--- |
| **Jenkins no detecta el comando `node` o `npm`** | El nombre de la herramienta en Jenkins no coincide con el `Jenkinsfile`. | Verifica en *Manage Jenkins* > *Tools* que el nombre sea exactamente `NodeJS-20`. |
| **Error `curl: not found` en Jenkins** | La imagen base de Jenkins en Docker no tiene `curl` instalado. | Entra al contenedor como root (`docker exec -u 0 -it jenkins-server bash`) y ejecuta `apt-get update && apt-get install -y curl`. |
| **GitHub Webhook marca error 404 o timeout** | La URL del Webhook Relay está mal escrita o Jenkins está apagado. | Revisa en Webhook Relay que el output apunte a `http://localhost:8080/github-webhook/` con la barra diagonal final `/`. |
| **Falla en `withCredentials`** | El ID de la credencial en Jenkins no coincide. | Confirma que la credencial Secret text tenga exactamente el ID `RENDER_DEPLOY_HOOK`. |
| **Render no actualiza tras el build exitoso** | La URL del Deploy Hook copiada es inválida o expiró. | Genera un nuevo Deploy Hook en la pestaña *Settings* de Render y actualiza la credencial en Jenkins. |

---

> Hecho con ❤️ para la comunidad de desarrolladores y DevOps.
