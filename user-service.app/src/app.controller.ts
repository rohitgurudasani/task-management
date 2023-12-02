import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AppService, CreateUserDto } from './app.service';
import { Response } from 'express';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('user')
  async create(
    @Body() createUserDto: CreateUserDto,
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.appService.create(userId, createUserDto);
      res.status(200).json(result);
      return result;
    } catch (error) {
      console.log('error', error);

      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: error?.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Get('user/:id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.appService.findOne(id);
      res.status(200).json(result);
      return result;
    } catch (error) {
      console.log('error', error);

      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: error?.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Delete('user/:id')
  async delete(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.appService.delete(id, userId);
      res.status(200).json(result);
      return result;
    } catch (error) {
      console.log('error', error);

      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: error?.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @EventPattern('task_completed')
  handleTaskCompletedEvent(data: { _id: string }) {
    console.log('TaskCompleted Event Received', data);
  }
}
