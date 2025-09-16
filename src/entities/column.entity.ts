import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Card } from './card.entity';
import { User } from './user.entity';

@Entity()
export class ColumnTask {
  @PrimaryGeneratedColumn()
  columnId: string;

  @Column()
  title: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Card, (card) => card.column)
  cards: Card[];

  @ManyToOne(() => User, (user) => user.columns)
  user: User;
}
