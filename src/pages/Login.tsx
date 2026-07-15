// src/pages/Login.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../hooks/useAuth";
import { AuthCard } from "../Components/AuthCard";
import { Input } from "../Components/Input";
import { loginSchema, type LoginInput } from "../schema/auth.schema";
import { ThemeToggle } from "../Components/ThemeToggle";

export const Login = () => {
    const navigate = useNavigate();
    const loginMutation = useLogin();
    const [customError, setCustomError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = (values: LoginInput) => {
        setCustomError(null);

        loginMutation.mutate(values, {
            onSuccess: () => {
                console.log(`********************************** Login sucessfully`)
                navigate("/dashboard", { replace: true });
            },
            onError: (err: any) => {
                setCustomError(err?.response?.data?.message || "Invalid credentials. Please try again.");
            }
        });
    };

    return (
        <>
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <AuthCard title="Sign In" subtitle="Access your team workspace network">

                {customError && (
                    <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-3 text-xs font-semibold text-red-600 dark:text-red-400 mb-5 text-center tracking-wide animate-ocean">
                        ⚠️ {customError}
                    </div>
                )}

                {/* Standard React Hook Form pipeline linking back to your customized Input wrappers */}
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        label="Work Email"
                        type="email"
                        placeholder="name@company.com"
                        error={errors.email?.message}
                        {...register("email")}
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register("password")}
                    />

                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full mt-4 rounded-xl bg-sky-600 text-white hover:bg-sky-700 active:scale-[0.99] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 py-3 text-sm font-semibold tracking-wide transition-all duration-150 shadow-md shadow-sky-600/10 dark:shadow-none cursor-pointer"
                    >
                        {loginMutation.isPending ? "Verifying Profile..." : "Login"}
                    </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-4 text-xs">
                    <span>
                        New here?{" "}
                        <Link to="/register" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-bold underline underline-offset-4 transition-colors">
                            Register Workspace
                        </Link>
                    </span>

                    {/* ⚡ THE HOME LINK */}
                    <Link to="/" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium flex items-center gap-1 transition-colors duration-150">
                        ← Return to Introduction
                    </Link>
                </div>

            </AuthCard>
        </>
    );
};