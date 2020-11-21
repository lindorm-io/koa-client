import Joi from "@hapi/joi";

export const schema = Joi.object({
  id: Joi.string().guid().required(),
  version: Joi.number().required(),
  created: Joi.date().required(),
  updated: Joi.date().required(),
  events: Joi.array()
    .items(
      Joi.object({
        date: Joi.date().required(),
        name: Joi.string().required(),
        payload: Joi.object().required(),
      }),
    )
    .required(),

  approved: Joi.boolean().required(),
  description: Joi.string().allow(null).required(),
  extra: Joi.object().required(),
  name: Joi.string().allow(null).required(),
  secret: Joi.string().base64().allow(null).required(),
});
