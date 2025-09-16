import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ColumnTask } from "./column.entity";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	userId: string 

	@Column()
	firstName: string 

	@Column()
	lastName: string 

	@Column()
	email: string 

	@Column()
	avatarUrl: string 

	@CreateDateColumn()
	created_at: Date 

	@OneToMany(() => ColumnTask, (column) => column.user)
	columns: ColumnTask

}