import { Router } from 'express';
import { zoomController } from './zoom.controller';

const zoomRouter = Router();

zoomRouter.get('/integration/:userId', zoomController.getUsersAuthDetail);
zoomRouter.get('/:userId', zoomController.checkValidity);

// Domain verification routes
zoomRouter.get('/terms', zoomController.getTerms);
zoomRouter.get('/policy', zoomController.getPolicy);
zoomRouter.get('/support', zoomController.getSupport);
zoomRouter.get('/zoomverify/verifyzoom.html', zoomController.verify);

export default zoomRouter;
