import { redirect } from 'next/navigation';

/** Mi espacio ya no se promociona ni forma parte de la oferta pública. */
export default function MiEspacioRedirectPage() {
  redirect('/');
}
