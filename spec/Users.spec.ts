import app from '@server';
import supertest from 'supertest';

import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { Response, SuperTest, Test } from 'supertest';
import { User } from '../src/models/User';
import { IUser, UserRoles } from '@entities';
import { setupDb, dropTables } from './support/DbHelper';
import { login } from './support/LoginAgent';
import { pErr } from '@shared';

describe('UserRouter', () => {
  const usersPath = '/api/users';
  const getUsersPath = `${usersPath}/all`;
  const addUsersPath = `${usersPath}/add`;
  const updateUserPath = `${usersPath}/update`;
  const deleteUserPath = `${usersPath}/delete`;

  let agent: SuperTest<Test>;
  let jwtCookie: string;

  beforeAll(async done => {
    await setupDb();
    agent = supertest.agent(app);
    await login(agent, (cookie: string) => {
      jwtCookie = cookie;
      done();
    });
  });

  describe(`"GET:${getUsersPath}"`, () => {
    const callApi = (): supertest.Test => {
      return agent.get(getUsersPath).set('Cookie', jwtCookie);
    };

    it(`should return a JSON object with all the users and a status code of "${OK}" if the
            request was successful.`, done => {
      // Setup Dummy Data
      const users = [
        new User({
          name: 'Sean Maxwell',
          email: 'sean.maxwell@gmail.com',
          pwdHash: 'secret',
          role: UserRoles.Admin
        }),
        new User({
          name: 'John Smith',
          email: 'john.smith@gmail.com',
          pwdHash: 'secret',
          role: UserRoles.Admin
        }),
        new User({
          name: 'Gordan Freeman',
          email: 'gordan.freeman@gmail.com',
          pwdHash: 'secret',
          role: UserRoles.Admin
        })
      ];
      users.forEach(user => user.save());
      // Call API
      callApi().end((err: Error, res: Response) => {
        pErr(err);
        expect(res.status).toBe(OK);
        // Caste instance-objects to 'User' objects
        expect(res.body.users).toContain({
          role: users[0].role,
          _id: users[0]._id.toString(),
          name: users[0].name,
          email: users[0].email,
          __v: users[0].__v
        });
        expect(res.body.error).toBeUndefined();
        done();
      });
    });
  });

  describe(`"POST:${addUsersPath}"`, () => {
    const callApi = (reqBody: object): supertest.Test => {
      return agent
        .post(addUsersPath)
        .set('Cookie', jwtCookie)
        .type('form')
        .send(reqBody);
    };

    const user = new User({
      name: 'Gordon Freeman',
      email: 'gordon.freeman@gmail.com',
      pwdHash: 'secret',
      role: UserRoles.Admin
    });

    it(`should return a status code of "${CREATED}" if the request was successful.`, async done => {
      await callApi(user).end((err: Error, res: Response) => {
        pErr(err);
        expect(res.status).toBe(CREATED);
        expect(res.body.email).toBe(user.email);
        done();
      });
    });

    it(`should return a JSON object with an error array and a status
            code of "${BAD_REQUEST}" if no params were sent.`, done => {
      callApi({}).end((err: Error, res: Response) => {
        pErr(err);
        expect(res.status).toBe(BAD_REQUEST);
        expect(res.body.errors).toEqual([
          { msg: 'You must specify a name', param: 'name', location: 'body' },
          {
            msg: 'Please include a valid email',
            param: 'email',
            location: 'body'
          },
          { msg: 'Password is required', param: 'password', location: 'body' }
        ]);
        done();
      });
    });
  });

  describe(`"PUT:${updateUserPath}"`, () => {
    const callApi = (reqBody: object) => {
      return agent
        .put(updateUserPath)
        .set('Cookie', jwtCookie)
        .type('form')
        .send(reqBody);
    };

    const user = new User({
      name: 'Gordan Freeman',
      email: 'gordan.freeman@gmail.com',
      pwdHash: 'secret',
      role: UserRoles.Admin
    });

    it(`should return a status code of "${OK}" if the request was successful.`, async done => {
      callApi(user).end((err: Error, res: Response) => {
        pErr(err);
        expect(res.status).toBe(OK);
        expect(res.body.error).toBeUndefined();
        done();
      });
    });

    it(`should return a JSON object with an error message and a
            status code of "${BAD_REQUEST}" if no params were sent.`, done => {
      callApi({}).end((err: Error, res: Response) => {
        pErr(err);
        expect(res.status).toBe(BAD_REQUEST);
        expect(res.body.errors).toEqual([
          {
            msg: 'Please include a valid email',
            param: 'email',
            location: 'body'
          }
        ]);
        done();
      });
    });
  });

  describe(`"DELETE:${deleteUserPath}"`, () => {
    const callApi = (reqBody: object): supertest.Test => {
      return agent
        .delete(deleteUserPath)
        .set('Cookie', jwtCookie)
        .send(reqBody);
    };

    it(`should return a status code of "${OK}" if the request was successful.`, async done => {
      const user = new User({
        name: 'Gordan Freeman',
        email: 'gordan.freeman@gmail.com',
        pwdHash: 'secret',
        role: UserRoles.Admin
      });

      const userExists = await User.findOne({ email: user.email });

      if (!userExists) {
        await user.save();
      }

      callApi({ email: 'gordan.freeman@gmail.com' }).end(
        (err: Error, res: Response) => {
          pErr(err);
          expect(res.status).toBe(OK);
          expect(res.body.email).toBeDefined();
          done();
        }
      );
    });

    it(`should return a JSON object with an error message and a status code of "${BAD_REQUEST}"
            if the request was unsuccessful.`, done => {
      // Setup Dummy Response
      const deleteErrMsg = 'Could not delete user.';
      // Call API
      callApi({ email: 'testing@hej.com' }).end((err: Error, res: Response) => {
        pErr(err);
        expect(res.status).toBe(BAD_REQUEST);
        expect(res.body.error).toBe(deleteErrMsg);
        done();
      });
    });
  });
});
