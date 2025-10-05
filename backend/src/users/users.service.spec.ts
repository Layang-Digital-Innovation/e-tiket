import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    profileImage: "",
    emailVerified: false,
    emailVerificationToken: "",
    resetPasswordToken: "",
    resetPasswordExpires: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      password: 'plainPassword',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+0987654321',
      role: UserRole.USER,
    };

    it('should create a user with hashed password', async () => {
      const hashedPassword = 'hashedPassword123';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
      expect(repository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(repository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should create a user with admin role', async () => {
      const adminDto = { ...createUserDto, role: UserRole.ADMIN };
      const hashedPassword = 'hashedPassword123';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await service.create(adminDto);

      expect(result).toEqual(mockUser);
      expect(repository.create).toHaveBeenCalledWith({
        ...adminDto,
        password: hashedPassword,
      });
    });

    it('should create a user with event organizer role', async () => {
      const organizerDto = { ...createUserDto, role: UserRole.EVENT_ORGANIZER };
      const hashedPassword = 'hashedPassword123';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await service.create(organizerDto);

      expect(result).toEqual(mockUser);
      expect(repository.create).toHaveBeenCalledWith({
        ...organizerDto,
        password: hashedPassword,
      });
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [mockUser];
      repository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(repository.find).toHaveBeenCalledWith({
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'phone',
          'role',
          'status',
          'createdAt',
        ],
      });
    });

    it('should return empty array when no users exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('user-1');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'phone',
          'role',
          'status',
          'createdAt',
        ],
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found by email', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update user without password', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      
      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);
      repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] } as never);

      const result = await service.update('user-1', updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(repository.update).toHaveBeenCalledWith('user-1', updateUserDto);
    });

    it('should update user with hashed password', async () => {
      const updateWithPassword = { ...updateUserDto, password: 'newPassword' };
      const hashedPassword = 'newHashedPassword';
      const updatedUser = { ...mockUser, ...updateWithPassword };

      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);
      repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] } as never);

      const result = await service.update('user-1', updateWithPassword);

      expect(result).toEqual(updatedUser);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(repository.update).toHaveBeenCalledWith('user-1', {
        ...updateWithPassword,
        password: hashedPassword,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(service.update('999', updateUserDto)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);
      repository.remove.mockResolvedValue(mockUser);

      await service.remove('user-1');

      expect(service.findOne).toHaveBeenCalledWith('user-1');
      expect(repository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(service.remove('999')).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validatePassword('plainPassword', 'hashedPassword');

      expect(result).toBe(true);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
    });

    it('should return false for invalid password', async () => {
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validatePassword('wrongPassword', 'hashedPassword');

      expect(result).toBe(false);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role to admin', async () => {
      const updatedUser = { ...mockUser, role: UserRole.ADMIN };
      
      repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] } as never);
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedUser);

      const result = await service.updateUserRole('user-1', UserRole.ADMIN);

      expect(result).toEqual(updatedUser);
      expect(repository.update).toHaveBeenCalledWith('user-1', { role: UserRole.ADMIN });
    });

    it('should update user role to event organizer', async () => {
      const updatedUser = { ...mockUser, role: UserRole.EVENT_ORGANIZER };
      
      repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] } as never);
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedUser);

      const result = await service.updateUserRole('user-1', UserRole.EVENT_ORGANIZER);

      expect(result).toEqual(updatedUser);
      expect(repository.update).toHaveBeenCalledWith('user-1', { role: UserRole.EVENT_ORGANIZER });
    });

    it('should update user role to regular user', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      const updatedUser = { ...mockUser, role: UserRole.USER };
      
      repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] } as never);
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedUser);

      const result = await service.updateUserRole('user-1', UserRole.USER);

      expect(result).toEqual(updatedUser);
      expect(repository.update).toHaveBeenCalledWith('user-1', { role: UserRole.USER });
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status to inactive', async () => {
      const updatedUser = { ...mockUser, status: UserStatus.INACTIVE };
      
      repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] } as never);
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedUser);

      const result = await service.updateUserStatus('user-1', UserStatus.INACTIVE);

      expect(result).toEqual(updatedUser);
      expect(repository.update).toHaveBeenCalledWith('user-1', { status: UserStatus.INACTIVE });
    });

    it('should update user status to suspended', async () => {
      const updatedUser = { ...mockUser, status: UserStatus.SUSPENDED };
      
      repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] } as never);
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedUser);

      const result = await service.updateUserStatus('user-1', UserStatus.SUSPENDED);

      expect(result).toEqual(updatedUser);
      expect(repository.update).toHaveBeenCalledWith('user-1', { status: UserStatus.SUSPENDED });
    });

    it('should update user status to active', async () => {
      const suspendedUser = { ...mockUser, status: UserStatus.SUSPENDED };
      const updatedUser = { ...mockUser, status: UserStatus.ACTIVE };
      
      repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedUser);

      const result = await service.updateUserStatus('user-1', UserStatus.ACTIVE);

      expect(result).toEqual(updatedUser);
      expect(repository.update).toHaveBeenCalledWith('user-1', { status: UserStatus.ACTIVE });
    });
  });
});