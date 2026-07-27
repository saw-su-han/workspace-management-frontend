import React from 'react';

export interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <nav className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            {items.map((item, i) => {
                const isLast = i === items.length - 1;
                return (
                    <React.Fragment key={i}>
                        {i > 0 && (
                            <span className="text-sky-300 dark:text-cyan-400/25 text-[10px] flex-shrink-0">›</span>
                        )}
                        {isLast || !item.onClick ? (
                            <span
                                className={`text-xs truncate ${isLast
                                    ? 'font-extrabold text-sky-950 dark:text-cyan-50'
                                    : 'font-semibold text-sky-500 dark:text-cyan-400/60'
                                    }`}
                            >
                                {item.label}
                            </span>
                        ) : (
                            <button
                                onClick={item.onClick}
                                className="text-xs font-semibold text-sky-500 dark:text-cyan-400/60 hover:text-cyan-600 dark:hover:text-cyan-300 truncate transition-colors"
                            >
                                {item.label}
                            </button>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};