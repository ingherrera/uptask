# Administración de Variables de Envío (30 de Marzo 2026)

En el archivo `.github/workflows/deploy.yml`, las variables de entorno se gestionan mediante GitHub Actions y se inyectan directamente en el servidor durante el proceso de despliegue.

## 1. Origen de los Datos
Se utilizan dos tipos de almacenamiento en GitHub:
- **`vars` (Variables):** Para datos no sensibles (`APP_PORT`, `FRONTEND_URL`). Configuración en *Settings > Secrets and variables > Actions > Variables*.
- **`secrets` (Secretos):** Para datos sensibles (`DATABASE_URL`, `JWT_SECRET`). Configuración en *Settings > Secrets and variables > Actions > Secrets*.

## 2. Proceso de Inyección (.env)
En el **Paso 8 ("Crear .env")**, el flujo de trabajo genera dinámicamente el archivo en el servidor:

```yaml
- name: Crear .env
  run: |
    cat <<EOF > .env
    PORT=${{ vars.APP_PORT }}
    DATABASE_URL=${{ secrets.DATABASE_URL }}
    FRONTEND_URL=${{ vars.FRONTEND_URL }}
    JWT_SECRET=${{ secrets.JWT_SECRET }}
    EOF
  working-directory: ${{ env.APP_DIR }}
```

## 3. Uso y Aplicación
- **Prisma:** En el **Paso 9**, `npx prisma migrate deploy` utiliza `DATABASE_URL` del archivo `.env` recién creado.
- **PM2:** En el **Paso 10**, se ejecuta `pm2 reload ecosystem.config.js --update-env` para forzar a la aplicación Node.js a cargar las nuevas variables de entorno.

## Conclusión
El flujo garantiza que el servidor siempre tenga un archivo `.env` actualizado con los valores definidos en GitHub, manteniendo la seguridad de los secretos y permitiendo cambios rápidos en la configuración sin modificar el código fuente.
