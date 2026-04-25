import type { Request, Response, NextFunction } from "express";
import { prisma } from "./../config/db";
import type { IProject } from "../types";

declare global {
  namespace Express {
    interface Request {
      project: IProject; 
    }
  }
}


export async function projectExists(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = +req.params.projectId;
    // console.log("*********************");
    // console.log("Desde projectExists");
    // console.log("projectId:", projectId);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      const error = new Error("Proyecto no encontrado-desde middleware projectExists");
      return res.status(404).json({ error: error.message });
    }
    req.project = project;
    // console.log("Desde projectExists req.project", req.project)
    next();
  } catch (error) {
    res.status(500).json({ error: "Hubo un error" });
  }
}
