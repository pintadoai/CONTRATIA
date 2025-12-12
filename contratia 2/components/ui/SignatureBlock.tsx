import React from "react";

type SignatureBlockProps = {
  signerName?: string;
  signerInitials?: string;
  signerTitle?: string;
  signerCompany?: string;
  date?: string;
  useImage?: boolean;
  base64Signature?: string;
  showDivider?: boolean;
  showCompanyInfo?: boolean;
  showLegalText?: 'full' | 'simplified' | 'none';
};

const COLORS = {
  brand: "#119600",   // verde D' Show
  gray:  "#9b9b9b",
  text:  "#000000",
};

export const SignatureBlock: React.FC<SignatureBlockProps> = ({
  signerName = "Luis A. Pintado Escudero",
  signerInitials = "L.A.P.E.",
  signerTitle = "Director",
  signerCompany = "D’ Show Events LLC",
  date,
  useImage = false,
  base64Signature,
  showDivider = true,
  showCompanyInfo = true,
  showLegalText = 'full',
}) => {
  const signedAt =
    date ||
    new Date().toLocaleDateString("es-PR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="w-full mt-8 pt-4" style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}>
      {/* Firma visual encima de la línea */}
      <div className="h-16">
        {useImage && base64Signature ? (
          <img
            src={base64Signature}
            alt={`Firma de ${signerName}`}
            style={{ height: 64, opacity: 0.95 }}
          />
        ) : (
          <div
            className="font-sacramento text-4xl -mb-4 pl-2"
            style={{
              color: COLORS.text,
            }}
          >
            {signerInitials}
          </div>
        )}
      </div>

      {showDivider && (
        <div
          className="h-[1px]"
          style={{ background: COLORS.gray, opacity: 0.5 }}
        />
      )}

      {/* Nombre en claro y cargo */}
      <div className="mt-2 text-sm" style={{ color: COLORS.text }}>
        <strong>{signerName}</strong>
        <div className="text-[12px]" style={{ color: "#555" }}>
          {signerTitle}, {signerCompany}
        </div>
      </div>

      {/* Sello / línea corporativa opcional */}
      {showCompanyInfo && (
        <div className="mt-2 text-[11px]" style={{ color: COLORS.gray }}>
            <span
            className="inline-block mr-2 align-middle"
            style={{
                width: 8,
                height: 8,
                background: COLORS.brand,
                borderRadius: 999,
            }}
            />
            D’ Show Events LLC • info@dshowevents.com • (+1) 787-329-6680
        </div>
      )}

      {/* Texto de validez legal */}
       {showLegalText !== 'none' && (
         <p className="mt-3 text-[10px]" style={{ color: "#666" }}>
            Firmado electrónicamente por <b>{signerName}</b> el {signedAt}.
            {showLegalText === 'full' && ' Al presionar “Aceptar y firmar”, el firmante consiente el uso de firma electrónica y reconoce que este documento tiene la misma validez legal que una firma manuscrita conforme a ESIGN y a la legislación aplicable en Puerto Rico.'}
        </p>
      )}
    </div>
  );
};

export default SignatureBlock;