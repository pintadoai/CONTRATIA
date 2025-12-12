import React from 'react';

interface LanguageSelectorProps {
    selected: 'es' | 'en';
    onChange: (lang: 'es' | 'en') => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selected, onChange }) => {
    return (
        <div className="flex justify-center w-full">
            <div className="bg-gray-100 p-1 rounded-full inline-flex relative shadow-inner">
                {/* The gliding background */}
                <div
                    className={`absolute top-1 bottom-1 w-[50%] bg-white rounded-full shadow-md transition-all duration-300 ease-out ${selected === 'es' ? 'left-1' : 'left-[49%]'}`}
                ></div>

                <button
                    type="button"
                    onClick={() => onChange('es')}
                    className={`relative z-10 w-32 py-2 rounded-full text-sm font-bold transition-colors ${selected === 'es' ? 'text-gray-900' : 'text-gray-500'}`}
                >
                    <span role="img" aria-label="Spain flag" className="mr-2">ES</span> Espanol
                </button>
                <button
                    type="button"
                    onClick={() => onChange('en')}
                    className={`relative z-10 w-32 py-2 rounded-full text-sm font-bold transition-colors ${selected === 'en' ? 'text-gray-900' : 'text-gray-500'}`}
                >
                    <span role="img" aria-label="USA flag" className="mr-2">EN</span> English
                </button>
            </div>
        </div>
    );
};

export default LanguageSelector;
