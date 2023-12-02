import { Types } from 'mongoose';

export class CreateTaskCompleteEvent {
  constructor(public readonly _id: Types.ObjectId) {}
}
