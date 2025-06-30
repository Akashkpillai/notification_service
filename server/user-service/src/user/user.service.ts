import UtilsService from './../helpers/service/util.service';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { User } from './dto/user.dto';
import { UpdateDto } from './dto/update.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService {
    constructor(
        private prismaService: PrismaService,
        private utilsService: UtilsService,
        @Inject('NOTIFICATION_SERVICE') private readonly client: ClientProxy
    ) {}

    async notifyUser(to: string, subject: string, html: any, templateName: string) {
        const emailPayload = {
            to: to,
            subject: subject,
            html: html,
            templateName: templateName,
        };

        try {
            const result = this.client.emit('send_email', emailPayload); // Publish the event to Redis
            return result;
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }

    async sendOtp(to: string) {
        try {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            const otpExpiry = new Date();
            otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);
            const otpUpdate = await this.utilsService.updateQuery(
                'user', // Table name
                { otp: otp, otp_expiry: otpExpiry }, // Fields to update
                { number: to } // Condition for the update
            );
            if (!otpUpdate) {
                throw new HttpException(
                    { message: 'Error while sending otp' },
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
            const formattedPhoneNumber = `+91${to}`;
            const otpPayload = {
                phone: formattedPhoneNumber,
                otp,
            };
            this.client.emit('send_otp', otpPayload);
            return { status: 'success', message: 'OTP sent successfully!' };
        } catch (error) {
            console.error('Error sending otp');
        }
    }

    async update(id, payload: UpdateDto): Promise<{ message: string }> {
        if (!payload) {
            throw new HttpException(
                { message: 'Please provide the data to be update' },
                HttpStatus.BAD_REQUEST
            );
        }

        const existingUser = await this.findById(id);

        if (!existingUser) {
            throw new HttpException({ message: 'User not found to update' }, HttpStatus.NOT_FOUND);
        } else {
            const updateResult = await this.utilsService.updateQuery(
                'user', // Table name
                payload, // Fields to update
                { id: parseInt(id, 10) } // Condition for the update
            );
            return updateResult ? { message: 'User updated' } : { message: 'User updation failed' };
        }
    }

    async findAll(): Promise<User[]> {
        const users = await this.prismaService.$queryRawUnsafe<User[]>(
            `SELECT id , name , email , bio ,gender , preferences ,number FROM "user";`
        );
        if (!users.length) {
            throw new HttpException({ message: 'User details not found' }, HttpStatus.NOT_FOUND);
        }
        return users;
    }

    async findById(id): Promise<User> {
        if (typeof id == 'string') {
            id = parseInt(id, 10);
        }
        const user = await this.utilsService.querySingle<User>(
            `SELECT id , name , email , number ,bio , gender ,preferences FROM "user" WHERE id = $1`,
            id
        );

        if (!user) {
            // throw new HttpException({ message: 'User not found' }, HttpStatus.NOT_FOUND);
            throw new RpcException({
                message: `User not found with id ${id}`,
                statusCode: 404,
            });
        } else {
            return user;
        }
    }

    async findByNumber(phone: string): Promise<{
        number: string;
        id: number;
        email: string;
        password: string;
        isBlocked: boolean;
        isEmailverified: boolean;
        otp: string;
        otp_expiry;
    }> {
        const user = await this.utilsService.querySingle<{
            id: number;
            number: string;
            password: string;
            is_blocked: boolean;
            is_email_verified: boolean;
            otp: string;
            email: string;
            otp_expiry;
        }>(
            `SELECT id, email, password,is_email_verified,is_blocked,otp,otp_expiry FROM "user" WHERE number = $1`,
            phone
        );

        if (!user) {
            throw new HttpException({ message: 'User not found' }, HttpStatus.NOT_FOUND);
        }

        return {
            id: user.id,
            number: user.number,
            password: user.password,
            isBlocked: user.is_blocked,
            isEmailverified: user.is_email_verified,
            otp: user.otp,
            email: user.email,
            otp_expiry: user.otp_expiry,
        };
    }

    async findByEmail(email: string): Promise<{
        email: string;
        id: number;
        password: string;
        isBlocked: boolean;
        isEmailverified: boolean;
    }> {
        const user = await this.utilsService.querySingle<{
            id: number;
            email: string;
            password: string;
            is_blocked: boolean;
            is_email_verified: boolean;
        }>(
            `SELECT id, email, password,is_email_verified,is_blocked FROM "user" WHERE email = $1`,
            email
        );

        if (!user) {
            throw new RpcException({
                message: `User not found`,
                status: 404,
            });
        }

        return {
            id: user.id,
            email: user.email,
            password: user.password,
            isBlocked: user.is_blocked,
            isEmailverified: user.is_email_verified,
        };
    }

    async delete(id): Promise<boolean> {
        const existingUser = await this.findById(id);

        if (!existingUser) {
            throw new HttpException({ message: 'User not found to update' }, HttpStatus.NOT_FOUND);
        }

        const deleted = await this.prismaService.$queryRawUnsafe(
            `DELETE FROM "user" WHERE id = ${id} RETURNING id AS id;`
        );
        return deleted && deleted[0].id ? true : false;
    }

    async hashPassword(password: string): Promise<string> {
        return await argon2.hash(password);
    }

    async verifyPassword(hash: string, password: string): Promise<boolean> {
        return await argon2.verify(hash, password);
    }
}
