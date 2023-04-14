import { Joi } from 'celebrate';

export const durationSchema = Joi.object()
  .keys({
    from: Joi.string().required(),
    to: Joi.string().required(),
    limit: Joi.number().required(),
  })
  .required();

export const eventItems = Joi.object()
  .keys({
    index: Joi.number(),
    host: Joi.string().required(),
    limit: Joi.number().required(),
    time: Joi.object()
      .keys({
        from: Joi.string().required(),
        to: Joi.string().required(),
      })
      .required(),
    meetings: Joi.array().items(durationSchema).required(),
  })
  .required();

export const questionSchema = Joi.object().keys({
  id: Joi.number(),
  inquiry: Joi.string(),
});

export const recursionSchemas = {
  createEvent: {
    body: Joi.object()
      .keys({
        details: Joi.object()
          .keys({
            title: Joi.string().required(),
            description: Joi.string().required(),
            calendar: Joi.object()
              .keys({
                id: Joi.string().required(),
                summary: Joi.string().required(),
              })
              .required(),
            location: Joi.string().valid('meet', 'zoom').default('meet').required(),
            colorId: Joi.number().min(0).max(10).required(),
            managed: Joi.boolean().default(false).required(),
            zoomDetails: Joi.object().keys({
              manager: Joi.string().required(),
              managee: Joi.string().required(),
            }),
          })
          .required(),
        events: Joi.array().items(eventItems).required(),
        questions: Joi.array().items(questionSchema),
      })
      .required(),
  },
};
