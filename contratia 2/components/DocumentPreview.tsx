import React from 'react';
import { ContractData } from '../types';
import { ContractContent, AnexoContent } from './document/DocumentParts';

type ActiveTab = 'contract' | 'annex';

interface DocumentPreviewProps {
    data: ContractData;
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ data, activeTab, setActiveTab }) => {
    return (
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 h-[calc(100vh-120px)] flex flex-col">
            <div className="border-b border-gray-200">
                <nav className="flex -mb-px" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('contract')}
                        className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'contract'
                                ? 'border-[#119600] text-[#119600]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Vista Previa del Contrato
                    </button>
                    <button
                        onClick={() => setActiveTab('annex')}
                        className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'annex'
                                ? 'border-[#119600] text-[#119600]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Vista Previa de Factura (Anexo)
                    </button>
                </nav>
            </div>
            <div id="pdf-content" className="flex-grow overflow-y-auto p-8 bg-white font-lato">
                {activeTab === 'contract' ? <ContractContent data={data} /> : <AnexoContent data={data} />}
                 <div className="text-center text-xs text-gray-400 mt-8 py-4 font-light">
                    <p>D' Show Events LLC ● info@dshowevents.com ● (787) 329-6680</p>
                </div>
            </div>
        </div>
    );
};

export default DocumentPreview;