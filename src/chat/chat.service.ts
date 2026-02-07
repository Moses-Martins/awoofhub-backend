import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/common/types/enums';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    private readonly userService: UsersService,
  ) { }


  async getOrCreateConversation(initiatorId: string, participantId: string) {
    
    const initiatorUser = await this.userService.getUserById(initiatorId);
    if (!initiatorUser) {
      throw new NotFoundException('Initiator not found');
    }

    const participantUser = await this.userService.getUserById(participantId);
    if (!participantUser) {
      throw new NotFoundException('Participant not found');
    }

    if (initiatorId === participantId) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    let conversation = await this.conversationRepo.findOne({
      where: [
        {
          initiator: { id: initiatorUser.id },
          participant: { id: participantUser.id },
        },
        {
          initiator: { id: participantUser.id },
          participant: { id: initiatorUser.id },
        },
      ],
      relations: ['messages'],
    });

    if (!conversation) {
      if (initiatorUser.role === UserRole.BUSINESS) {
        throw new ForbiddenException(
          'Business accounts are not allowed to start conversations',
        );
      }
      conversation = this.conversationRepo.create({
        initiator: { id: initiatorUser.id },
        participant: { id: participantUser.id },
      });
      await this.conversationRepo.save(conversation);
    }

    return conversation;
  }

  async findConversationById(id: string) {
    return this.conversationRepo.findOne({
      where: { id },
      relations: ['initiator', 'participant'],
    });
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const sender = await this.userService.getUserById(senderId);
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    const message = this.messageRepo.create({
      conversation,
      sender,
      content,
    });

    return this.messageRepo.save(message);
  }

  async getMessages(conversationId: string) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.messageRepo.find({
      where: { conversation: { id: conversation.id } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

}
