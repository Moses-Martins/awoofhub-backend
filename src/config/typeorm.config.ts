import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
config();

const configService = new ConfigService();


const AppDataSource = new DataSource({
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: +configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    synchronize: false,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/database/migrations/*.js'], 
    migrationsRun: false,
    logging: true,
}); 

export default AppDataSource;