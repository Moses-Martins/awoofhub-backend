import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OffersService } from 'src/offers/offers.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';


@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private usersService: UsersService,
    private offersService: OffersService,
  ) { }

  async create(userId: string, OfferId: string, createCommentDto: CreateCommentDto) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const offer = await this.offersService.findById(OfferId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }


    const comment = this.commentsRepository.create({ ...createCommentDto, user: { id: user.id }, offer: { id: offer.id } });
    return this.commentsRepository.save(comment);

  }

  async findAll(offerId: string) {
    const offer = await this.offersService.findById(offerId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const comments = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .select([
        'comment',
        'user.id', 'user.name', 'user.profileImageUrl',
      ])
      .where('comment.offer = :offerId', { offerId })
      .orderBy('comment.createdAt', 'DESC')
      .getMany();

    return comments
  }

}
