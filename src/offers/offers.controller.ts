import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/types/enums';
import { User } from 'src/users/entities/user.entity';
import { AdminModerateDto } from './dto/admin-moderate.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OffersService } from './offers.service';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) { }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS)
  create(@CurrentUser() user: User, @Body() createOfferDto: CreateOfferDto) {
    return this.offersService.create(createOfferDto, user.id);
  }

  @Post(":id/admin/moderate")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminModerate(@Param('id') id: string, @CurrentUser() user: User, @Body() adminModerateDto: AdminModerateDto) {
    return this.offersService.adminModerate(id, user.id, adminModerateDto.status, adminModerateDto.note);
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

}
