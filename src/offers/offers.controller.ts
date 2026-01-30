import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/types/enums';
import { User } from 'src/users/entities/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
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

  @Get()
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.offersService.findAll(page, limit);
  }

  @Get('search')
  searchOffers(@Query('query') query: string, @Query('page') page: number, @Query('limit') limit: number) {
    return this.offersService.searchOffers(query, page, limit);
  }

  @Get('filter')
  filter(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('minRating') minRating?: number,
  ) {
    return this.offersService.filter(category, minPrice, maxPrice, minRating, page, limit);
  }

  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.offersService.createCategory(createCategoryDto);
  }

  @Get(':id')
  findOfferById(@Param('id') id: string) {
    return this.offersService.findById(id);
  }

}
