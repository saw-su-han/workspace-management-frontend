
import { z } from "zod";
const passwordStrength = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[0-9]/, "Password must include at least one number");

export const loginSchema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Enter a valid email address"),
        password: passwordStrength,
        confirmPassword: z.string().min(1, "Please confirm your password"),
        workspaceName: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const forgotPasswordSchema = z.object({
    email: z.string().email("Enter a valid email address"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
    .object({
        email: z.string().email("Enter a valid email address"),
        code: z.string().length(6, "Code must be 6 digits"),
        newPassword: z
            .string()
            .min(8, "At least 8 characters")
            .regex(/[A-Z]/, "Must include an uppercase letter")
            .regex(/[a-z]/, "Must include a lowercase letter")
            .regex(/[0-9]/, "Must include a number"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;


export const verifyCodeSchema = z.object({
    email: z.string().email("Enter a valid email"),
    code: z
        .string()
        .length(6, "Code must be 6 digits")
        .regex(/^\d{6}$/, "Code must be numeric"),
});
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;