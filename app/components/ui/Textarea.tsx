import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, name, error, ...props }) => {
    const errorClasses = 'bg-red-50 border-red-300 focus:ring-red-200 focus:border-red-400';
    const baseClasses = 'bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-[#119600]/20 focus:border-[#119600] transition-all duration-200';
    
    return (
        <div className="group">
            <label htmlFor={name} className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                {label}
            </label>
            <textarea
                id={name}
                name={name}
                rows={3}
                className={`block w-full px-4 py-3 rounded-xl shadow-sm sm:text-sm placeholder-gray-400 focus:outline-none resize-y ${error ? errorClasses : baseClasses}`}
                {...props}
            />
            {error && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500 flex items-center gap-1">
                <span className="block w-1 h-1 rounded-full bg-red-500"></span>
                {error}
            </p>}
        </div>
    );
};

export default Textarea;