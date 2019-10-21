import { Request, Response, Router } from 'express';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { adminMW } from '@shared';
import { Subscriber } from '../models/Subscriber';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';

interface SubscriberData {
  pushToken: string;
  email: string;
}

// Init shared
const router = Router();

/******************************************************************************
 *                Send Push Notification - "POST /api/push/send"
 ******************************************************************************/
router.post('/send', adminMW, async (req: Request, res: Response) => {
  const messages: ExpoPushMessage[] = [];
  const expo = new Expo();

  const messageData = req.body;

  const subscribers = await Subscriber.find({}).select('pushToken -_id');
  console.log(subscribers);
  for (const subscriber of subscribers) {
    if (!Expo.isExpoPushToken(subscriber.pushToken)) {
      console.error(
        `Push token ${subscriber.pushToken} is not a valid Expo push token`
      );
      continue;
    }
    messages.push({
      to: subscriber.pushToken,
      sound: 'default',
      body: messageData.message,
      data: { withSome: 'data' }
    });
  }

  // const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  const errors = [];
  // Send the chunks to the Expo push notification service. There are
  // different strategies you could use. A simple one is to send one chunk at a
  // time, which nicely spreads the load out over time:
  for (const message of messages) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync([message]);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
      // NOTE: If a ticket contains an error code in ticket.details.error, you
      // must handle it appropriately. The error codes are listed in the Expo
      // documentation:
      // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
    } catch (error) {
      console.error(error);
      errors.push(error);
    }
  }
  if (errors.length > 0) {
    console.log('Errors: ', errors);
    res.status(BAD_REQUEST).json(errors);
  } else {
    res.status(OK).json(tickets);
  }
});

export default router;
