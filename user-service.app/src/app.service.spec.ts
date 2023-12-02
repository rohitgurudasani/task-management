import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService, CreateUserDto } from './app.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './users.schema';

describe('AppController', () => {
  let appService: AppService;

  const createUserDto: CreateUserDto = {
    username: 'admin',
    email: 'admin@admin.com',
    type: 'admin',
  };

  const mockUser: CreateUserDto & { _id: string } = {
    username: 'admin',
    email: 'admin@admin.com',
    type: 'admin',
    _id: '6568ac39fa9181fdc5c9e914',
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: getModelToken(User.name),
          useValue: {
            create: jest.fn().mockResolvedValue(createUserDto),
            findOne: jest.fn().mockResolvedValue(createUserDto),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return "User microservice!"', () => {
      expect(appService.getHello()).toBe('User microservice!');
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const userId = '6568ac39fa9181fdc5c9e914';
      const createSpy = jest
        .spyOn(appService, 'create')
        .mockResolvedValueOnce(mockUser);

      await appService.create(userId, createUserDto);
      expect(createSpy).toHaveBeenCalledWith(userId, createUserDto);
    });

    it('should throw an error if missing params', async () => {
      const createUserDto: any = {
        username: 'testuser',
      };
      const userId = '6568ac39fa9181fdc5c9e914';
      await expect(appService.create(userId, createUserDto)).rejects.toThrow(
        'Missing Params',
      );
    });
  });

  describe('findOne', () => {
    it('should find a user by ID', async () => {
      const userId = '6568ac39fa9181fdc5c9e914';

      jest.spyOn(appService, 'findOne').mockResolvedValueOnce(mockUser);

      const result = await appService.findOne(userId);

      expect(result).toBe(mockUser);
    });
  });
});
