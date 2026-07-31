export const validateCreateProduct = (body) => {
  const errors = [];

  if (!body.name) {
    errors.push("Product name is required");
  }

  if (!body.originalPrice) {
    errors.push("Original price is required");
  }

  if (body.originalPrice < 0) {
    errors.push("Price cannot be negative");
  }

  if (!body.category) {
    errors.push("Category is required");
  }

  return errors;
};