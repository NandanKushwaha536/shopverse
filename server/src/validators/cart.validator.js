export const validateCart = (data) => {
  const errors = [];

  if (!data.productId) {
    errors.push("Product ID is required");
  }

  if (
    data.quantity !== undefined &&
    (isNaN(data.quantity) || data.quantity < 1)
  ) {
    errors.push("Quantity must be at least 1");
  }

  return errors;
};