# Resumen Final de Arquitectura y Despliegue - 20 de Marzo

## 1. Arquitectura de la Solución
Hemos implementado un modelo de **Separación de Responsabilidades** (Separation of Concerns):

*   **Infraestructura (Ansible):** Prepara la VPS desde cero (Node.js, MariaDB, Nginx, Firewall y GitHub Runner). Solo se ejecuta cuando hay cambios en el servidor físico.
*   **Aplicación (GitHub Actions):** Gestiona el ciclo de vida del código (Push -> Build -> Deploy). Se ejecuta automáticamente en cada `git push` a la rama `main`.

## 2. Hallazgos Técnicos y Soluciones

### Conflicto de Red (Doble IP)
*   **Problema:** La interfaz `enp1s0` mostraba dos IPs (`.160` y `.165`).
*   **Causa:** Conflicto entre la configuración de Ansible y los archivos predeterminados de Ubuntu (`cloud-init`).
*   **Solución:** Se sincronizó la IP a `.165` en `all.yml`, se eliminaron los archivos de `cloud-init` y se estandarizó el uso de `netplan apply` en los handlers de Ansible.

### Error de Base de Datos (Prisma P2021/P1000)
*   **P2021:** Tablas inexistentes. Se solucionó añadiendo `npx prisma migrate deploy` al flujo de despliegue.
*   **P1000:** Error de autenticación. Se corrigió sincronizando las credenciales de MariaDB creadas por Ansible con los **GitHub Secrets** (`DATABASE_URL`).

### Desajuste de Rutas en PM2 (El problema del mensaje "v2")
*   **Problema:** Al actualizar el código, se seguía viendo la versión antigua.
*   **Causa:** PM2 seguía ejecutando el código desde la carpeta de Ansible (`/var/www`) en lugar de la carpeta del Runner.
*   **Solución:** Se modificó `ecosystem.config.js` para usar rutas relativas (`cwd: "./"`) y se "reseteó" PM2 en la VPS (`pm2 delete all && pm2 save`).

## 3. Flujo de Despliegue Profesional (`ci.yml`)
El nuevo archivo de GitHub Actions incluye optimizaciones de alto nivel:
1.  **Detección de Cambios Inteligente:** Solo ejecuta `npm install` si cambian los archivos `package.json` o `package-lock.json`.
2.  **Seguridad Dinámica:** Genera el archivo `.env` en cada despliegue usando los secretos de GitHub.
3.  **Migraciones Automáticas:** Prisma actualiza la base de datos antes de reiniciar la app.
4.  **Arranque Robusto:** Usa `pm2 startOrReload` para asegurar que la app siempre esté online.
5.  **Logs en Tiempo Real:** Muestra el estado de PM2 y los últimos logs directamente en la interfaz de GitHub para facilitar el debugging sin entrar a la VPS.

## 4. Estado de Conexión
*   **URL de la API:** `http://192.168.122.165/api/` (Puerto 80 gestionado por Nginx).
*   **Puerto 4000:** Protegido por Firewall, solo accesible internamente por Nginx.

---
**Nota:** El sistema ahora es totalmente autónomo. Cualquier cambio en el código local se reflejará en la VPS simplemente haciendo un `git push`.
