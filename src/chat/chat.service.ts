import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/common/types/enums';
import { UsersService } from 'src/users/users.service';
import { Not, Repository } from 'typeorm';
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
    const conversation = await this.findConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.initiator.id !== senderId && conversation.participant.id !== senderId) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const message = this.messageRepo.create({
      conversation,
      sender: { id: senderId },
      content,
    });

    return this.messageRepo.save(message);
  }

  async getMessages(conversationId: string, userId: string) {
    const conversation = await this.conversationRepo.findOne({
      where: [
        { id: conversationId, initiator: { id: userId } },
        { id: conversationId, participant: { id: userId } },
      ],
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

  async markAsRead(conversationId: string, userId: string) {
    const conversation = await this.findConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.initiator.id !== userId && conversation.participant.id !== userId) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    await this.messageRepo.update(
      {
        conversation: { id: conversation.id },
        sender: { id: Not(userId) },
        isRead: false
      },

      { isRead: true }
    );
  }

}
