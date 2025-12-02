import { Test, TestingModule } from '@nestjs/testing';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

describe('JournalController', () => {
  let controller: JournalController;
  let service: JournalService;

  const mockJournalEntry = {
    id: 'test-entry-id',
    title: 'Test Entry',
    content: 'This is a test journal entry content.',
    userId: 'user-123',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  const mockJournalService = {
    create: jest.fn(),
    findAll: jest.fn(),
    searchByDate: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: { uid: 'user-123' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JournalController],
      providers: [
        {
          provide: JournalService,
          useValue: mockJournalService,
        },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<JournalController>(JournalController);
    service = module.get<JournalService>(JournalService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new journal entry', async () => {
      const createEntryDto = {
        title: 'Test Entry',
        content: 'Test content',
      };

      mockJournalService.create.mockResolvedValue(mockJournalEntry);

      const result = await controller.create(mockRequest, createEntryDto);

      expect(service.create).toHaveBeenCalledWith('user-123', createEntryDto);
      expect(result).toEqual(mockJournalEntry);
    });

    it('should create entry without title', async () => {
      const createEntryDto = {
        content: 'Content only',
      };

      const entryWithoutTitle = { ...mockJournalEntry, title: undefined };
      mockJournalService.create.mockResolvedValue(entryWithoutTitle);

      const result = await controller.create(mockRequest, createEntryDto);

      expect(service.create).toHaveBeenCalledWith('user-123', createEntryDto);
      expect(result.title).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return all journal entries when no search provided', async () => {
      const mockEntries = [
        mockJournalEntry,
        { ...mockJournalEntry, id: 'entry-2', title: 'Entry 2' }
      ];
      mockJournalService.findAll.mockResolvedValue(mockEntries);

      const result = await controller.findAll(mockRequest, undefined);

      expect(service.findAll).toHaveBeenCalledWith('user-123', undefined);
      expect(result).toEqual(mockEntries);
    });

    it('should search entries when search query provided', async () => {
      const mockEntries = [mockJournalEntry];
      mockJournalService.findAll.mockResolvedValue(mockEntries);

      const result = await controller.findAll(mockRequest, 'test query');

      expect(service.findAll).toHaveBeenCalledWith('user-123', 'test query');
      expect(result).toEqual(mockEntries);
    });

    it('should return empty array when user has no entries', async () => {
      mockJournalService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest, undefined);

      expect(result).toEqual([]);
    });
  });

  describe('searchByDate', () => {
    it('should find entries by date range', async () => {
      const mockEntries = [mockJournalEntry];
      mockJournalService.searchByDate.mockResolvedValue(mockEntries);

      const result = await controller.searchByDate(mockRequest, '2023-01-01', '2023-01-31');

      expect(service.searchByDate).toHaveBeenCalledWith(
        'user-123',
        '2023-01-01',
        '2023-01-31'
      );
      expect(result).toEqual(mockEntries);
    });

    it('should handle missing end date parameter', async () => {
      const mockEntries = [];
      mockJournalService.searchByDate.mockResolvedValue(mockEntries);

      const result = await controller.searchByDate(mockRequest, '2023-01-01', undefined);

      expect(service.searchByDate).toHaveBeenCalledWith(
        'user-123',
        '2023-01-01',
        undefined
      );
      expect(result).toEqual(mockEntries);
    });
  });

  describe('findOne', () => {
    it('should return a specific journal entry by id', async () => {
      mockJournalService.findOne.mockResolvedValue(mockJournalEntry);

      const result = await controller.findOne(mockRequest, 'test-entry-id');

      expect(service.findOne).toHaveBeenCalledWith('user-123', 'test-entry-id');
      expect(result).toEqual(mockJournalEntry);
    });
  });

  describe('update', () => {
    it('should update a journal entry', async () => {
      const updateDto = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const updatedEntry = {
        ...mockJournalEntry,
        title: 'Updated Title',
        content: 'Updated content',
        updatedAt: '2023-01-02T00:00:00.000Z',
      };

      mockJournalService.update.mockResolvedValue(updatedEntry);

      const result = await controller.update(mockRequest, 'test-entry-id', updateDto);

      expect(service.update).toHaveBeenCalledWith('user-123', 'test-entry-id', updateDto);
      expect(result).toEqual(updatedEntry);
    });

    it('should update with partial data', async () => {
      const updateDto = {
        title: 'Only Title Updated',
      };

      const updatedEntry = {
        ...mockJournalEntry,
        title: 'Only Title Updated',
        updatedAt: '2023-01-02T00:00:00.000Z',
      };

      mockJournalService.update.mockResolvedValue(updatedEntry);

      const result = await controller.update(mockRequest, 'test-entry-id', updateDto);

      expect(service.update).toHaveBeenCalledWith('user-123', 'test-entry-id', updateDto);
      expect(result).toEqual(updatedEntry);
    });
  });

  describe('remove', () => {
    it('should delete a journal entry', async () => {
      const deleteResponse = { message: 'Journal entry deleted successfully' };
      mockJournalService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove(mockRequest, 'test-entry-id');

      expect(service.remove).toHaveBeenCalledWith('user-123', 'test-entry-id');
      expect(result).toEqual(deleteResponse);
    });
  });

  describe('search functionality', () => {
    it('should handle empty search strings', async () => {
      const mockEntries = [mockJournalEntry];
      mockJournalService.findAll.mockResolvedValue(mockEntries);

      const result = await controller.findAll(mockRequest, '');

      expect(service.findAll).toHaveBeenCalledWith('user-123', '');
      expect(result).toEqual(mockEntries);
    });

    it('should handle search with special characters', async () => {
      const mockEntries = [mockJournalEntry];
      mockJournalService.findAll.mockResolvedValue(mockEntries);

      const result = await controller.findAll(mockRequest, 'test @#$%');

      expect(service.findAll).toHaveBeenCalledWith('user-123', 'test @#$%');
      expect(result).toEqual(mockEntries);
    });

    it('should pass search query directly to service', async () => {
      const mockEntries = [mockJournalEntry];
      mockJournalService.findAll.mockResolvedValue(mockEntries);

      const result = await controller.findAll(mockRequest, '  test query  ');

      expect(service.findAll).toHaveBeenCalledWith('user-123', '  test query  ');
    });
  });

  describe('authentication', () => {
    it('should be protected by FirebaseAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', JournalController);
      expect(guards).toContain(FirebaseAuthGuard);
    });
  });

  describe('error handling', () => {
    it('should propagate service errors', async () => {
      const error = new Error('Service error');
      mockJournalService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(mockRequest, 'non-existent')).rejects.toThrow(error);
    });

    it('should handle network timeouts and service unavailability', async () => {
      const timeoutError = new Error('TIMEOUT');
      mockJournalService.findAll.mockRejectedValue(timeoutError);

      await expect(controller.findAll(mockRequest, {})).rejects.toThrow(timeoutError);
    });
  });
});