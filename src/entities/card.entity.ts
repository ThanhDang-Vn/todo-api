import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ColumnTask } from './column.entity';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  cardId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  priority: string;

  @Column()
  due_to: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => ColumnTask, (column) => column.cards)
  column: ColumnTask;
}
