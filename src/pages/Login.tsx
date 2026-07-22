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

const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.066 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
);

export const Login = () => {
    const navigate = useNavigate();
    const loginMutation = useLogin();
    const [customError, setCustomError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = (values: LoginInput) => {
        setCustomError(null);

        loginMutation.mutate(values, {
            onSuccess: () => {
                navigate("/dashboard", { replace: true });
            },
            onError: (err: any) => {
                const backendMessage = err?.response?.data?.message;
                const status = err?.response?.status;

                const isWrongPassword = status === 401 || /password/i.test(backendMessage || "");

                if (isWrongPassword) {
                    setCustomError(
                        "Wrong password. Passwords must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number."
                    );
                } else {
                    setCustomError(backendMessage || "Invalid credentials. Please try again.");
                }
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
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-600 dark:text-red-400 mb-5 text-center tracking-wide font-mono-nav">
                        ⚠️ {customError}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        label="Work Email"
                        type="email"
                        placeholder="name@company.com"
                        error={errors.email?.message}
                        {...register("email")}
                    />

                    <div className="relative">
                        <Input
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            error={errors.password?.message}
                            {...register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            tabIndex={-1}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-3 top-[34px] text-[#0E3A5C]/40 hover:text-[#0E3A5C] dark:text-[#4A9DC7]/50 dark:hover:text-[#4A9DC7] transition-colors"
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="font-mono-nav w-full mt-2 rounded-lg bg-[#0E3A5C] dark:bg-[#4A9DC7] text-[#DCEAF5] dark:text-[#051C2E] hover:bg-[#0E3A5C]/90 dark:hover:bg-[#4A9DC7]/90 active:scale-[0.99] disabled:opacity-50 py-3 text-xs font-bold uppercase tracking-wide transition-all shadow-md cursor-pointer"
                    >
                        {loginMutation.isPending ? "Verifying Profile..." : "Login"}
                    </button>
                </form>

                <div className="mt-8 flex flex-col items-center gap-3 border-t border-[#0E3A5C]/10 dark:border-[#4A9DC7]/15 pt-5 text-xs font-medium text-[#0E3A5C]/60 dark:text-[#E6F1F8]/50">
                    <span>
                        New here?{" "}
                        <Link to="/register" className="text-[#1E5F87] dark:text-[#4A9DC7] font-bold underline underline-offset-4 hover:opacity-80 transition-opacity">
                            Register Workspace
                        </Link>
                    </span>

                    <Link to="/" className="font-mono-nav text-[11px] text-[#0E3A5C]/50 hover:text-[#0E3A5C] dark:text-[#4A9DC7]/60 dark:hover:text-[#4A9DC7] flex items-center gap-1 transition-colors mt-1">
                        ← Return to Introduction
                    </Link>
                </div>
            </AuthCard>
        </>
    );
};