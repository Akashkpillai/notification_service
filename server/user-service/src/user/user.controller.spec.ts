import { Test } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './dto/user.dto';
import { UserGender } from './enum/user-gender.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import UtilsService from 'src/helpers/service/util.service';
import axios from 'axios';
// import { User } from 'src/interface/user.interface';

let userController: UserController;
let userService: UserService;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        controllers: [UserController],
        providers: [
            UserService,
            PrismaService,
            UtilsService,
            {
                provide: 'NOTIFICATION_SERVICE',
                useValue: {},
            },
        ],
    }).compile();

    userService = moduleRef.get(UserService);
    userController = moduleRef.get(UserController);
});

describe('get all users', () => {
    it('should return an array of users', async () => {
        const result: User[] = [
            {
                name: 'Akash Pillai',
                email: 'akashkpillai55@gmail.com',
                bio: null,
                gender: UserGender.male,
                preferences: 'Only green flags',
                number: '7356344191',
            },
        ];

        // Mock the `findAll` method to return the result as a Promise
        jest.spyOn(userService, 'findAll').mockResolvedValue(result);

        // Call the controller's method and verify the response
        expect(await userController.getAll()).toBe(result);
    });
});

describe('API test for get all users', () => {
    const mockData = [
        {
            name: 'Akash Pillai',
            email: 'akashkpillai55@gmail.com',
            gender: 'male',
            preferences: 'Only green flags',
            number: '7356344191',
        },
    ];

    jest.spyOn(axios, 'get').mockResolvedValueOnce({ status: 200, data: mockData, message: 'OK' });

    it('should return an array of users', async () => {
        const data = await axios.get('http://localhost:3011/user');
        expect(data.status).toBe(200);
        expect(data.data).toStrictEqual(mockData);
    }, 1000);
});
