import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateUserDto } from 'src/app.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const adminUserId = '6568ac39fa9181fdc5c9e914';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('User microservice!');
  });

  describe('/user (POST)', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        type: 'default',
      };

      await request(app.getHttpServer())
        .post('/user?userId=' + adminUserId)
        .send(createUserDto)
        .expect(200);
    });

    it('should handle errors during user creation', async () => {
      const createUserDto: any = {
        username: 'testuser',
        email: 'test@example.com',
      };

      await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto)
        .expect(403)
        .expect((res) => {
          const error: any = res.body;
          expect(error.status).toBe(HttpStatus.FORBIDDEN);
        });
    });
  });

  describe('/user/:id (GET)', () => {
    it('should get a user by ID', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser2',
        email: 'test2@example.com',
        type: 'default',
      };

      const createUserResponse = await request(app.getHttpServer())
        .post('/user?userId=' + adminUserId)
        .send(createUserDto)
        .expect(200);

      const userId = createUserResponse.body._id;

      await request(app.getHttpServer()).get(`/user/${userId}`).expect(200);
    });

    it('should handle errors for invalid user ID', async () => {
      const invalidUserId = '6568ac39fa9181fdc5c9e814';

      await request(app.getHttpServer())
        .get(`/user/${invalidUserId}`)
        .expect(200);
    });
  });

  describe('/user/:id (DELETE)', () => {
    it('should delete a user by ID', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser3',
        email: 'test3@example.com',
        type: 'default',
      };

      const createUserResponse = await request(app.getHttpServer())
        .post('/user?userId=' + adminUserId)
        .send(createUserDto)
        .expect(200);

      const userId = createUserResponse.body._id;

      await request(app.getHttpServer())
        .delete(`/user/${userId}?userId=${adminUserId}`)
        .expect(200);
    });

    it('should handle errors for invalid user ID during deletion', async () => {
      const invalidUserId = 'invalid_user_id';

      await request(app.getHttpServer())
        .delete(`/user/${invalidUserId}`)
        .expect(403);
    });
  });
});
