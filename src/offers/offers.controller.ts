import { Body, Controller, Delete, Patch, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/types/enums';
import { User } from 'src/users/entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OffersService } from './offers.service';
import { UserStatusGuard } from 'src/common/guards/user-status.guard';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) { }

  @Post()
@UseGuards(AuthGuard, UserStatusGuard, RolesGuard)
@Roles(UserRole.BUSINESS)
create(@CurrentUser() user: User, @Body() createOfferDto: CreateOfferDto) {
  return this.offersService.create(createOfferDto, user.id);
}

  @Get()
  async findAll(@Query('page') page: number, @Query('limit') limit: number, @Query('search') search?: string, @Query('category') category?: string, @Query('minRating') minRating?: number, @Query('createdFrom') createdFrom?: string, @Query('createdTo') createdTo?: string) {
    return this.offersService.findAll(search, category, minRating, createdFrom, createdTo, page, limit);
  }

  @Get('user/:id')
  async findAllByUser(@Param('id') id: string, @Query('page') page: number, @Query('limit') limit: number, @Query('search') search?: string, @Query('category') category?: string, @Query('minRating') minRating?: number, @Query('createdFrom') createdFrom?: string, @Query('createdTo') createdTo?: string) {
    return this.offersService.findAllByUser(id, search, category, minRating, createdFrom, createdTo, page, limit);
  }

  @Get('random')
  getRandom(@Query('page') page: number, @Query('limit') limit: number) {
    return this.offersService.getRandomOffers(page, limit);
  }

  @Get('category/id/:id')
  findByCategoryId(@Param('id') id: string, @Query('page') page: number, @Query('limit') limit: number) {
    return this.offersService.findByCategoryId(id, page, limit);
  }

  @Get('business/dashboard')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS)
  getBusinessDashboard(@CurrentUser() user: User) {
    return this.offersService.getBusinessDashboard(user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOfferById(@Param('id') id: string) {
    return this.offersService.findById(id);
  }

@Patch(':id')
@UseGuards(AuthGuard, UserStatusGuard, RolesGuard)
@Roles(UserRole.BUSINESS)
update(@CurrentUser() user: User, @Param('id') id: string, @Body() updateOfferDto: UpdateOfferDto) {
  return this.offersService.update(id, user.id, updateOfferDto);
}

@Delete(':id')
@UseGuards(AuthGuard, UserStatusGuard, RolesGuard)
@Roles(UserRole.BUSINESS)
remove(@CurrentUser() user: User, @Param('id') id: string) {
  return this.offersService.remove(id, user.id);
}

@Get('admin/pending')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getPendingOffers(@Query('page') page: number, @Query('limit') limit: number) {
  return this.offersService.findPending(page, limit);
}


}
