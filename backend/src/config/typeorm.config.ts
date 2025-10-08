import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { AuditSubscriber } from 'src/common/subscribers/audit.subscriber';

// Load environment variables
dotenv.config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST') || 'localhost',
  port: configService.get<number>('DB_PORT') || 5432,
  username: configService.get<string>('DB_USERNAME') || 'postgres',
  password: configService.get<string>('DB_PASSWORD') || 'password',
  database: configService.get<string>('DB_DATABASE') || 'ticketing_app',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  subscribers : [AuditSubscriber],
  synchronize: configService.get<string>('NODE_ENV') === 'development',
  logging: true,
  dropSchema : true
});