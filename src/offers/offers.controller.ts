import {
  Body,
  Controller,
  Delete,
  Patch,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/types/enums';

import { User } from 'src/users/entities/user.entity';

import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OffersService } from './offers.service';

@ApiTags('Offers')
@ApiBearerAuth()
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) { }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS)
  @ApiOperation({
    summary: 'Create a new offer',
  })
  @ApiResponse({
    status: 201,
    description: 'Offer created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  create(@CurrentUser() user: User, @Body() createOfferDto: CreateOfferDto) {
    return this.offersService.create(createOfferDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all active offers',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'createdFrom', required: false, type: String })
  @ApiQuery({ name: 'createdTo', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Offers fetched successfully',
  })
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('minRating') minRating?: number,
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
  ) {
    return this.offersService.findAll(
      search,
      category,
      minRating,
      createdFrom,
      createdTo,
      page,
      limit,
    );
  }

  @Get("admin")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all offers',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'createdFrom', required: false, type: String })
  @ApiQuery({ name: 'createdTo', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Offers fetched successfully',
  })
  async findAllAdmin(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('minRating') minRating?: number,
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
  ) {
    return this.offersService.findAllAdmin(
      search,
      category,
      minRating,
      createdFrom,
      createdTo,
      page,
      limit,
    );
  }

  @Get('user/:id')
  @ApiOperation({
    summary: 'Get offers by user ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'User offers fetched successfully',
  })
  async findAllByUser(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('minRating') minRating?: number,
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
  ) {
    return this.offersService.findAllByUser(
      id,
      search,
      category,
      minRating,
      createdFrom,
      createdTo,
      page,
      limit,
    );
  }

  @Get('business')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS)
  @ApiOperation({
    summary: 'Get offers for business',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'User offers fetched successfully',
  })
  async findAllByBusiness(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('minRating') minRating?: number,
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
  ) {
    return this.offersService.findAllByBusiness(
      user.id,
      search,
      category,
      minRating,
      createdFrom,
      createdTo,
      page,
      limit,
    );
  }

  @Get('random')
  @ApiOperation({
    summary: 'Get random offers',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Random offers fetched successfully',
  })
  getRandom(@Query('page') page: number, @Query('limit') limit: number) {
    return this.offersService.getRandomOffers(page, limit);
  }

  @Get('category/id/:id')
  @ApiOperation({
    summary: 'Get offers by category ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Offers fetched successfully',
  })
  findByCategoryId(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.offersService.findByCategoryId(id, page, limit);
  }

  @Get('business/dashboard')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS)
  @ApiOperation({
    summary: 'Get business dashboard statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Business dashboard fetched successfully',
  })
  getBusinessDashboard(@CurrentUser() user: User) {
    return this.offersService.getBusinessDashboard(user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get offer by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Offer fetched successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Offer not found',
  })
  findOfferById(@Param('id') id: string) {
    return this.offersService.findById(id);
  }
  

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS)
  @ApiOperation({ summary: 'Delete an offer' })
  @ApiResponse({ status: 200, description: 'Offer deleted successfully' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.offersService.remove(id, user.id);
  }

}
