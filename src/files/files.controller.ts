import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';

import { AuthGuard } from 'src/auth/guards/auth.guard';

import { FilesService } from './files.service';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a single file',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.filesService.uploadSingleFile(file);
  }

  @Post('upload-multiple')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload multiple files',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Files uploaded successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.filesService.uploadMultipleFiles(files);
  }
}