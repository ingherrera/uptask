import { z } from "zod";

/** Auth & Users */
const authSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  current_password: z.string(),
  password: z.string(),
  password_confirmation: z.string(),
  token: z.string(),
});

export const userSchema = authSchema
  .pick({
    name: true,
    email: true,
  })
  .extend({
    id: z.number(),
  });

export type User = z.infer<typeof userSchema>;
export type UserProfileForm = Pick<User, "name" | "email">;

type Auth = z.infer<typeof authSchema>;
export type UserLoginForm = Pick<Auth, "email" | "password">;
export type UserRegistrationForm = Pick<
  Auth,
  "name" | "email" | "password" | "password_confirmation"
>;
export type ConfirmToken = Pick<Auth, "token">;
export type RequestConfirmationCodeForm = Pick<Auth, "email">;
export type ForgotPasswordForm = Pick<Auth, "email">;
export type NewPasswordForm = Pick<Auth, "password" | "password_confirmation">;
export type UpdateCurrentUserPasswordForm = Pick<
  Auth,
  "current_password" | "password" | "password_confirmation"
>;
export type CheckPasswordForm = Pick<Auth, "password">;

// -------------------- Team --------------------
export const teamMembersSchema = z.array(userSchema);
export type TeamMember = z.infer<typeof userSchema>;
export type TeamMemberForm = Pick<User, "email">;

export const taskStatusSchema = z.enum([
  "pending",
  "onHold",
  "inProgress",
  "underReview",
  "completed",
]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

// -------------------- Note --------------------
const noteSchema = z.object({
  id: z.number(),
  content: z.string(),
  createdAt: z.string(),
  userId: z.number(),
  taskId: z.number(),
  user: userSchema.pick({
    name: true,
    email: true,
  }),
});

export type Note = z.infer<typeof noteSchema>;
export type NoteFormData = Pick<Note, "content">;

// --------------------TaskStatusHistory--------------------
export const taskStatusHistorySchema = z.object({
  id: z.number(),
  status: taskStatusSchema,
  user: authSchema.pick({
    name: true,
    email: true,
  }),
});

//--------------------Task--------------------
export const taskSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  projectId: z.number(),
  status: taskStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  // TaskStatusHistory: z.array(taskStatusHistorySchema),
  Notes: z.array(noteSchema),
});

export const taskProjectSchema = taskSchema.pick({
  id: true,
  name: true,
  description: true,
  status: true,
});

export type Task = z.infer<typeof taskSchema>;
export type TaskFormData = Pick<Task, "name" | "description">;
export type TaskProject = z.infer<typeof taskProjectSchema>;

// export type Pascu = z.infer<typeof taskStatusHistorySchema >

// --------------------Project--------------------
export const projectSchema = z.object({
  id: z.number(),
  projectName: z.string(),
  clientName: z.string(),
  description: z.string(),
  Tasks: z.array(taskProjectSchema),
  manager: z.number(userSchema.pick({ id: true })),
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectFormData = Pick<Project, "clientName" | "projectName" | "description">;
export const dashboardProjectSchema = z.array(
  projectSchema.pick({
    id: true,
    projectName: true,
    clientName: true,
    description: true,
    manager: true,
  }),
);

export const editProjectSchema = projectSchema.pick({
  projectName: true,
  clientName: true,
  description: true,
});
