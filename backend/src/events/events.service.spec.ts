import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  DeleteResult,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { Event, EventStatus } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UserRole, UserStatus } from '../users/entities/user.entity';

describe('EventsService', () => {
  let service: EventsService;
  let repository: jest.Mocked<Repository<Event>>;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
  const futureEndDate = new Date(futureDate);
  futureEndDate.setHours(futureEndDate.getHours() + 8); // 8 hours later

  const mockOrganizer = {
    id: 'organizer-1',
    email: 'organizer@example.com',
    firstName: 'John',
    lastName: 'Organizer',
    role: UserRole.EVENT_ORGANIZER,
    password: 'hashed-password',
    phone: '1234567890',
    status: UserStatus.ACTIVE,
    profileImage: 'profile.jpg',
    emailVerified: true,
    emailVerificationToken: 'token',
    resetPasswordToken: 'token',
    resetPasswordExpires: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    oauthProvider: 'google',
    oauthProviderId: '22765a47-0dbc-4f2c-bb6c-be4a19c933ea',
    emailVerificationExpires: new Date(),
  };

  const mockEvent: Partial<Event> = {
    id: '1',
    title: 'Test Event',
    description: 'Test Description',
    location: 'Test Location',
    startDate: futureDate,
    endDate: futureEndDate,
    basePrice: 50.0,
    imageUrl: 'test-image.jpg',
    status: EventStatus.PUBLISHED,
    organizerId: 'organizer-1',
    organizer: mockOrganizer,
    createdBy: 'organizer-1',
    updatedBy: 'organizer-1',
    creator: mockOrganizer,
    updater: mockOrganizer,
    ticketCategories: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockEvent], 1]),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repository = module.get(getRepositoryToken(Event));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createEventDto: CreateEventDto = {
      title: 'New Event',
      description: 'New Description',
      location: 'New Location',
      startDate: futureDate.toISOString(),
      endDate: futureEndDate.toISOString(),
      maxCapacity: 100,
      basePrice: 50.0,
      imageUrl: 'new-image.jpg',
    };

    it('should create an event successfully', async () => {
      const userId = 'organizer-1';
      repository.create.mockReturnValue(mockEvent as Event);
      repository.save.mockResolvedValue(mockEvent as Event);

      const result = await service.create(createEventDto, userId);

      expect(result).toEqual(mockEvent);
      expect(repository.create).toHaveBeenCalledWith({
        ...createEventDto,
        startDate: new Date(createEventDto.startDate),
        endDate: new Date(createEventDto.endDate),
        organizerId: userId,
      });
      expect(repository.save).toHaveBeenCalledWith(mockEvent);
    });

    it('should throw BadRequestException when end date is before start date', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() - 1); // 1 hour before start

      const invalidDto = {
        ...createEventDto,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      await expect(service.create(invalidDto, 'organizer-1')).rejects.toThrow(
        new BadRequestException('End date must be after start date'),
      );
    });

    it('should throw BadRequestException when start date is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const invalidDto = {
        ...createEventDto,
        startDate: pastDate.toISOString(),
      };

      await expect(service.create(invalidDto, 'organizer-1')).rejects.toThrow(
        new BadRequestException('Start date cannot be in the past'),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      const mockEvents = [mockEvent];
      const total = 1;

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockEvents, total]);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        events: mockEvents,
        total,
        page: 1,
        limit: 10,
      });

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('event');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'event.organizer',
        'organizer',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'event.tickets',
        'tickets',
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'event.createdAt',
        'DESC',
      );
    });

    it('should filter by status when provided', async () => {
      const mockEvents = [mockEvent];
      const total = 1;

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockEvents, total]);

      await service.findAll(1, 10, EventStatus.PUBLISHED);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'event.status = :status',
        {
          status: EventStatus.PUBLISHED,
        },
      );
    });
  });

  describe('findOne', () => {
    it('should return an event when found', async () => {
      repository.findOne.mockResolvedValue(mockEvent as Event);

      const result = await service.findOne('1');

      expect(result).toEqual(mockEvent);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['organizer', 'tickets'],
      });
    });

    it('should throw NotFoundException when event not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(
        new NotFoundException('Event with ID 999 not found'),
      );
    });
  });

  describe('findByOrganizer', () => {
    it('should return events by organizer', async () => {
      const mockEvents = [mockEvent];
      const total = 1;

      repository.findAndCount.mockResolvedValue([mockEvents as Event[], total]);

      const result = await service.findByOrganizer('organizer-1', 1, 10);

      expect(result).toEqual({
        events: mockEvents,
        total,
        page: 1,
        limit: 10,
      });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { organizerId: 'organizer-1' },
        relations: ['tickets'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('update', () => {
    const updateEventDto: UpdateEventDto = {
      title: 'Updated Event',
      description: 'Updated Description',
    };

    it('should update event when user is the organizer', async () => {
      const updatedEvent = { ...mockEvent, ...updateEventDto };

      repository.findOne.mockResolvedValue(mockEvent as Event);
      repository.update.mockResolvedValue(undefined as unknown as UpdateResult);
      repository.findOne
        .mockResolvedValueOnce(mockEvent as Event)
        .mockResolvedValueOnce({
          ...updatedEvent,
          id: '1',
          startDate: new Date(),
          endDate: new Date(),
        } as Event);

      const result = await service.update(
        '1',
        updateEventDto,
        'organizer-1',
        UserRole.EVENT_ORGANIZER,
      );

      expect(result).toEqual(updatedEvent as Event);
      expect(repository.update).toHaveBeenCalledWith('1', {
        ...updateEventDto,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should update event when user is admin', async () => {
      const updatedEvent = { ...mockEvent, ...updateEventDto };

      repository.findOne.mockResolvedValue(mockEvent as Event);
      repository.update.mockResolvedValue(undefined as unknown as UpdateResult);
      repository.findOne
        .mockResolvedValueOnce(mockEvent as Event)
        .mockResolvedValueOnce(updatedEvent as Event);

      const result = await service.update(
        '1',
        updateEventDto,
        'different-user',
        UserRole.ADMIN,
      );

      expect(result).toEqual(updatedEvent as Event);
    });

    it('should throw ForbiddenException when user is not organizer or admin', async () => {
      repository.findOne.mockResolvedValue(mockEvent as Event);

      await expect(
        service.update('1', updateEventDto, 'different-user', UserRole.USER),
      ).rejects.toThrow(
        new ForbiddenException('You can only update your own events'),
      );
    });

    it('should validate dates when updating', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() - 1); // 1 hour before start

      const invalidUpdateDto = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      repository.findOne.mockResolvedValue(mockEvent as Event);

      await expect(
        service.update(
          '1',
          invalidUpdateDto,
          'organizer-1',
          UserRole.EVENT_ORGANIZER,
        ),
      ).rejects.toThrow(
        new BadRequestException('End date must be after start date'),
      );
    });
  });

  describe('remove', () => {
    it('should remove event when user is the organizer', async () => {
      repository.findOne.mockResolvedValue(mockEvent as Event);
      repository.remove.mockResolvedValue(undefined as unknown as Event);

      await service.remove('1', 'organizer-1', UserRole.EVENT_ORGANIZER);

      expect(repository.remove).toHaveBeenCalledWith(mockEvent as Event);
    });

    it('should remove event when user is admin', async () => {
      repository.findOne.mockResolvedValue(mockEvent as Event);
      repository.remove.mockResolvedValue(undefined as unknown as Event);

      await service.remove('1', 'different-user', UserRole.ADMIN);

      expect(repository.remove).toHaveBeenCalledWith(mockEvent as Event);
    });

    it('should throw ForbiddenException when user is not organizer or admin', async () => {
      repository.findOne.mockResolvedValue(mockEvent as Event);

      await expect(
        service.remove('1', 'different-user', UserRole.USER),
      ).rejects.toThrow(
        new ForbiddenException('You can only delete your own events'),
      );
    });
  });

  describe('updateStatus', () => {
    it('should update event status when user is the organizer', async () => {
      const updatedEvent = { ...mockEvent, status: EventStatus.CANCELLED };

      repository.findOne.mockResolvedValue(mockEvent as Event);
      repository.update.mockResolvedValue(undefined as unknown as UpdateResult);
      repository.findOne
        .mockResolvedValueOnce(mockEvent as Event)
        .mockResolvedValueOnce(updatedEvent as Event);

      const result = await service.updateStatus(
        '1',
        EventStatus.CANCELLED,
        'organizer-1',
        UserRole.EVENT_ORGANIZER,
      );

      expect(result).toEqual(updatedEvent as Event);
      expect(repository.update).toHaveBeenCalledWith('1', {
        status: EventStatus.CANCELLED,
      });
    });

    it('should throw ForbiddenException when user is not organizer or admin', async () => {
      repository.findOne.mockResolvedValue(mockEvent as Event);

      await expect(
        service.updateStatus(
          '1',
          EventStatus.CANCELLED,
          'different-user',
          UserRole.USER,
        ),
      ).rejects.toThrow(
        new ForbiddenException('You can only update your own events'),
      );
    });
  });
});
