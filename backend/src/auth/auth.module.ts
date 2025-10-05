import { Module, DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';


@Module({})
export class AuthModule {
  static forRoot(): DynamicModule {
    const providers: any[] = [AuthService, LocalStrategy, JwtStrategy];
    
    // Only add OAuth strategies if credentials are configured
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      providers.push(GoogleStrategy);
    }

    return {
      module: AuthModule,
      imports: [
        UsersModule,
        EmailModule,
        PassportModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: {
              expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
            },
          }),
          inject: [ConfigService],
        }),
      ],
      controllers: [AuthController],
      providers,
      exports: [AuthService],
    };
  }
}
