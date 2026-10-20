/**
 * Datos del titular del servicio.
 * Los valores por defecto son los publicados; el entorno puede completar NIF y domicilio.
 *
 *   NEXT_PUBLIC_LEGAL_NAME      Nombre o razón social
 *   NEXT_PUBLIC_LEGAL_TAX_ID    NIF/CIF
 *   NEXT_PUBLIC_LEGAL_ADDRESS   Domicilio
 *   NEXT_PUBLIC_SUPPORT_EMAIL   Correo de soporte
 */

export const DEFAULT_LEGAL_NAME = 'Carlos Tena';
export const DEFAULT_SUPPORT_EMAIL = 'radarvpo@gmail.com';
export const PENDING_TAX_ID = 'pendingToAdd';

function read(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const legalOwner = {
  name: read(process.env.NEXT_PUBLIC_LEGAL_NAME) ?? DEFAULT_LEGAL_NAME,
  taxId: read(process.env.NEXT_PUBLIC_LEGAL_TAX_ID) ?? PENDING_TAX_ID,
  address: read(process.env.NEXT_PUBLIC_LEGAL_ADDRESS),
};

export const supportEmail = read(process.env.NEXT_PUBLIC_SUPPORT_EMAIL) ?? DEFAULT_SUPPORT_EMAIL;

export function isTaxIdPublished(taxId = legalOwner.taxId): boolean {
  return Boolean(taxId && taxId !== PENDING_TAX_ID);
}

export function isLegalIdentityComplete(): boolean {
  return Boolean(legalOwner.name && isTaxIdPublished() && legalOwner.address && supportEmail);
}

export const SUPPORT_SCOPE =
  'compras, acceso a cursos, facturación y problemas técnicos';
