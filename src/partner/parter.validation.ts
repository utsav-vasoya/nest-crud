import * as Joi from 'joi';

export const registerPartnerValidator = Joi.object({
  fullName: Joi.string().required(),
  phoneNo: Joi.string().regex(/^[0-9]{10}$/).messages({ "string.pattern.base": `Phone number must have 10 digits.` }).required(),
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }).required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().options({ messages: { 'any.only': 'Password does not match.' } }),
  isActive: Joi.boolean().required()
});
