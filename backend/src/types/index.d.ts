// import { PrismaClient } from "@prisma/client";
import { taskStatus } from "@prisma/client";

export interface IProject {
  // id: string;
  id: number;
  projectName: string;
  clientName: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  manager: number;
  // team: number[];
}

export interface ITask {
  // id: string;
  id: number;
  name: string;
  description: string;
  status: taskStatus;
  createdAt: Date;
  updatedAt: Date;
  projectId: number;
}


export interface IUser {
  id: number;
  email: string;
  password: string;
  name: string;
  confirmed: boolean;
}

export interface IToken {
  id: number;
  userId: number;
  expiresAt: Date;
}

export interface INote {
  id: number;
  content: string;
  userId: number;
  taskId: number;
  createdAt: Date;
  updatedAt: Date;
}



// declare global {
  //   namespace Express {
    //     interface Request {
      //       project: IProject
//       prisma: PrismaClient
//     }
//   }
// }
