import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import { taskExists, taskBelongProject, hasAuthorization } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamMemberController";
import { NoteController } from "../controllers/NoteController";

const router = Router();

router.use(authenticate);

router.param("projectId", projectExists);

router.post(
  "/",
  body("projectName").notEmpty().withMessage("El Nombre del Proyecto es Obligatorio"),
  body("clientName").notEmpty().withMessage("El Nombre del Cliente es Obligatorio"),
  body("description").notEmpty().withMessage("La Descripción del Proyecto es Obligatoria"),
  handleInputErrors,
  ProjectController.createProject
);

// Mostrar todos los Proyectos
router.get(
  "/",
  ProjectController.getAllProjects);

router.get(
  // "/:id",
  "/:projectId",
  // param('id').isUUID().withMessage("ID no válido"),
  param("projectId").isInt().withMessage("El ID del proyecto debe ser un número"),
  handleInputErrors,
  ProjectController.getProjectById
);


//  Actualizar un Proyecto usando su Id
router.put(
  "/:projectId",
  param("projectId").isInt().withMessage("El ID del proyecto debe ser un número"),
  body("projectName").notEmpty().withMessage("El Nombre del Proyecto es Obligatorio"),
  body("clientName").notEmpty().withMessage("El Nombre del Cliente es Obligatorio"),
  body("description").notEmpty().withMessage("La Descripción del Proyecto es Obligatoria"),
  hasAuthorization,
  handleInputErrors,
  ProjectController.updateProject
);

// Eliminar Proyecto usando su Id
router.delete(
  "/:projectId",
  param("projectId").isInt().withMessage("El ID del proyecto debe ser un número"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.deleteProject
)

// Buscar un miembro por su email
router.post(
  "/:projectId/team/find",
  body("email").isEmail().toLowerCase().withMessage("E-mail no válido"),
  handleInputErrors,
  TeamMemberController.findMemberByEmail
);

//Agregar un miembro a equipo de trabajo
router.post(
  "/:projectId/team",
  body("id").isInt().withMessage("El ID del proyecto debe ser un número"),
  handleInputErrors,
  TeamMemberController.addMemberById
);

// Eliminar un miembro a equipo de trabajo
router.delete(
  "/:projectId/team/:userId",
  param("userId").isInt().withMessage("El ID del usuario debe ser un numero"),
  handleInputErrors,
  TeamMemberController.removeMemberById
);

// Obtener los miembros de un equipo de trabajo
router.get("/:projectId/team", TeamMemberController.getProjectTeam);


// Crear una Tarea
router.post(
  "/:projectId/tasks",
  hasAuthorization,
  body("name").notEmpty().withMessage("El Nombre de la tarea es Obligatorio"),
  body("description").notEmpty().withMessage("La descripción de la tarea es obligatoria"),
  handleInputErrors,
  TaskController.createTask
);

// Obtener todas las Tareas de un Proyecto
router.get(
  "/:projectId/tasks",
  TaskController.getProjectTasks
);

// Middleware que verifica si la Tarea existe
router.param("taskId", taskExists);
router.param("taskId", taskBelongProject);

// Obtener una Tarea(Ver detalles, cambiar estado, agregar Notas)
router.get(
  "/:projectId/tasks/:taskId",
  param("taskId").isInt().withMessage("El ID de la Tarea debe ser un número"),
  handleInputErrors,  
  TaskController.getTaskById
);

//  Actualizar una Tarea 
router.put(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isInt().withMessage("El ID de la Tarea debe ser un número"),
  body("name").notEmpty().withMessage("El Nombre de la tarea es Obligatorio"),
  body("description").notEmpty().withMessage("La descripción de la tarea es obligatoria"),
  handleInputErrors,
  TaskController.updateTask
);

// Eliminar Tarea
router.delete(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isInt().withMessage("El ID de la Tarea debe ser un número"),
  handleInputErrors,
  TaskController.deleteTask
);

// Actualizar status de la Tarea
router.post(
  "/:projectId/tasks/:taskId/status",
  param("taskId").isInt().withMessage("El ID de la Tarea debe ser un número"),
  body("status").notEmpty().withMessage("El estado es obligatorio"),
  handleInputErrors,
  TaskController.updateStatus
);

// Crear una Nota 
router.post(
  "/:projectId/tasks/:taskId/notes",
  body("content").notEmpty().withMessage("El Contenido de la nota es obligatorio"),
  handleInputErrors,
  NoteController.createNote
);

// Obtener todas la Notas de una Tarea 
router.get("/:projectId/tasks/:taskId/notes", NoteController.getTaskNotes);

// Eliminar Nota
router.delete(
  "/:projectId/tasks/:taskId/notes/:noteId",
  param("noteId").isInt().withMessage("El ID de la Nota debe ser un número"),
  handleInputErrors,
  NoteController.deleteNote
);

export default router;
