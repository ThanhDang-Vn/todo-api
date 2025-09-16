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
    return await this.userRepo.save(dto);
  }

  async findOneUser(id: string) {
    return await this.userRepo.findOne({
      where: {
        userId: id,
      },
    });
  }

  async findAllUser(pagination: Pagination) {
    return await this.userRepo.find({
      skip: pagination.skip,
      take: pagination.limit ?? DEFAULT_PAGE_SIZE,
    });
  }

  async updateUser(id: string, dto: updateUserDto) {
    await this.userRepo.update({ userId: id }, dto);
  }

  async deleteUser(id: string) {
    await this.userRepo.delete({ userId: id });
  }
}
