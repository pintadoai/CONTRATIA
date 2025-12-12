// --- VALIDATION HELPERS ---

/**
 * Puerto Rico is in Atlantic Standard Time (AST), which is UTC-4 and does not observe daylight saving.
 */
const PR_TIMEZONE_OFFSET = -4; // UTC-4

/**
 * Gets the current time in America/Puerto_Rico.
 * @returns {Date} A Date object representing the current time in Puerto Rico.
 */
export const getCurrentPRTime = (): Date => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * PR_TIMEZONE_OFFSET));
};

const PHONE_REGEX = /^\+?1?\D?(\d{3})\D?(\d{3})\D?(\d{4})$/;

/**
 * Validates a phone number for PR/USA formats.
 * // isValidPhone("7875551234") => true
 * // isValidPhone("+1 787 555 1234") => true
 * // isValidPhone("12345") => false
 */
export const isValidPhone = (value: string): boolean => {
    if (!value) return false;
    return PHONE_REGEX.test(value.trim());
};

/**
 * Normalizes a PR/USA phone number to E.164 format (+1XXXXXXXXXX).
 * // normalizePhone("787-555-1234") => "+17875551234"
 */
export const normalizePhone = (value: string): string => {
    if (!isValidPhone(value)) return '';
    const match = value.trim().match(PHONE_REGEX);
    return match ? `+1${match[1]}${match[2]}${match[3]}` : value;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validates an email address.
 * // isValidEmail("test@example.com") => true
 * // isValidEmail("test@example") => false
 */
export const isValidEmail = (value: string): boolean => {
    if (!value) return false;
    return EMAIL_REGEX.test(value.trim());
};

/**
 * Checks if a given date is today or in the future, considering PR timezone.
 * @param {string} dateValue A date string in 'YYYY-MM-DD' format.
 */
export const isValidDate = (dateValue: string): boolean => {
    if (!dateValue || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return false;
    
    const prNow = getCurrentPRTime();
    const prStartOfDay = new Date(prNow.getFullYear(), prNow.getMonth(), prNow.getDate());

    const [year, month, day] = dateValue.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);

    return selectedDate.getTime() >= prStartOfDay.getTime();
};

/**
 * Validates if a selected time slot is valid for a given date.
 * @param {string} dateValue Date string in 'YYYY-MM-DD'.
 * @param {string} timeValue Time string like 'H:MM AM/PM'.
 */
export const isValidTimeSlot = (dateValue: string, timeValue: string): boolean => {
    if (!dateValue || !timeValue || !isValidDate(dateValue)) return false;
    
    const timeMatch = timeValue.match(/(\d+):(\d+)\s(AM|PM)/);
    if (!timeMatch) return false;
    
    const minute = parseInt(timeMatch[2], 10);
    if (![0, 15, 30, 45].includes(minute)) return false;

    const prTime = getCurrentPRTime();
    
    const [year, month, day] = dateValue.split('-').map(Number);
    const prDateToday = new Date(prTime.getFullYear(), prTime.getMonth(), prTime.getDate());
    const selectedDate = new Date(year, month - 1, day);

    if (selectedDate.getTime() > prDateToday.getTime()) {
        return true; // Future date is always valid
    }
    
    // If date is today, check if time is in the future.
    let [_, hourStr, minuteStr, period] = timeMatch;
    let hour = parseInt(hourStr, 10);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0; // Midnight case

    const selectedDateTime = new Date(selectedDate.getTime());
    selectedDateTime.setHours(hour, parseInt(minuteStr, 10), 0, 0);

    return selectedDateTime > prTime;
};


// --- TRANSLATIONS ---

const es = {
    form: {
        languageTitle: "Idioma del Contrato",
        clientInfoTitle: "Información del Cliente",
        clientName: "Nombre Completo",
        clientNamePlaceholder: "Ej: Juan Pérez",
        contractNumber: "No. de Contrato",
        phone: "Teléfono",
        eventDetailsTitle: "Detalles del Evento",
        activityType: "Tipo de Actividad",
        activityTypePlaceholder: "Boda, Cumpleaños, Corporativo",
        serviceTime: "Hora del Servicio",
        day: "Día",
        month: "Mes",
        year: "Año",
        eventAddress: "Dirección del Evento",
        eventAddressPlaceholder: "Salón de eventos, dirección completa",
        serviceDetailsTitle: "Detalles del Servicio Contratado",
        parkingSpaces: "Espacios de Estacionamiento",
        serviceDescription: "Descripción del Servicio (Auto-generado)",
        serviceDescriptionPlaceholder: "Se completa al seleccionar servicios",
        contractNotes: "Notas (Contrato)",
        contractNotesPlaceholder: "Cláusulas especiales, acuerdos, etc.",
        soundTitle: "Sonido",
        soundPending: "Pendiente (Cliente decide)",
        soundPendingDesc: "El cliente escogerá la opción al recibir el contrato.",
        soundClient: "Sonido provisto por el cliente",
        soundClientDesc: "El cliente suple el sistema de sonido y 2 micrófonos con stands.",
        soundBasic: "Sonido básico (Incluido)",
        soundBasicDesc: "Sistema compacto profesional para hasta 25 personas.",
        soundUpgrade: "Upgrade a sonido profesional grande (+$150 USD)",
        soundUpgradeDesc: "Sistema de mayor potencia para eventos grandes.",
        financialInfoTitle: "Información Financiera",
        totalCost: "Costo Total (USD)",
        remainingBalance: "Balance Restante (USD)",
        remainingBalancePlaceholder: "Calculado automáticamente",
        remainingBalanceDesc: "Se calcula automáticamente basado en el costo y depósito.",
        depositCheckboxLabel: "Aplica Depósito para reservar",
        invoiceNotes: "Notas Adicionales para la Factura",
        invoiceNotesPlaceholder: "Añada aquí cláusulas o notas requeridas solo en la factura.",
        errorTitle: "Error al Generar Contrato",
        clearButton: "Limpiar",
        successTitle: "Contrato Generado Exitosamente",
        fileLabel: "Archivo",
        editButton: "Editar Documento",
        viewButton: "Ver PDF",
        downloadButton: "Descargar PDF",
        // --- NEW BOOTH FORM (PRD) ---
        boothServiceTypeTitle: "Tipo de Servicio Contratado",
        boothServiceTypeDesc: "Seleccione uno o ambos servicios (puede marcar ambos):",
        photoBoothLabel: "PHOTO BOOTH - Cabina de fotos digitales",
        videoBooth360Label: "VIDEO BOOTH 360 - Plataforma giratoria",
        addonServicesTitle: "Servicios Adicionales (Opcional)",
        addonServicesDesc: "Para cada servicio, seleccione una opción:",
        addonSpeaker: "Bocina para poner música en el área del Booth",
        addonEarlySetup: '"Early Setup" - Montaje temprano',
        addonBranding: '"Full Branding" del Booth con la marca del cliente',
        addonCost: "Costo",
        addonHire: "Contratar",
        addonNoHire: "No contratar",
        addonPending: "Pendiente - Cliente decide",
        eventLocation: "Ubicación del Evento",
        eventLocationIndoor: "Interior",
        eventLocationOutdoor: "Exterior",
        boothDetailsTitle: "Detalles del Booth",
        serviceHours: "Horas de Servicio (Duración)",
        serviceHoursPlaceholder: "Ej: 2 horas, 3 horas",
        setupTime: "Hora de Montaje (Auto-calculado)",
    },
    dj_form: {
        languageTitle: "Idioma del Contrato",
        clientInfoTitle: "Información del Cliente",
        contractNumber: "No. de Contrato",
        clientName: "Nombre Completo",
        phone: "Teléfono",
        eventDetailsTitle: "Detalles del Evento",
        activityType: "Tipo de Evento",
        activityTypePlaceholder: "Boda, Cumpleaños, Quinceañero...",
        eventDate: "Fecha del Evento",
        startTime: "Hora de Inicio",
        endTime: "Hora de Finalización",
        totalDuration: "Duración Total",
        guestCount: "Número de Invitados",
        venueName: "Nombre del Venue",
        venueAddress: "Dirección del Venue",
        venueInfoTitle: "Información del Venue",
        venueInfoDesc: "Opcional - puede completarse después",
        eventFloor: "Piso del Evento",
        venueContact: "Contacto del Venue",
        venuePhone: "Teléfono de Emergencia del Venue",
        setupRestrictions: "Restricciones de Horario para Montaje",
        technicalSpecsTitle: "Especificaciones Técnicas",
        setupType: "Tipo de Montaje Requerido",
        setupPremium: "Paquete Premium (hasta 150 personas)",
        setupDeluxe: "Paquete Deluxe (más de 150 personas)",
        electricalReqs: "Requisitos Eléctricos",
        outdoorEventsTitle: "Eventos Exteriores",
        isOutdoor: "¿El evento es al aire libre?",
        yes: "Sí",
        no: "No",
        surfaceType: "Tipo de Superficie",
        surfaceTypePlaceholder: "césped, concreto, arena...",
        protectionAvailable: "Protección Disponible (opcional)",
        protectionTent: "Carpa/toldo proporcionado por cliente",
        protectionStructure: "Estructura permanente (gazebo/pérgola)",
        protectionNone: "Sin protección (+$150 carpa D Show)",
        protectionLevelArea: "Área nivelada y con drenaje adecuado",
        protectionVehicleAccess: "Acceso para vehículos de instalación",
        packageServicesTitle: "Paquete y Servicios",
        setupColor: "Color del Setup",
        colorBlack: "Negro",
        colorWhite: "Blanco",
        parkingSpaces: "Espacios de Estacionamiento",
        contractNotes: "Notas Adicionales",
        contractNotesPlaceholder: "Especifique aquí cualquier detalle, acuerdo especial o cláusula adicional para el contrato.",
        financialInfoTitle: "Información Financiera",
        totalCost: "Costo Total (USD)",
        deposit50: "Depósito (50%)",
        balance50: "Balance Restante (50%)",
        remainingBalance: "Balance Restante (USD)",
        remainingBalanceDesc: "Se calcula automáticamente basado en el costo y depósito.",
        depositCheckboxLabel: "Aplica Depósito para reservar",
        invoiceNotes: "Notas Adicionales para la Factura",
        invoiceNotesPlaceholder: "Añada aquí cláusulas o notas requeridas solo en la factura.",
    },
    doc: {
        contractTitle: "CONTRATO DE SERVICIOS",
        clientNamePlaceholder: "Nombre del Cliente",
        intro1: "Por una parte, ",
        intro2: ", de ahora en adelante denominado \"CLIENTE\", y contratando los servicios de D' Show Events, de ahora en adelante el \"PROVEEDOR\", acuerdan los siguientes términos:",
        notProvided: "No provisto",
        phone: "Teléfono",
        noNotes: "Sin notas adicionales.",

        c_depositTitle: "DEPÓSITO Y PAGO FINAL",
        c_deposit_p1_withDeposit: "El cliente acuerda realizar un depósito de $125.00 para reservar los servicios de D' Show Events. Este depósito no es reembolsable.",
        c_deposit_p2_withDeposit: "El balance restante se pagará en su totalidad ANTES de comenzar los servicios contratados en la fecha del evento.",
        c_deposit_p3_withDeposit: "En caso de cancelación por parte del cliente, se aplicarán los siguientes cargos:",
        c_deposit_b1_withDeposit: "Menos de 5 días calendario antes del evento: se facturará un 50% del costo total (acreditando el depósito).",
        c_deposit_b2_withDeposit: "48 horas o menos antes del evento: se facturará un 75% del costo total (acreditando el depósito).",
        c_deposit_p4_withDeposit: "Si el proveedor cancela por cualquier razón, se devolverá al cliente el 100% del depósito.",
        c_deposit_p1_noDeposit: "No se requiere depósito para reservar. La firma de este contrato formaliza la reserva de la fecha y los servicios.",
        c_deposit_p2_noDeposit: "El pago del 100% del costo total se realizará en su totalidad ANTES de comenzar los servicios contratados en la fecha del evento.",
        c_deposit_p3_noDeposit: "En caso de cancelación por parte del cliente, se aplicarán los siguientes cargos administrativos:",
        c_deposit_b1_noDeposit: "Menos de 5 días calendario antes del evento: cargo del 50% del costo total.",
        c_deposit_b2_noDeposit: "48 horas o menos antes del evento: cargo del 75% del costo total.",
        c_deposit_p4_noDeposit: "Si el PROVEEDOR cancela, este contrato quedará sin efecto y el cliente no incurrirá en ningún cargo.",

        c_punctualityTitle: "PUNTUALIDAD Y CAMBIOS DE HORARIO",
        c_punctuality_p1: "La puntualidad del cliente es esencial. Si el cliente no cumple con la hora estipulada, el servicio podrá verse reducido. Si el retraso impide completamente la prestación, el cliente estará obligado al pago completo. Cambios de horario el mismo día del evento conllevan un cargo administrativo de $100.00.",
        c_punctuality_p2: "D' Show Events no oferecerá reembolsos por servicios no prestados debido a retrasos del cliente, ni por causas externas inevitables (tránsito, condiciones imprevistas). No obstante, el proveedor hará esfuerzos razonables por adaptarse.",

        c_soundTitle: "SONIDO",
        c_sound_optClient: "Opción seleccionada: Sonido provisto por el cliente. El cliente suple el sistema de sonido, incluyendo dos (2) micrófonos con stands, garantizando su óptimo funcionamiento.",
        c_sound_optBasic: "Opción seleccionada: Sonido básico provisto por D' Show Events. Sistema compacto profesional para hasta 25 personas. Incluido sin costo adicional.",
        c_sound_optUpgrade: "Opción seleccionada: Upgrade a sonido profesional grande. Sistema de mayor potencia para eventos grandes. Cargo adicional de $150.00 USD.",
        c_sound_optPending_action: "ACCIÓN REQUERIDA POR EL CLIENTE:",
        c_sound_optPending_instruction: "Por favor, marque con una (X) la opción de sonido de su preferencia:",
        c_sound_optPending_p1: "ACCIÓN REQUERIDA: Por favor, marque con una (X) la opción de sonido de su preferencia:",
        c_sound_optPending_b1: "[__] Opción 1: Sonido provisto por el cliente. El cliente suple el sistema de sonido, incluyendo dos (2) micrófonos con stands.",
        c_sound_optPending_b2: "[__] Opción 2: Sonido básico (incluido). Sistema compacto profesional para hasta 25 personas.",
        c_sound_optPending_b3: "[__] Opción 3: Upgrade a sonido profesional (+$150.00 USD). Sistema de mayor potencia para eventos grandes.",
        c_sound_optPending_b1_title: "[__] Opción 1: Sonido provisto por el cliente.",
        c_sound_optPending_b1_desc: "El cliente suple el sistema de sonido, incluyendo dos (2) micrófonos con stands, garantizando su óptimo funcionamiento.",
        c_sound_optPending_b2_title: "[__] Opción 2: Sonido básico (incluido).",
        c_sound_optPending_b2_desc: "Sistema compacto profesional para hasta 25 personas. Incluido sin costo adicional.",
        c_sound_optPending_b3_title: "[__] Opción 3: Upgrade a sonido profesional (+$150.00 USD).",
        c_sound_optPending_b3_desc: "Sistema de mayor potencia para eventos grandes. Se añade el cargo adicional al balance restante.",
        c_sound_optPending_b1_full: "[__] Opción 1: Sonido provisto por el cliente. El cliente suple el sistema de sonido, incluyendo dos (2) micrófonos con stands.",
        c_sound_optPending_b2_full: "[__] Opción 2: Sonido básico (incluido). Sistema compacto profesional para hasta 25 personas.",
        c_sound_optPending_b3_full: "[__] Opción 3: Upgrade a sonido profesional (+$150.00 USD). Sistema de mayor potencia para eventos grandes.",
        c_sound_p2: "El proveedor no se hace responsable por fallas técnicas o eléctricas fuera de su control. Si el daño es causado por negligencia directa del proveedor, este asumirá los costos.",
        
        c_accessTitle: "ACCESO Y ESTACIONAMiento",
        c_access_p1_1: "El cliente cubrirá los gastos de estacionamiento del personal del proveedor (",
        c_access_p1_2: " espacios) y gestionará los permisos de acceso. Si no se realizan estas gestiones, los retrasos o limitaciones que resulten no serán responsabilidad del proveedor.",
        
        c_rescheduleTitle: "CAMBIOS DE FECHA",
        c_reschedule_p1: "El cliente podrá realizar un (1) cambio de fecha sin costo adicional, sujeto a la disponibilidad del PROVEEDOR, siempre que se notifique por escrito con más de 30 días de antelación a la fecha original del evento. Cambios adicionales o solicitados con menos de 30 días de antelación conllevan un cargo administrativo de $50.00.",
        c_reschedule_p2: "Toda cancelación o solicitud de cambio de fecha debe realizarse por escrito (email o mensaje confirmado) para ser válida.",
        
        c_staffImagesTitle: "DERECHO DE USO DE IMÁGENES DEL PERSONAL",
        c_staffImages_p1: "El proveedor podrá utilizar fotografías o videos que incluyan exclusivamente a su personal (músicos, talentos, artistas) para promoción y redes, garantizando la privacidad del cliente.",
        
        c_safetyTitle: "SEGURIDAD DEL PERSONAL",
        c_safety_p1: "La seguridad del personal de D' Show Events es prioritaria. Ante cualquier situación de acoso, hostilidad o peligro, el personal podrá retirarse sin penalidad ni reembolso.",

        c_commsTitle: "COMUNICACIONES OFICIALES",
        c_comms_provider: "Contacto del Proveedor",
        c_comms_client: "Contacto del Cliente",
        c_comms_pLast: "Las notificaciones serán válidas una vez confirmada su recepción por cualquiera de las partes.",

        c_clientContentTitle: "CONTENIDO GENERADO POR EL CLIENTE",
        c_clientContent_p1: "El cliente y sus invitados pueden grabar o compartir libremente durante el evento. Se agradece (pero no se requiere) etiquetar a @dshowevents al publicar contenido en redes.",
        c_clientContent_p2: "Nuestras Redes:",
        
        c_liabilityTitle: "LIMITACIÓN DE RESPONSABILIDAD",
        c_liability_p1: "La responsabilidad total del proveedor no excederá el monto pagado por el cliente. No se responderá por daños indirectos, pérdida de ganancias, o problemas técnicos del venue o terceros.",
        
        c_indemnificationTitle: "INDEMNIZACIÓN",
        c_indemnification_p1: "El cliente mantendrá indemne a D' Show Events LLC frente a cualquier reclamo o daño derivado de actos, omisiones o incumplimientos del cliente o sus invitados.",

        c_forceMajeureTitle: "FUERZA MAYOR",
        c_forceMajeure_p1: "Ninguna parte será responsable si el incumplimiento resulta de causas fuera de su control razonable (huracanes, apagones, pandemias, disturbios, restricciones gubernamentales, etc.). La parte afectada notificará dentro de 48 horas. Podrán reprogramar dentro de 30 días o, si no es posible, el proveedor reembolsará el depósito menos los gastos incurridos (máx. 25%).",

        c_jurisdictionTitle: "JURISDICCIÓN Y LEGISLAÇÃO APLICABLE",
        c_jurisdiction_p1: "Este contrato se regirá por las leyes del Estado Libre Asociado de Puerto Rico. Cualquier disputa será tratada primero mediante comunicación directa, luego mediación, y finalmente ante los tribunales de San Juan o Bayamón.",

        summary_detailsTitle: "RESUMEN DE DETALLES DEL SERVICIO",
        summary_service: "Servicio contratado:",
        summary_time: "Hora de los servicios:",
        summary_totalCost: "Costo total:",
        summary_balance: "Balance restante:",
        summary_address: "Dirección del evento:",
        summary_activity: "Tipo de actividad:",
        summary_date: "Fecha del evento:",
        summary_notes: "Notas:",

        summary_paymentTitle: "RESUMEN DE DEPÓSITO Y PAGO",
        summary_deposit: "Depósito:",
        summary_parking: "Estacionamientos requeridos:",
        summary_checks: "Cheques a nombre de:",
        parkingSpaces: (s: string) => `${s} espacios`,

        c_confirmationTitle: "CONFIRMACIÓN Y FIRMAS",
        c_confirmation_p1: "Yo, __________________, certifico en la fecha de hoy _____ de ____________ del _______, que entiendo y acepto los términos y condiciones establecidos en este documento, formalizando la contratación de los servicios para el día ",
        c_confirmation_p1_part1: "Yo,",
        c_confirmation_p1_part2: "certifico en la fecha de hoy",
        c_confirmation_p1_part3: "de",
        c_confirmation_p1_part4: "del",
        c_confirmation_p1_part5: "que entiendo y acepto los términos y condiciones establecidos en este documento, formalizando la contratación de los servicios para el día",
        c_confirmation_p1_full: (date: string) => `Yo, ______________________, certifico en la fecha de hoy ____________ que entiendo y acepto los términos y condiciones establecidos en este documento, formalizando la contratación de los servicios para el día ${date}.`,

        signature_client: (name: string) => `Firma de ${name} / Representante`,
        signature_provider: "Representante Autorizado",

        invoice_title: "FACTURA",
        invoice_subtitle: (num: string) => `Anexo al Contrato #${num}`,
        invoice_billTo: "FACTURAR A",
        invoice_from: "DE",
        invoice_number: "No. Factura",
        invoice_issueDate: "Fecha de Emisión",
        invoice_eventDate: "Fecha del Evento",
        invoice_tableDesc: "Descripción",
        invoice_tableTotal: "Total",
        invoice_serviceDesc: "Servicios Artísticos y Técnicos",
        invoice_serviceDesc_placeholder: "Según descrito en contrato.",
        invoice_soundUpgrade: "Upgrade de Sonido Profesional",
        invoice_subtotal: "Subtotal",
        invoice_depositPaid: "Depósito Pagado",
        invoice_balanceDue: "Balance Restante",
        invoice_notes: "Notas Adicionales",
        invoice_notes_placeholder: "El balance restante debe ser saldado en su totalidad antes del comienzo del servicio en la fecha del evento.",
        invoice_thankYou: "¡Gracias por elegir a D' Show Events!",
        invoice_footer: "Para preguntas sobre esta factura, contáctenos en info@dshowevents.com",

        formatTime12Hour: (time: string): string => {
            if (!time) return '';
            return time; // Already in 12-hour format
        },
        formatDate: (day: string, month: string, year: string): string => {
            if (!day || !month || !year) return `DD de Mes de AAAA`;
            const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
            return `${day || 'DD'} de ${capitalizedMonth || 'Mes'} del ${year || 'AAAA'}`;
        },
    }
};

const en = {
    form: {
        languageTitle: "Contract Language",
        clientInfoTitle: "Client Information",
        clientName: "Full Name",
        clientNamePlaceholder: "Ex: John Doe",
        contractNumber: "Contract No.",
        phone: "Phone",
        eventDetailsTitle: "Event Details",
        activityType: "Activity Type",
        activityTypePlaceholder: "Wedding, Birthday, Corporate",
        serviceTime: "Service Time",
        day: "Day",
        month: "Month",
        year: "Year",
        eventAddress: "Event Address",
        eventAddressPlaceholder: "Venue, full address",
        serviceDetailsTitle: "Contracted Service Details",
        parkingSpaces: "Parking Spaces",
        serviceDescription: "Service Description (Auto-generated)",
        serviceDescriptionPlaceholder: "Completed when selecting services",
        contractNotes: "Notes (Contract)",
        contractNotesPlaceholder: "Special clauses, agreements, etc.",
        soundTitle: "Sound System",
        soundPending: "Pending (Client decides)",
        soundPendingDesc: "The client will choose the option upon receiving the contract.",
        soundClient: "Sound provided by client",
        soundClientDesc: "Client supplies the sound system and 2 microphones with stands.",
        soundBasic: "Basic Sound (Included)",
        soundBasicDesc: "Compact professional system for up to 25 people.",
        soundUpgrade: "Upgrade to Large Professional Sound (+$150 USD)",
        soundUpgradeDesc: "Higher power system for large events.",
        financialInfoTitle: "Financial Information",
        totalCost: "Total Cost (USD)",
        remainingBalance: "Remaining Balance (USD)",
        remainingBalancePlaceholder: "Calculated automatically",
        remainingBalanceDesc: "Calculated automatically based on cost and deposit.",
        depositCheckboxLabel: "Deposit Required to Book",
        invoiceNotes: "Additional Notes for Invoice",
        invoiceNotesPlaceholder: "Add any clauses or notes here required only on the invoice.",
        errorTitle: "Error Generating Contract",
        clearButton: "Clear",
        successTitle: "Contract Generated Successfully",
        fileLabel: "File",
        editButton: "Edit Document",
        viewButton: "View PDF",
        downloadButton: "Download PDF",
        // --- NEW BOOTH FORM (PRD) ---
        boothServiceTypeTitle: "Contracted Service Type",
        boothServiceTypeDesc: "Select one or both services (you can check both):",
        photoBoothLabel: "PHOTO BOOTH - Digital photo booth",
        videoBooth360Label: "VIDEO BOOTH 360 - Revolving platform",
        addonServicesTitle: "Additional Services (Optional)",
        addonServicesDesc: "For each service, select an option:",
        addonSpeaker: "Speaker to play music in the Booth area",
        addonEarlySetup: '"Early Setup"',
        addonBranding: '"Full Branding" of the Booth with the client\'s brand',
        addonCost: "Cost",
        addonHire: "Hire",
        addonNoHire: "Do not hire",
        addonPending: "Pending - Client decides",
        eventLocation: "Event Location",
        eventLocationIndoor: "Indoor",
        eventLocationOutdoor: "Outdoor",
        boothDetailsTitle: "Booth Details",
        serviceHours: "Service Hours (Duration)",
        serviceHoursPlaceholder: "Ex: 2 hours, 3 hours",
        setupTime: "Setup Time (Auto-calculated)",
    },
    dj_form: {
        languageTitle: "Contract Language",
        clientInfoTitle: "Client Information",
        contractNumber: "Contract No.",
        clientName: "Full Name",
        phone: "Phone",
        eventDetailsTitle: "Event Details",
        activityType: "Event Type",
        activityTypePlaceholder: "Wedding, Birthday, Sweet 16...",
        eventDate: "Event Date",
        startTime: "Start Time",
        endTime: "End Time",
        totalDuration: "Total Duration",
        guestCount: "Number of Guests",
        venueName: "Venue Name",
        venueAddress: "Venue Address",
        venueInfoTitle: "Venue Information",
        venueInfoDesc: "Optional - can be completed later",
        eventFloor: "Event Floor",
        venueContact: "Venue Contact",
        venuePhone: "Venue Emergency Phone",
        setupRestrictions: "Setup Time Restrictions",
        technicalSpecsTitle: "Technical Specifications",
        setupType: "Required Setup Type",
        setupPremium: "Premium Package (up to 150 guests)",
        setupDeluxe: "Deluxe Package (over 150 guests)",
        electricalReqs: "Electrical Requirements",
        outdoorEventsTitle: "Outdoor Events",
        isOutdoor: "Is the event outdoors?",
        yes: "Yes",
        no: "No",
        surfaceType: "Surface Type",
        surfaceTypePlaceholder: "grass, concrete, sand...",
        protectionAvailable: "Available Protection (optional)",
        protectionTent: "Tent/canopy provided by client",
        protectionStructure: "Permanent structure (gazebo/pergola)",
        protectionNone: "No protection (+$150 D Show tent)",
        protectionLevelArea: "Level area with proper drainage",
        protectionVehicleAccess: "Access for setup vehicles",
        packageServicesTitle: "Package and Services",
        setupColor: "Setup Color",
        colorBlack: "Black",
        colorWhite: "White",
        parkingSpaces: "Parking Spaces",
        contractNotes: "Additional Notes",
        contractNotesPlaceholder: "Specify any details, special agreements, or additional clauses for the contract here.",
        financialInfoTitle: "Financial Information",
        totalCost: "Total Cost (USD)",
        deposit50: "Deposit (50%)",
        balance50: "Remaining Balance (50%)",
        remainingBalance: "Remaining Balance (USD)",
        remainingBalanceDesc: "Calculated automatically based on cost and deposit.",
        depositCheckboxLabel: "Apply Deposit to reserve",
        invoiceNotes: "Additional Notes for Invoice",
        invoiceNotesPlaceholder: "Add any clauses or notes here required only on the invoice.",
    },
    doc: {
        contractTitle: "SERVICE AGREEMENT",
        clientNamePlaceholder: "Client Name",
        intro1: "This agreement is made between ",
        intro2: ", hereinafter referred to as the \"CLIENT\", and D' Show Events, hereinafter referred to as the \"PROVIDER\". Both parties agree to the following terms:",
        notProvided: "Not provided",
        phone: "Phone",
        noNotes: "No additional notes.",

        c_depositTitle: "DEPOSIT AND FINAL PAYMENT",
        c_deposit_p1_withDeposit: "The CLIENT agrees to make a non-refundable deposit of $125.00 to reserve the services of D' Show Events.",
        c_deposit_p2_withDeposit: "The remaining balance must be paid in full BEFORE the contracted services begin on the event date.",
        c_deposit_p3_withDeposit: "In case of cancellation by the CLIENT, the following charges will apply:",
        c_deposit_b1_withDeposit: "Less than 5 calendar days before the event: 50% of the total cost will be billed (deposit credited).",
        c_deposit_b2_withDeposit: "48 hours or less before the event: 75% of the total cost will be billed (deposit credited).",
        c_deposit_p4_withDeposit: "If the PROVIDER cancels for any reason, 100% of the deposit will be returned to the CLIENT.",
        c_deposit_p1_noDeposit: "No deposit is required to book. Signing this contract formalizes the reservation of the date and services.",
        c_deposit_p2_noDeposit: "100% of the total cost must be paid in full BEFORE the contracted services begin on the event date.",
        c_deposit_p3_noDeposit: "In case of cancellation by the CLIENT, the following administrative charges will apply:",
        c_deposit_b1_noDeposit: "Less than 5 calendar days before the event: a charge of 50% of the total cost.",
        c_deposit_b2_noDeposit: "48 hours or less before the event: a charge of 75% of the total cost.",
        c_deposit_p4_noDeposit: "If the PROVIDER cancels, this contract will be void, and the CLIENT will incur no charges.",

        c_punctualityTitle: "PUNCTUALITY AND SCHEDULE CHANGES",
        c_punctuality_p1: "CLIENT's punctuality is essential. If the CLIENT fails to adhere to the stipulated time, the service may be shortened. If the delay completely prevents service delivery, the CLIENT is obligated to pay in full. Same-day schedule changes incur a $100.00 administrative fee.",
        c_punctuality_p2: "D' Show Events will not offer refunds for services not rendered due to CLIENT delays or unavoidable external causes (traffic, unforeseen conditions). However, the PROVIDER will make reasonable efforts to adapt.",

        c_soundTitle: "SOUND SYSTEM",
        c_sound_optClient: "Selected option: Sound provided by the client. The client supplies the sound system, including two (2) microphones with stands, ensuring their optimal functionality.",
        c_sound_optBasic: "Selected option: Basic sound provided by D' Show Events. A compact professional system for up to 25 people. Included at no extra cost.",
        c_sound_optUpgrade: "Selected option: Upgrade to large professional sound. A higher power system for large events. An additional charge of $150.00 USD applies.",
        c_sound_optPending_action: "ACTION REQUIRED BY CLIENT:",
        c_sound_optPending_instruction: "Please mark your preferred sound option with an (X):",
        c_sound_optPending_p1: "ACTION REQUIRED: Please mark your preferred sound option with an (X):",
        c_sound_optPending_b1: "[__] Option 1: Sound provided by the client. Client supplies the sound system, including two (2) microphones with stands.",
        c_sound_optPending_b2: "[__] Option 2: Basic sound (included). Compact professional system for up to 25 people.",
        c_sound_optPending_b3: "[__] Option 3: Upgrade to professional sound (+$150.00 USD). Higher power system for large events.",
        c_sound_optPending_b1_title: "[__] Option 1: Sound provided by client.",
        c_sound_optPending_b1_desc: "The client supplies the sound system, including two (2) microphones with stands, ensuring optimal functionality.",
        c_sound_optPending_b2_title: "[__] Option 2: Basic sound (included).",
        c_sound_optPending_b2_desc: "Compact professional system for up to 25 people. Included at no extra cost.",
        c_sound_optPending_b3_title: "[__] Option 3: Upgrade to professional sound (+$150.00 USD).",
        c_sound_optPending_b3_desc: "Higher power system for large events. The additional charge will be added to the remaining balance.",
        c_sound_optPending_b1_full: "[__] Option 1: Sound provided by the client. The client supplies the sound system, including two (2) microphones with stands, ensuring optimal functionality.",
        c_sound_optPending_b2_full: "[__] Option 2: Basic sound (included). Compact professional system for up to 25 people. Included at no extra cost.",
        c_sound_optPending_b3_full: "[__] Option 3: Upgrade to professional sound (+$150.00 USD). Higher power system for large events. The additional charge will be added to the remaining balance.",
        c_sound_p2: "The PROVIDER is not responsible for technical or electrical failures beyond its control. If damage is caused by the PROVIDER's direct negligence, the PROVIDER will assume the costs.",

        c_accessTitle: "ACCESS AND PARKING",
        c_access_p1_1: "The CLIENT will cover parking costs for the PROVIDER's staff (",
        c_access_p1_2: " spaces) and will arrange any necessary access permits. Failure to do so may result in delays or limitations for which the PROVIDER is not responsible.",

        c_rescheduleTitle: "DATE CHANGES",
        c_reschedule_p1: "The CLIENT may make one (1) date change at no additional cost, subject to the PROVIDER's availability, provided it is requested in writing more than 30 days before the original event date. Additional changes or those requested with less than 30 days' notice will incur a $50.00 administrative fee.",
        c_reschedule_p2: "All cancellations or date change requests must be made in writing (confirmed email or message) to be valid.",

        c_staffImagesTitle: "USE OF STAFF IMAGERY",
        c_staffImages_p1: "The PROVIDER may use photographs or videos that exclusively feature its personnel (musicians, talents, artists) for promotion and social media, ensuring the CLIENT's privacy.",

        c_safetyTitle: "STAFF SAFETY",
        c_safety_p1: "The safety of D' Show Events staff is a priority. In any situation of harassment, hostility, or danger, the staff may withdraw without penalty or refund.",

        c_commsTitle: "OFFICIAL COMMUNICATIONS",
        c_comms_provider: "Provider's Contact",
        c_comms_client: "Client's Contact",
        c_comms_pLast: "Notifications are considered valid once receipt is confirmed by either party.",

        c_clientContentTitle: "CLIENT-GENERATED CONTENT",
        c_clientContent_p1: "The CLIENT and their guests are free to record and share content during the event. Tagging @dshowevents on social media is appreciated but not required.",
        c_clientContent_p2: "Our Socials:",
        
        c_liabilityTitle: "LIMITATION OF LIABILITY",
        c_liability_p1: "The PROVIDER's total liability shall not exceed the amount paid by the CLIENT. The PROVIDER is not liable for indirect damages, loss of profits, or technical issues from the venue or third parties.",
        
        c_indemnificationTitle: "INDEMNIFICATION",
        c_indemnification_p1: "The CLIENT will hold D' Show Events LLC harmless from any claim or damage arising from the acts, omissions, or breaches of the CLIENT or their guests.",

        c_forceMajeureTitle: "FORCE MAJEURE",
        c_forceMajeure_p1: "Neither party shall be liable for failure to perform due to causes beyond their reasonable control (hurricanes, blackouts, pandemics, riots, government restrictions, etc.). The affected party will notify within 48 hours. They may reschedule within 30 days or, if not possible, the PROVIDER will refund the deposit minus incurred expenses (max. 25%).",

        c_jurisdictionTitle: "JURISDICTION AND APPLICABLE LAW",
        c_jurisdiction_p1: "This agreement shall be governed by the laws of the Commonwealth of Puerto Rico. Any dispute will first be addressed through direct communication, then mediation, and finally in the courts of San Juan or Bayamón.",

        summary_detailsTitle: "SUMMARY OF SERVICE DETAILS",
        summary_service: "Service contracted:",
        summary_time: "Service time:",
        summary_totalCost: "Total cost:",
        summary_balance: "Remaining balance:",
        summary_address: "Event address:",
        summary_activity: "Activity type:",
        summary_date: "Event date:",
        summary_notes: "Notes:",

        summary_paymentTitle: "DEPOSIT AND PAYMENT SUMMARY",
        summary_deposit: "Deposit:",
        summary_parking: "Parking spaces required:",
        summary_checks: "Checks payable to:",
        parkingSpaces: (s: string) => `${s} spaces`,

        c_confirmationTitle: "CONFIRMATION AND SIGNATURES",
        c_confirmation_p1: "I, __________________, certify on this date, _____ of ____________, _______, that I understand and accept the terms and conditions set forth in this document, thereby formalizing the contracting of services for the day ",
        c_confirmation_p1_part1: "I,",
        c_confirmation_p1_part2: "certify on this day of",
        c_confirmation_p1_part3: ",",
        c_confirmation_p1_part4: "",
        c_confirmation_p1_part5: "that I understand and accept the terms and conditions set forth in this document, formalizing the hiring of services for",
        c_confirmation_p1_full: (date: string) => `I, ______________________, certify on this day ____________ that I understand and accept the terms and conditions set forth in this document, formalizing the hiring of services for the day ${date}.`,
        
        signature_client: (name: string) => `Signature of ${name} / Representative`,
        signature_provider: "Authorized Representative",

        invoice_title: "INVOICE",
        invoice_subtitle: (num: string) => `Addendum to Agreement #${num}`,
        invoice_billTo: "BILL TO",
        invoice_from: "FROM",
        invoice_number: "Invoice No.",
        invoice_issueDate: "Issue Date",
        invoice_eventDate: "Event Date",
        invoice_tableDesc: "Description",
        invoice_tableTotal: "Total",
        invoice_serviceDesc: "Artistic and Technical Services",
        invoice_serviceDesc_placeholder: "As described in the contract.",
        invoice_soundUpgrade: "Professional Sound Upgrade",
        invoice_subtotal: "Subtotal",
        invoice_depositPaid: "Deposit Paid",
        invoice_balanceDue: "Balance Due",
        invoice_notes: "Additional Notes",
        invoice_notes_placeholder: "The remaining balance must be paid in full before the service begins on the event date.",
        invoice_thankYou: "Thank you for choosing D' Show Events!",
        invoice_footer: "For questions about this invoice, please contact us at info@dshowevents.com",

        formatTime12Hour: (time: string): string => {
            if (!time) return '';
            return time; // Already in 12-hour format
        },
        formatDate: (day: string, month: string, year: string): string => {
            if (!day || !month || !year) return `Month DDth, YYYY`;
            const esToEnMonths: { [key: string]: string } = { "enero": "January", "febrero": "February", "marzo": "March", "abril": "April", "mayo": "May", "junio": "June", "julio": "July", "agosto": "August", "septiembre": "September", "octubre": "October", "noviembre": "November", "diciembre": "December" };
            const d = parseInt(day, 10);
            if (isNaN(d)) return `Month DD, YYYY`;

            let daySuffix = 'th';
            if (d === 1 || d === 21 || d === 31) daySuffix = 'st';
            else if (d === 2 || d === 22) daySuffix = 'nd';
            else if (d === 3 || d === 23) daySuffix = 'rd';
            
            const englishMonth = esToEnMonths[month.toLowerCase()] || 'Month';
            return `${englishMonth} ${d || 'DD'}${daySuffix}, ${year || 'YYYY'}`;
        },
    }
};

export const translations = { es, en };