import React from 'react';
import { ContractData, AddonServiceOption } from '../../types';
import { RadioOption } from './RadioGroup';

interface AddonServiceProps {
    title: string;
    cost: number;
    name: keyof ContractData;
    value: AddonServiceOption;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    t: {
        addonHire: string;
        addonNoHire: string;
        addonPending: string;
    };
}

const AddonService: React.FC<AddonServiceProps> = ({ title, cost, name, value, onChange, t }) => (
    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
        <div className="flex justify-between items-start mb-3">
            <p className="font-bold text-gray-800">{title}</p>
            <span className="bg-[#119600]/10 text-[#119600] text-xs font-bold px-2 py-1 rounded-md">
                +${cost.toFixed(2)}
            </span>
        </div>
        <div className="flex flex-col space-y-2 mt-2">
            <RadioOption name={name} id={`${name}-contratar`} label={t.addonHire} value="contratar" checked={value === 'contratar'} onChange={onChange} />
            <RadioOption name={name} id={`${name}-no`} label={t.addonNoHire} value="no_contratar" checked={value === 'no_contratar'} onChange={onChange} />
            <RadioOption name={name} id={`${name}-pendiente`} label={t.addonPending} value="pendiente" checked={value === 'pendiente'} onChange={onChange} />
        </div>
    </div>
);

export default AddonService;
