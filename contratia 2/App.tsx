import React, { useState, useCallback, useEffect } from 'react';
import { ContractData, GeneratedLinks, ContractType } from './types';
import ContractForm from './components/ContractForm';
import ContractHistory from './components/ContractHistory';
import useAutoSave from './hooks/useAutoSave';
import useContractHistory from './hooks/useContractHistory';
import { Logo } from './components/icons';
import { CONFIG, PRICING } from './utils/constants';

const initialMusicData: ContractData = {
    numeroContrato: '001',
    nombreCliente: '',
    emailCliente: '',
    telefonoCliente: '',
    diaEvento: '',
    mesEvento: '',
    anoEvento: CONFIG.CURRENT_YEAR,
    descripcionServicio: '',
    horaServicio: '',
    costoTotal: '',
    balanceRestante: '0.00',
    tipoActividad: '',
    direccionEvento: '',
    notasAdicionales: '',
    notasFactura: '',
    aplicaDeposito: true,
    soundOption: 'pendiente',
    parkingSpaces: '5',
    language: 'es',
};

const initialBoothData: ContractData = {
    numeroContrato: '001',
    nombreCliente: '',
    emailCliente: '',
    telefonoCliente: '',
    diaEvento: '',
    mesEvento: '',
    anoEvento: CONFIG.CURRENT_YEAR,
    descripcionServicio: '',
    horaServicio: '',
    costoTotal: '0.00',
    balanceRestante: '0.00',
    tipoActividad: '',
    direccionEvento: '',
    notasAdicionales: '',
    notasFactura: '',
    aplicaDeposito: true,
    language: 'es',
    soundOption: 'pendiente', // Not used, but part of type
    parkingSpaces: '2',
    // Booth specific from PRD
    servicioPhotoBooth: false,
    servicioVideoBooth360: false,
    bocinaOpcion: 'no_contratar',
    earlySetupOpcion: 'no_contratar',
    brandingOpcion: 'no_contratar',
    ubicacionEvento: '',
    serviceHours: '2 horas',
};

const initialDjData: ContractData = {
    numeroContrato: '001',
    nombreCliente: '',
    emailCliente: '',
    telefonoCliente: '',
    diaEvento: '',
    mesEvento: '',
    anoEvento: CONFIG.CURRENT_YEAR,
    descripcionServicio: '', // Not used for DJ, but in type
    horaServicio: '', // Represents hora_inicio
    costoTotal: '0.00', // Represents honorarios_total
    balanceRestante: '0.00', // Not used for DJ, but in type
    tipoActividad: '', // Represents tipo_evento
    direccionEvento: '', // Represents venue_direccion
    notasAdicionales: '', // Represents notas_contrato
    notasFactura: '',
    aplicaDeposito: true, // DJ uses 50/50 split, now toggleable
    language: 'es',
    soundOption: 'pendiente', // Not used for DJ, but in type
    parkingSpaces: '2', // Represents cantidad_estacionamientos
    // DJ specific fields
    fecha_evento_str: '',
    hora_inicio: '',
    hora_fin: '',
    duracion_total: '0 horas',
    numero_invitados: '',
    venue_nombre: '',
    piso_evento: '',
    contacto_venue: '',
    telefono_venue: '',
    restricciones_horario: '',
    montaje: '',
    electrico: '',
    es_exterior: 'No',
    tipo_superficie: '',
    proteccion_carpa_cliente: false,
    proteccion_estructura_permanente: false,
    proteccion_sin_proteccion: false,
    proteccion_area_nivelada: false,
    proteccion_acceso_vehiculos: false,
    nombre_paquete: '',
    color_setup: '',
    deposito_50: '0.00',
    balance_50: '0.00',
};

const getInitialData = (type: ContractType) => {
    switch (type) {
        case 'music': return initialMusicData;
        case 'booth': return initialBoothData;
        case 'dj': return initialDjData;
        default: return initialMusicData;
    }
};

const ContractTypeSelector: React.FC<{
    selectedType: ContractType;
    onChange: (type: ContractType) => void;
}> = ({ selectedType, onChange }) => {
    // New "Pill" design for selector
    const baseStyle = "flex-1 text-sm md:text-base font-bold py-3 px-4 rounded-full transition-all duration-300 transform";
    const activeStyle = "bg-black text-white shadow-lg scale-105 ring-2 ring-offset-2 ring-gray-200";
    const inactiveStyle = "text-gray-500 hover:bg-white hover:text-black";

    return (
        <div className="flex flex-col md:flex-row justify-between items-center bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-[2rem] mx-auto max-w-4xl shadow-inner mb-8 border border-gray-200 gap-1 md:gap-0">
            <button
                onClick={() => onChange('music')}
                className={`${baseStyle} ${selectedType === 'music' ? activeStyle : inactiveStyle}`}
            >
                🎵 Música
            </button>
            <button
                onClick={() => onChange('booth')}
                className={`${baseStyle} ${selectedType === 'booth' ? activeStyle : inactiveStyle}`}
            >
                📸 Photo Booth
            </button>
             <button
                onClick={() => onChange('dj')}
                className={`${baseStyle} ${selectedType === 'dj' ? activeStyle : inactiveStyle}`}
            >
                🎧 DJ Set
            </button>
        </div>
    );
};


const App: React.FC = () => {
    const [contractType, setContractType] = useState<ContractType>('music');
    const [contractData, setContractData] = useState<ContractData>(getInitialData(contractType));
    const [isDownloading, setIsDownloading] = useState(false);
    const [generatedLinks, setGeneratedLinks] = useState<GeneratedLinks | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const { clearDraft, saveStatus } = useAutoSave(contractData, setContractData, `dshow-contract-draft-${contractType}`);
    const { history, addToHistory, removeFromHistory, clearHistory } = useContractHistory();

     // Auto-generate Service Description for Booths
    useEffect(() => {
        if (contractType === 'booth') {
            const services = [];
            if (contractData.servicioPhotoBooth) services.push("PHOTO BOOTH");
            if (contractData.servicioVideoBooth360) services.push("VIDEO BOOTH 360");
            
            let description = services.join(' + ');
            
            if (description && contractData.serviceHours) {
                description += ` - ${contractData.serviceHours}`;
            }

            const addons = [];
            if (contractData.bocinaOpcion === 'contratar') addons.push("Bocina");
            if (contractData.earlySetupOpcion === 'contratar') addons.push("Early Setup");
            if (contractData.brandingOpcion === 'contratar') addons.push("Full Branding");

            if (addons.length > 0) {
                description += ` + ${addons.join(' + ')}`;
            }

            if (contractData.descripcionServicio !== description) {
                setContractData(prev => ({ ...prev, descripcionServicio: description }));
            }
        }
    }, [
        contractType,
        contractData.servicioPhotoBooth,
        contractData.servicioVideoBooth360,
        contractData.serviceHours,
        contractData.bocinaOpcion,
        contractData.earlySetupOpcion,
        contractData.brandingOpcion,
        contractData.descripcionServicio
    ]);

    // Calculate Remaining Balance for Music/Booth contracts
    useEffect(() => {
        if (contractType === 'dj') return;

        let totalForBalanceCalc = parseFloat(contractData.costoTotal) || 0;

        if (contractType === 'music' && contractData.soundOption === 'upgrade') {
            totalForBalanceCalc += PRICING.SOUND_UPGRADE;
        }
        
        if (totalForBalanceCalc <= 0) {
            if (contractData.balanceRestante !== '0.00') {
                setContractData(prev => ({ ...prev, balanceRestante: '0.00' }));
            }
            return;
        }

        const deposit = contractData.aplicaDeposito ? PRICING.DEPOSIT_MUSIC_BOOTH : 0;
        const balance = totalForBalanceCalc - deposit;
        
        const newBalance = Math.max(0, balance).toFixed(2);
        if (contractData.balanceRestante !== newBalance) {
            setContractData(prev => ({ ...prev, balanceRestante: newBalance }));
        }
    }, [contractType, contractData.costoTotal, contractData.aplicaDeposito, contractData.soundOption, contractData.balanceRestante]);

    // Effect for DJ contract calculations
    useEffect(() => {
        if (contractType !== 'dj') return;

        // 1. Calculate duration
        const calculateDuration = (startStr?: string, endStr?: string): string => {
            if (!startStr || !endStr) return '0 horas';

            const parseTime = (timeStr: string) => {
                const match = timeStr.match(/(\d+):(\d+)\s(AM|PM)/);
                if (!match) return null;
                let [_, hourStr, minuteStr, period] = match;
                let hour = parseInt(hourStr, 10);
                const minute = parseInt(minuteStr, 10);

                if (period === 'PM' && hour !== 12) hour += 12;
                if (period === 'AM' && hour === 12) hour = 0;
                
                return { hour, minute };
            };

            const start = parseTime(startStr);
            const end = parseTime(endStr);

            if (!start || !end) return '0 horas';

            const startDate = new Date(0);
            startDate.setUTCHours(start.hour, start.minute);

            const endDate = new Date(0);
            endDate.setUTCHours(end.hour, end.minute);
            
            if (endDate <= startDate) { // Handles overnight events, e.g., 10 PM to 2 AM
                endDate.setUTCDate(endDate.getUTCDate() + 1);
            }
            
            let diffMs = endDate.getTime() - startDate.getTime();
            let diffHours = diffMs / (1000 * 60 * 60);

            return `${diffHours.toFixed(1).replace(/\.0$/, '')} horas`;
        }

        const newDuration = calculateDuration(contractData.hora_inicio, contractData.hora_fin);
        
        // 2. Calculate financials
        const total = parseFloat(contractData.costoTotal) || 0;
        const deposit = contractData.aplicaDeposito ? (total * 0.5).toFixed(2) : '0.00';
        const balance = contractData.aplicaDeposito ? (total * 0.5).toFixed(2) : total.toFixed(2);


        if (contractData.duracion_total !== newDuration || contractData.deposito_50 !== deposit || contractData.balance_50 !== balance) {
            setContractData(prev => ({
                ...prev,
                duracion_total: newDuration,
                deposito_50: deposit,
                balance_50: balance
            }));
        }

    }, [contractType, contractData.hora_inicio, contractData.hora_fin, contractData.costoTotal, contractData.duracion_total, contractData.deposito_50, contractData.balance_50, contractData.aplicaDeposito]);

    // Effect to sync package name with mounting type for DJ contract
    useEffect(() => {
        if (contractType !== 'dj') return;

        let newPackageName: 'Paquete Premium' | 'Paquete Deluxe' | '' = '';
        if (contractData.montaje === 'premium') {
            newPackageName = 'Paquete Premium';
        } else if (contractData.montaje === 'deluxe') {
            newPackageName = 'Paquete Deluxe';
        }

        if (contractData.nombre_paquete !== newPackageName) {
            setContractData(prev => ({
                ...prev,
                nombre_paquete: newPackageName
            }));
        }
    }, [contractType, contractData.montaje, contractData.nombre_paquete]);

    // Effect to migrate old contract number format for music drafts
    useEffect(() => {
        if (contractType === 'music' && contractData.numeroContrato && contractData.numeroContrato.includes('-')) {
            const parts = contractData.numeroContrato.split('-');
            const contractId = parts[parts.length - 1];
            setContractData(prev => ({ ...prev, numeroContrato: contractId }));
        }
    }, [contractType, contractData.numeroContrato]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setContractData(prev => ({ ...prev, [name]: checked }));
        } else {
            // For text, radio, select
            if (name === 'balanceRestante' || name === 'deposito_50' || name === 'balance_50') return;

            let finalValue = value;
            if (name === 'diaEvento' || name === 'anoEvento' || name === 'numeroContrato' || name === 'numero_invitados') {
                finalValue = value.replace(/[^0-9]/g, '');
            }

            if (name === 'fecha_evento_str') {
                // value is YYYY-MM-DD from <input type="date">
                 if (value) {
                    const date = new Date(value);
                    // Use UTC methods to avoid timezone shift issues
                    const year = date.getUTCFullYear().toString();
                    const day = date.getUTCDate().toString();
                    const monthIndex = date.getUTCMonth();
                    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
                    setContractData(prev => ({ 
                        ...prev, 
                        [name]: value,
                        diaEvento: day,
                        mesEvento: monthNames[monthIndex],
                        anoEvento: year,
                    }));
                } else {
                    setContractData(prev => ({
                        ...prev,
                        [name]: '', diaEvento: '', mesEvento: '', anoEvento: CONFIG.CURRENT_YEAR
                    }));
                }
            } else {
                setContractData(prev => ({ ...prev, [name]: finalValue }));
            }
        }
    }, []);

    const handleLanguageChange = useCallback((lang: 'es' | 'en') => {
        setContractData(prev => ({ ...prev, language: lang }));
    }, []);

    const handleClearForm = useCallback(() => {
        if (window.confirm("¿Estás seguro de que quieres limpiar todos los campos del formulario? Se perderá el borrador actual.")) {
            clearDraft();
            setContractData(getInitialData(contractType));
            setGeneratedLinks(null);
            setApiError(null);
        }
    }, [clearDraft, contractType]);
    
    const handleContractTypeChange = (newType: ContractType) => {
        if (newType === contractType) return;
        setContractType(newType);
        setGeneratedLinks(null);
        setApiError(null);
        // Let useAutoSave load the draft by setting initial data first
        setContractData(getInitialData(newType));
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] text-[#000000] font-sans flex flex-col">
            {/* Modern Dashboard Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                         <div className="flex items-center gap-3">
                            <Logo className="h-8 w-auto" />
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Auto-save status indicator */}
                            <div className="flex items-center gap-2 text-xs">
                                {saveStatus === 'saving' && (
                                    <span className="flex items-center gap-1.5 text-gray-400 animate-pulse">
                                        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        Guardando...
                                    </span>
                                )}
                                {saveStatus === 'saved' && (
                                    <span className="flex items-center gap-1 text-green-600 font-medium">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Guardado
                                    </span>
                                )}
                                {saveStatus === 'error' && (
                                    <span className="flex items-center gap-1 text-red-500 font-medium">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Error
                                    </span>
                                )}
                            </div>
                            <span className="text-xl font-black text-gray-900 font-montserrat tracking-tight">
                                CONTRATIA
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
                {/* Dashboard Intro */}
                <div className="mb-8 text-center sm:text-left">
                    <h1 className="text-3xl font-black text-gray-900 font-montserrat tracking-tight mb-2">
                        Generador de Contratos
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Selecciona el tipo de servicio y completa los detalles para generar documentos al instante.
                    </p>
                </div>

                 <ContractTypeSelector selectedType={contractType} onChange={handleContractTypeChange} />

                {/* Contract History Panel */}
                <div className="mb-6">
                    <ContractHistory
                        history={history}
                        onRemove={removeFromHistory}
                        onClear={clearHistory}
                    />
                </div>

                <ContractForm
                    contractType={contractType}
                    data={contractData}
                    onInputChange={handleInputChange}
                    onLanguageChange={handleLanguageChange}
                    onClearForm={handleClearForm}
                    isDownloading={isDownloading}
                    setIsDownloading={setIsDownloading}
                    generatedLinks={generatedLinks}
                    setGeneratedLinks={setGeneratedLinks}
                    apiError={apiError}
                    setApiError={setApiError}
                    onContractGenerated={addToHistory}
                />
            </main>
            
            <footer className="w-full py-8 text-center space-y-2 border-t border-gray-200 bg-gray-50 mt-8">
                <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                    © {new Date().getFullYear()} D' SHOW EVENTS LLC
                </p>
                <p className="text-[10px] font-bold text-[#119600] tracking-widest uppercase">
                    DESARROLLADO POR PINTADO.AI
                </p>
                <div className="pt-2">
                    <span className="inline-block bg-gray-200 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-mono">
                        v2.1.0
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default App;