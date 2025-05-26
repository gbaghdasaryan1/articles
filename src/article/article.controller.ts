import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AuthGuard } from '../guards/auth.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Article } from './entities/article.entity';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({ summary: 'Create article' })
  @ApiResponse({ type: Article })
  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(createArticleDto);
  }

  @ApiOperation({ summary: 'Get all articles' })
  @ApiResponse({ type: [Article] })
  @Get()
  findAll(@Query() query: any) {
    return this.articleService.findAll(query);
  }

  @ApiOperation({ summary: 'Get one article' })
  @ApiResponse({ type: Article })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update article' })
  @ApiResponse({ type: Article })
  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.update(+id, updateArticleDto);
  }

  @ApiOperation({ summary: 'Delete article' })
  @ApiResponse({ type: Article })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articleService.remove(+id);
  }
}
