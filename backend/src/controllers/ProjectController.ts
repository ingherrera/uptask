import type { Request, Response } from "express";
import { prisma } from "./../config/db";
import colors from "colors";

export class ProjectController {


  static createProject = async (req: Request, res: Response) => {
    // console.log("Desde createProject - req.user:", req.user);
    try {
      await prisma.project.create({
        data: {
          projectName: req.body.projectName,
          clientName: req.body.clientName,
          description: req.body.description,
          User: {
            connect: { id: req.user.id}, // Aquí se establece la relación con el usuario
          },
        },
      });
      res.send("Proyecto creado correctamente");
      // res.send(req.user);
    } catch (error) {
      console.log(error);
    }
  };

  static getAllProjects = async (req: Request, res: Response) => {
    // console.log("getAllProjects",{ user: req.user });
    try {
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { manager: req.user.id },
            { Team: { some: { userId: req.user.id} } }
          ]
        }
      });
      res.json(projects);
    } catch (error) {
      console.log(error);
    }
  };

  static getProjectById = async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.projectId, 10);
    // const id = req.params.id;
    try {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          Tasks: true,
          Team:true
        },
      });

      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }
      
      // Verificar si usuario autenticado es el que creo el Proyecto o es colaborador
      const isUserInTeam = project.Team.some((member) => member.userId === req.user.id);  

      // console.log("getProjectById - req.user",req.user)
      // console.log("getProjectById - project",project)
      // console.log("getProjectById - isUserInTeam",isUserInTeam)


      if (req.user.id !== req.project.manager && !isUserInTeam) {
      // if (req.user.id.toString() !== req.project.manager.toString()) {
        const error = new Error("Acción no válida");
        return res.status(404).json({ error: error.message });
      }

      res.json(project);
    } catch (error) {
      console.log(error);
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      await prisma.project.update({
        where: { id: req.project.id },
        data: body,
      });
      res.send("Proyecto Actualizado");
    } catch (error) {
      console.log(error);
    }
  };

  static deleteProject = async (req: Request, res: Response) => {
    try {
      await prisma.project.delete({ where: { id: req.project.id } });

      res.send("Proyecto Eliminado");
    } catch (error) {
      console.log(error);
    }
  };
}
