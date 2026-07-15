// src/Components/FileField.tsx
import React, { useState } from 'react';

interface FileFieldProps {
    label: string;
    onChange: (file: File | null) => void;
}

export const FileField: React.FC<FileFieldProps> = ({ label, onChange }) => {
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
        setFileName(file ? file.name : null);
        onChange(file);
    };

    return (
        <div className="space-y-1.5 flex flex-col items-start w-full">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-0.5">{label}</label>
            <label className="flex flex-col items-center justify-center w-full h-20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-sky-50/30 dark:hover:bg-sky-950/20 hover:border-sky-400 dark:hover:border-sky-500 cursor-pointer transition-all duration-150 text-center px-3 group">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate max-w-full block">
                    {fileName ? fileName : "Add Document"}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} onClick={(e) => ((e.target as HTMLInputElement).value = '')} />
            </label>
        </div>
    );
};