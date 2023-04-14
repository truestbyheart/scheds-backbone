import { recursionSchemas } from './schema/recursion.schemas';
import { recursionController } from './recursion.controller';
import { Router } from 'express';
import Auth from '../Shared/middlewares/Auth.middleware';
import joiHandler from '../Shared/middlewares/joi.handler';
import { deleteRecursionProtection } from './recursion.middleware';
import catchAsync from '../Shared/middlewares/errorHandler.middleware';

const recursionRouter = Router();

recursionRouter.get('/', Auth, recursionController.getPaginated);
recursionRouter.post('/', Auth, joiHandler(recursionSchemas.createEvent), recursionController.create);
recursionRouter
  .route('/:id')
  .get(Auth, recursionController.getOne)
  .delete(Auth, deleteRecursionProtection, catchAsync(recursionController.deleteRecursion))
  .put(Auth, catchAsync(recursionController.update));

// recursionRouter.patch('/update', Auth, recursionController.update);

export default recursionRouter;
