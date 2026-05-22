'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type FollowupButtonProps = {
  className?: string;
};

const whatsappContactUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_CONTACT_URL ||
  'https://wa.me/34600111222?text=Hola%2C%20quiero%20activar%20el%20seguimiento%20individualizado%20de%20Radar%20VPO.';

export function FollowupButton({ className }: FollowupButtonProps) {
  const [status, setStatus] = useState<'loading' | 'authed' | 'guest'>('loading');
  const router = useRouter();

  useEffect(() => {
    let active = true;

    api
      .getMe()
      .then(() => {
        if (active) setStatus('authed');
      })
      .catch(() => {
        if (active) setStatus('guest');
      });

    return () => {
      active = false;
    };
  }, []);

  const handleClick = () => {
    if (status === 'authed') {
      const opened = window.open(whatsappContactUrl, '_blank', 'noopener');
      if (!opened) {
        window.location.href = whatsappContactUrl;
      }
      return;
    }

    router.push('/login');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === 'loading'}
      className={className}
    >
      Pedir seguimiento
    </button>
  );
}
