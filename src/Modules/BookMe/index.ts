import { Router } from 'express';
import bookMeController from './BookMe.controller';
import Auth from '../Shared/middlewares/Auth.middleware';
import catchAsync from '../Shared/middlewares/errorHandler.middleware';
import { pickUpBookMeInfo } from './BookMe.middleware';

const bookMeRouter = Router();

bookMeRouter
  .route('/')
  .post(Auth, catchAsync(bookMeController.createBookMe))
  .get(Auth, catchAsync(bookMeController.viewBookIns));
bookMeRouter.post('/:bookme_id', pickUpBookMeInfo, catchAsync(bookMeController.getBookMeCalendarDetails));
bookMeRouter.post('/in/:bookme_id', pickUpBookMeInfo, catchAsync(bookMeController.bookIn));
bookMeRouter.post('/details/:bookme_id', catchAsync(bookMeController.bookMeDetails));
bookMeRouter.post('/cancel/bookin', catchAsync(bookMeController.cancelBookIn));
bookMeRouter.patch('/edit/:bookme_id', catchAsync(bookMeController.updateBookMe));
bookMeRouter.delete('/delete/:bookme_id', catchAsync(bookMeController.deleteBookMe));

export default bookMeRouter;
