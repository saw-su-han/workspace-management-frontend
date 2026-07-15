// Example of how your src/Components/Input.tsx MUST be structured:
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">{label}</label>
                <input ref={ref} {...props} className="border p-2 rounded-xl" />
                {error && <span className="text-red-500 text-xs">{error}</span>}
            </div>
        );
    }
);

Input.displayName = "Input";