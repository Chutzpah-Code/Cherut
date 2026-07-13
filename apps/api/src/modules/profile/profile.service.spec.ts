import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { FirebaseService } from '../../config/firebase.service';
import { CloudinaryService } from '../../config/cloudinary.service';

describe('ProfileService', () => {
  let service: ProfileService;

  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockFirebaseService = { getFirestore: jest.fn(() => mockFirestore) };
  const mockCloudinaryService = { uploadAvatar: jest.fn() };

  const USER = 'user-123';

  const mockProfile = {
    userId: USER,
    displayName: 'Test User',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const docOf = (data: object) => ({ exists: true, id: USER, data: () => data });
  const notFound = () => ({ exists: false });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);

    jest.resetAllMocks();
    mockFirestore.collection.mockReturnThis();
    mockFirestore.doc.mockReturnThis();
    mockFirebaseService.getFirestore.mockReturnValue(mockFirestore);
  });

  describe('create', () => {
    it('creates profile stored under userId as document id', async () => {
      mockFirestore.get.mockResolvedValue(notFound());
      mockFirestore.set.mockResolvedValue(undefined);

      const result = await service.create(USER, { displayName: 'Test User' } as any) as any;

      expect(mockFirestore.set).toHaveBeenCalled();
      expect(result.id).toBe(USER);
      expect(result.userId).toBe(USER);
    });

    it('throws ConflictException when profile already exists', async () => {
      mockFirestore.get.mockResolvedValue(docOf(mockProfile));

      await expect(service.create(USER, {} as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('returns profile when found', async () => {
      mockFirestore.get.mockResolvedValue(docOf(mockProfile));

      const result = await service.findOne(USER) as any;

      expect(result.id).toBe(USER);
      expect(result.displayName).toBe('Test User');
    });

    it('throws NotFoundException when not found', async () => {
      mockFirestore.get.mockResolvedValue(notFound());

      await expect(service.findOne(USER)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates profile and returns refreshed doc', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(mockProfile))
        .mockResolvedValueOnce(docOf({ ...mockProfile, displayName: 'Updated' }));
      mockFirestore.update.mockResolvedValue(undefined);

      const result = await service.update(USER, { displayName: 'Updated' } as any) as any;

      expect(mockFirestore.update).toHaveBeenCalled();
      expect(result.displayName).toBe('Updated');
    });

    it('strips undefined fields before updating', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docOf(mockProfile))
        .mockResolvedValueOnce(docOf(mockProfile));
      mockFirestore.update.mockResolvedValue(undefined);

      await service.update(USER, { displayName: 'X', bio: undefined } as any);

      const updates = mockFirestore.update.mock.calls[0][0];
      expect('bio' in updates).toBe(false);
    });
  });

  describe('remove', () => {
    it('deletes profile and returns success message', async () => {
      mockFirestore.get.mockResolvedValue(docOf(mockProfile));
      mockFirestore.delete.mockResolvedValue(undefined);

      const result = await service.remove(USER);

      expect(mockFirestore.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Profile deleted successfully' });
    });
  });

  describe('getOrCreate', () => {
    it('returns existing profile without creating', async () => {
      mockFirestore.get.mockResolvedValue(docOf(mockProfile));

      const result = await service.getOrCreate(USER) as any;

      expect(mockFirestore.set).not.toHaveBeenCalled();
      expect(result.id).toBe(USER);
    });

    it('creates profile when not found', async () => {
      mockFirestore.get.mockResolvedValueOnce(notFound()); // findOne inside getOrCreate
      mockFirestore.get.mockResolvedValueOnce(notFound()); // findOne inside create (exists check)
      mockFirestore.set.mockResolvedValue(undefined);

      await service.getOrCreate(USER, { displayName: 'New' } as any);

      expect(mockFirestore.set).toHaveBeenCalled();
    });
  });

  describe('updateAvatar', () => {
    it('uploads to cloudinary and updates avatarUrl on profile', async () => {
      mockCloudinaryService.uploadAvatar.mockResolvedValue('https://cdn.example.com/avatar.jpg');
      mockFirestore.get
        .mockResolvedValueOnce(docOf(mockProfile))   // findOne inside update
        .mockResolvedValueOnce(docOf({ ...mockProfile, avatarUrl: 'https://cdn.example.com/avatar.jpg' }));
      mockFirestore.update.mockResolvedValue(undefined);

      const result = await service.updateAvatar(USER, { buffer: Buffer.from('img') } as any);

      expect(mockCloudinaryService.uploadAvatar).toHaveBeenCalledWith(expect.any(Buffer), USER);
      expect(result.avatarUrl).toBe('https://cdn.example.com/avatar.jpg');
    });
  });
});
