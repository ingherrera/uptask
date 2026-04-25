# Resumen de Conversación: Estrategia de CI/CD con Ansible y GitHub Runner

## 1. Análisis Inicial de Ansible
Se revisaron los archivos `ansible/aprov.yml` y `ansible/conf.yml`. Se confirmó que Ansible está correctamente configurado para:
- Instalar las dependencias de sistema (Node.js, MariaDB, Nginx, PM2).
- Descargar y configurar el **GitHub Runner** como un servicio del sistema.
- Registrar el Runner en el repositorio de GitHub mediante un PAT (Personal Access Token).

## 2. Diagnóstico del Workflow de GitHub Actions
Al revisar `.github/workflows/ci.yml`, se identificó que el proceso de despliegue estaba dividido:
- GitHub Actions hacía el *build* en la carpeta del Runner.
- Se usaba `rsync` para mover solo la carpeta `dist/`.
- **Riesgo Detectado:** Las dependencias (`node_modules`) en la carpeta de producción (`/var/www/upTaskBackend`) podían quedar desactualizadas si se agregaban nuevas librerías al proyecto, ya que el workflow no las sincronizaba.

## 3. Propuesta de Mejora: Enfoque GitOps con Ansible
Se acordó centralizar toda la lógica de despliegue en Ansible para asegurar consistencia total. El flujo final propuesto es:
1. El usuario hace `git push` a la rama `main`.
2. El GitHub Runner detecta el cambio y dispara el Workflow.
3. El Workflow ejecuta un comando de Ansible localmente en el VPS.
4. Ansible se encarga de:
   - Actualizar el código fuente.
   - Instalar dependencias.
   - Generar el archivo `.env` con secretos de GitHub.
   - Construir el proyecto (`npm run build`).
   - Reiniciar la aplicación con PM2.

## 4. Implementación Refinada (Playbook con Tags)
Se reestructuró `ansible/conf.yml` organizando las tareas por bloques numerados y añadiendo **tags** para optimizar el tiempo de ejecución.

### Estructura de Tags en Ansible:
- `setup`: Configuración inicial de usuarios.
- `db`: Gestión de base de datos MariaDB.
- `nginx`: Configuración del proxy inverso.
- `deploy`: **(Principal)** Tareas que se ejecutan en cada push (Git, NPM, Build, PM2).

### Nuevo Workflow de GitHub (`.github/workflows/ci.yml`):
```yaml
name: Deploy con Ansible
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: self-hosted
    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4
      - name: Ejecutar Despliegue (Solo tareas de Deploy)
        run: |
          ansible-playbook ansible/conf.yml \
            --connection=local \
            --limit localhost \
            --tags deploy \
            -e "app_db_url='${{ secrets.DATABASE_URL }}'" \
            -e "app_frontend_url='${{ secrets.FRONTEND_URL }}'" \
            -e "app_jwt_secret='${{ secrets.JWT_SECRET }}'" \
            -e "github_user='${{ github.repository_owner }}'" \
            -e "github_repo='${{ github.event.repository.name }}'"
```

## 5. Próximos Pasos
- Verificar que Ansible esté instalado en el VPS (`sudo apt install ansible`).
- Configurar los Secretos en GitHub (Settings -> Secrets -> Actions).
- Realizar un `git push` para probar la automatización completa.
