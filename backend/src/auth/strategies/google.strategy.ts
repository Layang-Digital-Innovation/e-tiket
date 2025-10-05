import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, StrategyOptions } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get('GOOGLE_CLIENT_SECRET');
    
    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth credentials are not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables.');
    }
    
    super({
      clientID,
      clientSecret,
      callbackURL: configService.get('GOOGLE_CALLBACK_URL') || '/api/auth/google/callback',
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    
    const user = {
      oauthProviderId: id,
      oauthProvider: 'google',
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      profileImage: photos[0].value,
      emailVerified: true, // Google emails are already verified
    };

    const validatedUser = await this.authService.validateOAuthUser(user);
    done(null, validatedUser);
  }
}