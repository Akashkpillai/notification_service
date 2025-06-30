import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginEmailDto } from './dto/login.dto';
import { CreateUserDto } from 'src/user/dto/create.dto';
import { EventPattern, MessagePattern, RpcException } from '@nestjs/microservices';
// import { User } from 'src/user/dto/user.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    // @Post('register')
    // async register(@Body() data: CreateUserDto): Promise<{ message: string }> {
    //     return this.authService.register(data);
    // }

    @MessagePattern({ cmd: 'register_user' })
    async registerUser(data: CreateUserDto) {
        try {
            const result = await this.authService.register(data);
            return { status: 'OK', result };
        } catch (error) {
            console.error('Auth Service Error:', error);
            throw new RpcException({
                statusCode: error?.error?.status || 500, // or extract dynamically
                message: error?.message || 'User registration failed',
            });
        }
    }

    // @Patch('mail-verification/:token')
    // async verification(@Param('token') token: string): Promise<{ success: boolean }> {
    //     return this.authService.verifyMail(token);
    // }

    @MessagePattern({ cmd: 'login_user' })
    async login(data: LoginEmailDto): Promise<{ status: string; result: any }> {
        try {
            const result = await this.authService.login(data);
            return { status: 'OK', result };
        } catch (error) {
            console.error('Auth Service Error:', error);
            throw new RpcException({
                statusCode: error?.error?.status || 500, // or extract dynamically
                message: error?.message || 'User login failed',
            });
        }
    }

    @EventPattern({ cmd: 'verify_email' })
    async verifyEmail(data: string): Promise<{ status: string; result: any }> {
        try {
            const result = await this.authService.verifyMail(data);
            if (result.success) {
                return { status: 'OK', result: { message: 'Email verified successfully' } };
            }
        } catch (error) {
            console.error('Auth Service Error:', error);
            throw new RpcException({
                statusCode: error?.error?.status ? error?.error?.status : error?.status || 500, // or extract dynamically
                message: error?.message || 'Email verification failed',
            });
        }
    }

    @Post('login/otp')
    async sendOtp(@Body() data: { phone: string; otp: string }): Promise<{ access_token: string }> {
        return await this.authService.otpLogin(data);
    }
}
