import type { Request, Response } from "express";
import type { INote } from "../types";
import { prisma } from "../config/db";

type NoteParams = {
  noteId: INote["id"]
}

export class NoteController {
  static createNote = async (
    req: Request<{ taskId: string; projectId: string }, {}, INote>,
    res: Response
  ) => {
    try {
      await prisma.note.create({
        data: {
          content: req.body.content,
          userId: +req.user.id, // ID del usuario asociado a la nota
          taskId: +req.params.taskId, // ID de la tarea asociada a la nota
        },
      });
      res.send("Nota Creada Correctamente");
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Hubo un error - NoteController" });
    }
  };

  static getTaskNotes = async (req: Request, res: Response) => {
    try {
      const notes = await prisma.note.findMany({
        where: {
          taskId: +req.params.taskId,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      res.json({ notes: notes });
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static deleteNote = async (req: Request<NoteParams>, res: Response) => {
    const noteId = +req.params.noteId 

    try {
      // Revisamos si la "Nota" existe
      const note = await prisma.note.findUnique({
        where: { id: noteId },
        // include: {
        //   Tasks: true,
        //   Team: true,
        // },
      });

      if (!note) {
        const error = new Error("Nota no encontrado");
        return res.status(404).json({ error: error.message });
      }

      // Solo la persona que creó la nota la puede eliminar
      if (note.userId !== req.user.id) {
        const error = new Error("Acción no válida");
        return res.status(401).json({ error: error.message });
      }

      // Eliminamos la Nota
      await prisma.note.delete({ where: { id: noteId } });

      res.send("Tarea Eliminada");
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Hubo un error" });
    }
  };

}
