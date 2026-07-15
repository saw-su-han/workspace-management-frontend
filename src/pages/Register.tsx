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

export const Register = () => {
    const [avatar, setAvatar] = useState<File | null>(null);
    const [logo, setLogo] = useState<File | null>(null);

    const navigate = useNavigate();
    const registerMutation = useRegister();

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "", workspaceName: "" } as any,
    });

    const onSubmit = (values: any) => {
        const data = new FormData();

        // Explicitly map inputs to ensure correct serialization format
        data.append("name", values.name || "");
        data.append("email", values.email || "");
        data.append("password", values.password || "");

        if (values.workspaceName && values.workspaceName.trim() !== "") {
            data.append("workspaceName", values.workspaceName.trim());
        }

        // Append local file states if present
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
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-5 text-center tracking-wide animate-ocean">
                        Workspace created! Redirecting to login...
                    </div>
                )}
                {registerMutation.isError && (
                    <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-3 text-xs font-semibold text-red-600 dark:text-red-400 mb-5 text-center tracking-wide animate-ocean">
                        {(registerMutation.error as any).response?.data?.message || "Registration failed"}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit, onValidationError)}>
                    <Input label="Your Name" type="text" placeholder="Alex Carter" error={errors.name?.message} {...register("name")} />
                    <Input label="Work Email" type="email" placeholder="alex@company.com" error={errors.email?.message} {...register("email")} />
                    <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
                    <Input label="Workspace Name" type="text" placeholder="Acme Labs" error={errors.workspaceName?.message} {...register("workspaceName")} />

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <FileField label="User Avatar" onChange={setAvatar} />
                        <FileField label="Brand Logo" onChange={setLogo} />
                    </div>

                    <button
                        type="submit"
                        disabled={registerMutation.isPending || registerMutation.isSuccess}
                        className="w-full mt-4 rounded-xl bg-sky-600 text-white hover:bg-sky-700 active:scale-[0.99] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 py-3 text-sm font-semibold tracking-wide transition-all duration-150 shadow-md shadow-sky-600/10 dark:shadow-none cursor-pointer"
                    >
                        {registerMutation.isPending ? "Creating Space..." : "Register Workspace"}
                    </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-4 text-xs">
                    Have an active account?{" "}
                    <Link to="/login" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-bold underline underline-offset-4 transition-colors">
                        Log in
                    </Link>
                    <Link to="/" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium flex items-center gap-1 transition-colors duration-150">
                        ← Return to Introduction
                    </Link>
                </div>
            </AuthCard>
        </>
    );
};