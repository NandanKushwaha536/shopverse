export const validateRegister = (data) => {
  const errors = [];

  if (!data.name?.trim()) {
    errors.push("Name is required");
  }

  if (!data.email?.trim()) {
    errors.push("Email is required");
  }

  if (!data.password?.trim()) {
    errors.push("Password is required");
  }

  if (data.password && data.password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  return errors;
};

export const validateLogin = (data) => {
  const errors = [];

  if (!data.email?.trim()) {
    errors.push("Email is required");
  }

  if (!data.password?.trim()) {
    errors.push("Password is required");
  }

  return errors;
};