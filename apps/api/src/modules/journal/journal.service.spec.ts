import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { JournalService } from './journal.service';
import { FirebaseService } from '../../config/firebase.service';

describe('JournalService', () => {
  let service: JournalService;
  let firebaseService: FirebaseService;

  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    add: jest.fn(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    get: jest.fn(),
    doc: jest.fn().mockReturnThis(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockFirebaseService = {
    getFirestore: jest.fn(() => mockFirestore),
  };

  const mockJournalEntry = {
    id: 'test-entry-id',
    title: 'Test Entry',
    content: 'This is a test journal entry content.',
    userId: 'user-123',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JournalService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<JournalService>(JournalService);
    firebaseService = module.get<FirebaseService>(FirebaseService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new journal entry successfully', async () => {
      const createEntryDto = {
        title: 'Test Entry',
        content: 'This is a test content.',
      };

      const mockDocRef = { id: 'new-entry-id' };
      mockFirestore.add.mockResolvedValue(mockDocRef);

      const result = await service.create('user-123', createEntryDto);

      expect(mockFirestore.collection).toHaveBeenCalledWith('journalEntries');
      expect(mockFirestore.add).toHaveBeenCalledWith({
        title: 'Test Entry',
        content: 'This is a test content.',
        userId: 'user-123',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(result.id).toBe('new-entry-id');
      expect(result.title).toBe('Test Entry');
      expect(result.content).toBe('This is a test content.');
    });

    it('should create entry without title', async () => {
      const createEntryDto = {
        content: 'Content without title.',
      };

      const mockDocRef = { id: 'no-title-entry' };
      mockFirestore.add.mockResolvedValue(mockDocRef);

      const result = await service.create('user-123', createEntryDto);

      expect(mockFirestore.add).toHaveBeenCalledWith({
        content: 'Content without title.',
        userId: 'user-123',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(result.content).toBe('Content without title.');
    });
  });

  describe('findAll', () => {
    it('should return all journal entries for a user', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'entry-2',
            data: () => ({
              title: 'Entry 2',
              content: 'Content 2',
              userId: 'user-123',
              createdAt: '2023-01-02T00:00:00.000Z'
            }),
          },
          {
            id: 'entry-1',
            data: () => ({
              title: 'Entry 1',
              content: 'Content 1',
              userId: 'user-123',
              createdAt: '2023-01-01T00:00:00.000Z'
            }),
          },
        ],
      };

      mockFirestore.get.mockResolvedValue(mockSnapshot);

      const result = await service.findAll('user-123');

      expect(mockFirestore.collection).toHaveBeenCalledWith('journalEntries');
      expect(mockFirestore.where).toHaveBeenCalledWith('userId', '==', 'user-123');
      expect(result).toHaveLength(2);
      // Should be sorted by createdAt desc (newest first)
      expect(result[0].id).toBe('entry-2');
      expect(result[1].id).toBe('entry-1');
    });

    it('should return empty array when no entries found', async () => {
      const mockSnapshot = { docs: [] };
      mockFirestore.get.mockResolvedValue(mockSnapshot);

      const result = await service.findAll('user-123');

      expect(result).toEqual([]);
    });

    it('should filter entries by search term', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'entry-1',
            data: () => ({
              title: 'Important Meeting',
              content: 'Content 1',
              userId: 'user-123',
              createdAt: '2023-01-01T00:00:00.000Z'
            }),
          },
          {
            id: 'entry-2',
            data: () => ({
              title: 'Daily Notes',
              content: 'Content 2',
              userId: 'user-123',
              createdAt: '2023-01-02T00:00:00.000Z'
            }),
          },
        ],
      };

      mockFirestore.get.mockResolvedValue(mockSnapshot);

      const result = await service.findAll('user-123', 'meeting');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Important Meeting');
    });
  });


  describe('findOne', () => {
    it('should return a journal entry by id', async () => {
      const mockDoc = {
        exists: true,
        id: 'entry-1',
        data: () => ({
          title: 'Test Entry',
          content: 'Test content',
          userId: 'user-123'
        }),
      };

      mockFirestore.get.mockResolvedValue(mockDoc);

      const result = await service.findOne('user-123', 'entry-1');

      expect(mockFirestore.collection).toHaveBeenCalledWith('journalEntries');
      expect(mockFirestore.doc).toHaveBeenCalledWith('entry-1');
      expect(result.id).toBe('entry-1');
      expect(result.title).toBe('Test Entry');
    });

    it('should throw NotFoundException when entry not found', async () => {
      const mockDoc = { exists: false };
      mockFirestore.get.mockResolvedValue(mockDoc);

      await expect(service.findOne('user-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when entry belongs to different user', async () => {
      const mockDoc = {
        exists: true,
        data: () => ({ title: 'Entry', userId: 'other-user' }),
      };

      mockFirestore.get.mockResolvedValue(mockDoc);

      await expect(service.findOne('user-123', 'entry-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a journal entry successfully', async () => {
      const updateDto = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockJournalEntry)
        .mockResolvedValueOnce({
          ...mockJournalEntry,
          title: 'Updated Title',
          content: 'Updated content',
        });

      const result = await service.update('user-123', 'entry-1', updateDto);

      expect(mockFirestore.update).toHaveBeenCalledWith({
        title: 'Updated Title',
        content: 'Updated content',
        updatedAt: expect.any(String),
      });
      expect(result.title).toBe('Updated Title');
      expect(result.content).toBe('Updated content');
    });

    it('should filter out undefined values in update', async () => {
      const updateDto = {
        title: 'Updated Title',
        content: undefined,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockJournalEntry);

      await service.update('user-123', 'entry-1', updateDto);

      expect(mockFirestore.update).toHaveBeenCalledWith({
        title: 'Updated Title',
        updatedAt: expect.any(String),
      });
    });
  });

  describe('remove', () => {
    it('should delete a journal entry successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockJournalEntry);

      const result = await service.remove('user-123', 'entry-1');

      expect(mockFirestore.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Journal entry deleted successfully' });
    });

    it('should throw error if entry does not exist', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.remove('user-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});