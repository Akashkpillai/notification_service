import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import UtilsService from 'src/helpers/service/util.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'NOTIFICATION_SERVICE',
                transport: Transport.REDIS,
                options: {
                    host: 'localhost',
                    port: 6379,
                },
            },
        ]),
    ],
    controllers: [UserController],
    providers: [UserService, PrismaService, UtilsService],
    exports: [UserService, ClientsModule],
})
export class UserModule {}
