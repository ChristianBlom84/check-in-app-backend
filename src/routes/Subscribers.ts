/* eslint-disable prettier/prettier */
import { Subscriber } from './../models/subscriber';
import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { logger, adminMW, userMW, subscriberNotFoundError } from '@shared';

interface SubscriberData {
  pushToken: string;
  name: string;
	email: string;
	organization?: string;
}

// Init shared
const router = Router();

/******************************************************************************
 *          Get All Subscribers - "GET /api/subscribers/all"
 ******************************************************************************/

router.get('/all', userMW, async (req: Request, res: Response) => {
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
    
		subscriberData.organization = '4d616b696e67205761766573';

		console.log(subscriberData);

		const subscriber = await Subscriber.findOne({
			pushToken: subscriberData.pushToken
		});

		if (!subscriber) {
			await Subscriber.create(subscriberData);
			return res.status(CREATED).json({...subscriberData, organization: 'Making Waves'});
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

/******************************************************************************
 *                       Update - "PUT /api/subscribers/update"
 ******************************************************************************/

router.put(
  '/update',
  adminMW,
  [
    check('email', 'Please include a valid email')
      .not()
      .isEmpty()
      .isEmail(),
    check('name')
      .optional()
      .escape()
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;

    try {
      // Update subscriber
      const subscriber = await Subscriber.findOne({ email });

      if (!subscriber) {
        return res.status(BAD_REQUEST).json({
          error: subscriberNotFoundError
        });
      }

      subscriber.name = name ? name : subscriber.name;
      subscriber.email = email ? email : subscriber.email;

      await subscriber.save();
      return res.status(OK).json(subscriber);
    } catch (err) {
      logger.error(err.message, err);
      return res.status(BAD_REQUEST).json({
        error: err.message
      });
    }
  }
);

/******************************************************************************
 *                    Delete - "DELETE /api/subscribers/delete"
 ******************************************************************************/

router.delete(
  '/delete/:email',
  adminMW,
  async (req: Request, res: Response) => {
    const { email } = req.params;

    try {
      const subscriber = await Subscriber.findOneAndDelete({ email }).select('-pwdHash');
      if (!subscriber) {
        return res
          .status(BAD_REQUEST)
          .json({ error: 'Could not delete subscriber.' });
      }
      return res.status(OK).json(subscriber);
    } catch (err) {
      logger.error(err.message, err);
      return res.status(BAD_REQUEST).json({
        error: err.message
      });
    }
  }
);

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
