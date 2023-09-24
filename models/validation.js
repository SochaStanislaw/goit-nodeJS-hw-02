const Joi = require("joi");

// validation schema to signup
const userValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    // minimum 8 characters
    .min(8)
    .required()
    .pattern(
      /^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=[\w\s]*[\W_])[\s\S]{8,}$/
    )
    .message(
      "Password must be at least 8 characters long and contain at least one digit, one uppercase letter, and one special character"
    ),
});

// schema for contacts
const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email(),
  phone: Joi.string(),
});

module.exports = {
  userValidationSchema,
  contactSchema,
};
