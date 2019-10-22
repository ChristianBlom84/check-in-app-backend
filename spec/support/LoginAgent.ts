import bcrypt from 'bcrypt';
import { SuperTest, Test } from 'supertest';
import { UserDao } from '@daos';
import { User, UserRoles } from '@entities';
import { pwdSaltRounds } from '@shared';

const creds = {
  email: 'christian.blom@makingwaves.com',
  password: 'secret'
};

export const login = (beforeAgent: SuperTest<Test>, done: any): void => {
  // Setup dummy data
  const role = UserRoles.Admin;
  const pwdHash = bcrypt.hashSync(creds.password, pwdSaltRounds);
  const loginUser = new User('john smith', creds.email, role, pwdHash);
  spyOn(UserDao.prototype, 'getOne').and.returnValue(
    Promise.resolve(loginUser)
  );
  // Call Login API
  beforeAgent
    .post('/api/auth/login')
    .type('form')
    .send(creds)
    .end((err: Error, res: any) => {
      if (err) {
        throw err;
      }
      done(res.headers['set-cookie']);
    });
};
