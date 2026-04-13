import { Controller, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Post('upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadSingleFile(file);
  }

  @Post('upload-multiple')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.filesService.uploadMultipleFiles(files);
  }

}
