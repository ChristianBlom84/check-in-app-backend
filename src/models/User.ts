import { model, Model, Schema, Document } from 'mongoose';
import { Notification } from './Notification';

export enum UserRoles {
  Standard,
  Admin
}

type TUserRoles = UserRoles.Standard | UserRoles.Admin;

interface UserModel extends Document {
  name: string;
  email: string;
  pwdHash: string;
  organization?: string;
  notifications: Notification[];
  role: TUserRoles;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  pwdHash: { type: String, required: true },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization'
  },
  notifications: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Notification'
    }
  ],
  role: {
    type: Number,
    max: 1,
    default: UserRoles.Standard
  }
});

export const User: Model<UserModel> = model<UserModel>('User', UserSchema);
