import type { Request, Response } from "express";
import { prisma } from "./../config/db";
import { taskStatus } from "@prisma/client";

interface reqBody {
  status: taskStatus;
}

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = await prisma.task.create({
        data: {
          name: req.body.name,
          description: req.body.description,
          projectId: req.project.id,
        },
      });
      // project.tasks.push(task.id);
      // res.send("Tarea creada correctamente");
      res.send(task);
    } catch (error) {
      console.log(error);
    }
  };

  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await prisma.task.findMany({
        where: {
          projectId: req.project.id,
        },
      });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static getTaskById = async (req: Request, res: Response) => {
    try {
      const task = await prisma.task.findUnique({
        where: {
          id: req.task.id,
        },
        include: {
          TaskStatusHistory: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          Note: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          }
        },
      });

      res.json(task);

    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static updateTask = async (req: Request, res: Response) => {
    try {
      const taskUpdate = await prisma.task.update({
        where: { id: req.taskId },
        data: req.body,
      });

      res.send(taskUpdate);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    try {
      console.log("req.taskId", req.taskId)
      await prisma.task.delete({ where: { id: req.taskId } });
      res.send("Tarea eliminada");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static updateStatus = async (
    req: Request<{ taskId: string; projectId: string }, {}, reqBody>,
    res: Response
  ) => {
    try {
      const status = req.body.status;

      // console.log("Desde updateStatus - req.user", req.user.id);
      // console.log("Desde updateStatus - req.params", req.params.taskId);

      
      const taskUpdate = await prisma.task.update({
        where: { id: +req.params.taskId },
        data: { status: status },
      });

      // Guardar el cambio de estado en TaskStatusHistory
      await prisma.taskStatusHistory.create({
        data: {
          status: status, // Estado actualizado de la tarea
          taskId: +req.params.taskId, // ID de la tarea
          userId: req.user.id, // ID del usuario que realizó el cambio
        },
      });

      res.send(taskUpdate);
    } catch (error) {
      console.log({error})
      res.status(500).json({ error: "Hubo un error- updateStatus" });
    }
  };
}
