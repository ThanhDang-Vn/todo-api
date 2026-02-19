import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [PrismaModule],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
