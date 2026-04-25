
# Análisis del Proyecto: UpTask Backend

Este documento resume la lógica de negocio, las operaciones de la API y el flujo de autorización del proyecto UpTask.

---

## 1. Lógica de Negocio General

Este proyecto es un backend para una aplicación de gestión de proyectos, construido con **Node.js**, **Express** y **TypeScript**. La base de datos es **MySQL**, gestionada con el ORM **Prisma**.

### Modelos de Datos (Entidades Principales)

La estructura de la base de datos (`prisma/schema.prisma`) revela la lógica central:

*   **User (Usuario):**
    *   Entidad central con `email`, `password` (hasheado), `name` y un estado de `confirmed`.
    *   Un usuario puede ser **manager** de `Project` (proyectos).
    *   Puede ser miembro de `Team` (equipos de trabajo).
    *   Puede crear `Note` (notas) en las tareas.

*   **Project (Proyecto):**
    *   Contenedor principal con `projectName`, `clientName` y `description`.
    *   Tiene un único **manager** (un `User`).
    *   Contiene múltiples `Task` (tareas).
    *   Tiene un `Team` de colaboradores.

*   **Task (Tarea):**
    *   Pertenece a un `Project`.
    *   Tiene `name`, `description` y un `status` (`pending`, `onHold`, `inProgress`, `underReview`, `completed`).
    *   Se le pueden añadir `Note` (notas).

*   **Team (Equipo):**
    *   Tabla intermedia que relaciona `User` y `Project` para gestionar colaboradores.

*   **Note (Nota):**
    *   Comentarios que un `User` puede añadir a una `Task`.

*   **Token:**
    *   Se usan para la confirmación de cuentas y reseteo de contraseñas, con fecha de expiración.

*   **TaskStatusHistory (Historial de Estado de Tarea):**
    *   Registra cada cambio de estado de una `Task`, guardando qué `User` hizo el cambio.

### Resumen de Funcionalidades

*   **Autenticación y Usuarios (`AuthController`):**
    *   Registro con confirmación por email.
    *   Login con JWT (JSON Web Token).
    *   Recuperación de contraseña.
    *   Gestión de perfil de usuario.

*   **Gestión de Proyectos (`ProjectController`):**
    *   Creación, listado, actualización y eliminación de proyectos.
    *   Un usuario puede ver todos los proyectos donde es manager o colaborador.

*   **Gestión de Tareas (`TaskController`):**
    *   Creación, listado, actualización y eliminación de tareas dentro de un proyecto.
    *   Cambio de estado de las tareas.

*   **Colaboradores y Equipos (`TeamMemberController`):**
    *   El manager puede añadir o eliminar colaboradores de un proyecto buscándolos por email.

*   **Notas en Tareas (`NoteController`):**
    *   Los miembros del proyecto pueden añadir y eliminar notas en las tareas.

---

## 2. Detalle de Proyectos y su Enlace con Tareas

La relación entre `Project` y `Task` es el núcleo de la aplicación.

### Enlace a Nivel de Base de Datos

La relación es de **uno a muchos**: un `Project` tiene muchas `Task`, y una `Task` pertenece a un solo `Project`.

```prisma
// En el modelo Project
model Project {
  Tasks Task[] @relation("Project-Tasks")
}

// En el modelo Task
model Task {
  projectId Int
  project   Project @relation("Project-Tasks", fields: [projectId], references: [id], onDelete: Cascade)
}
```

La opción `onDelete: Cascade` es fundamental: **si se elimina un proyecto, todas sus tareas asociadas se eliminan automáticamente**, manteniendo la integridad de los datos.

### Operaciones Detalladas de los Proyectos (API Endpoints)

#### 1. Crear un Nuevo Proyecto
*   **Endpoint:** `POST /api/projects/`
*   **Descripción:** Un usuario autenticado crea un proyecto y se convierte en su **manager**.
*   **Datos Requeridos:** `projectName`, `clientName`, `description`.

#### 2. Obtener Todos los Proyectos de un Usuario
*   **Endpoint:** `GET /api/projects/`
*   **Descripción:** Devuelve los proyectos donde el usuario es **manager** o **colaborador**.

#### 3. Obtener un Proyecto Específico por su ID
*   **Endpoint:** `GET /api/projects/:projectId`
*   **Descripción:** Devuelve los detalles de un proyecto, incluyendo **todas sus tareas (`Tasks`) y miembros del equipo (`Team`)**.
*   **Autorización:** Solo para el manager o colaboradores del proyecto.

#### 4. Actualizar un Proyecto
*   **Endpoint:** `PUT /api/projects/:projectId`
*   **Descripción:** Modifica los detalles de un proyecto.
*   **Autorización:** Solo para el **manager** del proyecto.

#### 5. Eliminar un Proyecto
*   **Endpoint:** `DELETE /api/projects/:projectId`
*   **Descripción:** Elimina un proyecto y, gracias a `onDelete: Cascade`, **todas sus tareas, notas y registros de equipo asociados**.
*   **Autorización:** Solo para el **manager** del proyecto.

---

## 3. Flujo de Trabajo de Autorización

El sistema utiliza un enfoque en capas con **middleware** de Express para garantizar la seguridad.

**Distinción Clave:**
*   **Autenticación:** ¿Quién eres? (Verificar identidad).
*   **Autorización:** ¿Qué tienes permitido hacer? (Verificar permisos).

### Flujo Paso a Paso (Ejemplo: `PUT /api/projects/:projectId`)

1.  **Petición del Usuario:** El frontend envía una petición `PUT` a `/api/projects/123` incluyendo el **JWT** en la cabecera `Authorization`.

2.  **Middleware `authenticate` (1er Guardián):**
    *   **Misión:** Autenticación.
    *   Verifica que el JWT sea válido.
    *   Extrae el ID del usuario del token.
    *   Busca al usuario en la base de datos.
    *   **Adjunta el objeto de usuario a la petición (`req.user`)**.
    *   Si falla, rechaza la petición (Error 401). Si tiene éxito, pasa al siguiente guardián.

3.  **Middleware `projectExists`:**
    *   **Misión:** Verificar que el recurso existe.
    *   Comprueba si un proyecto con el `:projectId` de la URL existe en la base de datos.
    *   Si existe, **adjunta el objeto del proyecto a la petición (`req.project`)**.

4.  **Middleware `hasAuthorization` (2do Guardián):**
    *   **Misión:** Autorización.
    *   Compara el ID del usuario que hace la petición con el ID del manager del proyecto: `req.user.id === req.project.manager`.
    *   Si no coinciden, rechaza la petición (Error 401).
    *   Si coinciden, permite que la petición continúe.

5.  **Controlador `ProjectController.updateProject` (Destino Final):**
    *   Recibe la petición, que ya ha sido validada y autorizada.
    *   Ejecuta la lógica de negocio (actualizar la base de datos) con la confianza de que el usuario tiene los permisos necesarios.

Este flujo garantiza la **separación de responsabilidades**, la **reutilización de código** y una **alta seguridad**, ya que la lógica de negocio en los controladores permanece limpia de comprobaciones de permisos.
