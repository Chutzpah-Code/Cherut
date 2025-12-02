import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ValuesService } from './values.service';
import { FirebaseService } from '../../config/firebase.service';
import { CreateValueDto, UpdateValueDto } from './dto';

describe('ValuesService', () => {
  let service: ValuesService;
  let firebaseService: FirebaseService;

  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    add: jest.fn(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn(),
    doc: jest.fn().mockReturnThis(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockFirebaseService = {
    getFirestore: jest.fn(() => mockFirestore),
  };

  const mockValue = {
    id: 'test-value-id',
    title: 'Test Value',
    shortDescription: 'Test description',
    behaviors: 'Test behaviors',
    userId: 'user-123',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValuesService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<ValuesService>(ValuesService);
    firebaseService = module.get<FirebaseService>(FirebaseService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new value successfully', async () => {
      const createValueDto: CreateValueDto = {
        title: 'Test Value',
        shortDescription: 'Test description',
        behaviors: 'Test behaviors',
      };

      const mockDocRef = { id: 'new-value-id' };
      mockFirestore.add.mockResolvedValue(mockDocRef);

      const result = await service.create('user-123', createValueDto);

      expect(mockFirestore.collection).toHaveBeenCalledWith('values');
      expect(mockFirestore.add).toHaveBeenCalledWith({
        title: 'Test Value',
        shortDescription: 'Test description',
        behaviors: 'Test behaviors',
        userId: 'user-123',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(result).toEqual({
        id: 'new-value-id',
        title: 'Test Value',
        shortDescription: 'Test description',
        behaviors: 'Test behaviors',
        userId: 'user-123',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should create value with only required fields', async () => {
      const createValueDto: CreateValueDto = {
        title: 'Required Only',
      };

      const mockDocRef = { id: 'minimal-value-id' };
      mockFirestore.add.mockResolvedValue(mockDocRef);

      const result = await service.create('user-123', createValueDto);

      expect(mockFirestore.add).toHaveBeenCalledWith({
        title: 'Required Only',
        userId: 'user-123',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(result.title).toBe('Required Only');
    });

    it('should filter out undefined values', async () => {
      const createValueDto: CreateValueDto = {
        title: 'Test',
        shortDescription: undefined,
        behaviors: 'Some behaviors',
      };

      const mockDocRef = { id: 'filtered-value-id' };
      mockFirestore.add.mockResolvedValue(mockDocRef);

      await service.create('user-123', createValueDto);

      expect(mockFirestore.add).toHaveBeenCalledWith({
        title: 'Test',
        behaviors: 'Some behaviors',
        userId: 'user-123',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('findAll', () => {
    it('should return all values for a user', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'value-1',
            data: () => ({ title: 'Value 1', userId: 'user-123' }),
          },
          {
            id: 'value-2',
            data: () => ({ title: 'Value 2', userId: 'user-123' }),
          },
        ],
      };

      mockFirestore.get.mockResolvedValue(mockSnapshot);

      const result = await service.findAll('user-123');

      expect(mockFirestore.collection).toHaveBeenCalledWith('values');
      expect(mockFirestore.where).toHaveBeenCalledWith('userId', '==', 'user-123');
      expect(result).toEqual([
        { id: 'value-1', title: 'Value 1', userId: 'user-123' },
        { id: 'value-2', title: 'Value 2', userId: 'user-123' },
      ]);
    });

    it('should return empty array when no values found', async () => {
      const mockSnapshot = { docs: [] };
      mockFirestore.get.mockResolvedValue(mockSnapshot);

      const result = await service.findAll('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a value by id', async () => {
      const mockDoc = {
        exists: true,
        id: 'value-1',
        data: () => ({ title: 'Test Value', userId: 'user-123' }),
      };

      mockFirestore.get.mockResolvedValue(mockDoc);

      const result = await service.findOne('user-123', 'value-1');

      expect(mockFirestore.collection).toHaveBeenCalledWith('values');
      expect(mockFirestore.doc).toHaveBeenCalledWith('value-1');
      expect(result).toEqual({
        id: 'value-1',
        title: 'Test Value',
        userId: 'user-123',
      });
    });

    it('should throw NotFoundException when value not found', async () => {
      const mockDoc = { exists: false };
      mockFirestore.get.mockResolvedValue(mockDoc);

      await expect(service.findOne('user-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('user-123', 'non-existent')).rejects.toThrow(
        'Value non-existent not found',
      );
    });

    it('should throw NotFoundException when value belongs to different user', async () => {
      const mockDoc = {
        exists: true,
        data: () => ({ title: 'Test Value', userId: 'other-user' }),
      };

      mockFirestore.get.mockResolvedValue(mockDoc);

      await expect(service.findOne('user-123', 'value-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a value successfully', async () => {
      const updateValueDto: UpdateValueDto = {
        title: 'Updated Title',
        behaviors: 'Updated behaviors',
      };

      const mockDoc = {
        exists: true,
        id: 'value-1',
        data: () => ({ title: 'Old Title', userId: 'user-123' }),
      };

      mockFirestore.get.mockResolvedValue(mockDoc);

      // Mock findOne to return updated value
      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockValue) // First call in update method
        .mockResolvedValueOnce({ // Second call at the end
          ...mockValue,
          title: 'Updated Title',
          behaviors: 'Updated behaviors',
          updatedAt: expect.any(String),
        });

      const result = await service.update('user-123', 'value-1', updateValueDto);

      expect(mockFirestore.update).toHaveBeenCalledWith({
        title: 'Updated Title',
        behaviors: 'Updated behaviors',
        updatedAt: expect.any(String),
      });
      expect(result.title).toBe('Updated Title');
    });

    it('should filter out undefined values in update', async () => {
      const updateValueDto: UpdateValueDto = {
        title: 'Updated Title',
        shortDescription: undefined,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockValue);

      await service.update('user-123', 'value-1', updateValueDto);

      expect(mockFirestore.update).toHaveBeenCalledWith({
        title: 'Updated Title',
        updatedAt: expect.any(String),
      });
    });
  });

  describe('remove', () => {
    it('should delete a value successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockValue);

      const result = await service.remove('user-123', 'value-1');

      expect(mockFirestore.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Value deleted successfully' });
    });

    it('should throw error if value does not exist', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.remove('user-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});