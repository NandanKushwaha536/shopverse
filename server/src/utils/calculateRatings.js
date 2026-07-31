export const calculateRatings = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return 0;
  }

  const totalRatings = reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );

  return totalRatings / reviews.length;
};