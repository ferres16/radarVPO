import { redirect } from 'next/navigation';

/** El acompañamiento 1:1 ya no se vende. Los accesos históricos se gestionan en Compras y accesos. */
export default function AdminServicesRetiredPage() {
  redirect('/admin/access');
}
