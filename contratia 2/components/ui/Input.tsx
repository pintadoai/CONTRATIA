import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    addonText?: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, name, addonText, error, ...props }) => {
    const hasAddon = !!addonText;
    const errorClasses = 'bg-red-50 border-red-300 focus:ring-red-200 focus:border-red-400';
    const baseClasses = 'bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-[#119600]/20 focus:border-[#119600] transition-all duration-200';

    return (
        <div className="group">
            <label htmlFor={name} className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                {label}
            </label>
            <div className="flex shadow-sm rounded-xl overflow-hidden">
                 {hasAddon && (
                    <span className={`inline-flex items-center px-4 bg-gray-100 border-r border-gray-200 text-gray-500 font-medium sm:text-sm`}>
                        {addonText}
                    </span>
                )}
                <input
                    id={name}
                    name={name}
                    className={`block w-full px-4 py-3 sm:text-sm placeholder-gray-400 focus:outline-none ${hasAddon ? '' : 'rounded-xl'} ${error ? errorClasses : baseClasses}`}
                    {...props}
                />
            </div>
            {error && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500 flex items-center gap-1">
                <span className="block w-1 h-1 rounded-full bg-red-500"></span>
                {error}
            </p>}
        </div>
    );
};

export default Input;