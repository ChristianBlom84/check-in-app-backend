import { Request, Response, Router } from "express";
import { BAD_REQUEST, CREATED, OK } from "http-status-codes";
import { paramMissingError, logger, adminMW } from "@shared";
import { Subscriber } from "../models/subscriber";

interface SubscriberData {
  pushToken: string;
  email: string;
}

// Init shared
const router = Router();

/******************************************************************************
 *                Register Expo Push Token - "POST /api/push"
 ******************************************************************************/
router.post("/", async (req: Request, res: Response) => {
  try {
    const subscriberData: SubscriberData = req.body;
    console.log(subscriberData);
    const subscriber = await Subscriber.findOne({ pushToken: subscriberData.pushToken });
    if (!subscriber) {
      Subscriber.create(subscriberData);
      return res.status(CREATED).json(subscriberData);
    }
    return res.status(BAD_REQUEST).json({ error: "Device already registered." })
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

export default router;
