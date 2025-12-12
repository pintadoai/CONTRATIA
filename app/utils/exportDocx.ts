import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  PageOrientation,
  convertInchesToTwip,
} from 'docx';
import { ContractData } from '../types';
import { translations } from './translations';

const FONT = "Lato";
const PRIMARY_COLOR = "119600";

const text = (txt: string, bold = false, size = 22, color = "000000") => 
    new TextRun({ text: txt, font: FONT, size, bold, color });

const spacer = () => new Paragraph({ text: "", spacing: { after: 200 } });

const heading = (txt: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel], alignment = AlignmentType.LEFT, color = PRIMARY_COLOR) => 
    new Paragraph({ 
        text: txt, 
        heading: level, 
        alignment,
        spacing: { before: 400, after: 200 }
    });

const para = (children: (TextRun | string)[], options: any = {}) => 
    new Paragraph({ 
        children: children.map(child => typeof child === 'string' ? text(child) : child),
        spacing: { after: 160 },
        ...options
    });

const bulletPara = (txt: string) => 
    new Paragraph({
        text: txt,
        bullet: { level: 0 },
        spacing: { after: 120 },
    });

export const generateDocxBlob = (data: ContractData): Promise<Blob> => {
    let clauseCounter = 1;
    const today = new Date();
    const baseCost = parseFloat(data.costoTotal || '0');
    const soundUpgradeCost = data.soundOption === 'upgrade' ? 150 : 0;
    const totalGeneral = baseCost + soundUpgradeCost;
    const deposit = data.aplicaDeposito ? 125 : 0;
    
    const t = translations[data.language].doc;

    // === CONTRATO ===
    const contractChildren: (Paragraph | Table)[] = [
        // Header
        new Paragraph({ 
            text: "D' SHOW EVENTS LLC", 
            heading: HeadingLevel.TITLE, 
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
        }),
        new Paragraph({ 
            text: t.contractTitle,
            heading: HeadingLevel.HEADING_1, 
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
        }),
        new Paragraph({ 
            text: `#${data.numeroContrato || 'DSE-2025-000'}`, 
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }),
        
        // Introducción
        para([
            text(t.intro1),
            text(data.nombreCliente || `[${t.clientNamePlaceholder}]`, true),
            text(t.intro2),
        ]),
        spacer(),

        // Cláusula 1: Depósito y Pago Final
        heading(`${clauseCounter++}. ${t.c_depositTitle}`, HeadingLevel.HEADING_2),
    ];

    if (data.aplicaDeposito) {
        contractChildren.push(
            para([t.c_deposit_p1_withDeposit]),
            para([t.c_deposit_p2_withDeposit]),
            para([t.c_deposit_p3_withDeposit]),
            bulletPara(t.c_deposit_b1_withDeposit),
            bulletPara(t.c_deposit_b2_withDeposit),
            para([t.c_deposit_p4_withDeposit]),
        );
    } else {
        contractChildren.push(
            para([t.c_deposit_p1_noDeposit]),
            para([t.c_deposit_p2_noDeposit]),
            para([t.c_deposit_p3_noDeposit]),
            bulletPara(t.c_deposit_b1_noDeposit),
            bulletPara(t.c_deposit_b2_noDeposit),
            para([t.c_deposit_p4_noDeposit]),
        );
    }

    contractChildren.push(spacer());

    // Cláusula 2: Puntualidad
    contractChildren.push(
        heading(`${clauseCounter++}. ${t.c_punctualityTitle}`, HeadingLevel.HEADING_2),
        para([t.c_punctuality_p1]),
        para([t.c_punctuality_p2]),
        spacer(),
    );

    // Cláusula 3: Sonido
    contractChildren.push(heading(`${clauseCounter++}. ${t.c_soundTitle}`, HeadingLevel.HEADING_2));
    
    switch (data.soundOption) {
        case 'cliente':
            contractChildren.push(para([text(t.c_sound_optClient, true)]));
            break;
        case 'basico':
            contractChildren.push(para([text(t.c_sound_optBasic, true)]));
            break;
        case 'upgrade':
            contractChildren.push(para([text(t.c_sound_optUpgrade, true)]));
            break;
        case 'pendiente':
            contractChildren.push(
                para([text(t.c_sound_optPending_p1, true)]),
                para([t.c_sound_optPending_b1]),
                para([t.c_sound_optPending_b2]),
                para([t.c_sound_optPending_b3]),
            );
            break;
    }
    
    contractChildren.push(
        para([t.c_sound_p2]),
        spacer(),
    );

    // Cláusula 4: Acceso y Estacionamiento
    contractChildren.push(
        heading(`${clauseCounter++}. ${t.c_accessTitle}`, HeadingLevel.HEADING_2),
        para([
            text(t.c_access_p1_1),
            text(data.parkingSpaces || "5", true),
            text(t.c_access_p1_2),
        ]),
        spacer(),
    );

    // Cláusula 5: Cambios de Fecha
    contractChildren.push(
        heading(`${clauseCounter++}. ${t.c_rescheduleTitle}`, HeadingLevel.HEADING_2),
        para([t.c_reschedule_p1]),
        para([t.c_reschedule_p2]),
        spacer(),
    );

    // Cláusula 6: Derecho de Uso de Imágenes del Personal
    contractChildren.push(
        heading(`${clauseCounter++}. ${t.c_staffImagesTitle}`, HeadingLevel.HEADING_2),
        para([t.c_staffImages_p1]),
        spacer(),
    );

    // Cláusula 7: Seguridad del Personal
    contractChildren.push(
        heading(`${clauseCounter++}. ${t.c_safetyTitle}`, HeadingLevel.HEADING_2),
        para([t.c_safety_p1]),
        spacer(),
    );

    // Cláusula 8: Comunicaciones Oficiales
    contractChildren.push(
        heading(`${clauseCounter++}. ${t.c_commsTitle}`, HeadingLevel.HEADING_2),
        para([text(t.c_comms_provider, true)]),
        para(["Email: info@dshowevents.com"]),
        para([`WhatsApp/Message: (787) 329-6680`]),
        spacer(),
        para([text(t.c_comms_client, true)]),
        para([text("Email: "), text(data.emailCliente || t.notProvided, true)]),
        para([text(`${t.phone}: `), text(data.telefonoCliente || t.notProvided, true)]),
        para([t.c_comms_pLast], { italics: true }),
        spacer(),
    );

    // Cláusula 9: Contenido Generado por el Cliente
    contractChildren.push(
        heading(`${clauseCounter++}. ${t.c_clientContentTitle}`, HeadingLevel.HEADING_2),
        para([t.c_clientContent_p1]),
        para([text(t.c_clientContent_p2, true)]),
        para(["Instagram: @dshowevents | Facebook: D' Show Events | TikTok: @dshowevents"]),
        spacer(),
    );

    // Cláusula 10: Limitación de Responsabilidad
    contractChildren.push(
        heading(`${clauseCounter++}. ${t.c_liabilityTitle}`, HeadingLevel.HEADING_2),
        para([t.c_liability_p1]),
        spacer(),
    );

    // Cláusula 11: Indemnización
    contractChildren.push(
        heading(`${clauseCounter++}. ${t.c_indemnificationTitle}`, HeadingLevel.HEADING_2),
        para([t.c_indemnification_p1]),
        spacer(),
    );

    // Cláusula 12: Fuerza Mayor
    contractChildren.push(
        heading(`${clauseCounter++}. ${t.c_forceMajeureTitle}`, HeadingLevel.HEADING_2),
        para([t.c_forceMajeure_p1]),
        spacer(),
    );

    // Cláusula 13: Jurisdicción
    contractChildren.push(
        heading(`${clauseCounter++}. ${t.c_jurisdictionTitle}`, HeadingLevel.HEADING_2),
        para([t.c_jurisdiction_p1]),
        spacer(),
    );

    // === RESUMEN DE DETALLES ===
    contractChildren.push(
        heading(t.summary_detailsTitle, HeadingLevel.HEADING_2),
        para([text(t.summary_service, true), text(data.descripcionServicio || t.notProvided)]),
        para([text(t.summary_time, true), text(t.formatTime12Hour(data.horaServicio) || t.notProvided)]),
        para([text(t.summary_totalCost, true), text(`$${baseCost.toFixed(2)} USD`)]),
        para([text(t.summary_balance, true), text(`$${data.balanceRestante || '0.00'} USD`)]),
        para([text(t.summary_address, true), text(data.direccionEvento || t.notProvided)]),
        para([text(t.summary_activity, true), text(data.tipoActividad || t.notProvided)]),
        para([text(t.summary_date, true), text(t.formatDate(data.diaEvento, data.mesEvento, data.anoEvento))]),
        spacer(),
    );

    // === RESUMEN DE PAGO ===
    contractChildren.push(heading(t.summary_paymentTitle, HeadingLevel.HEADING_2));
    
    if (data.aplicaDeposito) {
        contractChildren.push(
            para([text(t.summary_deposit, true), text("$125.00 USD")]),
        );
    }
    
    contractChildren.push(
        para([text(t.summary_parking, true), text(t.parkingSpaces(data.parkingSpaces || '5'))]),
        para([text("ATH Móvil Business: ", true), text("/DSHOWEVENTS")]),
        para([text(t.summary_checks, true), text("D SHOW EVENTS LLC")]),
        spacer(),
    );

    // === FIRMAS ===
    contractChildren.push(
        heading(`${clauseCounter++}. ${t.c_confirmationTitle}`, HeadingLevel.HEADING_2),
        para([
            text(t.c_confirmation_p1),
            text(t.formatDate(data.diaEvento, data.mesEvento, data.anoEvento), true),
            text("."),
        ]),
        spacer(),
        spacer(),
        spacer(),
        para(["_____________________________"], { alignment: AlignmentType.LEFT }),
        para([t.signature_client(data.nombreCliente || t.clientNamePlaceholder)]),
        spacer(),
        spacer(),
        para(["_____________________________"], { alignment: AlignmentType.RIGHT }),
        para(["D' SHOW EVENTS LLC"], { alignment: AlignmentType.RIGHT }),
        para([t.signature_provider], { alignment: AlignmentType.RIGHT }),
    );

    // === FACTURA (NUEVA PÁGINA) ===
    const invoiceChildren: (Paragraph | Table)[] = [
        new Paragraph({ children: [new PageBreak()] }),
        
        new Paragraph({ 
            text: "D' SHOW EVENTS LLC", 
            heading: HeadingLevel.TITLE, 
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
        }),
        new Paragraph({ 
            text: t.invoice_title,
            heading: HeadingLevel.HEADING_1, 
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
        }),
        new Paragraph({ 
            text: t.invoice_subtitle(data.numeroContrato || 'DSE-2025-000'), 
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }),

        heading(t.invoice_billTo, HeadingLevel.HEADING_3),
        para([text(data.nombreCliente || t.clientNamePlaceholder, true)]),
        para([text(data.emailCliente || t.notProvided)]),
        para([text(data.telefonoCliente || t.notProvided)]),
        spacer(),

        heading(t.invoice_from, HeadingLevel.HEADING_3),
        para([text("D' SHOW EVENTS LLC", true)]),
        para(["PO BOX 4083, Bayamón, PR 00958"]),
        para(["info@dshowevents.com"]),
        para(["(787) 329-6680"]),
        spacer(),

        para([text(`${t.invoice_number}: `, true), text(data.numeroContrato)]),
        para([text(`${t.invoice_issueDate}: `, true), text(today.toLocaleDateString('es-ES'))]),
        para([text(`${t.invoice_eventDate}: `, true), text(`${data.diaEvento}/${data.mesEvento}/${data.anoEvento}`)]),
        spacer(),

        // Tabla de servicios
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ 
                            children: [para([text(t.invoice_tableDesc, true)])],
                            shading: { fill: "EAEAEA" }
                        }),
                        new TableCell({ 
                            children: [new Paragraph({ children: [text(t.invoice_tableTotal, true)], alignment: AlignmentType.RIGHT })],
                            shading: { fill: "EAEAEA" }
                        }),
                    ],
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [para([text(t.invoice_serviceDesc, true)]), para([data.descripcionServicio || t.invoice_serviceDesc_placeholder])] }),
                        new TableCell({ children: [new Paragraph({ text: `$${baseCost.toFixed(2)}`, alignment: AlignmentType.RIGHT })] }),
                    ],
                }),
                ...(soundUpgradeCost > 0 ? [new TableRow({
                    children: [
                        new TableCell({ children: [para([text(t.invoice_soundUpgrade)])] }),
                        new TableCell({ children: [new Paragraph({ text: `$${soundUpgradeCost.toFixed(2)}`, alignment: AlignmentType.RIGHT })] }),
                    ],
                })] : []),
            ],
        }),
        spacer(),

        new Paragraph({ text: `${t.invoice_subtotal}: $${totalGeneral.toFixed(2)}`, alignment: AlignmentType.RIGHT }),
        ...(deposit > 0 ? [new Paragraph({ text: `${t.invoice_depositPaid}: -$${deposit.toFixed(2)}`, alignment: AlignmentType.RIGHT })] : []),
        new Paragraph({ 
            children: [text(`${t.invoice_balanceDue}: $${data.balanceRestante} USD`, true, 28)],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 400 }
        }),

        heading(t.invoice_notes, HeadingLevel.HEADING_3),
        para([data.notasFactura || t.invoice_notes_placeholder], { italics: true }),
        spacer(),
        spacer(),

        new Paragraph({ 
            children: [text(t.invoice_thankYou, true)],
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 }
        }),
        new Paragraph({ 
            text: t.invoice_footer,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }),
    ];

    // === DOCUMENTO COMPLETO ===
    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: { font: FONT, size: 22 }, // 11pt
                }
            },
            paragraphStyles: [
                {
                    id: "Heading1",
                    name: "Heading 1",
                    basedOn: "Normal",
                    next: "Normal",
                    run: {
                        font: FONT,
                        size: 48,
                        bold: true,
                        color: PRIMARY_COLOR,
                    },
                    paragraph: {
                        spacing: { before: 400, after: 200 },
                    },
                },
                {
                    id: "Heading2",
                    name: "Heading 2",
                    basedOn: "Normal",
                    next: "Normal",
                    run: {
                        font: FONT,
                        size: 32,
                        bold: true,
                        color: PRIMARY_COLOR,
                    },
                    paragraph: {
                        spacing: { before: 400, after: 200 },
                    },
                },
                {
                    id: "Heading3",
                    name: "Heading 3",
                    basedOn: "Normal",
                    next: "Normal",
                    run: {
                        font: FONT,
                        size: 26,
                        bold: true,
                    },
                    paragraph: {
                        spacing: { before: 300, after: 160 },
                    },
                },
            ],
        },
        sections: [{
            properties: {
                page: {
                    size: { 
                        width: convertInchesToTwip(8.5), 
                        height: convertInchesToTwip(11), 
                        orientation: PageOrientation.PORTRAIT 
                    },
                    margin: { 
                        top: convertInchesToTwip(1), 
                        right: convertInchesToTwip(1), 
                        bottom: convertInchesToTwip(1), 
                        left: convertInchesToTwip(1) 
                    },
                },
            },
            children: [
                ...contractChildren,
                ...invoiceChildren,
            ],
        }],
    });

    return Packer.toBlob(doc);
};