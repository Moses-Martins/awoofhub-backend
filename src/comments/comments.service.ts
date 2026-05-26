import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OffersService } from 'src/offers/offers.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private usersService: UsersService,
    private offersService: OffersService,
    private paginationService: PaginationService,
  ) {}

  async create(
    userId: string,
    OfferId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const offer = await this.offersService.findById(OfferId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      user: { id: user.id },
      offer: { id: offer.id },
    });
    return this.commentsRepository.save(comment);
  }

  // Get all comments for a specific offer
  async findByOffer(offerId: string) {
    const offer = await this.offersService.findById(offerId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const comments = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .select(['comment', 'user.id', 'user.name', 'user.profileImageUrl'])
      .where('comment.offer = :offerId', { offerId })
      .orderBy('comment.createdAt', 'DESC')
      .getMany();

    return comments;
  }

  // Get all comments with pagination and filtering
  async findAllGlobal(
    search?: string,
    createdFrom?: string,
    createdTo?: string,
    page = 1,
    limit = 10,
  ) {
    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .leftJoin('comment.offer', 'offer')
      .select([
        'comment',
        'user.id',
        'user.name',
        'user.profileImageUrl',
        'offer.id',
        'offer.title',
      ]);

    // Search comment text
    if (search) {
      queryBuilder.andWhere('comment.comment ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Date filters
    if (createdFrom) {
      queryBuilder.andWhere('comment.createdAt >= :createdFrom', {
        createdFrom: new Date(createdFrom),
      });
    }

    if (createdTo) {
      queryBuilder.andWhere('comment.createdAt <= :createdTo', {
        createdTo: new Date(createdTo),
      });
    }

    queryBuilder
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    // Get total count without pagination
    const countQuery = queryBuilder
      .clone()
      .skip(undefined)
      .take(undefined)
      .orderBy();

    const total = await countQuery.getCount();

    const meta = this.paginationService.getPaginationMeta(page, limit, total);

    const comments = await queryBuilder.getMany();

    return {
      data: comments,
      meta,
    };
  }

  async findById(id: string) {
    const comment = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .leftJoin('comment.offer', 'offer')
      .addSelect(['user.id', 'user.name', 'user.email', 'offer.id'])
      .where('comment.id = :id', { id })
      .getOne();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async removeComment(
    requesterId: string,
    commentId: string,
    isAdmin: boolean = false,
  ) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isOwner = comment.user.id === requesterId;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }

    await this.commentsRepository.remove(comment);
    return { message: 'Comment successfully removed' };
  }

  async getCommentStats() {
    const [totalComments] = await Promise.all([
      this.commentsRepository.count(),
    ]);

    return {
      totalComments,
    };
  }
  async update(userId: string, commentId: string, updateCommentDto: UpdateCommentDto) {
  const comment = await this.commentsRepository.findOne({
    where: { id: commentId },
    relations: ['user'],
  });

  if (!comment) {
    throw new NotFoundException('Comment not found');
  }

  if (comment.user.id !== userId) {
    throw new NotFoundException('You can only edit your own comments');
  }

  Object.assign(comment, updateCommentDto);
  return this.commentsRepository.save(comment);
}

async remove(userId: string, commentId: string) {
  const comment = await this.commentsRepository.findOne({
    where: { id: commentId },
    relations: ['user'],
  });

  if (!comment) {
    throw new NotFoundException('Comment not found');
  }

  if (comment.user.id !== userId) {
    throw new NotFoundException('You can only delete your own comments');
  }

  return this.commentsRepository.remove(comment);
}
}
