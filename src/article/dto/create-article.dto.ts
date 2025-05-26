import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ example: 'Title 1', description: 'Set article title' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Some description',
    description: 'Set article description',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'Elon Musk',
    description: 'Set article author',
  })
  @IsString()
  author: string;
}
