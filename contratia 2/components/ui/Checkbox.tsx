import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: React.ReactNode;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, name, ...props }) => {
    return (
        <div className="relative flex items-center group cursor-pointer">
            <div className="flex items-center h-6">
                <input
                    id={name}
                    name={name}
                    type="checkbox"
                    className="h-5 w-5 text-[#119600] focus:ring-[#119600] border-gray-300 rounded cursor-pointer transition-transform group-hover:scale-110 accent-[#119600]"
                    {...props}
                />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor={name} className="font-medium text-gray-700 cursor-pointer select-none">
                    {label}
                </label>
            </div>
        </div>
    );
};

export default Checkbox;