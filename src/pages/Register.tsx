// src/pages/Register.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../hooks/useAuth";
import { AuthCard } from "../Components/AuthCard";
import { FileField } from "../Components/FileField";
import { Input } from "../Components/Input";
import { registerSchema, type RegisterInput } from "../schema/auth.schema";
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

export const Register = () => {
    const [avatar, setAvatar] = useState<File | null>(null);
    const [logo, setLogo] = useState<File | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const registerMutation = useRegister();

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "", workspaceName: "" } as any,
    });

    const onSubmit = (values: any) => {
        const data = new FormData();
        data.append("name", values.name || "");
        data.append("email", values.email || "");
        data.append("password", values.password || "");

        if (values.workspaceName && values.workspaceName.trim() !== "") {
            data.append("workspaceName", values.workspaceName.trim());
        }

        if (avatar) data.append("avatar", avatar);
        if (logo) data.append("logo", logo);

        registerMutation.mutate(data);
    };

    const onValidationError = (formErrors: any) => {
        console.error("🚨 Form validation blocked submission:", formErrors);
    };

    useEffect(() => {
        if (registerMutation.isSuccess) {
            const timer = setTimeout(() => navigate("/login"), 2000);
            return () => clearTimeout(timer);
        }
    }, [registerMutation.isSuccess, navigate]);

    return (
        <>
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <AuthCard title="Get Started" subtitle="Establish your team workspace profile">
                {registerMutation.isSuccess && (
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-5 text-center tracking-wide font-mono-nav">
                        Workspace created! Redirecting to login...
                    </div>
                )}
                {registerMutation.isError && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-600 dark:text-red-400 mb-5 text-center tracking-wide font-mono-nav">
                        {(registerMutation.error as any).response?.data?.message || "Registration failed"}
                    </div>
                )}

                <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit, onValidationError)}>
                    <Input label="Your Name" type="text" placeholder="Alex Carter" error={errors.name?.message} {...register("name")} />
                    <Input label="Work Email" type="email" placeholder="alex@company.com" error={errors.email?.message} {...register("email")} />

                    <div className="relative">
                        <Input
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="At least 8 characters, 1 uppercase, 1 number"
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

                    <div className="relative">
                        <Input
                            label="Confirm Password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Re-enter your password"
                            error={errors.confirmPassword?.message}
                            {...register("confirmPassword")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            tabIndex={-1}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            className="absolute right-3 top-[34px] text-[#0E3A5C]/40 hover:text-[#0E3A5C] dark:text-[#4A9DC7]/50 dark:hover:text-[#4A9DC7] transition-colors"
                        >
                            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>

                    <Input label="Workspace Name" type="text" placeholder="Acme Labs" error={errors.workspaceName?.message} {...register("workspaceName")} />

                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <FileField label="User Avatar" onChange={setAvatar} />
                        <FileField label="Brand Logo" onChange={setLogo} />
                    </div>

                    <button
                        type="submit"
                        disabled={registerMutation.isPending || registerMutation.isSuccess}
                        className="font-mono-nav w-full mt-3 rounded-lg bg-[#0E3A5C] dark:bg-[#4A9DC7] text-[#DCEAF5] dark:text-[#051C2E] hover:bg-[#0E3A5C]/90 dark:hover:bg-[#4A9DC7]/90 active:scale-[0.99] disabled:opacity-50 py-3 text-xs font-bold uppercase tracking-wide transition-all shadow-md cursor-pointer"
                    >
                        {registerMutation.isPending ? "Creating Space..." : "Register Workspace"}
                    </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-2 border-t border-[#0E3A5C]/10 dark:border-[#4A9DC7]/15 pt-4 text-xs font-medium text-[#0E3A5C]/60 dark:text-[#E6F1F8]/50">
                    <span>
                        Have an active account?{" "}
                        <Link to="/login" className="text-[#1E5F87] dark:text-[#4A9DC7] font-bold underline underline-offset-4 hover:opacity-80 transition-opacity">
                            Log in
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