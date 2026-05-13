import { Module } from '@nestjs/common';
import { PaginationService } from './pagination/pagination.service';
import { UsersModule } from 'src/users/users.module';
@Module({
    providers: [PaginationService],
    exports: [PaginationService],
})
export class CommonModule {}