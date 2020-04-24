import { Request, Response, Router } from 'express';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import { BAD_REQUEST, OK, FORBIDDEN } from 'http-status-codes';
import { userMW, logger } from '@shared';
import { Subscriber } from '../models/subscriber';
import { TicketChunk } from '../models/TicketChunk';
import { Notification } from '../models/Notification';
import { JwtService } from '@shared';

// Init shared
const router = Router();
const jwtService = new JwtService();

/******************************************************************************
 *                Send Push Notification - "POST /api/push/send"
 ******************************************************************************/
router.post('/send', userMW, async (req: Request, res: Response) => {
  const messages: ExpoPushMessage[] = [];
  const expo = new Expo();

  const messageData = req.body;

  const subscribers = await Subscriber.find({}).select('pushToken -_id');

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
      data: { message: messageData.message }
    });
  }

  // const chunks = expo.chunkPushNotifications(messages);
  const chunks = messages;
  const tickets = [];
  const errors = [];
  // Send the chunks to the Expo push notification service. There are
  // different strategies you could use. A simple one is to send one chunk at a
  // time, which nicely spreads the load out over time:
  // Change message/messages to chunk/chunks in production
  for (const chunk of chunks) {
    try {
      const [ticketChunk] = await expo.sendPushNotificationsAsync([chunk]);
      // if (ticketChunk.status === "error") {
      //   const ticketChunkReceipt = await expo.getPushNotificationReceiptsAsync([
      //     ticketChunk.id
      //   ]);
      //   console.log('Receipt: ', ticketChunkReceipt);
      // }
      tickets.push(ticketChunk);
      // NOTE: If a ticket contains an error code in ticket.details.error, you
      // must handle it appropriately. The error codes are listed in the Expo
      // documentation:
      // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
      logger.info('Ticketchunk: ', tickets);
      const ticketsModel = new TicketChunk({ tickets });
      await ticketsModel.save();
    } catch (error) {
      logger.error(error);
      errors.push(error);
    }
  }
  if (errors.length > 0) {
    logger.error('Errors: ', errors);
    res.status(BAD_REQUEST).json(errors);
  } else {
    res.status(OK).json(tickets);
  }
  try {
    const { userID } = await jwtService.decodeJwt(
      req.signedCookies.JwtCookieKey
    );

    const notification = {
      date: new Date(),
      message: messageData.message,
      user: userID
    };

    const notificationModel = new Notification(notification);
    await notificationModel.save();
  } catch (error) {
    logger.error(error);
  }
});

/******************************************************************************
 *        Get The Last Five Notifications - "POST /api/push/all"
 ******************************************************************************/

router.post('/all', async (req: Request, res: Response) => {
  const { pushToken } = req.body;

  try {
    const subscriber = await Subscriber.findOne({
      pushToken
    });

    if (!subscriber) {
      return res.status(FORBIDDEN).send('You are not registered.');
    }

    const allNotifications = await Notification.find({});
    const notifications = allNotifications.reverse().slice(0, 5);

    return res.status(OK).json(notifications);
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

export default router;
