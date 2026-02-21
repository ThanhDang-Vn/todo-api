import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  imports: [PrismaModule],
  providers: [CloudinaryService, CloudinaryProvider],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
