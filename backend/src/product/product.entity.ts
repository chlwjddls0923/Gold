import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Category } from '../category/category.entity'

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ type: 'decimal', precision: 10, scale: 0, nullable: true })
  price: number | null

  @Column({ nullable: true, type: 'text' })
  description: string

  @Column({ nullable: true })
  imageUrl: string

  @Column({ default: true })
  isActive: boolean

  @Column({ type: 'text', nullable: true })
  detailImages: string // JSON string[]

  @ManyToOne(() => Category, (category) => category.products, { nullable: true, eager: true })
  category: Category

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
