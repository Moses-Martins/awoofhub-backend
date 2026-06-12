import { Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ClicksService } from './clicks.service';

@Controller('clicks')
export class ClicksController {
  constructor(private readonly clicksService: ClicksService) { }

  @Post('offer/:offerId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Click on an offer',
  })
  @ApiParam({
    name: 'offerId',
    type: String,
    description: 'Offer ID',
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 201,
    description: 'Click added successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  create(
    @CurrentUser() user,
    @Param('offerId', ParseUUIDPipe) offerId: string
  ) {
    return this.clicksService.create(user.id, offerId);
  }

}
