import React from 'react';
import { ContractData } from '../../types';
import SignatureBlock from '../ui/SignatureBlock';
import { translations } from '../../utils/translations';

// Helper Components & Functions
const Placeholder: React.FC<{ text: string }> = ({ text }) => (
    <span className="text-gray-400 italic">[{text}]</span>
);

const renderText = (value: string | undefined | null, placeholder: string) => {
    return value ? <span className="font-semibold text-black">{value}</span> : <Placeholder text={placeholder} />;
};

const textToComponent = (text: string) => {
    if (!text) return null;
   return text.split('\n').map((line, index) => <p key={index} className="mb-1">{line}</p>);
};

const DocHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <header className="text-center mb-10 border-b-2 border-gray-100 pb-6">
        <div className="mb-4">
            <h1 className="font-montserrat text-4xl font-bold text-black tracking-normal">
                <span className="text-[#119600]">D' SHOW</span> EVENTS
            </h1>
            <p className="font-lato text-xs text-gray-500 tracking-[0.3em] uppercase">LLC</p>
        </div>
        
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 tracking-wider font-playfair">{title}</h2>
            {subtitle && <p className="text-sm font-semibold text-gray-500 mt-1 font-montserrat tracking-widest">{subtitle}</p>}
        </div>
    </header>
);

const FillableBlank: React.FC<{ widthClass?: string }> = ({ widthClass = 'w-48' }) => (
    <span className={`inline-block bg-yellow-100 border-b-2 border-dotted border-gray-400 px-2 h-6 align-middle ${widthClass}`} aria-label="Campo para rellenar">&nbsp;</span>
);

const Clause: React.FC<{num: number, title: string, children: React.ReactNode}> = ({num, title, children}) => {
    return (
        <section className="mb-6 break-inside-avoid">
            <h3 className="text-lg font-medium text-black border-b border-gray-300 pb-2 mb-3 font-montserrat">
                <span className="text-[#119600]">{num}.</span> {title.toUpperCase()}
            </h3>
            <div className="space-y-3 text-sm text-gray-800 leading-relaxed">{children}</div>
        </section>
    );
};

const DetailsSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
     <section className="mb-6 break-inside-avoid">
        <h3 className="text-lg font-medium text-black border-b border-gray-300 pb-2 mb-3 font-montserrat">
            <span className="text-[#119600]">◆</span> {title.toUpperCase()}
        </h3>
        <div className="text-sm text-gray-800 leading-relaxed">{children}</div>
    </section>
);


// Main Content Components
export const ContractContent: React.FC<{data: ContractData}> = ({ data }) => {
    const t = translations[data.language].doc;

    const renderSoundOption = () => {
        const baseClasses = "pl-5 text-xs text-gray-700";
        const selectedClasses = "font-bold text-black";

        switch (data.soundOption) {
            case 'cliente':
                return <p className={selectedClasses}>{t.c_sound_optClient}</p>;
            case 'basico':
                return <p className={selectedClasses}>{t.c_sound_optBasic}</p>;
            case 'upgrade':
                return <p className={selectedClasses}>{t.c_sound_optUpgrade}</p>;
            case 'pendiente':
                return (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 my-2 text-sm">
                        <p className="font-bold text-yellow-900 font-montserrat">{t.c_sound_optPending_action}</p>
                        <p>{t.c_sound_optPending_instruction}</p>
                        <ul className="list-none mt-2 space-y-3">
                            <li>
                                <span className="font-semibold">{t.c_sound_optPending_b1_title}</span>
                                <p className={baseClasses}>{t.c_sound_optPending_b1_desc}</p>
                            </li>
                            <li>
                                <span className="font-semibold">{t.c_sound_optPending_b2_title}</span>
                                 <p className={baseClasses}>{t.c_sound_optPending_b2_desc}</p>
                            </li>
                            <li>
                                <span className="font-semibold">{t.c_sound_optPending_b3_title}</span>
                                 <p className={baseClasses}>{t.c_sound_optPending_b3_desc}</p>
                            </li>
                        </ul>
                    </div>
                );
        }
    };

    let clauseCounter = 1;

    return (
        <article>
            <DocHeader title={t.contractTitle} subtitle={`#${data.numeroContrato || 'DSE-2025-000'}`} />

            <section className="mb-8 text-sm text-center">
                <p className="mb-4">
                    {t.intro1}
                    {renderText(data.nombreCliente, t.clientNamePlaceholder)}
                    {t.intro2}
                </p>
                <hr className="my-6" />
            </section>

            <Clause num={clauseCounter++} title={t.c_depositTitle}>
                {data.aplicaDeposito ? (
                    <>
                        <p>{t.c_deposit_p1_withDeposit}</p>
                        <p>{t.c_deposit_p2_withDeposit}</p>
                        <p>{t.c_deposit_p3_withDeposit}</p>
                        <ul className="list-disc list-inside text-sm pl-4 my-2">
                            <li>{t.c_deposit_b1_withDeposit}</li>
                            <li>{t.c_deposit_b2_withDeposit}</li>
                        </ul>
                        <p>{t.c_deposit_p4_withDeposit}</p>
                    </>
                ) : (
                    <>
                        <p>{t.c_deposit_p1_noDeposit}</p>
                        <p>{t.c_deposit_p2_noDeposit}</p>
                        <p>{t.c_deposit_p3_noDeposit}</p>
                         <ul className="list-disc list-inside text-sm pl-4 my-2">
                            <li>{t.c_deposit_b1_noDeposit}</li>
                            <li>{t.c_deposit_b2_noDeposit}</li>
                        </ul>
                        <p>{t.c_deposit_p4_noDeposit}</p>
                    </>
                )}
            </Clause>

            <Clause num={clauseCounter++} title={t.c_punctualityTitle}>
                <p>{t.c_punctuality_p1}</p>
                <p>{t.c_punctuality_p2}</p>
            </Clause>

            <Clause num={clauseCounter++} title={t.c_soundTitle}>
                {renderSoundOption()}
                <p className="mt-4">{t.c_sound_p2}</p>
            </Clause>

            <Clause num={clauseCounter++} title={t.c_accessTitle}>
                <p>{t.c_access_p1_1}{renderText(data.parkingSpaces, "5")}{t.c_access_p1_2}</p>
            </Clause>
            
             <Clause num={clauseCounter++} title={t.c_rescheduleTitle}>
                <p>{t.c_reschedule_p1}</p>
                <p>{t.c_reschedule_p2}</p>
            </Clause>

            <Clause num={clauseCounter++} title={t.c_staffImagesTitle}>
                <p>{t.c_staffImages_p1}</p>
            </Clause>

            <Clause num={clauseCounter++} title={t.c_safetyTitle}>
                <p>{t.c_safety_p1}</p>
            </Clause>

            <Clause num={clauseCounter++} title={t.c_commsTitle}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="font-medium font-montserrat">{t.c_comms_provider}:</p>
                        <p className="font-light">Email: info@dshowevents.com</p>
                        <p className="font-light">WhatsApp/Message: (787) 329-6680</p>
                    </div>
                    <div>
                         <p className="font-medium font-montserrat">{t.c_comms_client}:</p>
                         <p className="font-light">Email: {renderText(data.emailCliente, t.notProvided)}</p>
                         <p className="font-light">{t.phone}: {renderText(data.telefonoCliente, t.notProvided)}</p>
                    </div>
                </div>
                 <p className="mt-3 text-xs italic">{t.c_comms_pLast}</p>
            </Clause>

            <Clause num={clauseCounter++} title={t.c_clientContentTitle}>
                <p>{t.c_clientContent_p1}</p>
                <p className="font-medium mt-2 font-montserrat">{t.c_clientContent_p2}:</p>
                <p>Instagram: @dshowevents | Facebook: D’ Show Events | TikTok: @dshowevents</p>
            </Clause>

            <Clause num={clauseCounter++} title={t.c_liabilityTitle}>
                <p>{t.c_liability_p1}</p>
            </Clause>

            <Clause num={clauseCounter++} title={t.c_indemnificationTitle}>
                <p>{t.c_indemnification_p1}</p>
            </Clause>

            <Clause num={clauseCounter++} title={t.c_forceMajeureTitle}>
                <p>{t.c_forceMajeure_p1}</p>
            </Clause>

            <Clause num={clauseCounter++} title={t.c_jurisdictionTitle}>
                <p>{t.c_jurisdiction_p1}</p>
            </Clause>
            
            <hr className="my-8"/>

            <DetailsSection title={t.summary_detailsTitle}>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                     <p><strong className="font-montserrat font-medium">{t.summary_service}:</strong></p> <div>{textToComponent(data.descripcionServicio) || <Placeholder text={t.notProvided}/>}</div>
                     <p><strong className="font-montserrat font-medium">{t.summary_time}:</strong></p> <p>{renderText(t.formatTime12Hour(data.horaServicio), 'HH:MM')}</p>
                     <p><strong className="font-montserrat font-medium">{t.summary_totalCost}:</strong></p> <p>${renderText(parseFloat(data.costoTotal || '0').toFixed(2), '0.00')} USD</p>
                     <p><strong className="font-montserrat font-medium">{t.summary_balance}:</strong></p> <p>${renderText(data.balanceRestante, '0.00')} USD</p>
                     <p><strong className="font-montserrat font-medium">{t.summary_address}:</strong></p> <p>{renderText(data.direccionEvento, t.notProvided)}</p>
                     <p><strong className="font-montserrat font-medium">{t.summary_activity}:</strong></p> <p>{renderText(data.tipoActividad, t.notProvided)}</p>
                     <p><strong className="font-montserrat font-medium">{t.summary_notes}:</strong></p> <div>{textToComponent(data.notasAdicionales) || <p className="italic text-gray-500">{t.noNotes}</p>}</div>
                </div>
            </DetailsSection>

            <DetailsSection title={t.summary_paymentTitle}>
                 <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {data.aplicaDeposito && <>
                        <p><strong className="font-montserrat font-medium">{t.summary_deposit}:</strong></p> <p>$125.00 USD</p>
                    </>}
                    <p><strong className="font-montserrat font-medium">{t.summary_parking}:</strong></p> <p>{renderText(t.parkingSpaces(data.parkingSpaces), t.parkingSpaces('5'))}</p>
                 </div>
                 <div className="mt-4 text-xs">
                    <p><strong className="font-montserrat font-medium">ATH Móvil Business:</strong> /DSHOWEVENTS</p>
                    <p><strong className="font-montserrat font-medium">{t.summary_checks}:</strong> D SHOW EVENTS LLC</p>
                 </div>
            </DetailsSection>

            <hr className="my-8"/>
            
            <Clause num={clauseCounter++} title={t.c_confirmationTitle}>
                <p className="leading-loose">
                    {t.c_confirmation_p1_part1} <FillableBlank widthClass="w-2/5" />, {t.c_confirmation_p1_part2}
                    <FillableBlank widthClass="w-16" /> {t.c_confirmation_p1_part3} <FillableBlank widthClass="w-28" /> {t.c_confirmation_p1_part4} <FillableBlank widthClass="w-20" />, 
                    {t.c_confirmation_p1_part5} <strong>{t.formatDate(data.diaEvento, data.mesEvento, data.anoEvento)}</strong>.
                </p>
                <footer className="mt-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* Client Manual Signature Area */}
                        <div className="w-full mt-8 pt-4">
                            <div className="h-16"></div> {/* Space to sign */}
                            <div className="border-t border-gray-500 pt-2 text-sm">
                                <p>{t.signature_client(data.nombreCliente || t.clientNamePlaceholder)}</p>
                            </div>
                        </div>

                        {/* D' Show Events Signature Block */}
                        <SignatureBlock
                            signerInitials="L.A.P.E."
                            showCompanyInfo={false}
                            showLegalText="simplified"
                            useImage={false}
                        />
                    </div>
                </footer>
            </Clause>
        </article>
    );
};

export const AnexoContent: React.FC<{data: ContractData}> = ({ data }) => {
    const today = new Date();
    const baseCost = parseFloat(data.costoTotal || '0');
    const soundUpgradeCost = data.soundOption === 'upgrade' ? 150 : 0;
    const totalGeneral = baseCost + soundUpgradeCost;
    const deposit = data.aplicaDeposito ? 125 : 0;
    const t = translations[data.language].doc;

    return (
        <article>
            <DocHeader title={t.invoice_title} subtitle={t.invoice_subtitle(data.numeroContrato || 'DSE-2025-000')} />
            <div className="grid grid-cols-2 gap-8 text-sm mb-10">
                <div>
                    <h3 className="font-medium text-gray-800 mb-2 font-montserrat">{t.invoice_billTo}:</h3>
                    <p className="font-semibold">{renderText(data.nombreCliente, t.clientNamePlaceholder)}</p>
                    <p className="font-light">{renderText(data.emailCliente, "Email")}</p>
                    <p className="font-light">{renderText(data.telefonoCliente, t.phone)}</p>
                </div>
                <div className="text-right">
                    <h3 className="font-medium text-gray-800 mb-2 font-montserrat">{t.invoice_from}:</h3>
                    <p className="font-semibold">D' SHOW EVENTS LLC</p>
                    <p className="font-light">PO BOX 4083, Bayamón, PR 00958</p>
                    <p className="font-light">info@dshowevents.com</p>
                    <p className="font-light">(787) 329-6680</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-8 text-sm mb-10 text-center">
                <div><span className="text-gray-500 block font-montserrat font-medium">{t.invoice_number}</span> <span className="font-semibold">{data.numeroContrato}</span></div>
                <div><span className="text-gray-500 block font-montserrat font-medium">{t.invoice_issueDate}</span> <span className="font-semibold">{today.toLocaleDateString(data.language === 'es' ? 'es-ES' : 'en-US')}</span></div>
                <div><span className="text-gray-500 block font-montserrat font-medium">{t.invoice_eventDate}</span> <span className="font-semibold">{data.diaEvento}/{data.mesEvento}/{data.anoEvento}</span></div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 uppercase font-montserrat font-medium text-xs">
                        <tr>
                            <th className="px-4 py-3">{t.invoice_tableDesc}</th>
                            <th className="px-4 py-3 text-right">{t.invoice_tableTotal}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="px-4 py-3">
                                <p className="font-semibold">{t.invoice_serviceDesc}</p>
                                <div className="text-xs text-gray-600">
                                    {textToComponent(data.descripcionServicio) || <p>{t.invoice_serviceDesc_placeholder}</p>}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono">${baseCost.toFixed(2)}</td>
                        </tr>
                        {soundUpgradeCost > 0 && (
                            <tr className="border-b">
                                <td className="px-4 py-3 font-semibold">{t.invoice_soundUpgrade}</td>
                                <td className="px-4 py-3 text-right font-mono">${soundUpgradeCost.toFixed(2)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mt-6">
                <div className="w-full max-w-sm text-sm">
                    <div className="flex justify-between py-2">
                        <span className="text-gray-600 font-montserrat">{t.invoice_subtotal}:</span>
                        <span className="font-semibold font-mono">${totalGeneral.toFixed(2)}</span>
                    </div>
                    {deposit > 0 && (
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600 font-montserrat">{t.invoice_depositPaid}:</span>
                            <span className="font-semibold font-mono">- ${deposit.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-3 bg-[#119600] text-white px-4 rounded-b-lg">
                        <span className="font-bold text-base font-montserrat">{t.invoice_balanceDue}:</span>
                        <span className="font-bold text-base font-mono">${parseFloat(data.balanceRestante).toFixed(2)} USD</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-10 text-sm">
                 <h4 className="font-medium mb-2 text-gray-700 font-montserrat">{t.invoice_notes}:</h4>
                 <p className="text-gray-600 italic">
                    {data.notasFactura || t.invoice_notes_placeholder}
                 </p>
            </div>

             <footer className="text-center text-xs text-gray-500 mt-12 pt-6 border-t font-light">
                <p className="font-bold">{t.invoice_thankYou}</p>
                <p>{t.invoice_footer}</p>
            </footer>
        </article>
    );
};