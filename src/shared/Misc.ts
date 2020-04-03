import { Request, Response, NextFunction } from 'express';
import { UNAUTHORIZED } from 'http-status-codes';
import { UserRoles } from '@entities';
import { logger } from './Logger';
import { jwtCookieProps } from './cookies';
import { JwtService } from './JwtService';

// Init shared
const jwtService = new JwtService();

// Strings
export const paramMissingError =
  'One or more of the required parameters was missing.';
export const userNotFoundError = 'User not found.';
export const loginFailedErr = 'Login failed';

// Numbers
export const pwdSaltRounds = 10;

/* Functions */

export const pErr = (err: Error): void => {
  if (err) {
    logger.error(err);
  }
};

export const getRandomInt = (): number => {
  return Math.floor(Math.random() * 1_000_000_000_000);
};

// Middleware to verify that user is an admin
export const adminMW = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<NextFunction | Response | undefined> => {
  try {
    // Get json-web-token
    const jwt = req.signedCookies[jwtCookieProps.key];
    if (!jwt) {
      throw Error('JWT not present in signed cookie.');
    }
    // Make sure user role is an admin
    const clientData = await jwtService.decodeJwt(jwt);
    if (clientData.role === UserRoles.Admin) {
      next();
    } else {
      throw Error('You do not have permission to do that.');
    }
  } catch (err) {
    return res.status(UNAUTHORIZED).json({
      error: err.message
    });
  }
};

// Middleware to verify that user is logged in and has a set user role
export const userMW = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<NextFunction | Response | undefined> => {
  try {
    // Get json-web-token
    const jwt = req.signedCookies[jwtCookieProps.key];
    if (!jwt) {
      throw Error('JWT not present in signed cookie.');
    }
    // Make sure user role is an admin
    const clientData = await jwtService.decodeJwt(jwt);
    if (
      clientData.role === UserRoles.Admin ||
      clientData.role === UserRoles.Standard
    ) {
      next();
    } else {
      throw Error('JWT not present in signed cookie.');
    }
  } catch (err) {
    return res.status(UNAUTHORIZED).json({
      error: err.message
    });
  }
};
