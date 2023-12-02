import { AppService, CreateTaskDto } from './app.service';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Put('task')
  async upsert(
    @Body() createTaskDto: CreateTaskDto,
    @Res() res: Response,
    @Query('userId') userId: string,
  ) {
    try {
      const result = await this.appService.upsert(userId, createTaskDto);
      console.log('result', result, createTaskDto);

      res.status(200).json(result);
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

  @Get('task/all')
  async findAll(
    @Query('userId') userId: string,
    @Query('sortBy') sortBy: string,
    @Query('status') status: string,
    @Query('searchQuery') searchQuery: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc',
    @Res() res: Response,
  ) {
    try {
      console.log(userId, sortBy, status, searchQuery);

      const result = await this.appService.findAll(
        userId,
        sortBy,
        status,
        searchQuery,
        sortOrder,
      );

      res.status(200).json(result);
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

  @Get('task/:id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.appService.findOne(id);

      res.status(200).json(result);
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

  @Patch('task/:id')
  async updateStatus(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Query('status') status: 'COMPLETED' | 'PENDING',
    @Res() res: Response,
  ) {
    try {
      const result = await this.appService.updateStatus(id, userId, status);

      res.status(200).json(result);
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
}
