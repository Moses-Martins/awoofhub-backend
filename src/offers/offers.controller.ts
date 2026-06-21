import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { MyOffersTab, UserRole } from 'src/common/types/enums';

import { User } from 'src/users/entities/user.entity';

import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

import { FindOffersQueryDto } from './dto/find-offer-query.dto';
import { OffersService } from './offers.service';

@ApiTags('Offers')
@ApiBearerAuth()
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) { }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
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
  @ApiQuery({ name: 'dealType', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'createdFrom', required: false, type: String })
  @ApiQuery({ name: 'createdTo', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Offers fetched successfully',
  })
  async findAll(
    @Query() query: FindOffersQueryDto
  ) {
    return this.offersService.findAll(query);
  }

  @Get('trending')
  @ApiOperation({
    summary: 'Get all trending offers',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'dealType', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'createdFrom', required: false, type: String })
  @ApiQuery({ name: 'createdTo', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Offers fetched successfully',
  })
  async findAllTrending(
    @Query() query: FindOffersQueryDto
  ) {
    return this.offersService.findAllTrending(query);
  }

  @Get('expiring')
  @ApiOperation({
    summary: 'Get all expiring offers',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'dealType', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'createdFrom', required: false, type: String })
  @ApiQuery({ name: 'createdTo', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Offers fetched successfully',
  })
  async findAllExpiring(
    @Query() query: FindOffersQueryDto
  ) {
    return this.offersService.findAllExpiring(query);
  }

  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all offers',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'dealType', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'createdFrom', required: false, type: String })
  @ApiQuery({ name: 'createdTo', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Offers fetched successfully',
  })
  async findAllForAdmin(
    @Query() query: FindOffersQueryDto
  ) {
    return this.offersService.findAllForAdmin(query);
  }

  @Get('username/:username')
  @ApiOperation({
    summary: 'Get offers by username',
  })
  @ApiParam({
    name: 'username',
    type: String,
    example: '@johndoe',
  })
  @ApiResponse({
    status: 200,
    description: 'User offers fetched successfully',
  })
  async findAllByUsername(
    @Param('username') username: string,
    @Query() query: FindOffersQueryDto
  ) {
    return this.offersService.findAllByUsername(
      username,
      query,
    );
  }

  @Get('mine')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({
    summary: 'Get my posted offers',
  })
  @ApiQuery({ name: 'tab', required: false, enum: MyOffersTab })
  @ApiResponse({
    status: 200,
    description: 'offers fetched successfully',
  })
  async findMyOffers(
    @CurrentUser() user: User,
    @Query() query: FindOffersQueryDto
  ) {
    return this.offersService.findMyOffers(
      user.id,
      query
    );
  }

  @Get('mine/tabs-count')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({
    summary: 'Get my offer tabs count',
  })
  @ApiResponse({
    status: 200,
    description: 'tabs count fetched successfully',
  })
  async getMyOfferTabsCount(@CurrentUser() user: User) {
    return this.offersService.getMyOfferTabsCount(user.id);
  }


  @Get('random')
  @ApiOperation({
    summary: 'Get random offers',
  })
  @ApiResponse({
    status: 200,
    description: 'Random offers fetched successfully',
  })
  getRandom() {
    return this.offersService.getRandomOffers();
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
  findOfferById(@Param('id', ParseUUIDPipe) id: string) {
    return this.offersService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an offer' })
  @ApiParam({ name: 'id', type: String, example: '64f8c2d9a12b3c0012345678' })
  @ApiResponse({ status: 200, description: 'Offer updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() updateOfferDto: UpdateOfferDto) {
    return this.offersService.update(id, user.id, updateOfferDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an offer' })
  @ApiParam({ name: 'id', type: String, example: '64f8c2d9a12b3c0012345678' })
  @ApiResponse({ status: 200, description: 'Offer deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.offersService.remove(id, user.id);
  }
}
