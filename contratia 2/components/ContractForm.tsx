import React, { useState } from 'react';
import { ContractData, GeneratedLinks, ContractType, AddonServiceOption, EventLocation } from '../types';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Checkbox from './ui/Checkbox';
import Button from './ui/Button';
import { TrashIcon } from './icons';
import { MakeIntegrationButton } from './MakeIntegration';
import { translations, isValidPhone, normalizePhone, isValidEmail, isValidDate, isValidTimeSlot } from '../utils/translations';
import { CONFIG, PRICING, WEBHOOKS } from '../utils/constants';

// Modular form components
import {
    Section,
    RadioGroup,
    RadioOption,
    LanguageSelector,
    TimeSelector,
    DateInput,
    AddonService,
} from './forms';

interface ContractHistoryInput {
    contractNumber: string;
    contractType: ContractType;
    clientName: string;
    eventDate: string;
    links: GeneratedLinks;
}

interface ContractFormProps {
    contractType: ContractType;
    data: ContractData;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onLanguageChange: (lang: 'es' | 'en') => void;
    onClearForm: () => void;
    isDownloading: boolean;
    setIsDownloading: React.Dispatch<React.SetStateAction<boolean>>;
    generatedLinks: GeneratedLinks | null;
    setGeneratedLinks: React.Dispatch<React.SetStateAction<GeneratedLinks | null>>;
    apiError: string | null;
    setApiError: React.Dispatch<React.SetStateAction<string | null>>;
    onContractGenerated?: (item: ContractHistoryInput) => void;
}

// Webhook URLs loaded from environment variables via constants
const MAKE_WEBHOOK_URL_MUSIC = WEBHOOKS.MUSIC;
const MAKE_WEBHOOK_URL_BOOTH = WEBHOOKS.BOOTH;
const MAKE_WEBHOOK_URL_DJ = WEBHOOKS.DJ;


// Helper function to calculate setup time (2 hours before service)
const calculateMontajeTime = (serviceTime: string): string => {
    if (!serviceTime) return '---';
    const match = serviceTime.match(/(\d+):(\d+)\s(AM|PM)/);
    if (!match) return 'Hora invalida';

    let [_, hourStr, minuteStr, period] = match;
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    const eventDate = new Date();
    eventDate.setHours(hour, minute, 0, 0);
    eventDate.setHours(eventDate.getHours() - 2);

    let newHour = eventDate.getHours();
    const newMinute = eventDate.getMinutes();
    const newPeriod = newHour >= 12 ? 'PM' : 'AM';

    newHour = newHour % 12;
    newHour = newHour ? newHour : 12;

    return `${newHour}:${newMinute.toString().padStart(2, '0')} ${newPeriod}`;
};


const ContractForm: React.FC<ContractFormProps> = ({ contractType, data, onInputChange, onLanguageChange, onClearForm, isDownloading, setIsDownloading, generatedLinks, setGeneratedLinks, apiError, setApiError, onContractGenerated }) => {
    
    const [errors, setErrors] = useState<Partial<Record<keyof ContractData | string, string>>>({});

    const t = translations[data.language].form;
    const t_dj = translations[data.language].dj_form;
    
    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof ContractData | string, string>> = {};

        // Helper for music/booth date
        const getCompositeDate = () => {
            if (data.anoEvento && data.mesEvento && data.diaEvento) {
                const monthMap: { [key: string]: number } = {
                    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
                    julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
                };
                const monthNumber = monthMap[data.mesEvento.toLowerCase()];
                if (monthNumber) {
                    return `${data.anoEvento}-${String(monthNumber).padStart(2, '0')}-${String(data.diaEvento).padStart(2, '0')}`;
                }
            }
            return '';
        };

        // Common validations
        if (!data.nombreCliente.trim()) newErrors.nombreCliente = 'El nombre del cliente es requerido.';
        if (!isValidEmail(data.emailCliente)) newErrors.emailCliente = 'Introduce un correo electrónico válido.';
        if (!isValidPhone(data.telefonoCliente)) newErrors.telefonoCliente = 'Introduce un número válido de Puerto Rico/USA (10 dígitos o +1).';
        // Fix: Changed undefined variable 'type' to 'contractType' which is available from props.
        if (!data.tipoActividad.trim()) newErrors.tipoActividad = contractType === 'dj' ? 'El tipo de evento es requerido.' : 'El tipo de actividad es requerido.';
        
        // Type-specific validations
        if (contractType === 'music' || contractType === 'booth') {
            if (!data.numeroContrato.trim()) newErrors.numeroContrato = 'El No. de Contrato es requerido.';
            if (!data.direccionEvento.trim()) newErrors.direccionEvento = 'La dirección del evento es requerida.';
            const compositeDate = getCompositeDate();
            if (!isValidDate(compositeDate)) {
                 newErrors.diaEvento = 'La fecha no puede ser en el pasado.';
            } else if (!isValidTimeSlot(compositeDate, data.horaServicio)) {
                 newErrors.horaServicio = 'Selecciona un horario válido en el futuro y en intervalos de 15 minutos.';
            }
            if (contractType === 'music' && !data.descripcionServicio.trim()) newErrors.descripcionServicio = 'La descripción del servicio es requerida.';
            if (contractType === 'booth' && !data.servicioPhotoBooth && !data.servicioVideoBooth360) newErrors.servicioPhotoBooth = 'Debe seleccionar al menos un Tipo de Servicio.';
        } else if (contractType === 'dj') {
            if (!data.numeroContrato.trim()) newErrors.numeroContrato = 'El No. de Contrato es requerido.';
            if (!data.fecha_evento_str || !isValidDate(data.fecha_evento_str)) {
                newErrors.fecha_evento_str = 'La fecha no puede ser en el pasado.';
            } else {
                if (!isValidTimeSlot(data.fecha_evento_str, data.hora_inicio || '')) newErrors.hora_inicio = 'La hora de inicio debe ser futura y en un intervalo de 15 min.';
                if (!isValidTimeSlot(data.fecha_evento_str, data.hora_fin || '')) newErrors.hora_fin = 'La hora de fin debe ser futura y en un intervalo de 15 min.';
            }
            if (!data.venue_nombre) newErrors.venue_nombre = 'El nombre del venue es requerido.';
            if (!data.direccionEvento) newErrors.direccionEvento = 'La dirección del venue es requerida.';
            if (!data.montaje) newErrors.montaje = 'El tipo de montaje es requerido.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSuccess = (links: GeneratedLinks) => {
        setGeneratedLinks(links);
        setApiError(null);
        setErrors({});

        // Save to contract history
        if (onContractGenerated) {
            const eventDate = data.diaEvento && data.mesEvento && data.anoEvento
                ? `${data.diaEvento} de ${data.mesEvento} del ${data.anoEvento}`
                : 'Fecha no especificada';

            onContractGenerated({
                contractNumber: data.numeroContrato,
                contractType,
                clientName: data.nombreCliente || 'Cliente sin nombre',
                eventDate,
                links,
            });
        }
    };

    const handleClear = () => {
        setErrors({});
        onClearForm();
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name } = e.target;
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name as keyof typeof errors];
                return newErrors;
            });
        }
        onInputChange(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let error: string | undefined;

        switch (name) {
            case 'nombreCliente':
            case 'tipoActividad':
            case 'direccionEvento':
            case 'venue_nombre':
            case 'montaje':
                if (!value.trim()) error = "Este campo es requerido.";
                break;
            case 'emailCliente':
                if (!isValidEmail(value)) error = "Introduce un correo electrónico válido.";
                break;
            case 'telefonoCliente':
                if (!isValidPhone(value)) {
                    error = "Introduce un número válido de Puerto Rico/USA (10 dígitos o +1).";
                } else {
                    const normalized = normalizePhone(value);
                    if (normalized !== value) {
                        onInputChange({ target: { name, value: normalized } } as any);
                    }
                }
                break;
            case 'fecha_evento_str':
                if (!isValidDate(value)) error = "La fecha no puede ser en el pasado.";
                break;
            case 'hora_inicio':
                if (!isValidTimeSlot(data.fecha_evento_str || '', value)) error = "Hora inválida. Debe ser futura y en bloques de 15 min.";
                break;
            case 'hora_fin':
                if (!isValidTimeSlot(data.fecha_evento_str || '', value)) error = "Hora inválida. Debe ser futura y en bloques de 15 min.";
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleGenerateContract = async () => {
        setApiError(null);
        if (!validateForm()) {
            setApiError('⚠️ Por favor, corrige los errores en el formulario antes de continuar.');
            return;
        }
        setIsDownloading(true);

        try {
            const ano_contrato_current = CONFIG.CURRENT_YEAR;
            let finalPayload;
            let webhookUrl;

            if (contractType === 'music') {
                webhookUrl = MAKE_WEBHOOK_URL_MUSIC;
                finalPayload = {
                    contract_type: contractType,
                    nombre_cliente: data.nombreCliente,
                    email_cliente: data.emailCliente,
                    telefono_cliente: data.telefonoCliente,
                    dia_evento: data.diaEvento,
                    mes_evento: data.mesEvento,
                    ano_evento: data.anoEvento,
                    direccion_evento: data.direccionEvento,
                    tipo_actividad: data.tipoActividad,
                    hora_servicio: data.horaServicio,
                    notas_contrato: data.notasAdicionales || "",
                    notas_factura: data.notasFactura || "",
                    total_servicios: (parseFloat(data.costoTotal) || 0).toFixed(2),
                    balance_restante: (parseFloat(data.balanceRestante) || 0).toFixed(2),
                    aplica_deposito: data.aplicaDeposito,
                    idioma: data.language,
                    numero_contrato: data.numeroContrato,
                    ano_contrato: ano_contrato_current,
                    servicio_contratado: data.descripcionServicio,
                    opcion_sonido: data.soundOption,
                    cantidad_estacionamientos: data.parkingSpaces,
                };
            } else if (contractType === 'booth') {
                webhookUrl = MAKE_WEBHOOK_URL_BOOTH;
                finalPayload = {
                    ano_contrato: ano_contrato_current,
                    numero_contrato: data.numeroContrato,
                    fecha_emision: new Date().toLocaleDateString('es-ES'),
                    fecha_evento: translations[data.language].doc.formatDate(data.diaEvento, data.mesEvento, data.anoEvento),
                    nombre_cliente: data.nombreCliente,
                    email_cliente: data.emailCliente,
                    telefono_cliente: data.telefonoCliente,
                    dia_evento: data.diaEvento,
                    mes_evento: data.mesEvento,
                    ano_evento: data.anoEvento,
                    servicio_contratado: data.descripcionServicio,
                    hora_montaje: calculateMontajeTime(data.horaServicio),
                    hora_servicio: data.horaServicio,
                    duracion_servicio: data.serviceHours || '',
                    servicio_photo_booth: data.servicioPhotoBooth ? 'X' : '',
                    servicio_video_booth_360: data.servicioVideoBooth360 ? 'X' : '',
                    bocina_photo: data.bocinaOpcion === 'contratar' ? 'X' : '',
                    early_setup_video: data.earlySetupOpcion === 'contratar' ? 'X' : '',
                    branding_photo: data.brandingOpcion === 'contratar' ? 'X' : '',
                    ubicacion_interior: data.ubicacionEvento === 'interior' ? 'X' : '',
                    ubicacion_exterior: data.ubicacionEvento === 'exterior' ? 'X' : '',
                    direccion_evento: data.direccionEvento,
                    tipo_actividad: data.tipoActividad,
                    cantidad_estacionamientos: data.parkingSpaces,
                    total_servicios: (parseFloat(data.costoTotal) || 0).toFixed(2),
                    balance_restante: (parseFloat(data.balanceRestante) || 0).toFixed(2),
                    notas_contrato: data.notasAdicionales || "",
                    notas_factura: data.notasFactura || "",
                    aplica_deposito: data.aplicaDeposito,
                    idioma: data.language,
                };
            } else { // DJ contract
                webhookUrl = MAKE_WEBHOOK_URL_DJ;
                const today = new Date();
                const formattedDate = today.toLocaleDateString(data.language === 'es' ? 'es-PR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
                const eventDate = translations[data.language].doc.formatDate(data.diaEvento, data.mesEvento, data.anoEvento);
                
                finalPayload = {
                    formulario: 'contrato_dj',
                    idioma: data.language,
                    placeholders: {
                        ano_contrato: ano_contrato_current,
                        numero_contrato: data.numeroContrato,
                        fecha_contrato: formattedDate,
                        nombre_cliente: data.nombreCliente,
                        telefono_cliente: data.telefonoCliente,
                        tipo_evento: data.tipoActividad,
                        fecha_evento: eventDate,
                        dia_evento: data.diaEvento,
                        mes_evento: data.mesEvento,
                        ano_evento: data.anoEvento,
                        hora_inicio: data.hora_inicio || '',
                        hora_fin: data.hora_fin || '',
                        duracion_total: data.duracion_total || '',
                        numero_invitados: data.numero_invitados || '',
                        venue_nombre: data.venue_nombre || '',
                        venue_direccion: data.direccionEvento,
                        piso_evento: data.piso_evento || '___________________',
                        contacto_venue: data.contacto_venue || '___________________',
                        telefono_venue: data.telefono_venue || '___________________',
                        restricciones_horario: data.restricciones_horario || '___________________',
                        montaje_premium: data.montaje === 'premium' ? 'X' : '',
                        montaje_deluxe: data.montaje === 'deluxe' ? 'X' : '',
                        electrico_110v: data.electrico === '110v' ? 'X' : '',
                        electrico_240v: data.electrico === '240v' ? 'X' : '',
                        tipo_superficie: data.es_exterior === 'Sí' ? (data.tipo_superficie || '') : '',
                        carpa_cliente: data.es_exterior === 'Sí' && data.proteccion_carpa_cliente ? 'X' : '',
                        estructura_permanente: data.es_exterior === 'Sí' && data.proteccion_estructura_permanente ? 'X' : '',
                        sin_proteccion: data.es_exterior === 'Sí' && data.proteccion_sin_proteccion ? 'X' : '',
                        area_nivelada: data.es_exterior === 'Sí' && data.proteccion_area_nivelada ? 'X' : '',
                        acceso_vehiculos: data.es_exterior === 'Sí' && data.proteccion_acceso_vehiculos ? 'X' : '',
                        nombre_paquete: data.nombre_paquete || '',
                        color_setup: data.color_setup || '',
                        cantidad_estacionamientos: data.parkingSpaces,
                        aplica_deposito: data.aplicaDeposito,
                        honorarios_total: (parseFloat(data.costoTotal) || 0).toFixed(2),
                        deposito_50: data.deposito_50 || '0.00',
                        balance_50: data.balance_50 || '0.00',
                        notas_factura: data.notasFactura || "",
                        notas_adicionales_contrato: data.notasAdicionales || "",
                    }
                };
            }

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload),
            });
            
            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}. Respuesta: ${responseText}`);
            }

            try {
                const result = JSON.parse(responseText);
                if (result.success && result.doc_url) {
                    handleSuccess(result);
                } else {
                    throw new Error(result.message || 'La respuesta de Make.com no fue exitosa o no contenía los links esperados.');
                }
            } catch (jsonParseError) {
                // Handle cases where response is not JSON, like a simple "Accepted" string.
                throw new Error(`La respuesta del webhook no es un JSON válido. Respuesta recibida: "${responseText}"`);
            }

        } catch (error) {
            let errorMessage = 'Se produce un error al generar el contrato.\n\n';
            if (error instanceof Error) {
                errorMessage += `Detalle: ${error.message}\n\n`;
            }
            errorMessage += 'Por favor verifica:\n• La URL del webhook de Make es correcta y está configurada para devolver un JSON.\n• El scenario está activado en Make.\n• Todos los campos requeridos del formulario están llenos.\n• Tienes conexión a internet.';
            setApiError(errorMessage);
        } finally {
            setIsDownloading(false);
        }
    };
    
    const monthOptions = [
        { value: "enero", label: "Enero" }, { value: "febrero", label: "Febrero" },
        { value: "marzo", label: "Marzo" }, { value: "abril", label: "Abril" },
        { value: "mayo", label: "Mayo" }, { value: "junio", label: "Junio" },
        { value: "julio", label: "Julio" }, { value: "agosto", label: "Agosto" },
        { value: "septiembre", label: "Septiembre" }, { value: "octubre", label: "Octubre" },
        { value: "noviembre", label: "Noviembre" }, { value: "diciembre", label: "Diciembre" },
    ];

    return (
        <div className="space-y-8">
            <Section title={contractType === 'dj' ? t_dj.languageTitle : t.languageTitle}>
                <div className="md:col-span-2">
                    <LanguageSelector selected={data.language} onChange={onLanguageChange} />
                </div>
            </Section>
            
            {contractType !== 'dj' && (
                <Section title={t.clientInfoTitle}>
                    <Input label={t.clientName} name="nombreCliente" value={data.nombreCliente} onChange={handleChange} onBlur={handleBlur} placeholder={t.clientNamePlaceholder} required error={errors.nombreCliente} />
                    <Input
                        label={t.contractNumber}
                        name="numeroContrato"
                        value={data.numeroContrato}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="001"
                        maxLength={3}
                        required
                        addonText="2025-"
                        error={errors.numeroContrato}
                    />
                    <Input label="Email" name="emailCliente" value={data.emailCliente} onChange={handleChange} onBlur={handleBlur} type="email" placeholder="ejemplo@correo.com" required error={errors.emailCliente}/>
                    <Input label={t.phone} name="telefonoCliente" value={data.telefonoCliente} onChange={handleChange} onBlur={handleBlur} type="tel" placeholder="787-555-1234" required error={errors.telefonoCliente} />
                </Section>
            )}
            
            {contractType === 'booth' && (
                <>
                    <Section title={t.boothServiceTypeTitle} description={t.boothServiceTypeDesc}>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Checkbox name="servicioPhotoBooth" checked={!!data.servicioPhotoBooth} onChange={handleChange} label={t.photoBoothLabel} />
                            <Checkbox name="servicioVideoBooth360" checked={!!data.servicioVideoBooth360} onChange={handleChange} label={t.videoBooth360Label} />
                        </div>
                        {errors.servicioPhotoBooth && <p className="md:col-span-2 text-xs text-red-600 -mt-3">{errors.servicioPhotoBooth}</p>}
                    </Section>
                    <Section title={t.addonServicesTitle} description={t.addonServicesDesc}>
                       <AddonService title={t.addonSpeaker} cost={PRICING.ADDON_SPEAKER} name="bocinaOpcion" value={data.bocinaOpcion!} onChange={handleChange} t={t} />
                       <AddonService title={t.addonEarlySetup} cost={PRICING.ADDON_EARLY_SETUP} name="earlySetupOpcion" value={data.earlySetupOpcion!} onChange={handleChange} t={t} />
                       <div className="md:col-span-2">
                         <AddonService title={t.addonBranding} cost={PRICING.ADDON_BRANDING} name="brandingOpcion" value={data.brandingOpcion!} onChange={handleChange} t={t} />
                       </div>
                    </Section>
                </>
            )}

            {contractType !== 'dj' && (
              <Section title={t.eventDetailsTitle}>
                  <Input label={t.activityType} name="tipoActividad" value={data.tipoActividad} onChange={handleChange} onBlur={handleBlur} placeholder={t.activityTypePlaceholder} required error={errors.tipoActividad} />
                  <TimeSelector label={t.serviceTime} value={data.horaServicio} name="horaServicio" onChange={handleChange} onBlur={handleBlur} error={errors.horaServicio} />
                  <div className="md:col-span-2 grid grid-cols-3 gap-4">
                      <Input label={t.day} name="diaEvento" value={data.diaEvento} onChange={handleChange} onBlur={handleBlur} type="text" inputMode="numeric" placeholder="DD" maxLength={2} required error={errors.diaEvento} />
                      <div>
                           <label htmlFor="mesEvento" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t.month}</label>
                           <select id="mesEvento" name="mesEvento" value={data.mesEvento} onChange={handleChange} onBlur={handleBlur} required className="block w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl shadow-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#119600]/20 focus:border-[#119600] sm:text-sm cursor-pointer transition-all">
                               <option value="">MM</option>
                               {monthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                           </select>
                      </div>
                      <Input label={t.year} name="anoEvento" value={data.anoEvento} onChange={handleChange} onBlur={handleBlur} type="text" inputMode="numeric" placeholder="AAAA" maxLength={4} required />
                  </div>
                  {contractType === 'booth' && (
                      <div className="md:col-span-2">
                           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t.eventLocation}</label>
                           <div className="flex gap-x-8 bg-gray-50 p-4 rounded-xl border border-transparent hover:bg-gray-100 transition-colors">
                              <RadioOption id="loc-interior" name="ubicacionEvento" label={t.eventLocationIndoor} value="interior" checked={data.ubicacionEvento === 'interior'} onChange={handleChange} />
                              <RadioOption id="loc-exterior" name="ubicacionEvento" label={t.eventLocationOutdoor} value="exterior" checked={data.ubicacionEvento === 'exterior'} onChange={handleChange} />
                           </div>
                      </div>
                  )}
                  <div className="md:col-span-2">
                      <Textarea label={t.eventAddress} name="direccionEvento" value={data.direccionEvento} onChange={handleChange} onBlur={handleBlur} placeholder={t.eventAddressPlaceholder} required error={errors.direccionEvento} />
                  </div>
              </Section>
            )}
            
            {contractType === 'music' && (
                 <Section title={t.serviceDetailsTitle}>
                     <div className="md:col-span-2">
                        <Textarea label={t.serviceDescription} name="descripcionServicio" value={data.descripcionServicio} onChange={handleChange} onBlur={handleBlur} rows={4} placeholder={t.serviceDescriptionPlaceholder} required error={errors.descripcionServicio} />
                    </div>
                     <Input label={t.parkingSpaces} name="parkingSpaces" value={data.parkingSpaces} onChange={handleChange} onBlur={handleBlur} type="number" placeholder="5" required />
                     <div className="md:col-span-2">
                        <Textarea label={t.contractNotes} name="notasAdicionales" value={data.notasAdicionales} onChange={handleChange} onBlur={handleBlur} rows={3} placeholder={t.contractNotesPlaceholder} />
                    </div>
                </Section>
            )}
            
            {contractType === 'booth' && (
                <Section title={t.boothDetailsTitle}>
                    <Input label={t.serviceHours} name="serviceHours" value={data.serviceHours || ''} onChange={handleChange} onBlur={handleBlur} placeholder={t.serviceHoursPlaceholder} required />
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t.setupTime}</label>
                        <div className="block w-full px-4 py-3 bg-gray-100 text-gray-500 rounded-xl shadow-inner sm:text-sm font-mono">
                            {calculateMontajeTime(data.horaServicio)}
                        </div>
                    </div>
                     <div className="md:col-span-2">
                        <Textarea label={t.serviceDescription} name="descripcionServicio" value={data.descripcionServicio} onChange={handleChange} onBlur={handleBlur} rows={2} placeholder={t.serviceDescriptionPlaceholder} required error={errors.descripcionServicio} />
                    </div>
                    <Input label={t.parkingSpaces} name="parkingSpaces" value={data.parkingSpaces} onChange={handleChange} onBlur={handleBlur} type="number" min="1" max="10" placeholder="2" required />
                     <div className="md:col-span-2">
                        <Textarea label={t.contractNotes} name="notasAdicionales" value={data.notasAdicionales} onChange={handleChange} onBlur={handleBlur} rows={4} placeholder={t.contractNotesPlaceholder} />
                    </div>
                </Section>
            )}

            {contractType === 'music' && (
                <Section title={t.soundTitle}>
                    <div className="md:col-span-2">
                        <RadioGroup legend="Seleccione una opción">
                             <RadioOption id="sound-pendiente" label={t.soundPending} name="soundOption" value="pendiente" checked={data.soundOption === 'pendiente'} onChange={handleChange} description={t.soundPendingDesc} />
                            <RadioOption id="sound-cliente" label={t.soundClient} name="soundOption" value="cliente" checked={data.soundOption === 'cliente'} onChange={handleChange} description={t.soundClientDesc} />
                            <RadioOption id="sound-basico" label={t.soundBasic} name="soundOption" value="basico" checked={data.soundOption === 'basico'} onChange={handleChange} description={t.soundBasicDesc} />
                            <RadioOption id="sound-upgrade" label={t.soundUpgrade} name="soundOption" value="upgrade" checked={data.soundOption === 'upgrade'} onChange={handleChange} description={t.soundUpgradeDesc} />
                        </RadioGroup>
                    </div>
                </Section>
            )}
            
            {contractType !== 'dj' && (
              <Section title={t.financialInfoTitle}>
                  <Input label={t.totalCost} name="costoTotal" value={data.costoTotal} onChange={handleChange} onBlur={handleBlur} type="number" placeholder="0.00" required />
                  <div>
                      <Input label={t.remainingBalance} name="balanceRestante" value={data.balanceRestante} onChange={onInputChange} type="number" placeholder={t.remainingBalancePlaceholder} readOnly />
                      <p className="text-xs text-gray-400 mt-2 ml-1">{t.remainingBalanceDesc}</p>
                  </div>
                  <div className="md:col-span-2">
                      <Checkbox
                          label={<><strong>{t.depositCheckboxLabel}</strong><span className="font-normal text-gray-500"> (${PRICING.DEPOSIT_MUSIC_BOOTH.toFixed(2)} USD)</span></>}
                          name="aplicaDeposito"
                          checked={data.aplicaDeposito}
                          onChange={handleChange}
                      />
                  </div>
                  <div className="md:col-span-2">
                      <Textarea 
                          label={t.invoiceNotes}
                          name="notasFactura" 
                          value={data.notasFactura} 
                          onChange={handleChange} 
                          rows={3} 
                          placeholder={t.invoiceNotesPlaceholder} 
                      />
                  </div>
              </Section>
            )}

            {/* --- NEW DJ FORM --- */}
            {contractType === 'dj' && (
                <>
                    <Section title={t_dj.clientInfoTitle}>
                         <Input label={t_dj.contractNumber} name="numeroContrato" value={data.numeroContrato} onChange={handleChange} onBlur={handleBlur} placeholder="001" maxLength={3} required addonText="2025-" error={errors.numeroContrato} />
                         <Input label={t_dj.clientName} name="nombreCliente" value={data.nombreCliente} onChange={handleChange} onBlur={handleBlur} required error={errors.nombreCliente} />
                         <Input label={t_dj.phone} name="telefonoCliente" value={data.telefonoCliente} onChange={handleChange} onBlur={handleBlur} type="tel" required error={errors.telefonoCliente} />
                         <Input label="Email" name="emailCliente" value={data.emailCliente} onChange={handleChange} onBlur={handleBlur} type="email" placeholder="ejemplo@correo.com" error={errors.emailCliente} />
                    </Section>

                    <Section title={t_dj.eventDetailsTitle}>
                        <Input label={t_dj.activityType} name="tipoActividad" value={data.tipoActividad} onChange={handleChange} onBlur={handleBlur} placeholder={t_dj.activityTypePlaceholder} required error={errors.tipoActividad} />
                        <DateInput label={t_dj.eventDate} name="fecha_evento_str" value={data.fecha_evento_str || ''} onChange={handleChange} onBlur={handleBlur} required error={errors.fecha_evento_str} />
                        <TimeSelector label={t_dj.startTime} value={data.hora_inicio || ''} name="hora_inicio" onChange={handleChange} onBlur={handleBlur} error={errors.hora_inicio} />
                        <TimeSelector label={t_dj.endTime} value={data.hora_fin || ''} name="hora_fin" onChange={handleChange} onBlur={handleBlur} error={errors.hora_fin} />
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t_dj.totalDuration}</label>
                            <div className="block w-full px-4 py-3 bg-gray-100 text-gray-500 rounded-xl shadow-inner sm:text-sm font-mono">{data.duracion_total}</div>
                        </div>
                        <Input label={t_dj.guestCount} name="numero_invitados" value={data.numero_invitados || ''} onChange={handleChange} onBlur={handleBlur} type="text" inputMode="numeric" required />
                        <Input label={t_dj.venueName} name="venue_nombre" value={data.venue_nombre || ''} onChange={handleChange} onBlur={handleBlur} required error={errors.venue_nombre} />
                        <Textarea label={t_dj.venueAddress} name="direccionEvento" value={data.direccionEvento} onChange={handleChange} onBlur={handleBlur} required error={errors.direccionEvento} />
                    </Section>

                    <Section title={t_dj.venueInfoTitle} description={t_dj.venueInfoDesc}>
                        <Input label={t_dj.eventFloor} name="piso_evento" value={data.piso_evento || ''} onChange={handleChange} onBlur={handleBlur} />
                        <Input label={t_dj.venueContact} name="contacto_venue" value={data.contacto_venue || ''} onChange={handleChange} onBlur={handleBlur} />
                        <Input label={t_dj.venuePhone} name="telefono_venue" value={data.telefono_venue || ''} onChange={handleChange} onBlur={handleBlur} type="tel" />
                        <Textarea label={t_dj.setupRestrictions} name="restricciones_horario" value={data.restricciones_horario || ''} onChange={handleChange} onBlur={handleBlur} />
                    </Section>

                    <Section title={t_dj.technicalSpecsTitle}>
                        <RadioGroup legend={t_dj.setupType}>
                            <RadioOption id="montaje-premium" name="montaje" label={t_dj.setupPremium} value="premium" checked={data.montaje === 'premium'} onChange={handleChange} />
                            <RadioOption id="montaje-deluxe" name="montaje" label={t_dj.setupDeluxe} value="deluxe" checked={data.montaje === 'deluxe'} onChange={handleChange} />
                            {errors.montaje && <p className="mt-1 text-xs text-red-600 font-bold">{errors.montaje}</p>}
                        </RadioGroup>
                        <RadioGroup legend={t_dj.electricalReqs}>
                             <RadioOption id="electrico-110v" name="electrico" label="110V (Regular)" value="110v" checked={data.electrico === '110v'} onChange={handleChange} />
                            <RadioOption id="electrico-240v" name="electrico" label="240V (Large)" value="240v" checked={data.electrico === '240v'} onChange={handleChange} />
                        </RadioGroup>
                    </Section>

                    <Section title={t_dj.outdoorEventsTitle}>
                        <div className="md:col-span-2">
                            <RadioGroup legend={t_dj.isOutdoor}>
                                <div className="flex gap-x-8">
                                  <RadioOption id="exterior-si" name="es_exterior" label={t_dj.yes} value="Sí" checked={data.es_exterior === 'Sí'} onChange={handleChange} />
                                  <RadioOption id="exterior-no" name="es_exterior" label={t_dj.no} value="No" checked={data.es_exterior === 'No'} onChange={handleChange} />
                                </div>
                            </RadioGroup>
                        </div>
                        {data.es_exterior === 'Sí' && (
                            <>
                                <Input label={t_dj.surfaceType} name="tipo_superficie" value={data.tipo_superficie || ''} onChange={handleChange} onBlur={handleBlur} placeholder={t_dj.surfaceTypePlaceholder} />
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t_dj.protectionAvailable}</label>
                                    <div className="space-y-3 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                                       <Checkbox name="proteccion_carpa_cliente" checked={!!data.proteccion_carpa_cliente} onChange={handleChange} label={t_dj.protectionTent} />
                                       <Checkbox name="proteccion_estructura_permanente" checked={!!data.proteccion_estructura_permanente} onChange={handleChange} label={t_dj.protectionStructure} />
                                       <Checkbox name="proteccion_sin_proteccion" checked={!!data.proteccion_sin_proteccion} onChange={handleChange} label={t_dj.protectionNone} />
                                       <Checkbox name="proteccion_area_nivelada" checked={!!data.proteccion_area_nivelada} onChange={handleChange} label={t_dj.protectionLevelArea} />
                                       <Checkbox name="proteccion_acceso_vehiculos" checked={!!data.proteccion_acceso_vehiculos} onChange={handleChange} label={t_dj.protectionVehicleAccess} />
                                    </div>
                                </div>
                            </>
                        )}
                    </Section>

                     <Section title={t_dj.packageServicesTitle}>
                        <RadioGroup legend={t_dj.setupColor}>
                             <RadioOption id="color-negro" name="color_setup" label={t_dj.colorBlack} value="negro" checked={data.color_setup === 'negro'} onChange={handleChange} />
                             <RadioOption id="color-blanco" name="color_setup" label={t_dj.colorWhite} value="blanco" checked={data.color_setup === 'blanco'} onChange={handleChange} />
                        </RadioGroup>
                         <Input label={t_dj.parkingSpaces} name="parkingSpaces" value={data.parkingSpaces} onChange={handleChange} onBlur={handleBlur} type="text" inputMode="numeric" required />
                         <div className="md:col-span-2">
                            <Textarea label={t_dj.contractNotes} name="notasAdicionales" value={data.notasAdicionales} onChange={handleChange} onBlur={handleBlur} rows={6} placeholder={t_dj.contractNotesPlaceholder} />
                         </div>
                    </Section>

                    <Section title={t_dj.financialInfoTitle}>
                        <Input label={t_dj.totalCost} name="costoTotal" value={data.costoTotal} onChange={handleChange} onBlur={handleBlur} type="number" placeholder="0.00" required />
                        <div>
                            <Input
                                label={t_dj.remainingBalance}
                                name="balance_50" 
                                value={data.balance_50!}
                                readOnly
                            />
                            <p className="text-xs text-gray-400 mt-2 ml-1">{t_dj.remainingBalanceDesc}</p>
                        </div>
                        <div className="md:col-span-2">
                            <Checkbox 
                                label={<><strong>{t_dj.depositCheckboxLabel}</strong><span className="font-normal text-gray-500"> (50%)</span></>}
                                name="aplicaDeposito" 
                                checked={!!data.aplicaDeposito} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Textarea 
                                label={t_dj.invoiceNotes}
                                name="notasFactura" 
                                value={data.notasFactura || ''} 
                                onChange={handleChange} 
                                rows={3} 
                                placeholder={t_dj.invoiceNotesPlaceholder} 
                            />
                        </div>
                    </Section>
                </>
            )}

            {apiError && (
                <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-red-800 shadow-sm" role="alert">
                    <p className="font-bold flex items-center gap-2 text-lg">
                         <span className="text-2xl">⚠️</span> {t.errorTitle}
                    </p>
                    <pre className="mt-4 whitespace-pre-wrap font-sans text-sm bg-white p-4 rounded-xl border border-red-100 text-red-600">{apiError}</pre>
                </div>
            )}

            <div className="sticky bottom-4 z-10">
                <div className="bg-white/90 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-[2rem] p-4 flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
                    <Button variant="danger" onClick={handleClear} disabled={isDownloading} className="w-full md:w-auto">
                        <TrashIcon className="w-5 h-5 mr-2" />
                        {t.clearButton}
                    </Button>
                    
                    <div className="flex-1 w-full flex justify-end">
                    {generatedLinks ? (
                         <div className="w-full flex flex-col md:flex-row items-center gap-4 animate-fadeIn">
                             <div className="flex-1 text-center md:text-left">
                                <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-1">✓ LISTO</span>
                                {generatedLinks.file_name && <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{generatedLinks.file_name}</p>}
                             </div>
                             
                            <div className="flex items-center gap-2 w-full md:w-auto">
                               <a href={generatedLinks.doc_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                   <Button variant="info" className="w-full" disabled={isDownloading}>
                                       📝 {t.editButton}
                                   </Button>
                               </a>
                               <a href={generatedLinks.pdf_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                   <Button variant="success" className="w-full" disabled={isDownloading}>
                                       👁️ {t.viewButton}
                                   </Button>
                               </a>
                               <a href={generatedLinks.pdf_download_url} download={generatedLinks.file_name || 'contrato.pdf'} className="flex-1">
                                   <Button variant="warning" className="w-full" disabled={isDownloading}>
                                       ⬇️ {t.downloadButton}
                                   </Button>
                               </a>
                           </div>
                        </div>
                    ) : (
                        <div className="w-full md:w-auto">
                            <MakeIntegrationButton
                                onClick={handleGenerateContract}
                                isDownloading={isDownloading}
                            />
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractForm;