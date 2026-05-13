import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserStatus } from '../types/enums';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class UserStatusGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const freshUser = await this.usersService.getUserById(user.id);

    if (!freshUser) {
      throw new ForbiddenException('User not found');
    }

    if (freshUser.status === UserStatus.DELETED) {
      throw new ForbiddenException('Your account has been deleted');
    }

    if (freshUser.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Your account has been blocked');
    }

    if (freshUser.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException('Your account has been suspended');
    }

    return true;
  }
}