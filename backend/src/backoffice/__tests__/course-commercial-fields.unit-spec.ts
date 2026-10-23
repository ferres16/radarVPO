import { CourseAccessType, CoursePricingType } from '@prisma/client';
import { inferCourseCommercialFields } from '../course-commercial-fields';

describe('inferCourseCommercialFields', () => {
  it('marks a priced free course as a paid premium product', () => {
    expect(
      inferCourseCommercialFields({
        accessType: CourseAccessType.free,
        price: '29.90',
      }),
    ).toEqual({
      pricingType: CoursePricingType.premium,
      accessType: CourseAccessType.paid,
    });
  });

  it('keeps PRO access when the guide is included in the subscription', () => {
    expect(
      inferCourseCommercialFields({
        accessType: CourseAccessType.pro,
        price: '29.90',
      }),
    ).toEqual({
      pricingType: CoursePricingType.premium,
      accessType: CourseAccessType.pro,
    });
  });

  it('does not invent a commercial type without a price', () => {
    expect(
      inferCourseCommercialFields({
        accessType: CourseAccessType.free,
      }),
    ).toEqual({
      pricingType: undefined,
      accessType: CourseAccessType.free,
    });
  });

  it('upgrades an explicit free type when a sale price is set later', () => {
    expect(
      inferCourseCommercialFields({
        pricingType: CoursePricingType.free,
        accessType: CourseAccessType.free,
        price: '19',
      }),
    ).toEqual({
      pricingType: CoursePricingType.premium,
      accessType: CourseAccessType.paid,
    });
  });
});
