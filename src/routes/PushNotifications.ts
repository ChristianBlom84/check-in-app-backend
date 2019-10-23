import { Request, Response, Router } from 'express';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { adminMW, logger } from '@shared';
import { Subscriber } from '../models/Subscriber';
import { TicketChunk } from '../models/TicketChunk';

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
      const fromDatabase = await TicketChunk.find();
      logger.info('From Database: ', fromDatabase);
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
});

export default router;
