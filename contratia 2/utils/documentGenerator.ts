import { ContractData } from '../types';
import { translations } from './translations';

// Interfaces for a structured document definition
interface TextPart {
    text: string;
    bold?: boolean;
    italic?: boolean;
    isLineBreak?: boolean;
}

export interface DocumentItem {
    type: 'header' | 'paragraph' | 'list' | 'clause' | 'summary' | 'signatures' | 'spacer' | 'table';
    title?: string;
    subtitle?: string;
    parts?: TextPart[];
    number?: number;
    content?: DocumentItem[];
    details?: { label: string; value: string }[];
    listItems?: DocumentItem[];
    // Table specific
    headers?: string[];
    rows?: string[][];
}

export const getDocumentDefinition = (data: ContractData) => {
    let clauseCounter = 1;
    const t = translations[data.language].doc;

    // Logic for dynamic clauses
    const getSoundOptionClause = (): DocumentItem => {
        let content: DocumentItem[];
        switch (data.soundOption) {
            case 'cliente':
                content = [{ type: 'paragraph', parts: [{ text: t.c_sound_optClient }] }];
                break;
            case 'basico':
                content = [{ type: 'paragraph', parts: [{ text: t.c_sound_optBasic }] }];
                break;
            case 'upgrade':
                content = [{ type: 'paragraph', parts: [{ text: t.c_sound_optUpgrade }] }];
                break;
            default: // pendiente
                content = [
                    { type: 'paragraph', parts: [{ text: t.c_sound_optPending_p1, bold: true }] },
                    { type: 'list', listItems: [
                        { type: 'paragraph', parts: [{ text: t.c_sound_optPending_b1_full, bold: true }] },
                        { type: 'paragraph', parts: [{ text: t.c_sound_optPending_b2_full, bold: true }] },
                        { type: 'paragraph', parts: [{ text: t.c_sound_optPending_b3_full, bold: true }] },
                    ]}
                ];
        }
        content.push({ type: 'paragraph', parts: [{ text: t.c_sound_p2 }] });
        return { type: 'clause', number: clauseCounter++, title: t.c_soundTitle, content };
    };
    
    const getDepositClause = (): DocumentItem => {
        let content: DocumentItem[];
        if (data.aplicaDeposito) {
            content = [
                { type: 'paragraph', parts: [{ text: t.c_deposit_p1_withDeposit }] },
                { type: 'paragraph', parts: [{ text: t.c_deposit_p2_withDeposit }] },
                { type: 'paragraph', parts: [{ text: t.c_deposit_p3_withDeposit }] },
                { type: 'list', listItems: [
                    { type: 'paragraph', parts: [{ text: t.c_deposit_b1_withDeposit }] },
                    { type: 'paragraph', parts: [{ text: t.c_deposit_b2_withDeposit }] },
                ]},
                { type: 'paragraph', parts: [{ text: t.c_deposit_p4_withDeposit }] },
            ];
        } else {
             content = [
                { type: 'paragraph', parts: [{ text: t.c_deposit_p1_noDeposit }] },
                { type: 'paragraph', parts: [{ text: t.c_deposit_p2_noDeposit }] },
                { type: 'paragraph', parts: [{ text: t.c_deposit_p3_noDeposit }] },
                { type: 'list', listItems: [
                    { type: 'paragraph', parts: [{ text: t.c_deposit_b1_noDeposit }] },
                    { type: 'paragraph', parts: [{ text: t.c_deposit_b2_noDeposit }] },
                ]},
                { type: 'paragraph', parts: [{ text: t.c_deposit_p4_noDeposit }] },
            ];
        }
        return { type: 'clause', number: clauseCounter++, title: t.c_depositTitle, content };
    };

    // Full contract definition
    const contract: DocumentItem[] = [
        { type: 'header', title: "D' SHOW EVENTS", subtitle: `${t.contractTitle} #${data.numeroContrato || 'DSE-2025-000'}` },
        { type: 'paragraph', parts: [
            { text: t.intro1 },
            { text: data.nombreCliente || `[${t.clientNamePlaceholder}]`, bold: true },
            { text: t.intro2 },
        ]},
        { type: 'spacer' },
        getDepositClause(),
        { type: 'clause', number: clauseCounter++, title: t.c_punctualityTitle, content: [
            { type: 'paragraph', parts: [{ text: t.c_punctuality_p1 }] },
            { type: 'paragraph', parts: [{ text: t.c_punctuality_p2 }] },
        ]},
        getSoundOptionClause(),
        { type: 'clause', number: clauseCounter++, title: t.c_accessTitle, content: [
            { type: 'paragraph', parts: [{ text: `${t.c_access_p1_1}${data.parkingSpaces || 5}${t.c_access_p1_2}` }] }
        ]},
        { type: 'clause', number: clauseCounter++, title: t.c_rescheduleTitle, content: [
            { type: 'paragraph', parts: [{ text: t.c_reschedule_p1 }] },
            { type: 'paragraph', parts: [{ text: t.c_reschedule_p2 }] },
        ]},
        { type: 'clause', number: clauseCounter++, title: t.c_staffImagesTitle, content: [
             { type: 'paragraph', parts: [{ text: t.c_staffImages_p1 }] },
        ]},
        { type: 'clause', number: clauseCounter++, title: t.c_safetyTitle, content: [
             { type: 'paragraph', parts: [{ text: t.c_safety_p1 }] },
        ]},
        { type: 'clause', number: clauseCounter++, title: t.c_commsTitle, content: [
            { type: 'paragraph', parts: [{ text: t.c_comms_provider, bold: true }] },
            { type: 'paragraph', parts: [{ text: 'Email: info@dshowevents.com' }] },
            { type: 'paragraph', parts: [{ text: 'WhatsApp/Message: (787) 329-6680' }] },
            { type: 'spacer' },
            { type: 'paragraph', parts: [{ text: t.c_comms_client, bold: true }] },
            { type: 'paragraph', parts: [{ text: `Email: ${data.emailCliente || t.notProvided}` }] },
            { type: 'paragraph', parts: [{ text: `${t.phone}: ${data.telefonoCliente || t.notProvided}` }] },
             { type: 'paragraph', parts: [{ text: t.c_comms_pLast, italic: true }] },
        ]},
        { type: 'clause', number: clauseCounter++, title: t.c_clientContentTitle, content: [
            { type: 'paragraph', parts: [{ text: t.c_clientContent_p1 }] },
            { type: 'paragraph', parts: [{ text: t.c_clientContent_p2, bold: true }] },
            { type: 'paragraph', parts: [{ text: 'Instagram: @dshowevents | Facebook: D’ Show Events | TikTok: @dshowevents' }] },
        ]},
        { type: 'clause', number: clauseCounter++, title: t.c_liabilityTitle, content: [
            { type: 'paragraph', parts: [{ text: t.c_liability_p1 }] },
        ]},
        { type: 'clause', number: clauseCounter++, title: t.c_indemnificationTitle, content: [
            { type: 'paragraph', parts: [{ text: t.c_indemnification_p1 }] },
        ]},
        { type: 'clause', number: clauseCounter++, title: t.c_forceMajeureTitle, content: [
            { type: 'paragraph', parts: [{ text: t.c_forceMajeure_p1 }] },
        ]},
        { type: 'clause', number: clauseCounter++, title: t.c_jurisdictionTitle, content: [
            { type: 'paragraph', parts: [{ text: t.c_jurisdiction_p1 }] },
        ]},
        { type: 'spacer' },
        { type: 'summary', title: t.summary_detailsTitle, details: [
            { label: t.summary_service, value: data.descripcionServicio || t.notProvided },
            { label: t.summary_time, value: t.formatTime12Hour(data.horaServicio) },
            { label: t.summary_totalCost, value: `$${parseFloat(data.costoTotal || '0').toFixed(2)} USD` },
            { label: t.summary_balance, value: `$${data.balanceRestante} USD` },
            { label: t.summary_address, value: data.direccionEvento || t.notProvided },
            { label: t.summary_activity, value: data.tipoActividad || t.notProvided },
            { label: t.summary_notes, value: data.notasAdicionales || t.noNotes },
        ]},
        { type: 'summary', title: t.summary_paymentTitle, details: [
            ...(data.aplicaDeposito ? [
                { label: t.summary_deposit, value: '$125.00 USD' },
            ] : []),
            { label: t.summary_parking, value: t.parkingSpaces(data.parkingSpaces) },
        ]},
        { type: 'clause', number: clauseCounter++, title: t.c_confirmationTitle, content: [
            { type: 'paragraph', parts: [
                { text: t.c_confirmation_p1_full(t.formatDate(data.diaEvento, data.mesEvento, data.anoEvento)) }
            ]}
        ]},
        { type: 'signatures' }
    ];

    // Invoice definition
    const today = new Date();
    const baseCost = parseFloat(data.costoTotal || '0');
    const soundUpgradeCost = data.soundOption === 'upgrade' ? 150 : 0;
    const totalGeneral = baseCost + soundUpgradeCost;
    const deposit = data.aplicaDeposito ? 125 : 0;
    
    const invoice: DocumentItem[] = [
        { type: 'header', title: "D' SHOW EVENTS", subtitle: t.invoice_subtitle(data.numeroContrato || 'DSE-2025-000')},
        { type: 'paragraph', parts: [
            { text: `${t.invoice_billTo}:`, bold: true},
            { text: `\n${data.nombreCliente || `[${t.clientNamePlaceholder}]`}`, isLineBreak: true },
            { text: `\n${data.emailCliente || t.notProvided}`, isLineBreak: true },
            { text: `\n${data.telefonoCliente || t.notProvided}`, isLineBreak: true },
            { text: `\n\n${t.invoice_from}:`, bold: true, isLineBreak: true },
            { text: `\nD' SHOW EVENTS LLC`, isLineBreak: true, bold: true },
            { text: `\nPO BOX 4083, Bayamón, PR 00958`, isLineBreak: true },
            { text: `\ninfo@dshowevents.com`, isLineBreak: true },
            { text: `\n(787) 329-6680`, isLineBreak: true },
        ]},
         { type: 'paragraph', parts: [
            { text: `${t.invoice_number}: ${data.numeroContrato}\n`, bold: true },
            { text: `${t.invoice_issueDate}: ${today.toLocaleDateString('es-ES')}\n`, bold: true },
            { text: `${t.invoice_eventDate}: ${data.diaEvento}/${data.mesEvento}/${data.anoEvento}`, bold: true },
        ]},
        { type: 'table', 
            headers: [t.invoice_tableDesc, t.invoice_tableTotal],
            rows: [
                [`${t.invoice_serviceDesc}\n` + (data.descripcionServicio || t.invoice_serviceDesc_placeholder), `$${baseCost.toFixed(2)}`],
                ...(soundUpgradeCost > 0 ? [[t.invoice_soundUpgrade, `$${soundUpgradeCost.toFixed(2)}`]] : []),
            ]
        },
        { type: 'summary', title: '', details: [
            { label: t.invoice_subtotal, value: `$${totalGeneral.toFixed(2)}` },
            ...(deposit > 0 ? [{ label: t.invoice_depositPaid, value: `-${deposit.toFixed(2)}` }] : []),
            { label: t.invoice_balanceDue, value: `$${parseFloat(data.balanceRestante).toFixed(2)} USD` },
        ]},
        { type: 'paragraph', parts: [
            { text: `${t.invoice_notes}:`, bold: true },
            { text: `\n${data.notasFactura || t.invoice_notes_placeholder}`, isLineBreak: true, italic: true },
        ]},
    ];

    return { contract, invoice };
};