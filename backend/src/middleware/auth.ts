import { Request, Response, NextFunction } from "express";
import jwt, {JwtPayload} from "jsonwebtoken";
import { prisma } from "../config/db";
import type { IUser } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  // Recuperar JWT de "Headers"
  const bearer = req.headers.authorization;
  if (!bearer) {
    const error = new Error("No Autorizado");
    return res.status(401).json({ error: error.message });
  }
  const [, token] = bearer.split(" ");

  // Validamos que no haya expirado el Token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    
    // Comprobamos que usuario exista
    const userExists = await prisma.user.findUnique({
      where: { id:decoded.id },
    });

    if (userExists) {
      // console.log({userExists})
      req.user = userExists;
      next();
    } else {
      res.status(500).json({ error: "Token No Válido - porque no hay usuario" });
    }
  } catch (error) {
    res.status(500).json({ error: "Token No Válido" });
  }
  
  return
  
  // return next();
};
