export interface GeneratedLinks {
    doc_url: string;
    pdf_url: string;
    pdf_download_url: string;
    file_name?: string;
}

export type ContractType = 'music' | 'booth' | 'dj';

// New types for the detailed booth form
export type AddonServiceOption = 'contratar' | 'no_contratar' | 'pendiente';
export type EventLocation = 'interior' | 'exterior' | ''; // Empty string for initial/unselected state

export interface ContractData {
    numeroContrato: string;
    nombreCliente: string;
    emailCliente: string;
    telefonoCliente: string;
    diaEvento: string;
    mesEvento: string;
    anoEvento: string;
    descripcionServicio: string;
    horaServicio: string;
    costoTotal: string;
    balanceRestante: string;
    tipoActividad: string;
    direccionEvento: string;
    notasAdicionales: string;
    notasFactura: string;
    aplicaDeposito: boolean;
    language: 'es' | 'en';
    
    // Music & Characters specific
    soundOption: 'cliente' | 'basico' | 'upgrade' | 'pendiente';
    parkingSpaces: string; // Used by all types
    
    // --- Booth specific fields ---
    servicioPhotoBooth?: boolean;
    servicioVideoBooth360?: boolean;
    bocinaOpcion?: AddonServiceOption;
    earlySetupOpcion?: AddonServiceOption;
    brandingOpcion?: AddonServiceOption;
    ubicacionEvento?: EventLocation;
    serviceHours?: string;

    // --- NEW DJ specific fields ---
    fecha_evento_str?: string; // For the date picker input
    hora_inicio?: string;
    hora_fin?: string;
    duracion_total?: string;
    numero_invitados?: string;
    venue_nombre?: string;
    piso_evento?: string;
    contacto_venue?: string;
    telefono_venue?: string;
    restricciones_horario?: string;
    montaje?: 'premium' | 'deluxe' | '';
    electrico?: '110v' | '240v' | '';
    es_exterior?: 'Sí' | 'No' | '';
    tipo_superficie?: string;
    proteccion_carpa_cliente?: boolean;
    proteccion_estructura_permanente?: boolean;
    proteccion_sin_proteccion?: boolean;
    proteccion_area_nivelada?: boolean;
    proteccion_acceso_vehiculos?: boolean;
    nombre_paquete?: 'Paquete Premium' | 'Paquete Deluxe' | '';
    color_setup?: 'negro' | 'blanco' | '';
    deposito_50?: string;
    balance_50?: string;
}