import React from 'react';

interface RadioGroupProps {
    legend: string;
    children: React.ReactNode;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ legend, children }) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">{legend}</label>
        <div className="flex flex-col space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            {children}
        </div>
    </div>
);

interface RadioOptionProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    description?: string;
}

export const RadioOption: React.FC<RadioOptionProps> = ({ label, description, ...props }) => (
    <div className="flex items-start">
        <div className="flex items-center h-5">
            <input
                type="radio"
                className="focus:ring-[#119600] h-5 w-5 text-[#119600] border-gray-300 cursor-pointer accent-[#119600]"
                {...props}
            />
        </div>
        <div className="ml-3 text-sm">
            <label htmlFor={props.id} className="font-semibold text-gray-800 cursor-pointer">{label}</label>
            {description && <p className="text-gray-500 text-xs mt-0.5">{description}</p>}
        </div>
    </div>
);
