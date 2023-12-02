import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './tasks.schema';
import { ClientProxy } from '@nestjs/microservices';
import { CreateTaskCompleteEvent } from './task-completed.event';

export class CreateTaskDto {
  title: string;
  description: string;
  priority: number;
  dueDate: number;
  status: 'COMPLETED' | 'PENDING';
  _id?: string;
  assignedTo: string;
  assignedBy: string;
}

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @Inject('TaskCompleted') private readonly client: ClientProxy,
  ) {}

  getHello(): string {
    return 'Task microservice!';
  }

  async getUser(userId: string) {
    let response = null;
    const user = await fetch(`http://localhost:3000/user/${userId}`);

    if (user?.ok) {
      response = await user.json();
    }
    return response;
  }

  async upsert(userId: string, createUserDto: CreateTaskDto): Promise<Task> {
    const user = await this.getUser(userId);
    if (user?.type !== 'admin' || !userId) throw new Error('UNAUTHORIZED');

    if (!createUserDto?._id) {
      if (
        !createUserDto?.assignedTo ||
        !createUserDto?.description ||
        !createUserDto?.title ||
        !createUserDto?.dueDate ||
        !createUserDto?.priority ||
        !createUserDto?.status
      )
        throw new Error('Missing Body Params');
    }
    createUserDto.assignedBy = userId;

    if (!createUserDto?._id) {
      const createdUser = await this.taskModel.create(createUserDto);
      return createdUser;
    } else {
      const updatedUser = await this.taskModel.findOneAndUpdate(
        {
          _id: createUserDto._id,
        },
        createUserDto,
        { upsert: true, new: true },
      );
      return updatedUser;
    }
  }

  async findOne(id: string): Promise<Task> {
    return this.taskModel.findOne({ _id: id }).exec();
  }

  async findAll(
    userId: string,
    sortBy?: string,
    status?: string,
    searchQuery?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<Task[]> {
    if (!userId) throw new Error('Missing Param');

    const user = await this.getUser(userId);
    if (!user) throw new Error('UNAUTHORIZED');

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (searchQuery) {
      query.$or = [
        { title: { $regex: new RegExp(searchQuery, 'i') } },
        { description: { $regex: new RegExp(searchQuery, 'i') } },
      ];
    }

    let sortOptions: any = {};

    if (sortBy === 'dueDate') {
      sortOptions = { dueDate: sortOrder == 'desc' ? -1 : 1 };
    } else if (sortBy === 'priority') {
      sortOptions = { priority: sortOrder == 'desc' ? -1 : 1 };
    }

    if (user.type !== 'admin') {
      query.assignedTo = userId;
    }

    const tasks = await this.taskModel.find(query).sort(sortOptions).exec();
    return tasks;
  }

  async updateStatus(
    id: string,
    userId: string,
    status: 'COMPLETED' | 'PENDING',
  ) {
    if (!userId || !id || (status !== 'COMPLETED' && status !== 'PENDING'))
      throw new Error('Missing Param');
    const user = await this.getUser(userId);
    if (!user) throw new Error('UNAUTHORIZED');

    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();

    if (updatedTask.status === 'COMPLETED') {
      this.client.emit(
        'task_completed',
        new CreateTaskCompleteEvent(updatedTask?._id),
      );
    }
    return updatedTask;
  }
}
