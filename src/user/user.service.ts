import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { updateUserDto } from './dto/updateUser.dto';
import { Pagination } from './dto/pagination.dto';
import { DEFAULT_PAGE_SIZE } from 'src/utils/constants';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async createUser(dto: CreateUserDto) {
    const user = this.userRepo.create(dto);
    return await this.userRepo.save(user);
  }

  async findOneUser(id: number) {
    return await this.userRepo.findOne({
      where: {
        userId: id,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await this.userRepo.findOne({
      where: {
        email,
      },
    });
  }

  async findAllUser(pagination: Pagination) {
    return await this.userRepo.find({
      skip: pagination.skip,
      take: pagination.limit ?? DEFAULT_PAGE_SIZE,
    });
  }

  async updateHashingRefreshToken(
    id: number,
    hashingRefreshToken: string | null,
  ) {
    return this.userRepo.update(
      { userId: id },
      { hashedRefreshToken: hashingRefreshToken ?? undefined },
    );
  }

  async updateUser(id: number, dto: updateUserDto) {
    await this.userRepo.update({ userId: id }, dto);
  }

  async deleteUser(id: number) {
    await this.userRepo.delete({ userId: id });
  }
}
