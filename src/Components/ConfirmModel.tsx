import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDangerous?: boolean;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDangerous = true,
    isLoading = false,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* backdrop */}
            <div
                className="absolute inset-0 bg-sky-950/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* modal card */}
            <div className="relative w-full max-w-sm bg-white dark:bg-[#0a2f4e] border border-sky-200 dark:border-cyan-400/15 rounded-2xl shadow-xl p-6">
                <div className="flex items-start gap-3">
                    <div
                        className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-lg ${isDangerous
                            ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500'
                            : 'bg-cyan-50 dark:bg-cyan-400/10 text-cyan-600 dark:text-cyan-300'
                            }`}
                    >
                        {isDangerous ? '⚠️' : 'ℹ️'}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-sky-950 dark:text-cyan-50">{title}</h3>
                        <p className="text-xs text-sky-500/80 dark:text-cyan-400/50 mt-1.5 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 bg-sky-50 dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 text-sky-700 dark:text-cyan-200 text-xs font-bold rounded-xl transition-colors hover:bg-sky-100 dark:hover:bg-[#0e3a5c] disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-white text-xs font-extrabold rounded-xl shadow-sm transition-colors disabled:opacity-50 ${isDangerous
                            ? 'bg-rose-500 hover:bg-rose-600'
                            : 'bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400'
                            }`}
                    >
                        {isLoading ? 'Please wait...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};