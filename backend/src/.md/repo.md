## **Arquitectura del Proyecto**

Aplicación de backend para un sistema de gestión de proyectos (similar a Trello o Jira), construida con tecnologías modernas y siguiendo un patrón arquitectónico bien definido y organizado.

### **Resumen General**

La arquitectura del proyecto es una **API RESTful en capas**, construida sobre **Node.js** con el framework **Express.js** y escrita en **TypeScript**. Utiliza **Prisma** como ORM (Object-Relational Mapping) para interactuar con una base de datos **MySQL**. La estructura está claramente diseñada para la **separación de responsabilidades**, lo que la hace mantenible y escalable.

---

### **Tecnologías Principales**

*   **Entorno de ejecución:** Node.js
*   **Framework web:** Express.js
*   **Lenguaje:** TypeScript
*   **ORM y Base de Datos:** Prisma con una base de datos MySQL.
*   **Autenticación:** JSON Web Tokens (JWT).
*   **Validación de datos:** `express-validator`.
*   **Manejo de contraseñas:** `bcrypt` para el hasheo.
*   **Envío de correos:** `Nodemailer` para notificaciones (confirmación de cuenta, reseteo de contraseña).
*   **CORS:** `cors` para permitir peticiones desde el frontend.

---

### **Estructura del Proyecto y Patrón Arquitectónico**

El proyecto sigue un patrón de **arquitectura en capas**, muy común en aplicaciones Express, que se puede asemejar a un patrón **MVC (Modelo-Vista-Controlador)**, pero adaptado para una API REST (donde no hay "Vistas" renderizadas en el servidor).

Las capas principales son:

1.  **Capa de Ruteo (`src/routes`)**: Define los endpoints de la API.
2.  **Capa de Middleware (`src/middleware`)**: Intercepta las peticiones para realizar tareas comunes.
3.  **Capa de Controladores (`src/controllers`)**: Contiene la lógica de negocio de la aplicación.
4.  **Capa de Modelo/Datos (Prisma)**: Abstrae la interacción con la base de datos.
5.  **Capa de Utilidades y Servicios (`src/utils`, `src/config`, `src/emails`)**: Contiene código de soporte y configuración.

A continuación, se detalla cada capa:

#### 1. **Capa de Ruteo (`src/routes`)**

*   **Ubicación:** `src/routes/`
*   **Archivos clave:** `authRoutes.ts`, `projectRoutes.ts`.
*   **Responsabilidad:** Definir las rutas de la API (e.g., `POST /api/auth/create-account`, `GET /api/projects/:projectId`). Cada ruta está asociada a uno o más middlewares y a un método del controlador que se encargará de procesar la solicitud.
*   **Ejemplo:** En `projectRoutes.ts`, la ruta `POST /:projectId/tasks` está protegida por el middleware `hasAuthorization` y luego es manejada por `TaskController.createTask`. También utiliza `express-validator` para validar los datos de entrada (`body("name").notEmpty()`).

#### 2. **Capa de Middleware (`src/middleware`)**

*   **Ubicación:** `src/middleware/`
*   **Archivos clave:** `auth.ts`, `project.ts`, `task.ts`, `validation.ts`.
*   **Responsabilidad:** Realizar tareas transversales (cross-cutting concerns) antes de que la petición llegue al controlador.
    *   `auth.ts`: Middleware `authenticate` que verifica el JWT enviado en los headers, decodifica la información del usuario y la adjunta al objeto `req` (`req.user`). Protege las rutas que requieren autenticación.
    *   `project.ts` y `task.ts`: Verifican que los recursos (proyectos, tareas) existan en la base de datos a través de su ID en la URL. Si existen, los adjuntan a `req` (`req.project`, `req.task`) para que los siguientes middlewares o controladores puedan usarlos.
    *   `validation.ts`: `handleInputErrors` recopila los errores de validación de `express-validator` y, si los hay, detiene el flujo y responde con un error 400.

#### 3. **Capa de Controladores (`src/controllers`)**

*   **Ubicación:** `src/controllers/`
*   **Archivos clave:** `AuthController.ts`, `ProjectController.ts`, `TaskController.ts`, etc.
*   **Responsabilidad:** Es el "cerebro" de la aplicación. Orquesta la lógica de negocio. Recibe la petición (ya validada y enriquecida por los middlewares), interactúa con la capa de datos (Prisma) para leer o escribir información, y finalmente envía una respuesta al cliente (JSON o un mensaje de estado).
*   **Ejemplo:** `ProjectController.createProject` recibe los datos del proyecto desde `req.body` y el ID del usuario desde `req.user`, y luego llama a `prisma.project.create()` para guardar el nuevo proyecto en la base de datos.

#### 4. **Capa de Modelo/Datos (Prisma)**

*   **Ubicación:** `prisma/`
*   **Archivos clave:** `schema.prisma`.
*   **Responsabilidad:** Definir el esquema de la base de datos y gestionar todas las interacciones con ella.
    *   `schema.prisma` es la **única fuente de verdad** para los modelos de datos (`User`, `Project`, `Task`, `Note`, `Team`, etc.) y sus relaciones.
    *   El cliente de Prisma (`@prisma/client`), importado desde `src/config/db.ts`, proporciona una API tipada y segura para realizar operaciones CRUD (Crear, Leer, Actualizar, Borrar) sin escribir SQL directamente. Por ejemplo: `prisma.user.findUnique({ where: { email } })`.

#### 5. **Capa de Utilidades y Servicios**

*   **Ubicación:** `src/utils/`, `src/config/`, `src/emails/`
*   **Responsabilidad:** Proveer funcionalidades de soporte y configuración reutilizables.
    *   `src/config/`: Configuración de la base de datos (`db.ts`), CORS (`cors.ts`) y el transportador de correo (`nodemailer.ts`).
    *   `src/utils/`: Funciones auxiliares como `hashPassword` y `checkPassword` (`auth.ts`), generación de tokens (`jwt.ts`, `token.ts`).
    *   `src/emails/`: Lógica encapsulada para enviar correos electrónicos específicos, como el de confirmación de cuenta (`AuthEmail.sendConfirmationEmail`).

---

### **Flujo de una Petición (Ejemplo: Crear una tarea)**

Para entender cómo interactúan las capas, sigamos una petición `POST /api/projects/1/tasks`:

1.  **Entrada:** La petición llega al servidor (`server.ts`).
2.  **Middleware Global:** Se aplica el middleware de `cors`.
3.  **Ruteo:** El router de Express dirige la petición a `projectRoutes.ts`.
4.  **Middleware de Autenticación:** El middleware `router.use(authenticate)` se ejecuta primero, validando el JWT del usuario.
5.  **Middleware de Parámetro (`:projectId`):** El middleware `router.param("projectId", projectExists)` se activa. Busca el proyecto con ID `1`. Si existe, lo añade a `req.project`.
6.  **Middleware de Autorización y Validación:** La ruta específica tiene el middleware `hasAuthorization` (que verifica si `req.user.id` es el manager del proyecto) y los validadores de `express-validator` para el `name` y `description` de la tarea.
7.  **Controlador:** Si todo lo anterior pasa, se ejecuta `TaskController.createTask(req, res)`.
8.  **Lógica de Negocio:** El controlador extrae los datos del `body` y el `projectId` de `req.project.id`.
9.  **Capa de Datos:** Llama a `prisma.task.create()` para insertar la nueva tarea en la base de datos, asociándola al proyecto.
10. **Respuesta:** El controlador envía una respuesta JSON con la tarea creada y un estado 200 (o 201).

### **Conclusión**

El proyecto tiene una **arquitectura sólida, limpia y bien organizada**. La clara separación de responsabilidades entre rutas, middlewares, controladores y el modelo de datos (manejado por Prisma) hace que el código sea:

*   **Fácil de entender y mantener:** Sabes exactamente dónde buscar para modificar una ruta, una regla de negocio o un modelo de datos.
*   **Escalable:** Es sencillo añadir nuevas funcionalidades (e.g., un nuevo recurso como "Facturas") creando su propio conjunto de archivos de ruta, controlador y actualizando el `schema.prisma`.
*   **Seguro:** Centraliza la lógica de autenticación y autorización en middlewares, evitando la duplicación de código y posibles vulnerabilidades.
*   **Robusto:** El uso de TypeScript y la validación de entradas previene muchos errores comunes en tiempo de ejecución.

## Logica de Negocio
La lógica se centra en un sistema de gestión de proyectos con roles bien definidos para usuarios, proyectos, tareas y notas.

La aplicación está construida con Node.js, Express y Prisma como ORM para una base de datos MySQL. 

A continuación, se detalla el funcionamiento de cada componente principal:

### 1. Gestión de Usuarios y Autorización

Este es el pilar de la seguridad y los permisos de la aplicación. Todo gira en torno a un usuario autenticado.

**Flujo de Autenticación y Registro:**
1.  **Creación de Cuenta (`/api/auth/create-account`):**
    *   Un nuevo usuario se registra con su nombre, email y contraseña.
    *   El sistema verifica que el email no esté ya en uso.
    *   La contraseña se "hashea" (cifra) usando `bcrypt` antes de guardarla para mayor seguridad.
    *   Se crea un **Token de confirmación** numérico de 6 dígitos. Este token se guarda en la base de datos, asociado al ID del nuevo usuario y con una fecha de expiración de 10 minutos.
    *   El usuario se crea con el estado `confirmed: false`.
    *   Se envía un email al usuario con el token para que confirme su cuenta.

2.  **Confirmación de Cuenta (`/api/auth/confirm-account`):**
    *   El usuario introduce el token que recibió por email.
    *   El sistema busca el token en la base de datos. Si existe y no ha expirado, actualiza el estado del usuario a `confirmed: true` y elimina el token.
    *   El usuario ya puede iniciar sesión.

3.  **Inicio de Sesión (Login) (`/api/auth/login`):**
    *   El usuario introduce su email y contraseña.
    *   El sistema verifica:
        *   Que el usuario exista.
        *   Que la cuenta esté confirmada (`confirmed: true`). Si no lo está, le envía un nuevo email de confirmación y le deniega el acceso.
        *   Que la contraseña sea correcta, comparándola con la versión "hasheada" en la base de datos.
    *   Si todo es correcto, se genera un **JSON Web Token (JWT)**. Este JWT contiene el `id` del usuario y tiene una validez de 180 días. Este token se envía al cliente (frontend).

**Autorización en Rutas Protegidas:**
*   El JWT es la "llave" para acceder a las partes seguras de la API (casi todas, excepto el registro y login).
*   El cliente debe enviar este JWT en la cabecera `Authorization` de cada petición (Ej: `Authorization: Bearer <token>`).
*   El middleware `authenticate` (`src/middleware/auth.ts`) se ejecuta en cada ruta protegida. Este intercepta el token, lo verifica y, si es válido, busca al usuario en la base de datos y adjunta su información a la petición (`req.user`).
*   Si el token no es válido o no se proporciona, el acceso es denegado con un error 401 (No Autorizado).

---

### 2. Gestión de Proyectos (Projects)

Los proyectos son los contenedores principales de trabajo. Tienen un propietario claro (manager) y pueden tener colaboradores.

**Reglas de Negocio Clave:**
*   **Un proyecto tiene un único "Manager"**: La persona que crea el proyecto es su manager.
*   **Un proyecto puede tener un "Equipo" (Team)**: El manager puede agregar a otros usuarios como colaboradores.
*   **Permisos diferenciados**: El manager tiene control total. Los colaboradores tienen permisos limitados.

**Operaciones:**
1.  **Crear un Proyecto (`POST /api/projects/`):**
    *   Requiere un usuario autenticado.
    *   El `manager` del proyecto se asigna automáticamente al `id` del usuario que realiza la petición (`req.user.id`).

2.  **Obtener Proyectos (`GET /api/projects/`):**
    *   Un usuario no ve todos los proyectos del sistema.
    *   La consulta a la base de datos está diseñada para devolver solo los proyectos donde el usuario es **el manager** O **forma parte del equipo (Team)**.

3.  **Ver Detalles de un Proyecto (`GET /api/projects/:projectId`):**
    *   Solo el **manager** o un **miembro del equipo** de ese proyecto específico puede ver sus detalles (incluyendo sus tareas y equipo).
    *   Si un usuario intenta acceder a un proyecto al que no pertenece, recibirá un error.

4.  **Actualizar y Eliminar un Proyecto (`PUT` y `DELETE /api/projects/:projectId`):**
    *   Estas acciones son **exclusivas del manager**. El middleware `hasAuthorization` (`src/middleware/task.ts`) verifica que `req.user.id` sea igual a `req.project.manager`.
    *   Un colaborador, aunque sea parte del equipo, no puede editar la información del proyecto ni eliminarlo.
    *   **Importante:** Gracias a la configuración `onDelete: Cascade` en `prisma/schema.prisma`, cuando un manager elimina un proyecto, la base de datos elimina automáticamente en cascada todas sus tareas, las notas de esas tareas y los registros del equipo.

5.  **Gestión del Equipo (`/api/projects/:projectId/team/...`):**
    *   El manager puede buscar usuarios por email para agregarlos al proyecto.
    *   Puede agregar y eliminar miembros del equipo. Los colaboradores no tienen este permiso.

---

### 3. Gestión de Tareas (Tasks)

Las tareas viven dentro de un proyecto y representan unidades de trabajo específicas.

**Reglas de Negocio Clave:**
*   Una tarea siempre pertenece a un único proyecto.
*   El manager tiene control sobre la creación y eliminación, pero el equipo puede interactuar con el estado de las tareas.

**Operaciones:**
1.  **Crear una Tarea (`POST /api/projects/:projectId/tasks`):**
    *   Esta acción es **exclusiva del manager** del proyecto (reforzado por el middleware `hasAuthorization`).
    *   La tarea se asocia automáticamente al proyecto a través del `projectId` de la URL.

2.  **Obtener Tareas de un Proyecto (`GET /api/projects/:projectId/tasks`):**
    *   Cualquier persona que tenga acceso al proyecto (manager o colaborador) puede ver la lista de tareas.

3.  **Actualizar y Eliminar una Tarea (`PUT` y `DELETE .../:taskId`):**
    *   Al igual que la creación, estas acciones son **exclusivas del manager**. Un colaborador no puede cambiar el nombre o la descripción de una tarea, ni eliminarla.
    *   Si se elimina una tarea, sus notas asociadas se eliminan en cascada (`onDelete: Cascade`).

4.  **Cambiar el Estado de una Tarea (`POST .../:taskId/status`):**
    *   **Esta es una regla de negocio crucial y diferente**: **CUALQUIER** miembro del equipo (incluido el manager) puede cambiar el estado de una tarea (de `pending` a `inProgress`, etc.). Esta ruta no usa el middleware `hasAuthorization`.
    *   Cada vez que se cambia el estado, se crea un registro en la tabla `TaskStatusHistory`. Este registro guarda qué tarea cambió, a qué estado nuevo, y **qué usuario** (`req.user.id`) realizó el cambio. Esto crea un historial de auditoría muy útil.

---

### 4. Gestión de Notas (Notes)

Las notas son comentarios o registros que se pueden añadir a una tarea específica, permitiendo la comunicación dentro del equipo.

**Reglas de Negocio Clave:**
*   Una nota siempre pertenece a una tarea y es creada por un usuario.
*   Cualquier miembro del equipo puede comentar, pero solo el autor puede borrar su propio comentario.

**Operaciones:**
1.  **Crear una Nota (`POST .../tasks/:taskId/notes`):**
    *   **Cualquier miembro del equipo** del proyecto (o el manager) puede añadir una nota a una tarea.
    *   La nota se asocia con el `taskId` y el `userId` del autor (`req.user.id`).

2.  **Obtener Notas de una Tarea (`GET .../tasks/:taskId/notes`):**
    *   Cualquier miembro del equipo puede ver todas las notas de una tarea, junto con el nombre del autor de cada una.

3.  **Eliminar una Nota (`DELETE .../notes/:noteId`):**
    *   **Regla de negocio muy específica**: Solo el usuario que **originalmente creó la nota** puede eliminarla. El `NoteController.deleteNote` contiene una verificación explícita: `if (note.userId !== req.user.id)`.
    *   Esto significa que ni otros colaboradores ni siquiera el manager del proyecto pueden borrar una nota que no escribieron.

### Resumen de la Lógica de Permisos

| Acción | Manager | Colaborador de Equipo |
| :--- | :---: | :---: |
| **Proyectos** | | |
| Crear Proyecto | ✅ | ❌ |
| Ver Proyectos (propios/colabora) | ✅ | ✅ |
| Editar/Eliminar Proyecto | ✅ | ❌ |
| Añadir/Quitar Miembros | ✅ | ❌ |
| **Tareas** | | |
| Crear Tarea | ✅ | ❌ |
| Ver Tareas | ✅ | ✅ |
| Editar/Eliminar Tarea | ✅ | ❌ |
| Cambiar Estado de Tarea | ✅ | ✅ |
| **Notas** | | |
| Crear Nota en Tarea | ✅ | ✅ |
| Ver Notas de Tarea | ✅ | ✅ |
| Eliminar **propia** Nota | ✅ | ✅ |
| Eliminar Nota de **otro** | ❌ | ❌ |