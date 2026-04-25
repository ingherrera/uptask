import type { Request, Response } from 'express';
import { prisma } from '../config/db';

export class TeamMemberController {
  static findMemberByEmail = async (req: Request, res: Response) => {
    const { email } = req.body;

    // Buscar Usario por "email"
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (!userExists) {
      const error = new Error("Usuario No encontrado");
      return res.status(409).json({ error: error.message });
    }

    return res.json(userExists);
  };

  static addMemberById = async (req: Request, res: Response) => {
    const userId = +req.body.id;
    const projectId = +req.params.projectId;

    // Verificar si el usuario existe.
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      const error = new Error("Usuario No encontrado");
      return res.status(409).json({ error: error.message });
    }

    // Verificar si el usuario está en el equipo del proyecto
    const projectWithTeam = await prisma.project.findUnique({
      where: { id: projectId },
      include: { Team: true },
    });

    if (projectWithTeam.Team.some((team) => team.userId === userId)) {
      const error = new Error("El usuario ya existe en el proyecto");
      return res.status(409).json({ error: error.message });
    }

    // Anadir "userId" y "projecyId" al team del proyecto
    await prisma.team.create({
      data: {
        projectId,
        userId,
      },
    });

    res.send("Usuario agregado al Equipo correctamente");
  };

  static removeMemberById = async (req: Request, res: Response) => {
    const userId = +req.params.userId;
    const projectId = +req.params.projectId;

    // Verificar si el usuario está en el equipo del proyecto
    const projectWithTeam = await prisma.project.findUnique({
      where: { id: projectId },
      include: { Team: true },
    });

    if (!projectWithTeam) {
      const error = new Error("Proyecto No encontrado");
      return res.status(404).json({ error: error.message });
    }
    // console.log({ projectWithTeam });
    // console.log({Team: projectWithTeam.Team });   
    // console.log("team", project.team);

    const userInTeam = projectWithTeam.Team.some((team) => team.userId === userId);

    if (!userInTeam) {
      const error = new Error("El usuario no está en el equipo del proyecto");
      return res.status(409).json({ error: error.message });
    }

    // Eliminar el usuario del equipo
    await prisma.team.deleteMany({
      where: { userId, projectId },
    })

    res.send("Usuario removido del Equipo");
  };

  static getProjectTeam = async (req: Request, res: Response) => {
    const projectId = +req.params.projectId;
    try {
      // Buscar proyecto e incluir los usuarios del equipo
      const projectWithTeam = await prisma.project.findUnique({
        where: { id: projectId },
        // Incluir el equipo en la consulta
        include: {
          Team: {
            select: {
              // id: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!projectWithTeam) {
        const error = new Error("Proyecto No encontrado");
        return res.status(404).json({ error: error.message });
      }

      
      // Actualmente  Team  tiene esta estructura  {user:{email, id, name}}[]
      // Creamos un arreglo mas sencillo de este tipo {email, id name}[]      
      const membersTeam = projectWithTeam.Team?.map(({ user }) => ({ ...user }));
      
      // Enviar la lista de miembros del equipo 
      res.json(membersTeam);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}