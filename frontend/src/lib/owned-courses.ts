import { cookies } from 'next/headers';
import { getBackendApiUrl } from '@/lib/backend-url';

/** Cursos/guías a los que la sesión actual ya tiene acceso. */
export async function getOwnedCourseSlugs(): Promise<Set<string>> {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return new Set();

  try {
    const response = await fetch(`${getBackendApiUrl()}/users/me/courses`, {
      headers: {
        Cookie: cookieHeader,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (!response.ok) return new Set();
    const courses = (await response.json()) as Array<{ slug?: string | null }>;
    return new Set(
      courses.map((course) => course.slug).filter((slug): slug is string => Boolean(slug)),
    );
  } catch {
    return new Set();
  }
}

export function getGuideReadHref(slug: string) {
  return `/cursos/${slug}#guia`;
}
