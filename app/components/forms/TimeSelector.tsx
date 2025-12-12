import React, { useState, useEffect } from 'react';
import { ContractData } from '../../types';

interface TimeSelectorProps {
    label: string;
    value: string;
    name: keyof ContractData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
    error?: string;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ label, value, name, onChange, onBlur, error }) => {
    const [hour, setHour] = useState('');
    const [minute, setMinute] = useState('');
    const [period, setPeriod] = useState('');

    useEffect(() => {
        if (value) {
            const match = value.match(/(\d+):(\d+)\s(AM|PM)/);
            if (match) {
                setHour(match[1]);
                setMinute(match[2]);
                setPeriod(match[3]);
                return;
            }
        }
        setHour('');
        setMinute('');
        setPeriod('');
    }, [value]);

    const handlePartChange = (partName: 'hour' | 'minute' | 'period', newValue: string) => {
        let newParts = { hour, minute, period };
        if (partName === 'hour') {
            setHour(newValue);
            newParts.hour = newValue;
        } else if (partName === 'minute') {
            setMinute(newValue);
            newParts.minute = newValue;
        } else {
            setPeriod(newValue);
            newParts.period = newValue;
        }

        if (newParts.hour && newParts.minute && newParts.period) {
            const newTimeValue = `${newParts.hour}:${newParts.minute} ${newParts.period}`;
            onChange({ target: { name, value: newTimeValue } } as any);
        } else {
            if (value) {
                onChange({ target: { name, value: '' } } as any);
            }
        }
    };

    const handleBlurContainer = (e: React.FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            onBlur({ target: { name, value } } as any);
        }
    };

    const errorClasses = 'bg-red-50 border-red-300 focus:ring-red-200';
    const baseClasses = 'bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:ring-[#119600]/20 focus:border-[#119600]';
    const selectClasses = `block w-full px-3 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-all duration-200 cursor-pointer ${error ? errorClasses : baseClasses}`;

    return (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{label}</label>
            <div className="flex items-center gap-2" onBlur={handleBlurContainer}>
                <select name={`${name}_hour`} value={hour} onChange={(e) => handlePartChange('hour', e.target.value)} required className={selectClasses}>
                    <option value="">HH</option>
                    {[...Array(12)].map((_, i) => {
                        const hourVal = String(i + 1);
                        return <option key={hourVal} value={hourVal}>{hourVal.padStart(2, '0')}</option>;
                    })}
                </select>
                <span className="font-black text-gray-300">:</span>
                <select name={`${name}_minute`} value={minute} onChange={(e) => handlePartChange('minute', e.target.value)} required className={selectClasses}>
                    <option value="">MM</option>
                    <option value="00">00</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                </select>
                <select name={`${name}_period`} value={period} onChange={(e) => handlePartChange('period', e.target.value)} required className={selectClasses}>
                    <option value="">--</option>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
            </div>
            {error && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{error}</p>}
        </div>
    );
};

export default TimeSelector;
