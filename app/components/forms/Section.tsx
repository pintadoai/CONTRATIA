import React from 'react';

interface SectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, description, children }) => (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="border-b border-gray-100 pb-4 mb-6">
            <h3 className="text-xl font-bold text-gray-900 font-montserrat tracking-tight flex items-center">
                <span className="w-2 h-6 bg-[#119600] rounded-full mr-3"></span>
                {title}
            </h3>
            {description && <p className="text-sm text-gray-400 mt-2 ml-5">{description}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {children}
        </div>
    </div>
);

export default Section;
