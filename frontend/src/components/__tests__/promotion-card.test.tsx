import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PromotionCard } from '../promotion-card';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: unknown; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('PromotionCard', () => {
  it('renders promotion title and action', () => {
    render(
      <PromotionCard
        promotion={{
          id: 'p1',
          title: 'Promocion Demo',
          municipality: 'Barcelona',
          province: 'Barcelona',
          promotionType: 'alquiler',
          status: 'published',
          sourceUrl: 'https://example.com',
        }}
      />, 
    );

    expect(screen.getByText('Promocion Demo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver detalle' })).toBeInTheDocument();
  });
});
