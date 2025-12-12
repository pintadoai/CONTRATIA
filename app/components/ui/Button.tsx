import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'danger' | 'info' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
    // Improved fluidity: custom bezier for "pop" effect, hover scale, and colored shadows
    const baseClasses = 'inline-flex items-center justify-center font-bold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100';

    const variantClasses = {
        primary: 'bg-[#119600] text-white hover:bg-[#0e7d00] hover:shadow-[0_8px_20px_-4px_rgba(17,150,0,0.5)] focus:ring-[#119600]',
        outline: 'bg-white text-[#119600] border-2 border-[#119600] hover:bg-gray-50 focus:ring-[#119600] shadow-none hover:shadow-lg',
        danger: 'bg-white text-red-600 border-2 border-red-100 hover:bg-red-50 hover:border-red-200 focus:ring-red-500 shadow-none hover:shadow-lg',
        info: 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] hover:shadow-[0_8px_20px_-4px_rgba(37,99,235,0.5)] focus:ring-blue-500', 
        success: 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-[0_8px_20px_-4px_rgba(16,185,129,0.5)] focus:ring-emerald-500',
        warning: 'bg-amber-500 text-white hover:bg-amber-600 hover:shadow-[0_8px_20px_-4px_rgba(245,158,11,0.5)] focus:ring-amber-500',
    };

    const sizeClasses = {
        sm: 'px-4 py-1.5 text-xs',
        md: 'px-6 py-2.5 text-sm',
        lg: 'px-8 py-3.5 text-base',
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
        <button className={combinedClasses} {...props}>
            {children}
        </button>
    );
};

export default Button;