import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @ApiProperty({ example: 1, description: 'Unique id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'some_mail@mail.com', description: 'User email' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: '123456', description: 'User password' })
  @Column()
  password: string;
}
