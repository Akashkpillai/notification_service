import UtilsService from './../helpers/service/util.service';
import { JsonWebTokenError, JwtService, NotBeforeError, TokenExpiredError } from '@nestjs/jwt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginEmailDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create.dto';
import { User } from 'src/user/dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {
    constructor(
        private usreService: UserService,
        private jwtService: JwtService,
        private prismaService: PrismaService,
        private utilsService: UtilsService
    ) {}

    async register(data: CreateUserDto): Promise<{ message: string }> {
        const existingUser = await this.utilsService.querySingle<User>(
            `SELECT * FROM "user" WHERE email = $1 OR number = $2`,
            data.email,
            data.number
        );

        if (existingUser) {
            const conflictField = existingUser.email === data.email ? 'email' : 'number';
            throw new RpcException({
                message: `User with same ${conflictField} already exist`,
                status: 409,
            });
        }

        const hashedPassword = await this.usreService.hashPassword(data.password);

        let query = 'INSERT INTO "user" (name, email, password ,number ,gender ,';
        let values = `VALUES ('${data.name}', '${data.email}', '${hashedPassword}' ,${data.number},'${data.gender}',`;

        if (data.bio) {
            query += ' bio,';
            values += ` '${data.bio}',`;
        }

        if (data.preferences) {
            query += ' preferences';
            values += `'${data.preferences}'`;
        }

        query += ') ';
        values += ')';

        const fullQuery = `${query} ${values} RETURNING id;`;

        const user = await this.prismaService.$queryRawUnsafe(fullQuery);
        if (user[0].id) {
            const activationToken = this.jwtService.sign({ id: user[0].id }, { expiresIn: '5m' });
            // Construct the activation link
            const activationLink = {
                activationToken: `http://localhost:3000/user/activate/${activationToken}`,
            };
            console.log(activationToken);

            const userData: User = await this.utilsService.querySingle(
                ` SELECT * FROM "user" WHERE id = $1`,
                user[0].id
            );
            // Send the activation email
            await this.usreService.notifyUser(
                userData.email,
                'Activate Your Account',
                activationLink, // HTML content,
                'register'
            );

            return { message: 'Activation email sent. Please check your inbox.' };
        } else {
            console.error('Failed to create user or unexpected response:', user);
            throw new HttpException(
                { message: 'User creation failed' },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async verifyMail(data: string): Promise<{ success: boolean }> {
        try {
            const id = this.jwtService.verify(data);
            if (id) {
                const emailVerified = await this.usreService.update(id.id, {
                    is_email_verified: true,
                });
                if (emailVerified.message === 'User updated') {
                    return { success: true };
                } else {
                    return { success: false };
                }
            }
        } catch (error) {
            console.error('JWT Error:', error);

            if (error instanceof TokenExpiredError) {
                throw new HttpException(
                    { message: 'Verification link has expired' },
                    HttpStatus.UNAUTHORIZED
                );
            }

            if (error instanceof JsonWebTokenError || error instanceof NotBeforeError) {
                throw new HttpException(
                    { message: 'Invalid or malformed token' },
                    HttpStatus.UNAUTHORIZED
                );
            }
            throw new HttpException(
                { message: 'Error while verifying email' },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async login(data: LoginEmailDto): Promise<{ access_token: string }> {
        const user = await this.usreService.findByEmail(data.email);

        if (user && user.password) {
            const isMatch = await this.usreService.verifyPassword(user.password, data.password);
            if (!isMatch) {
                throw new RpcException({
                    message: `Invalid password`,
                    status: 400,
                });
            }
        }
        if (user.isBlocked) {
            throw new RpcException({
                message: `Your account is blocked`,
                status: 401,
            });
        }

        if (!user.isEmailverified) {
            throw new RpcException({
                message: 'Please verify your email address',
                status: 401,
            });
        }
        const payload = {
            id: user.id,
            email: user.email,
        };
        const token = await this.jwtService.sign(payload);
        return { access_token: token };
    }

    async otpLogin(data: { phone: string; otp: string }): Promise<{ access_token: string }> {
        const user = await this.usreService.findByNumber(data.phone);

        const currentTime = new Date();

        // Check if OTP has expired
        if (currentTime > user.otp_expiry) {
            throw new HttpException({ message: 'OTP has expired' }, HttpStatus.BAD_REQUEST);
        }
        if (user.otp !== data.otp) {
            throw new HttpException({ message: 'Invalid Otp' }, HttpStatus.BAD_REQUEST);
        }

        if (user.isBlocked) {
            throw new HttpException(
                { message: 'Your account is blocked' },
                HttpStatus.UNAUTHORIZED
            );
        }

        if (!user.isEmailverified) {
            throw new HttpException(
                { message: 'Please verify your email address' },
                HttpStatus.UNAUTHORIZED
            );
        }

        const payload = {
            id: user.id,
            email: user.email,
        };
        const token = await this.jwtService.sign(payload);
        return { access_token: token };
    }
}
