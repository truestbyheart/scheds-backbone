import { Joi } from 'celebrate';

const questionSchema = Joi.object().keys({
  event_id: Joi.string(),
  inquiry: Joi.string().max(150).min(2).required(),
});

const durationSchema = Joi.object().keys({
  id: Joi.number(),
  startTime: Joi.string().max(150).min(2).required(),
  endTime: Joi.string().max(150).min(2).required(),
});

const meetingSchema = Joi.object().keys({
  host: Joi.string().email().required(),
  limit: Joi.number().required(),
  duration: durationSchema.required(),
});

export const validateCreateEvent = {
  body: Joi.array().items({
    title: Joi.string().max(150).min(2).required(),
    description: Joi.string().max(150).min(2).required(),
    duration: durationSchema.required(),
    meetings: Joi.array().items(meetingSchema).required(),
    questions: Joi.array().items(questionSchema),
    calendar: Joi.object().keys({ id: Joi.string().required(), summary: Joi.string().required() }).required(),
    timezone: Joi.string().max(150).min(2).required(),
    colorId: Joi.string(),
  }),
};

export const validateUpdateContent = {
  body: Joi.object().keys({
    event_id: Joi.string().required(),
    reason: Joi.string().required(),
    title: Joi.string().max(150).min(2).required(),
    description: Joi.string().max(150).min(2).required(),
    duration: durationSchema.required(),
    meetings: Joi.array().items(meetingSchema).required(),
    questions: Joi.array().items(questionSchema),
    calendar: Joi.object().keys({ id: Joi.string().required(), summary: Joi.string().required() }).required(),
    timezone: Joi.string().max(150).min(2).required(),
    colorId: Joi.string(),
  }),
};

export const bookingContent = {
  body: Joi.object()
    .keys({
      recursionId: Joi.string().required(),
      user: Joi.object()
        .keys({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
        })
        .required(),
      guests: Joi.array().items(Joi.object().keys({ email: Joi.string().email() })),
      answers: Joi.array().items(Joi.object().keys({ answer: Joi.string(), id: Joi.number() })),
      event: Joi.object()
        .keys({
          id: Joi.string().required(),
          host: Joi.number().required(),
          slotId: Joi.number().required(),
        })
        .required(),
    })
    .required(),
};
