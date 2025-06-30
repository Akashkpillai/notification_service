import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
// import { CreateUserDto } from './dto/create.dto';
import { User } from './dto/user.dto';
import { UpdateDto } from './dto/update.dto';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Patch(':id')
    async update(@Param('id') id: number, @Body() data: UpdateDto): Promise<{ message: string }> {
        return this.userService.update(id, data);
    }

    @Get()
    async getAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<User> {
        return this.userService.findById(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<boolean> {
        return this.userService.delete(id);
    }

    @Get('otp/:phone')
    async sendOtp(@Param('phone') phone: string) {
        return await this.userService.sendOtp(phone);
    }

    @MessagePattern({ cmd: 'get_user' })
    async sendUserData() {
        try {
            const result = await this.userService.findAll();
            return { status: 'OK', result };
        } catch (error) {
            console.log(error);
            throw new RpcException({
                statusCode: 404, // or extract dynamically
                message: error?.message || 'User Data not found',
            });
        }
    }

    @MessagePattern({ cmd: 'get_user_by_id' })
    async findOneUser(@Payload() id: number): Promise<User> {
        try {
            return this.userService.findById(id);
        } catch (error) {
            console.error('Error in findOneUser:', error);
            throw new RpcException({
                statusCode: 404, // or extract dynamically
                message: error?.message || 'User not found',
            });
        }
    }
}
