import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  priority: number;

  @Prop()
  dueDate: number;

  @Prop()
  status: 'COMPLETED' | 'PENDING';

  @Prop()
  assignedTo: string;

  @Prop()
  assignedBy: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
