import app from '@server';
import supertest from 'supertest';
import bcrypt from 'bcrypt';

import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from 'http-status-codes';
import { Response, SuperTest, Test } from 'supertest';
import { setupDb, dropTables, tearDownDb } from './support/DbHelper';
import { UserRoles } from '@entities';
import { User } from '../src/models/User';
import { pErr, pwdSaltRounds, jwtCookieProps, loginFailedErr } from '@shared';

describe('UserRouter', () => {
  const authPath = '/api/auth';
  const loginPath = `${authPath}/login`;
  const logoutPath = `${authPath}/logout`;

  let agent: SuperTest<Test>;

  function hashPwd(pwd: string): string {
    return bcrypt.hashSync(pwd, pwdSaltRounds);
  }

  beforeAll(async done => {
    await setupDb();
    agent = supertest.agent(app);
    done();
  });

  afterAll(async () => {
    await tearDownDb();
  });

  describe(`"POST:${loginPath}"`, () => {
    afterEach(async () => {
      await dropTables();
    });
    const callApi = (reqBody: object): supertest.Test => {
      return agent
        .post(loginPath)
        .type('form')
        .send(reqBody);
    };

    it(`should return a response with a status of ${OK} and a cookie with a jwt if the login
            was successful.`, done => {
      // Setup Dummy Data
      const creds = {
        email: 'christian.blom@makingwaves.com',
        password: 'secret'
      };
      const role = UserRoles.Standard;
      const pwdHash = hashPwd(creds.password);
      const loginUser = new User({
        name: 'Christian Blom',
        email: creds.email,
        role,
        pwdHash
      });
      loginUser.save();
      // Call API
      callApi(creds).end((err: Error, res: any) => {
        pErr(err);
        expect(res.status).toBe(OK);
        expect(res.headers['set-cookie'][0]).toContain(jwtCookieProps.key);
        done();
      });
    });

    it(`should return a response with a status of ${UNAUTHORIZED} and a json with the error
            "${loginFailedErr}" if the email was not found.`, done => {
      // Setup Dummy Data
      const creds = {
        email: 'jsmith@gmail.com',
        password: 'Password@1'
      };
      // Call API
      callApi(creds).end((err: Error, res: any) => {
        pErr(err);
        expect(res.status).toBe(UNAUTHORIZED);
        expect(res.body.error).toBe(loginFailedErr);
        done();
      });
    });

    it(`should return a response with a status of ${UNAUTHORIZED} and a json with the error
            "${loginFailedErr}" if the password failed.`, done => {
      // Setup Dummy Data
      const creds = {
        email: 'christian.blom@makingwaves.com',
        password: 'someBadPassword'
      };
      const role = UserRoles.Standard;
      const pwdHash = hashPwd('Password@1');
      const loginUser = new User({
        name: 'Christian Blom',
        email: creds.email,
        role,
        pwdHash
      });
      loginUser.save();
      // Call API
      callApi(creds).end((err: Error, res: any) => {
        pErr(err);
        expect(res.status).toBe(UNAUTHORIZED);
        expect(res.body.error).toBe(loginFailedErr);
        done();
      });
    });
  });

  describe(`"GET:${logoutPath}"`, () => {
    it(`should return a response with a status of ${OK}.`, done => {
      agent.get(logoutPath).end((err: Error, res: any) => {
        pErr(err);
        expect(res.status).toBe(OK);
        done();
      });
    });
  });
});
