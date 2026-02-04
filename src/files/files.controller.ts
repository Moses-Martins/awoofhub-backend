import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadSingleFile(file);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.filesService.uploadMultipleFiles(files);
  }

}
