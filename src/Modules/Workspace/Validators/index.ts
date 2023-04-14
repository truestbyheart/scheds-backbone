import { Joi } from 'celebrate';

export const workspaceSchema = Joi.object().keys({
  info: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
  }),
  members: Joi.array()
    .items(
      Joi.object().keys({
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        email: Joi.string().required(),
        role: Joi.string().required(),
      }),
    )
    .required(),
});
