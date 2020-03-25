import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { User, UserRoles } from '../models/User';
import { paramMissingError, userNotFoundError, logger, adminMW } from '@shared';

// Init shared
const router = Router();

/******************************************************************************
 *                      Get All Users - "GET /api/users/all"
 ******************************************************************************/

router.get('/all', adminMW, async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-pwdHash');
    if (!users) {
      return res.status(BAD_REQUEST).json({ error: 'Could not fetch users.' });
    }
    return res.status(OK).json({ users });
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

/******************************************************************************
 *                       Add One - "POST /api/users/add"
 ******************************************************************************/

router.post(
  '/add',
  adminMW,
  [
    check('name', 'You must specify a name')
      .not()
      .isEmpty()
      .bail()
      .trim()
      .escape(),
    check('organization')
      .optional()
      .escape(),
    check('email', 'Please include a valid email')
      .isEmail()
      .escape(),
    check('password', 'Password is required').exists()
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, organization, email, password, role } = req.body;

    try {
      // Check parameters
      if (!name || !email || !password || !role) {
        return res.status(BAD_REQUEST).json({
          error: paramMissingError
        });
      }
      // Add new user
      const userRole = role === 1 ? UserRoles.Admin : UserRoles.Standard;

      const salt = await bcrypt.genSalt(10);

      const pwdHash = await bcrypt.hash(password, salt);

      const user = new User({
        name,
        organization,
        email,
        pwdHash,
        role: userRole
      });

      await user.save();

      return res.status(CREATED).json({
        name: user.name,
        organizationID: user.organization,
        email: user.email,
        role: user.role
      });
    } catch (err) {
      logger.error(err.message, err);
      return res.status(BAD_REQUEST).json({
        error: err.message
      });
    }
  }
);

/******************************************************************************
 *                       Update - "PUT /api/users/update"
 ******************************************************************************/

router.put(
  '/update',
  adminMW,
  [
    check('email', 'Please include a valid email')
      .not()
      .isEmpty(),
    check('name')
      .optional()
      .escape(),
    check('role')
      .optional()
      .isInt({ min: 0, max: 1 }),
    check('password')
      .optional()
      .trim()
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      // Update user
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(BAD_REQUEST).json({
          error: userNotFoundError
        });
      }

      if (password) {
        const salt = await bcrypt.genSalt(10);
        const pwdHash = await bcrypt.hash(password, salt);
        user.pwdHash = pwdHash;
      }

      user.name = name ? name : user.name;
      user.email = email ? email : user.email;
      user.role = role ? role : user.role;

      await user.save();
      return res.status(OK).json(user);
    } catch (err) {
      logger.error(err.message, err);
      return res.status(BAD_REQUEST).json({
        error: err.message
      });
    }
  }
);

/******************************************************************************
 *                    Delete - "DELETE /api/users/delete"
 ******************************************************************************/

router.delete('/delete', adminMW, async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOneAndDelete({ email }).select('-pwdHash');
    if (!user) {
      return res.status(BAD_REQUEST).json({ error: 'Could not delete user.' });
    }
    return res.status(OK).json(user);
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
