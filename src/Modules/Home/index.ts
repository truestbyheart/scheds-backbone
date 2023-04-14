import { Router } from 'express';
import HomeController from './Home.controller';

const homeRouter = Router();

homeRouter.get('/', HomeController.LoadHomepage);

export default homeRouter;
