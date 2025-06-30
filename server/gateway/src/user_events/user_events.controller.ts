import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Queue } from 'bull';
import { lastValueFrom } from 'rxjs';
import { CreateUserDto } from './dto/create.dto';

@Controller('api/user')
export class UserEventController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  @Get()
  async getUser() {
    const observable$ = this.userServiceClient.send({ cmd: 'get_user' }, {});

    // Convert the observable to a promise.
    const result = await lastValueFrom(observable$);

    if (!result) {
      throw new HttpException(
        { message: 'No user data returned' },
        HttpStatus.NOT_FOUND,
      );
    }
    return result;
  }

  @Post('register')
  async register(@Body() data: CreateUserDto) {
    try {
      const result = await lastValueFrom(
        this.userServiceClient.send({ cmd: 'register_user' }, data),
      );
      return result;
    } catch (error) {
      console.error('Caught error in API gateway:', error);

      throw new HttpException(
        error.message || 'Failed to register user',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    try {
      const observable$ = this.userServiceClient.send(
        { cmd: 'get_user_by_id' },
        id,
      );
      const result = await lastValueFrom(observable$);

      return result;
    } catch (error) {
      console.error('Caught error in API gateway:', error);

      throw new HttpException(
        error.message || 'Failed to register user',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  async login(@Body() data: { email: string; password: string }) {
    try {
      const observable$ = this.userServiceClient.send(
        { cmd: 'login_user' },
        data,
      );
      const result = await lastValueFrom(observable$);
      return result;
    } catch (error) {
      console.error('Caught error in API gateway:', error);

      throw new HttpException(
        error.message || 'Failed to login user',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('mail-verification/:token')
  async verification(
    @Param('token') token: string,
  ): Promise<{ success: boolean }> {
    try {
      const observable$ = this.userServiceClient.send(
        { cmd: 'verify_email' },
        token,
      );
      const result = await lastValueFrom(observable$);
      return result;
    } catch (error) {
      console.error('Caught error in API gateway:', error);

      throw new HttpException(
        error.message || 'Failed to verify email',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
