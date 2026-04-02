// Reseñas locales deshabilitadas — todas las reseñas vienen de la base de datos.
export type ProductReview = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export function readReviewsStore(): ProductReview[] { return []; }
export function writeReviewsStore(_data: ProductReview[]) {}
