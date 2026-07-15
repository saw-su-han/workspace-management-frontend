// src/schemas/auth.schema.ts
import { z } from "zod";

// Shared constraints
const emailSchema = z.string().min(1, "Email is required").email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: emailSchema,
    password: passwordSchema,
    workspaceName: z.string().min(2, "Workspace name must be at least 2 characters"),
});

// Infer types directly from Zod definitions for clean TypeScript bindings
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;