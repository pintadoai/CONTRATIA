import React from 'react';
import { ContractType } from '../types';

interface ContractTypeSelectorProps {
    selectedType: ContractType;
    onChange: (type: ContractType) => void;
}

const ContractTypeSelector: React.FC<ContractTypeSelectorProps> = ({ selectedType, onChange }) => {
    const baseStyle = "flex-1 text-sm md:text-base font-bold py-3 px-4 rounded-full transition-all duration-300 transform";
    const activeStyle = "bg-black text-white shadow-lg scale-105 ring-2 ring-offset-2 ring-gray-200";
    const inactiveStyle = "text-gray-500 hover:bg-white hover:text-black";

    const types: { type: ContractType; icon: string; label: string }[] = [
        { type: 'music', icon: '🎵', label: 'Musica' },
        { type: 'booth', icon: '📸', label: 'Photo Booth' },
        { type: 'dj', icon: '🎧', label: 'DJ Set' },
    ];

    return (
        <div className="flex flex-col md:flex-row justify-between items-center bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-[2rem] mx-auto max-w-4xl shadow-inner mb-8 border border-gray-200 gap-1 md:gap-0">
            {types.map(({ type, icon, label }) => (
                <button
                    key={type}
                    onClick={() => onChange(type)}
                    className={`${baseStyle} ${selectedType === type ? activeStyle : inactiveStyle}`}
                >
                    {icon} {label}
                </button>
            ))}
        </div>
    );
};

export default ContractTypeSelector;
