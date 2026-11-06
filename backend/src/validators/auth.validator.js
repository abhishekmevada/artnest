const validateName = (name) => {
  if (!name) {
    return "Name is Required";
  }

  if (typeof name != "string") {
    return "Name to be String";
  }

  const trimedName = name.trim();

  if (trimedName.length < 2) {
    return "Name must be at least 2 characters";
  }

  if (trimedName.length > 25) {
    return "Name must not exceed more then 25 characters";
  }

  if (!/^[A-Za-z]+$/.test(trimedName)) {
    return "Name can Contain only letters and spaces";
  }

  return null;
};

const validateEmail = (email) => {
  if (!email) {
    return res.status(400).json({ message: "Email is Required" });
  }

  if (typeof email !== "string") {
    return res.status(400).json({ message: "Email must be string" });
  }

  const trimEmail = email.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimEmail)) {
    return "Please enter a valid email";
  }

  if (trimEmail.length > 100) {
    return "Email must not exceed 100 characters";
  }

  return null;
};

const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }

  if (typeof password !== "string") {
    return "Password must be string";
  }

  if (password.length < 8) {
    return "Password must be at least 8 character";
  }

  if (password.length > 100) {
    return "Password must not exceed 100 character";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one small letter";
  }

  if (!/[0-9]/.test([password])) {
    return "Password must contain at least one number";
  }

  return null;
};

const validateStudioName = (name) => {
  if (!name) {
    return "Name is Required";
  }

  if (typeof name != "string") {
    return "Name to be String";
  }

  const trimedName = name.trim();

  if (trimedName.length < 2) {
    return "Name must be at least 2 characters";
  }

  if (trimedName.length > 25) {
    return "Name must not exceed more then 25 characters";
  }

  return null;
};

const validatePhoneNumber = (phone) => {
  if (phone === undefined || phone === null || phone === "") {
    return "Phone Number is Required";
  }

  if (typeof phone !== "number" || !Number.isSafeInteger(phone)) {
    return "Phone Number must be a valid Number";
  }

  if (phone < 1000000000 || phone > 9999999999) {
    return "Phone Number must be exactly 10 digits";
  }

  if (!/^[6-9]/.test(String(phone))) {
    return "Please enter a valid Indian mobile number";
  }

  return null;
};

module.exports = {
  validateName,
  validateEmail,
  validatePassword,
  validateStudioName,
  validatePhoneNumber,
};
