import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, isValidObjectId } from 'mongoose';
import { User } from './users.schema';

export class CreateUserDto {
  username: string;
  email: string;
  type: 'default' | 'admin';
}

@Injectable()
export class AppService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  getHello(): string {
    return 'User microservice!';
  }

  async create(userId, createUserDto: CreateUserDto): Promise<User> {
    console.log(userId);

    if (
      !userId ||
      !createUserDto?.email ||
      !createUserDto?.type ||
      !createUserDto?.username
    )
      throw new Error('Missing Params');
    const user = await this.findOne(userId);

    if (user?.type !== 'admin' || !userId) throw new Error('UNAUTHORIZED');

    const createdUser = await this.userModel.create(createUserDto);
    return createdUser;
  }

  async findOne(id: string): Promise<User> {
    if (!id) throw new Error('Missing Params');

    const _id = isValidObjectId(id) ? id : new mongoose.Types.ObjectId(id);

    return this.userModel.findOne({ _id }).exec();
  }

  async delete(id: string, userId: string) {
    if (!id || !userId) throw new Error('Missing Params');

    const user = await this.findOne(userId);

    if (user?.type !== 'admin' || !userId) throw new Error('UNAUTHORIZED');

    const deletedUser = await this.userModel
      .findByIdAndDelete({ _id: id })
      .exec();
    return deletedUser;
  }
}
