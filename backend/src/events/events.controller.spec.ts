import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus } from './entities/event.entity';
import { UserRole, UserStatus } from '../users/entities/user.entity';

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: jest.Mocked<EventsService>;

  const mockEvent = {
    id: '1',
    title: 'Test Event',
    description: 'Test Description',
    location: 'Test Location',
    startDate: new Date('2024-12-31T10:00:00Z'),
    endDate: new Date('2024-12-31T18:00:00Z'),
    maxCapacity: 100,
    basePrice: 50.0,
    imageUrl: 'test-image.jpg',
    status: EventStatus.PUBLISHED,
    organizerId: 'organizer-1',
    organizer: {
      id: 'organizer-1',
      email: 'organizer@example.com',
      firstName: 'John',
      lastName: 'Organizer',
      phone: '1234567890',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      profileImage: '',
      emailVerified: true,
      emailVerificationToken: '',
      resetPasswordExpires: new Date(),
      resetPasswordToken: '',
    },
    tickets: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResponse = {
    events: [mockEvent],
    total: 1,
    page: 1,
    limit: 10,
  };

  const mockUser = {
    id: 'organizer-1',
    email: 'organizer@example.com',
    role: UserRole.EVENT_ORGANIZER,
  };

  beforeEach(async () => {
    const mockEventsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByOrganizer: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    eventsService = module.get(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const createEventDto: CreateEventDto = {
        title: 'New Event',
        description: 'New Description',
        location: 'New Location',
        startDate: '2024-12-31T10:00:00Z',
        endDate: '2024-12-31T18:00:00Z',
        maxCapacity: 100,
        basePrice: 50.0,
        imageUrl: 'new-image.jpg',
      };

      const mockRequest = { user: mockUser };

      eventsService.create.mockResolvedValue(mockEvent as any);

      const result = await controller.create(createEventDto, mockRequest);

      expect(result).toEqual(mockEvent);
      expect(eventsService.create).toHaveBeenCalledWith(
        createEventDto,
        mockUser.id,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated events without filters', async () => {
      eventsService.findAll.mockResolvedValue(mockPaginatedResponse as any);

      const result = await controller.findAll();

      expect(result).toEqual(mockPaginatedResponse);
      expect(eventsService.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
      );
    });

    it('should return paginated events with pagination parameters', async () => {
      eventsService.findAll.mockResolvedValue(mockPaginatedResponse as any);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(mockPaginatedResponse);
      expect(eventsService.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });

    it('should return paginated events with status filter', async () => {
      eventsService.findAll.mockResolvedValue(mockPaginatedResponse as any);

      const result = await controller.findAll(1, 10, EventStatus.PUBLISHED);

      expect(result).toEqual(mockPaginatedResponse);
      expect(eventsService.findAll).toHaveBeenCalledWith(
        1,
        10,
        EventStatus.PUBLISHED,
      );
    });
  });

  describe('findMyEvents', () => {
    it('should return events by organizer', async () => {
      const mockRequest = { user: mockUser };

      eventsService.findByOrganizer.mockResolvedValue(
        mockPaginatedResponse as any,
      );

      const result = await controller.findMyEvents(mockRequest);

      expect(result).toEqual(mockPaginatedResponse);
      expect(eventsService.findByOrganizer).toHaveBeenCalledWith(
        mockUser.id,
        undefined,
        undefined,
      );
    });

    it('should return events by organizer with pagination', async () => {
      const mockRequest = { user: mockUser };

      eventsService.findByOrganizer.mockResolvedValue(
        mockPaginatedResponse as any,
      );

      const result = await controller.findMyEvents(mockRequest, 1, 10);

      expect(result).toEqual(mockPaginatedResponse);
      expect(eventsService.findByOrganizer).toHaveBeenCalledWith(
        mockUser.id,
        1,
        10,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single event', async () => {
      eventsService.findOne.mockResolvedValue(mockEvent as any);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockEvent);
      expect(eventsService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
        description: 'Updated Description',
      };

      const mockRequest = { user: mockUser };
      const updatedEvent = { ...mockEvent, ...updateEventDto };

      eventsService.update.mockResolvedValue(updatedEvent as any);

      const result = await controller.update('1', updateEventDto, mockRequest);

      expect(result).toEqual(updatedEvent);
      expect(eventsService.update).toHaveBeenCalledWith(
        '1',
        updateEventDto,
        mockUser.id,
        mockUser.role,
      );
    });
  });

  describe('remove', () => {
    it('should remove an event', async () => {
      const mockRequest = { user: mockUser };

      eventsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1', mockRequest);

      expect(result).toBeUndefined();
      expect(eventsService.remove).toHaveBeenCalledWith(
        '1',
        mockUser.id,
        mockUser.role,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update event status', async () => {
      const mockRequest = { user: mockUser };
      const updatedEvent = { ...mockEvent, status: EventStatus.CANCELLED };

      eventsService.updateStatus.mockResolvedValue(updatedEvent as any);

      const result = await controller.updateStatus(
        '1',
        EventStatus.CANCELLED,
        mockRequest,
      );

      expect(result).toEqual(updatedEvent);
      expect(eventsService.updateStatus).toHaveBeenCalledWith(
        '1',
        EventStatus.CANCELLED,
        mockUser.id,
        mockUser.role,
      );
    });
  });
});
