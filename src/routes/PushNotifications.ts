import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { paramMissingError, logger, adminMW } from '@shared';

// Init shared
const router = Router();

/******************************************************************************
 *                Register Expo Push Token - "POST /api/push"
 ******************************************************************************/
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log(req);
    return res.status(OK).json({ ok: true })
  } catch (err) {
      logger.error(err.message, err);
      return res.status(BAD_REQUEST).json({
          error: err.message,
      });
  }
});


 export default router;