import React from 'react';

interface DateInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    required?: boolean;
    error?: string;
}

const DateInput: React.FC<DateInputProps> = ({ label, name, value, onChange, onBlur, required, error }) => {
    const errorClasses = 'bg-red-50 border-red-300 focus:ring-red-200';
    const baseClasses = 'bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:ring-[#119600]/20 focus:border-[#119600]';

    return (
        <div>
            <label htmlFor={name} className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{label}</label>
            <input
                type="date"
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                required={required}
                className={`block w-full px-4 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-all duration-200 ${error ? errorClasses : baseClasses}`}
            />
            {error && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{error}</p>}
        </div>
    );
};

export default DateInput;
