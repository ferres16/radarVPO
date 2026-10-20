import { isInternalCatalogCourse } from '../public-courses';

describe('isInternalCatalogCourse', () => {
  it('hides provisional test products', () => {
    expect(
      isInternalCatalogCourse({ title: 'Test guia', slug: 'test-guia' }),
    ).toBe(true);
    expect(
      isInternalCatalogCourse({
        title: 'VPO desde cero',
        slug: 'vpo-desde-cero',
      }),
    ).toBe(false);
  });
});
