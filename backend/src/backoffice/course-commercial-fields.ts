import { CourseAccessType, CoursePricingType } from '@prisma/client';

function hasPositivePrice(price?: string | null): boolean {
  if (price == null || price === '') return false;
  const amount = Number(price);
  return Number.isFinite(amount) && amount > 0;
}

/**
 * Si el admin pone un precio de venta y deja tipo gratuito, el curso nunca
 * llega a Stripe: pricingType sigue en `free`. Inferimos premium/paid.
 */
export function inferCourseCommercialFields(input: {
  pricingType?: CoursePricingType;
  accessType?: CourseAccessType;
  price?: string | null;
}): {
  pricingType?: CoursePricingType;
  accessType?: CourseAccessType;
} {
  const paid = hasPositivePrice(input.price);
  const pricingType = paid ? CoursePricingType.premium : input.pricingType;
  const accessType =
    paid &&
    (input.accessType === CourseAccessType.free || input.accessType == null)
      ? CourseAccessType.paid
      : input.accessType;
  return { pricingType, accessType };
}
