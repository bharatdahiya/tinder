const validator = require("validator");
const validateSignupData = (data) => {
  const errors = {};
  if (
    !data.firstName ||
    typeof data.firstName !== "string" ||
    data.firstName.trim().length < 4 ||
    data.firstName.trim().length > 50
  ) {
    errors.firstName =
      "First name must be a string between 4 and 50 characters";
  }
  if (
    !data.lastName ||
    typeof data.lastName !== "string" ||
    data.lastName.trim().length === 0
  ) {
    errors.lastName = "Last name is required and must be a string";
  }
  if (
    !data.email ||
    typeof data.email !== "string" ||
    !validator.isEmail(data.email)
  ) {
    errors.email = "A valid email is required";
  }
  if (
    !data.password ||
    !validator.isStrongPassword(data.password, {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    errors.password = "Password must be strong";
  }
  return errors;
  
};

const validateProfileData = (req) => {
  const ALLOWED_FIELDS = [
    "firstName",
    "lastName",
    "age",
    "photourl",
  ];

  const isAllowed = Object.keys(req.body).some((field) =>
    ALLOWED_FIELDS.includes(field),
  );

  if (!isAllowed) {
    throw new Error("Invalid fields in update data");
  }
  return isAllowed
};

module.exports = {
  validateSignupData,
  validateProfileData,
};
