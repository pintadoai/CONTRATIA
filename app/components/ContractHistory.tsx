import React, { useState } from 'react';
import { ContractHistoryItem } from '../hooks/useContractHistory';
import Button from './ui/Button';
import { TrashIcon } from './icons';

interface ContractHistoryProps {
    history: ContractHistoryItem[];
    onRemove: (id: string) => void;
    onClear: () => void;
}

const ContractTypeLabel: React.FC<{ type: string }> = ({ type }) => {
    const labels: Record<string, { text: string; color: string }> = {
        music: { text: 'Musica', color: 'bg-purple-100 text-purple-700' },
        booth: { text: 'Booth', color: 'bg-blue-100 text-blue-700' },
        dj: { text: 'DJ', color: 'bg-orange-100 text-orange-700' },
    };
    const label = labels[type] || { text: type, color: 'bg-gray-100 text-gray-700' };

    return (
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${label.color}`}>
            {label.text}
        </span>
    );
};

const formatDate = (dateStr: string): string => {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
};

const ContractHistory: React.FC<ContractHistoryProps> = ({ history, onRemove, onClear }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (history.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-gray-800">Contratos Recientes</h3>
                        <p className="text-xs text-gray-400">{history.length} contrato{history.length !== 1 ? 's' : ''} generado{history.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isExpanded && (
                <div className="border-t border-gray-100">
                    <div className="max-h-80 overflow-y-auto">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className="px-5 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <ContractTypeLabel type={item.contractType} />
                                            <span className="text-xs text-gray-400 font-mono">#{item.contractNumber}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800 truncate">{item.clientName}</p>
                                        <p className="text-xs text-gray-400">{item.eventDate}</p>
                                        <p className="text-[10px] text-gray-300 mt-1">Generado: {formatDate(item.createdAt)}</p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <a
                                            href={item.links.doc_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Editar documento"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </a>
                                        <a
                                            href={item.links.pdf_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Ver PDF"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </a>
                                        <a
                                            href={item.links.pdf_download_url}
                                            download
                                            className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                            title="Descargar PDF"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </a>
                                        <button
                                            onClick={() => onRemove(item.id)}
                                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar del historial"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {history.length > 0 && (
                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    if (window.confirm('¿Estás seguro de que quieres limpiar todo el historial?')) {
                                        onClear();
                                    }
                                }}
                                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                            >
                                Limpiar historial
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContractHistory;
