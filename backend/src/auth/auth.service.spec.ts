import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let emailService: jest.Mocked<EmailService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    profileImage : '',
    emailVerified : true,
    emailVerificationToken : '',
  };

  const mockUserWithoutPassword = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    profileImage : '',
    emailVerified : true,
    emailVerificationToken : '',
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      validatePassword: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
    };

    const mockEmailService = {
      sendVerificationEmail: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    emailService = module.get(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {  
    it('should return user without password when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as User);
    usersService.validatePassword.mockResolvedValue(true);

    const result = await service.validateUser('test@example.com', 'hashedPassword');

    expect(result).toEqual(mockUserWithoutPassword);
    expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(usersService.validatePassword).toHaveBeenCalledWith('hashedPassword', 'hashedPassword');
    });

    it('should return null when user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);


      const result = await service.validateUser('test@example.com', 'hashedPassword');

      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.validatePassword).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as User);
      usersService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.validatePassword).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const mockToken = 'mock.jwt.token';
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUserWithoutPassword);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          status: 'active',
        },
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        email: 'test@example.com',
        role: 'user',
      });
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '0987654321',
    };

    const registeredUser = {
      ...registerDto,
      id: '2',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      profileImage : '',
      emailVerified : false,
      emailVerificationToken : '',
    }

      it('should register new user successfully', async () => {
    // Arrange
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue(registeredUser as User);

    // Act
    const result = await service.register(registerDto);

    // Assert
    expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
    expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({
      email: registerDto.email,
      emailVerified: false,
      emailVerificationToken: expect.any(String), // token harus ada
      emailVerificationExpires: expect.any(Date), // expires harus ada
    }));
    expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
      registerDto.email,
      expect.any(String),
      registerDto.firstName,
    );
    expect(result).toEqual({
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: registeredUser.id,
        email: registeredUser.email,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        role: registeredUser.role,
        status: registeredUser.status,
        emailVerified: registeredUser.emailVerified,
      },
    });
  });

    it('should throw ConflictException when user already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as User);

      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException('User with this email already exists'),
      );

      expect(usersService.findByEmail).toHaveBeenCalledWith('newuser@example.com');
      expect(usersService.create).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile without sensitive data', async () => {
      usersService.findOne.mockResolvedValue(mockUser as User);

      const result = await service.getProfile('1');

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        role: 'user',
        status: 'active',
        createdAt: mockUser.createdAt,
      });

      expect(usersService.findOne).toHaveBeenCalledWith('1');
    });
  });
});