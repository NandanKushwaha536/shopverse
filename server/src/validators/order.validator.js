export const validateOrder = (data) => {
  const errors = [];

  if (!data.shippingAddress) {
    errors.push("Shipping address is required");
  }

  if (!data.paymentMethod) {
    errors.push("Payment method is required");
  }

  const validMethods = ["COD", "ONLINE"];

  if (
    data.paymentMethod &&
    !validMethods.includes(data.paymentMethod)
  ) {
    errors.push("Invalid payment method");
  }

  return errors;
};