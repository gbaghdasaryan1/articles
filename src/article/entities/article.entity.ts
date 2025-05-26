import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('articles')
export class Article {
  @ApiProperty({ example: 1, description: 'Unique id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Cars', description: 'Article title' })
  @Column()
  title: string;

  @ApiProperty({
    example: 'About electro cars',
    description: 'Article description',
  })
  @Column()
  description: string;

  @ApiProperty({
    example: 'Published date',
    description: '2025-05-26T12:54:47.742Z',
  })
  @CreateDateColumn()
  publishedAt: Date;

  @ApiProperty({ example: 'Author name', description: 'Elon Musk' })
  @Column()
  author: string;
}
