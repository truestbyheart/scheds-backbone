import { NextFunction, Response, Request } from 'express';
import { celebrate, SchemaOptions } from 'celebrate';

/**
 * @author nkpremices
 * * */
class HttpError extends Error {
  constructor(public message: string, private code = 500, private error?: Error) {
    super();
  }

  static throwErrorIfNull(data: any, message: string, code = 500) {
    if (!data) {
      throw new HttpError(message, code);
    }
  }

  static sendErrorResponse(errorInstance: HttpError, res: Response) {
    const code = errorInstance.code || 500;
    const { message, error } = errorInstance;
    return res.status(code).json({
      success: false,
      message,
      error,
    });
  }

  static asyncHandler({
    controller,
    callback,
    celebrateObj,
  }: {
    controller?: (req: Request, res: Response, next?: NextFunction) => any;
    callback?: () => any;
    celebrateObj?: { [key: string]: any };
  }) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (controller) return await controller(req, res, next);
        if (celebrate) return celebrate(celebrateObj as SchemaOptions);
        // @ts-ignore
        return await callback();
      } catch (err) {
        if (celebrateObj) {
          return res.status(500).json({
            status: 500,
            message: err.message,
          });
        }
        return res.status(500).json({
          status: 500,
          message: err.message,
        });
      }
    };
  }
}

export default HttpError;
