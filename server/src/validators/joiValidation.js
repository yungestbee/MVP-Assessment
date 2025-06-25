const Joi = require("joi");

const signUp = (data) => {
  Schemas = Joi.object({
    firstName: Joi.string().required().trim().messages({
      "string.base": `First name should be a "text"`,
      "string.empty": `Firstname cannot be empty`,
      "any.required": `Firstname field is required`,
    }),
    lastName: Joi.string().required().trim().messages({
      "string.base": `Lastname should be a "text"`,
      "string.empty": `Lastname cannot be empty`,
      "any.required": `Lastname field is required`,
    }),
    email: Joi.string().trim().email().required().messages({
      "string.email": `Invalid email, for instance 'example@gmail.com'`,
      "any.required": `this field is require`,
      "string.empty": `"email" cannot be empty field`,
    }),
  });
  return Schemas.validate(data);
};

const loginSchema = (data) => {
  const Schema = Joi.object({
    username: Joi.string().required().trim().messages({
      "any.required": `Username is required`,
      "string.empty": `Username cannot be an empty field`,
    }),
    password: Joi.string().trim().min(8).required().messages({
      "any.required": `Password field is required`,
      "string.min": `Password length must at least be 8 characters long`,
      "string.empty": `Password cannot be an empty field`,
    }),
  });
  return Schema.validate(data);
};


const newPasswordSchema = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .min(8)
      .pattern(
        new RegExp(/(?=.*[A-Z])[a-zA-Z0-9]+[\#\@\$\%\&\*\(\)\>\<\~\{\}]+/)
      )
      .messages({
        "string.pattern.base": `Password must contain atleast one capital letter and one special characters`,
        "any.required": `Password field is required`,
        "string.min": `Password length must at least be 8 characters long`,
      }),

    newPassword: Joi.string()
      .required()
      .min(8)
      .pattern(
        new RegExp(/(?=.*[A-Z])[a-zA-Z0-9]+[\#\@\$\%\&\*\(\)\>\<\~\{\}]+/)
      )
      .messages({
        "string.pattern.base": `Password must contain atleast one capital letter and one special characters`,
        "any.required": `Password field is required`,
        "string.min": `Password length must at least be 8 characters long`,
      }),

    confirmPassword: Joi.any()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.require": "Confirm Password is required",
        "any.only": "Passwords do not match",
      }),
  });
  return schema.validate(data);
};

module.exports.signUp = signUp;
module.exports.loginSchema = loginSchema;
module.exports.newPasswordSchema = newPasswordSchema;