import { Article } from './entities/article.entity';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article) private articleRepo: Repository<Article>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createArticleDto: CreateArticleDto) {
    const article = this.articleRepo.create(createArticleDto);
    const saved = this.articleRepo.save(article);

    this.cacheManager.clear();

    return saved;
  }

  async findAll(query: {
    page: number;
    limit: number;
    author?: string;
    date?: string;
  }) {
    const { page, limit, author, date } = query;

    const cacheKey = `articles:${page}:${limit}:${author ?? ''}:${date ?? ''}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) return cached;

    const queryBuilder = this.articleRepo.createQueryBuilder('article');

    if (author) {
      queryBuilder.andWhere('article.author = :author', { author });
    }

    if (date) {
      queryBuilder.andWhere('DATE(article.publishedAt) = :date', { date });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const result = await queryBuilder.getMany();

    await this.cacheManager.set(cacheKey, result, 60);

    return result;
  }

  findOne(id: number) {
    return this.articleRepo.findOneBy({ id });
  }

  async update(id: number, updateArticleDto: UpdateArticleDto) {
    const article = await this.findOne(id);
    if (!article) throw new NotFoundException('Article not found');

    Object.assign(article, updateArticleDto);

    return this.articleRepo.save(article);
  }

  async remove(id: number) {
    const article = await this.findOne(id);
    if (!article) throw new NotFoundException('Article not found');

    return this.articleRepo.remove(article);
  }
}
