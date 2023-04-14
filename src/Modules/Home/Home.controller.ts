import { Request, Response } from 'express';

class HomeController {
  async LoadHomepage(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 200,
      message: 'The app is up and running.',
    });
  }
}

export default new HomeController();
