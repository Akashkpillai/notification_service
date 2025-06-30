import { Global, Module } from '@nestjs/common';
import UtilsService from './service/util.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Global()
@Module({
  providers: [PrismaService, UtilsService],
  imports: [],
  exports: [UtilsService],
})
export class HelperModule {}
