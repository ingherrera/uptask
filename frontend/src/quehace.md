## Enrutador y Autenticación

En resumen, el enrutador define una serie de páginas que cubren todo el ciclo de vida de la autenticación de un usuario, desde su creación hasta el inicio de sesión y la recuperación de su cuenta, separando cada paso en un componente de vista específico.

## DashboardView

Este componente es, en esencia, el panel de control principal para un usuario que ha iniciado sesión. Su propósito es mostrarle un resumen de todos los proyectos en los que participa y darle las herramientas para gestionarlos.

### 1. Propósito General

La `DashboardView` es la primera pantalla que ve un usuario tras autenticarse. Actúa como su centro de operaciones, permitiéndole ver sus proyectos de un vistazo y acceder a acciones clave como crear, editar o eliminar un proyecto.

### 2. Obtención de Datos (El motor: React Query)

El componente es dinámico y se basa en datos del servidor. Así es como los obtiene:

- **Obtiene el Usuario Actual:** Primero, usa el hook `useAuth()` para obtener los datos del usuario que ha iniciado sesión. Esto es crucial para saber quién es y qué permisos tiene.
- **Obtiene los Proyectos:** Utiliza el hook `useQuery` de **TanStack Query** para buscar todos los proyectos del usuario.
  - `queryFn: getAllProjects`: Llama a la función `getAllProjects` (definida en `src/api/ProjectAPI.ts`) que es la encargada de hacer la petición a la API del backend.
  - `isLoading`: Mientras `useQuery` espera la respuesta del servidor, la variable `isLoading` es `true`, y el componente muestra un simple texto de "Cargando...". Esto mejora la experiencia de usuario, ya que no ve una pantalla vacía o rota.
  - `data`: Una vez que se reciben los datos, se guardan en la variable `data`, que contiene un array con todos los proyectos.

### 3. Renderizado de la Interfaz (Lo que ve el usuario)

La vista es inteligente y se adapta según si el usuario tiene proyectos o no.

- **Si NO hay proyectos:**
  - Muestra un mensaje amigable: "No hay proyectos aún".
  - Inmediatamente después, muestra un enlace (`<Link>`) con el texto "Crear Proyecto" para guiar al usuario sobre cuál es el siguiente paso lógico.

- **Si SÍ hay proyectos:**
  - Muestra un título (`Mis Proyectos`) y un botón grande de "Nuevo Proyecto" en la parte superior para un acceso rápido.
  - Renderiza una lista (`<ul>`) donde cada elemento (`<li>`) es una "tarjeta" de proyecto.
  - Cada tarjeta muestra la información clave del proyecto: **Nombre**, **Cliente** y **Descripción**.

### 4. Roles y Permisos (La parte inteligente)

Esta es una de las funcionalidades más importantes de la vista. No todos los usuarios pueden hacer lo mismo.

- **Identificación de Rol:** Para cada proyecto en la lista, utiliza la función `isManager(user.id, project.manager)` para comprobar si el usuario actual es el **"Manager"** (administrador) de ese proyecto.
- **Interfaz Adaptativa:**
  1. **Etiqueta Visual:** Muestra una etiqueta de color que dice **"Manager"** o **"Colaborador"** en cada proyecto, para que el usuario sepa de inmediato cuál es su rol.
  2. **Acciones Condicionales:** El menú de opciones de cada proyecto (el icono de tres puntos) solo muestra las opciones "Editar Proyecto" y "Eliminar Proyecto" si el usuario es el **Manager**. Esto impide que un colaborador pueda modificar o borrar un proyecto por accidente o sin permiso.

### 5. Acciones sobre Proyectos (El Menú de Opciones)

Cada proyecto tiene un menú desplegable (creado con la librería **HeadlessUI** para una mejor accesibilidad) que permite realizar acciones:

- **Ver Proyecto:** Un enlace que lleva al detalle del proyecto (`/projects/${project.id}`).
- **Editar Proyecto (Solo Managers):** Un enlace que lleva al formulario de edición (`/projects/${project.id}/edit`).
- **Eliminar Proyecto (Solo Managers):** Un botón que, de una forma ingeniosa, no elimina el proyecto directamente. En su lugar, cambia la URL y le añade un parámetro (`?deleteProject=${project.id}`). Esto activa el componente `<DeleteProjectModal />`, que se encarga de mostrar la ventana de confirmación para evitar borrados accidentales.

### En Resumen

La `DashboardView` es un componente robusto y bien diseñado que sirve como un panel de control centralizado. No solo muestra datos, sino que también gestiona estados de carga, se adapta a si hay datos o no, y lo más importante, implementa una lógica de permisos para mostrar una interfaz diferente y acciones específicas según el rol del usuario en cada proyecto.