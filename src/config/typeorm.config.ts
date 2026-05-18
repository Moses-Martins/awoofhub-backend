import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
config();

const configService = new ConfigService();

const isProduction = configService.get<string>("NODE_ENV") === "production";

const AppDataSource = new DataSource({
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: +configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    synchronize: false,
    // entities: ['dist/**/*.entity.js'],
    // migrations: ['dist/database/migrations/*.js'],
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    migrations: [__dirname + '/../database/migrations/*{.js,.ts}'],
    migrationsRun: false,
    logging: true,
});

export default AppDataSource;