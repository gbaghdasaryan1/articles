import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { Article } from './entities/article.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { NotFoundException } from '@nestjs/common';

const mockArticle = {
  id: 1,
  title: 'Test',
  description: 'Test Desc',
  publishedAt: new Date(),
  author: 'John Doe',
};

describe('ArticleService', () => {
  let service: ArticleService;
  let repo: Repository<Article>;
  let cache: Cache;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        { provide: getRepositoryToken(Article), useValue: mockRepo },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    repo = module.get<Repository<Article>>(getRepositoryToken(Article));
    cache = module.get<Cache>(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a new article', async () => {
      const dto = { title: 'Test', description: 'Test Desc', author: 'John' };

      mockRepo.create.mockReturnValue(dto);
      mockRepo.save.mockResolvedValue(mockArticle);

      const result = await service.create(dto as any);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalledWith(dto);
      expect(mockCache.clear).toHaveBeenCalled();
      expect(result).toEqual(mockArticle);
    });
  });

  describe('findAll', () => {
    it('should return cached articles if available', async () => {
      mockCache.get.mockResolvedValue([mockArticle]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual([mockArticle]);
      expect(mockCache.get).toHaveBeenCalled();
    });

    it('should query and cache articles if not in cache', async () => {
      const qb: any = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockArticle]),
      };

      mockRepo.createQueryBuilder.mockReturnValue(qb);
      mockCache.get.mockResolvedValue(undefined);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual([mockArticle]);
      expect(mockCache.set).toHaveBeenCalledWith(
        expect.stringContaining('articles:'),
        [mockArticle],
        60,
      );
    });
  });

  describe('findOne', () => {
    it('should return an article by id', async () => {
      mockRepo.findOneBy.mockResolvedValue(mockArticle);

      const result = await service.findOne(1);

      expect(result).toEqual(mockArticle);
    });
  });

  describe('update', () => {
    it('should update and return article', async () => {
      const updateDto = { title: 'Updated' };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockArticle as Article);
      mockRepo.save.mockResolvedValue({ ...mockArticle, ...updateDto });

      const result = await service.update(1, updateDto as any);

      expect(result).toEqual({ ...mockArticle, ...updateDto });
    });

    it('should throw NotFoundException if article not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(service.update(1, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove and return article', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockArticle as Article);
      mockRepo.remove.mockResolvedValue(mockArticle);

      const result = await service.remove(1);

      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException if article not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
