import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ColumnTask } from './column.entity';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/auth/enums/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    default: Role.USER,
    type: 'enum',
    enum: Role,
  })
  role: Role;

  @Column({ nullable: true })
  hashedRefreshToken: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => ColumnTask, (column) => column.user)
  columns: ColumnTask;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
