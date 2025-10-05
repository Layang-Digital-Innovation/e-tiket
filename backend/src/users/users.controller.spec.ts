import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    profileImage: '',
    emailVerified: false,
    emailVerificationToken: '',
    resetPasswordToken: '',
    resetPasswordExpires: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateUserRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+0987654321',
      role: UserRole.USER,
    };

    it('should create a new user', async () => {
      const newUser = { ...mockUser, ...createUserDto };
      service.create.mockResolvedValue(newUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(newUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should create a user with admin role', async () => {
      const adminDto = { ...createUserDto, role: UserRole.ADMIN };
      const adminUser = { ...mockUser, ...adminDto };
      service.create.mockResolvedValue(adminUser);

      const result = await controller.create(adminDto);

      expect(result).toEqual(adminUser);
      expect(service.create).toHaveBeenCalledWith(adminDto);
    });

    it('should create a user with event organizer role', async () => {
      const organizerDto = { ...createUserDto, role: UserRole.EVENT_ORGANIZER };
      const organizerUser = { ...mockUser, ...organizerDto };
      service.create.mockResolvedValue(organizerUser);

      const result = await controller.create(organizerDto);

      expect(result).toEqual(organizerUser);
      expect(service.create).toHaveBeenCalledWith(organizerDto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      service.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return multiple users', async () => {
      const users = [
        mockUser,
        { ...mockUser, id: 'user-2', email: 'user2@example.com' },
        { ...mockUser, id: 'user-3', email: 'user3@example.com', role: UserRole.ADMIN },
      ];
      service.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(result).toHaveLength(3);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      service.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-1');

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('user-1');
    });

    it('should handle admin user lookup', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      service.findOne.mockResolvedValue(adminUser);

      const result = await controller.findOne('admin-1');

      expect(result).toEqual(adminUser);
      expect(service.findOne).toHaveBeenCalledWith('admin-1');
    });

    it('should handle event organizer user lookup', async () => {
      const organizerUser = { ...mockUser, role: UserRole.EVENT_ORGANIZER };
      service.findOne.mockResolvedValue(organizerUser);

      const result = await controller.findOne('organizer-1');

      expect(result).toEqual(organizerUser);
      expect(service.findOne).toHaveBeenCalledWith('organizer-1');
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update a user', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-1', updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith('user-1', updateUserDto);
    });

    it('should update user with new password', async () => {
      const updateWithPassword = { ...updateUserDto, password: 'newPassword' };
      const updatedUser = { ...mockUser, ...updateWithPassword };
      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-1', updateWithPassword);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith('user-1', updateWithPassword);
    });

    it('should update user email', async () => {
      const updateWithEmail = { ...updateUserDto, email: 'newemail@example.com' };
      const updatedUser = { ...mockUser, ...updateWithEmail };
      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-1', updateWithEmail);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith('user-1', updateWithEmail);
    });

    it('should update user phone', async () => {
      const updateWithPhone = { ...updateUserDto, phone: '+1111111111' };
      const updatedUser = { ...mockUser, ...updateWithPhone };
      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-1', updateWithPhone);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith('user-1', updateWithPhone);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('user-1');

      expect(service.remove).toHaveBeenCalledWith('user-1');
    });

    it('should handle removal of admin user', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('admin-1');

      expect(service.remove).toHaveBeenCalledWith('admin-1');
    });

    it('should handle removal of event organizer user', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('organizer-1');

      expect(service.remove).toHaveBeenCalledWith('organizer-1');
    });
  });

  describe('updateRole', () => {
    it('should update user role to admin', async () => {
      const updatedUser = { ...mockUser, role: UserRole.ADMIN };
      service.updateUserRole.mockResolvedValue(updatedUser);

      const result = await controller.updateRole('user-1', UserRole.ADMIN);

      expect(result).toEqual(updatedUser);
      expect(service.updateUserRole).toHaveBeenCalledWith('user-1', UserRole.ADMIN);
    });

    it('should update user role to event organizer', async () => {
      const updatedUser = { ...mockUser, role: UserRole.EVENT_ORGANIZER };
      service.updateUserRole.mockResolvedValue(updatedUser);

      const result = await controller.updateRole('user-1', UserRole.EVENT_ORGANIZER);

      expect(result).toEqual(updatedUser);
      expect(service.updateUserRole).toHaveBeenCalledWith('user-1', UserRole.EVENT_ORGANIZER);
    });

    it('should update admin role back to user', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      const updatedUser = { ...mockUser, role: UserRole.USER };
      service.updateUserRole.mockResolvedValue(updatedUser);

      const result = await controller.updateRole('admin-1', UserRole.USER);

      expect(result).toEqual(updatedUser);
      expect(service.updateUserRole).toHaveBeenCalledWith('admin-1', UserRole.USER);
    });

    it('should update event organizer role back to user', async () => {
      const organizerUser = { ...mockUser, role: UserRole.EVENT_ORGANIZER };
      const updatedUser = { ...mockUser, role: UserRole.USER };
      service.updateUserRole.mockResolvedValue(updatedUser);

      const result = await controller.updateRole('organizer-1', UserRole.USER);

      expect(result).toEqual(updatedUser);
      expect(service.updateUserRole).toHaveBeenCalledWith('organizer-1', UserRole.USER);
    });
  });

  describe('Guards and Authorization', () => {
    it('should be protected by JwtAuthGuard and RolesGuard', () => {
      const guards = Reflect.getMetadata('__guards__', UsersController);
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(RolesGuard);
    });

    it('should require ADMIN role for create endpoint', () => {
      const roles = Reflect.getMetadata('roles', controller.create);
      expect(roles).toContain(UserRole.ADMIN);
    });

    it('should require ADMIN role for findAll endpoint', () => {
      const roles = Reflect.getMetadata('roles', controller.findAll);
      expect(roles).toContain(UserRole.ADMIN);
    });

    it('should require ADMIN or EVENT_ORGANIZER role for findOne endpoint', () => {
      const roles = Reflect.getMetadata('roles', controller.findOne);
      expect(roles).toContain(UserRole.ADMIN);
      expect(roles).toContain(UserRole.EVENT_ORGANIZER);
    });

    it('should require ADMIN role for update endpoint', () => {
      const roles = Reflect.getMetadata('roles', controller.update);
      expect(roles).toContain(UserRole.ADMIN);
    });

    it('should require ADMIN role for remove endpoint', () => {
      const roles = Reflect.getMetadata('roles', controller.remove);
      expect(roles).toContain(UserRole.ADMIN);
    });

    it('should require ADMIN role for updateRole endpoint', () => {
      const roles = Reflect.getMetadata('roles', controller.updateRole);
      expect(roles).toContain(UserRole.ADMIN);
    });
  });
});