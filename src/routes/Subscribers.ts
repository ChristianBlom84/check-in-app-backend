import { Subscriber } from './../models/Subscriber';
import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { logger, adminMW } from '@shared';

interface SubscriberData {
  pushToken: string;
  email: string;
}

// Init shared
const router = Router();

/******************************************************************************
 *          Get All Subscribers - "GET /api/subscribers/all"
 ******************************************************************************/

router.get('/all', adminMW, async (req: Request, res: Response) => {
  try {
    const subscribers = await Subscriber.find({});
    return res.status(OK).json({ subscribers });
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

/******************************************************************************
 *          Check If Device Is Subscribed - "POST /api/subscribers/check-device"
 ******************************************************************************/

router.post('/check-device', async (req: Request, res: Response) => {
  try {
    const subscriber = await Subscriber.findOne({
      pushToken: req.body.pushToken
    });

    if (!subscriber) {
      return res.status(OK).json({ registered: false });
    }
    return res
      .status(OK)
      .json({ registered: true, withEmail: subscriber.email });
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

/******************************************************************************
 *          Register Expo Push Token - "POST /api/subscribers/register"
 ******************************************************************************/
router.post('/register', async (req: Request, res: Response) => {
  try {
    const subscriberData: SubscriberData = req.body;
    console.log(subscriberData);
    const subscriber = await Subscriber.findOne({
      pushToken: subscriberData.pushToken
    });
    if (!subscriber) {
      Subscriber.create(subscriberData);
      return res.status(CREATED).json(subscriberData);
    }
    return res
      .status(BAD_REQUEST)
      .json({ error: 'Device already registered.' });
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

export default router;
