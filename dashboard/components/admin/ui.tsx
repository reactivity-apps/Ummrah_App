import { ReactNode } from 'react';

interface AdminCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function AdminCard({ children, className = '', onClick }: AdminCardProps) {
    return (
        <div
            className={`bg-white rounded-[16px] shadow-sm border border-[#e8dfc8] ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

interface AdminButtonProps {
    children: ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'ghost';
    disabled?: boolean;
    className?: string;
}

export function AdminButton({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    disabled = false,
    className = ''
}: AdminButtonProps) {
    const baseStyles = 'px-5 py-2.5 rounded-[12px] font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-[#4A6741] text-white hover:bg-[#3d5536] active:scale-[0.98]',
        secondary: 'border-2 border-[#4A6741] text-[#4A6741] hover:bg-[#4A6741] hover:text-white',
        ghost: 'text-[#78716c] hover:text-[#292524] hover:bg-[#fdfbf7]'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        >
            {children}
        </button>
    );
}

interface AdminInputProps {
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export function AdminInput({
    type = 'text',
    value,
    onChange,
    placeholder,
    label,
    required = false,
    disabled = false,
    className = ''
}: AdminInputProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-[#292524]">
                    {label}
                    {required && <span className="text-[#C5A059] ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className="w-full px-4 py-3 bg-white border border-[#e8dfc8] rounded-[12px] text-[#292524] placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-[#4A6741] focus:border-transparent disabled:bg-[#fdfbf7] disabled:cursor-not-allowed transition-all"
            />
        </div>
    );
}

interface AdminTextareaProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    rows?: number;
    className?: string;
}

export function AdminTextarea({
    value,
    onChange,
    placeholder,
    label,
    required = false,
    disabled = false,
    rows = 4,
    className = ''
}: AdminTextareaProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-[#292524]">
                    {label}
                    {required && <span className="text-[#C5A059] ml-1">*</span>}
                </label>
            )}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                rows={rows}
                className="w-full px-4 py-3 bg-white border border-[#e8dfc8] rounded-[12px] text-[#292524] placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-[#4A6741] focus:border-transparent disabled:bg-[#fdfbf7] disabled:cursor-not-allowed transition-all resize-none"
            />
        </div>
    );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div className={`${sizeClasses[size]} border-2 border-[#e8dfc8] border-t-[#4A6741] rounded-full animate-spin`} />
    );
}
