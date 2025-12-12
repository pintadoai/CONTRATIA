import React, { useRef, useEffect } from 'react';
import { ContractData } from '../types';
import { ContractContent, AnexoContent } from './document/DocumentParts';

interface ExportDocumentProps {
    data: ContractData;
    onRendered: (element: HTMLDivElement) => void;
}

const PageBreak: React.FC = () => (
    <div style={{ pageBreakAfter: 'always', breakAfter: 'page' }} className="pt-10"></div>
);

const ExportDocument: React.FC<ExportDocumentProps> = ({ data, onRendered }) => {
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (exportRef.current) {
            // A short delay ensures all styles, fonts, and images are fully rendered
            const timer = setTimeout(() => {
                onRendered(exportRef.current!);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [onRendered]);

    return (
        // Render this component off-screen with a precise width for accurate PDF scaling.
        <div
            ref={exportRef}
            style={{
                position: 'absolute',
                left: '-9999px',
                top: '0',
                width: '8.5in', // Standard US Letter paper width
                backgroundColor: 'white',
            }}
        >
            <div className="bg-white">
                {/* Use the same padding as the preview for 100% visual consistency */}
                <div className="p-8 font-lato text-black">
                    <ContractContent data={data} />
                    <PageBreak />
                    <AnexoContent data={data} />
                     <div className="text-center text-xs text-gray-400 mt-8 py-4 font-light">
                        <p>D' Show Events LLC ● info@dshowevents.com ● (787) 329-6680</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportDocument;