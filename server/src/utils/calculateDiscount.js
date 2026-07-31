export const calculateDiscount = (originalPrice, discount = 0) => {
  return originalPrice - (originalPrice * discount) / 100;
};