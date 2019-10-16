import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { paramMissingError, logger, adminMW } from '@shared';
import { Subscriber } from '../models/subscriber';
import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushToken } from './expo';

interface SubscriberData {
  pushToken: string;
  email: string;
}

// Init shared
const router = Router();

/******************************************************************************
 *                Register Expo Push Token - "POST /api/push"
 ******************************************************************************/
router.post('/', async (req: Request, res: Response) => {
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

router.post('/send', async (req: Request, res: Response) => {
  let messages = [];
  let expo = new Expo();

  const subscribers = await Subscriber.find({}).select('pushToken -_id');
  console.log(subscribers); //res.send(pushTokens);
  for (let subscriber of subscribers) {
    if (!Expo.isExpoPushToken(subscriber.pushToken)) {
      console.error(
        `Push token ${subscriber.pushToken} is not a valid Expo push token`
      );
      continue;
    }
    messages.push({
      to: subscriber.pushToken,
      sound: 'default',
      body: 'This is a test notification',
      data: { withSome: 'data' }
    });
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
      } catch (error) {
        console.error(error);
      }
    }
  })();
});

export default router;
