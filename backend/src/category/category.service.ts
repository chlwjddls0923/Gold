import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Category } from './category.entity'
import { CreateCategoryDto } from './dto/create-category.dto'

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  findAll() {
    return this.categoryRepo.find({ order: { name: 'ASC' } })
  }

  create(dto: CreateCategoryDto) {
    const category = this.categoryRepo.create(dto)
    return this.categoryRepo.save(category)
  }

  remove(id: number) {
    return this.categoryRepo.delete(id)
  }
}
