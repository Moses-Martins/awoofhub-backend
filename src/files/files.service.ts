import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class FilesService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow('AWS_BUCKET_NAME');

    this.s3Client = new S3Client({
      region: this.configService.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  private async uploadToS3(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileExt = extname(file.originalname);
    const key = `media/${randomUUID()}${fileExt}`;

    const parallelUploads3 = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    });

    await parallelUploads3.done();

    const region = this.configService.getOrThrow('AWS_REGION');
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
  }

  async uploadSingleFile(file: Express.Multer.File) {
    const url = await this.uploadToS3(file);
    return { message: 'File uploaded successfully!', data: url };
  }

  async uploadMultipleFiles(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    const urls = await Promise.all(files.map((file) => this.uploadToS3(file)));
    return { message: 'Files uploaded successfully!', data: urls };
  }
}
