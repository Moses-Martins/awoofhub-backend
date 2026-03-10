import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) { }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {

    const name = createCategoryDto.name.trim();

    const existingCategory = await this.categoriesRepository.findOne({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException(`Category '${name}' already exists`);
    }

    const category = this.categoriesRepository.create({ name });
    try {
      return this.categoriesRepository.save(category);

    } catch (error) {
      throw new InternalServerErrorException('Failed to create category');
    }

  }

  async findAll(): Promise<Category[]> {
    const categories = this.categoriesRepository.find();

    return categories

  }


  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ slug });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findByName(name: string): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ name });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }


}
