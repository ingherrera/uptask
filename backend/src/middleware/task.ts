import type { Request, Response, NextFunction } from "express";
import { prisma } from "./../config/db";
import type { ITask } from "../types";


declare global {
  namespace Express {
    interface Request {
      task: ITask;
      taskId: number;
    }
  }
}

export async function taskExists(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = +req.params.taskId;
    // console.log("Desde taskExists");
    // console.log("taskId:", taskId);
    
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });
    
    if (!task) {
      const error = new Error("Tarea no encontrada");
      return res.status(404).json({ error: error.message });
    }

    req.taskId=taskId
    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({ error: "Hubo un error" });
  }
}

export async function taskBelongProject(req: Request, res: Response, next: NextFunction) {
  // console.log("Desde taskBelongProject")
  // console.log("req.task.projectId",  req.task.projectId);
  // console.log(" req.project.id", req.project.id);
  if (req.task.projectId !== req.project.id) {
    const error = new Error("Acción no válida");
    return res.status(400).json({ error: error.message });
  }
  next()
}

export function hasAuthorization(req: Request, res: Response, next: NextFunction) {
  // console.log("usario autenticado", req.user)
  // console.log("proyecto actual", req.project)

  if (req.user.id !== req.project.manager) {
    const error = new Error("Acción no válida");
    return res.status(400).json({ error: error.message });
  }
  next();
}