/* eslint-disable no-undef */
/**
 * Schemas description file
 * @name validationMiddleware
 * @author nkpremices
 */
import { NextFunction, Request, Response } from 'express';
import errorHandler from '../helpers/error.handler';
// @ts-ignore
import joiHelper from '../helpers/joi.helper';
import Joi from '@hapi/joi';

// Allowed http methods
const supportedMethods = ['get', 'post', 'patch', 'delete', 'put'];

// @ts-ignore
const isEmpty = (value: string | object = null) => {
  let empty = true;
  if (value && value !== '' && (typeof value === 'string' || typeof value === 'object')) {
    empty = false;
  }
  return empty;
};

// Joi validation options
const validationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: false, // allow unknown keys to be ignored
  stripUnknown: false, // remove unknown keys from the validated data
  convert: true, // attempts to cast values to the required types.
};

export /**
 * A function to execute the validation
 * @param {*} req
 * @param {*} schema
 * @param {string} [reqProperty='body']
 * @returns
 */
const validateProperties = (req: Request, schema: any, reqProperty = 'body') => {
  const validatedData = joiHelper.validateSubmission(
    // @ts-ignore
    req[reqProperty],
    schema[reqProperty],
    validationOptions,
  );

  const { errorMessage, ...errors } = validatedData;
  if (errorMessage) {
    console.log(errors);
    Object.getOwnPropertyNames(errors).map((error) => {
      errors[error] = errors[error].replace(/['"]/g, '');
      return error;
    });
    return {
      errorMessage,
      errors: { ...errors },
      success: false,
    };
  }
  return { success: true };
};

/**
 * A function to validate all inputs
 * @param {string} schema - The joi validation schema
 * @param {ValidRequestProperties} reqProperties - An array containing all the fields to validate
 * provided especially for custom error messages
 * @returns {Function} - A function validating the schema
 */
export default (schema: { [key: string]: Joi.ObjectSchema }) => (req: Request, res: Response, next: NextFunction) => {
  const method = req.method.toLowerCase();
  if (supportedMethods.includes(method) && !isEmpty(schema)) {
    // validation happens here
    try {
      Object.getOwnPropertyNames(schema).forEach((property) => {
        const { errorMessage, errors, success } = validateProperties(req, schema, property);
        if (!success) {
          const errorInstance = new Error(errorMessage);
          // @ts-ignore
          errorInstance.errors = errors;
          throw errorInstance;
        }
      });
      return next();
    } catch (errorInstance) {
      // Sending an error back if any
      return errorHandler.sendErrorResponse(
        // @ts-ignore
        {
          error: { ...errorInstance.errors },
          code: 400,
          message: errorInstance.message,
        },
        res,
      );
    }
  }

  return errorHandler.sendErrorResponse(
    // @ts-ignore
    {
      code: 405,
      message: 'Http method Not Allowed',
    },
    res,
  );
};
