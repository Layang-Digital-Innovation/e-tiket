import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole, UserStatus } from "../users/entities/user.entity";

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
  };

  const mockAuthResponse = {
    access_token: 'mock.jwt.token',
    user: mockUser,
    message: 'Login successful',
  };

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      getProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockRequest = {
        user: mockUser,
      };

      authService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(mockRequest, loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('register', () => {
    it('should register a new user and return access token', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '0987654321',
      };

      authService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockRequest = {
        user: { id: '1' },
      };

      const mockProfile = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
      };

      authService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockProfile);
      expect(authService.getProfile).toHaveBeenCalledWith('1');
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const result = await controller.logout();

      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});