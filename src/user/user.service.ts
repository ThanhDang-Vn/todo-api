import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { updateUserDto } from './dto/updateUser.dto';
import { Pagination } from './dto/pagination.dto';
import { DEFAULT_PAGE_SIZE } from 'src/utils/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    const { password, ...userDto } = dto;
    const hashedPassword = await argon2.hash(password);
    const user = await this.prisma.user.create({
      data: {
        ...userDto,
        password: hashedPassword,
      },
    });

    return user;
  }

  async findOneUser(id: number) {
    return await this.prisma.user.findUnique({
      where: {
        userId: id,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
  }

  async findAllUser() {
    return await this.prisma.user.findMany();
  }

  async findUserBasePagination(pagination: Pagination) {
    return await this.prisma.user.findMany({
      skip: pagination.skip,
      take: pagination.limit ?? DEFAULT_PAGE_SIZE,
    });
  }

  async updateHashingRefreshToken(
    id: number,
    hashingRefreshToken: string | null,
  ) {
    return await this.prisma.user.update({
      where: {
        userId: id,
      },
      data: {
        hashedRefreshToken: hashingRefreshToken ?? undefined,
      },
    });
  }

  async updateUser(id: number, dto: updateUserDto) {
    await this.prisma.user.update({
      where: { userId: id },
      data: {
        ...dto,
      },
    });
  }

  async deleteUser(id: number) {
    await this.prisma.user.delete({ where: { userId: id } });
    return 'Delete successfully';
  }
}
