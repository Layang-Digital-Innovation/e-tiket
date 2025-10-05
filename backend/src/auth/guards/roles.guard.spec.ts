import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: jest.Mocked<ExecutionContext>;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'user',
        },
      };

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;
    });

    it('should return true when no roles are required', () => {
      reflector.getAllAndOverride.mockReturnValue(null);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        ROLES_KEY,
        [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
      );
    });

    it('should return true when user has required role', () => {
      const requiredRoles: UserRole[] = [UserRole.USER, UserRole.ADMIN];
      reflector.getAllAndOverride.mockReturnValue(requiredRoles);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        ROLES_KEY,
        [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
      );
    });

    it('should return false when user does not have required role', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN, UserRole.EVENT_ORGANIZER];
      reflector.getAllAndOverride.mockReturnValue(requiredRoles);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        ROLES_KEY,
        [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
      );
    });

    it('should return true when user has admin role', () => {
      mockRequest.user.role = 'admin';
      const requiredRoles: UserRole[] = [UserRole.ADMIN];
      reflector.getAllAndOverride.mockReturnValue(requiredRoles);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true when user has event_organizer role', () => {
      mockRequest.user.role = 'event_organizer';
      const requiredRoles: UserRole[] = [UserRole.EVENT_ORGANIZER];
      reflector.getAllAndOverride.mockReturnValue(requiredRoles);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });
  });
});