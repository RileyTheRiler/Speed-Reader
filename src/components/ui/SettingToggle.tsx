import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SettingToggleProps {
    label: string | React.ReactNode;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

export const SettingToggle: React.FC<SettingToggleProps> = ({
    label,
    description,
    checked,
    onChange,
    className
}) => (
    <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
            "w-full p-4 rounded-lg flex items-center justify-between transition-colors text-left group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            className || "bg-gray-800/30 hover:bg-gray-800/50"
        )}
    >
        <div className="space-y-1">
            <div className="text-sm text-white font-medium group-hover:text-blue-200 transition-colors flex items-center gap-2">
                {label}
            </div>
            {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
        <div
            className={cn(
                "w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ml-4",
                checked ? "bg-blue-600" : "bg-gray-600 group-hover:bg-gray-500"
            )}
        >
            <div
                className={cn(
                    "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                    checked ? "translate-x-5" : "translate-x-0"
                )}
            />
        </div>
    </button>
);
