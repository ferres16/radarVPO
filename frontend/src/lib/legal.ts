/**
 * Datos del titular del servicio. NO se inventan: se leen del entorno.
 * Hasta que el titular los configure, las páginas legales lo indican con claridad.
 *
 *   NEXT_PUBLIC_LEGAL_NAME      Nombre o razón social
 *   NEXT_PUBLIC_LEGAL_TAX_ID    NIF/CIF
 *   NEXT_PUBLIC_LEGAL_ADDRESS   Domicilio
 *   NEXT_PUBLIC_SUPPORT_EMAIL   Correo de soporte
 */
function read(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const legalOwner = {
  name: read(process.env.NEXT_PUBLIC_LEGAL_NAME),
  taxId: read(process.env.NEXT_PUBLIC_LEGAL_TAX_ID),
  address: read(process.env.NEXT_PUBLIC_LEGAL_ADDRESS),
};

export const supportEmail = read(process.env.NEXT_PUBLIC_SUPPORT_EMAIL);

export function isLegalIdentityComplete(): boolean {
  return Boolean(legalOwner.name && legalOwner.taxId && legalOwner.address && supportEmail);
}

export const SUPPORT_SCOPE =
  'compras, acceso a cursos, facturación y problemas técnicos';
