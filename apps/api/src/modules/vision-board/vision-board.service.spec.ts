import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { VisionBoardService } from './vision-board.service';
import { FirebaseService } from '../../config/firebase.service';
import { CloudinaryService } from '../../config/cloudinary.service';

jest.mock('firebase-admin', () => ({
  firestore: {
    FieldValue: { serverTimestamp: () => 'SERVER_TIMESTAMP' },
  },
}));

describe('VisionBoardService', () => {
  let service: VisionBoardService;

  const mockBatch = {
    update: jest.fn(),
    commit: jest.fn(),
  };

  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    add: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    batch: jest.fn().mockReturnValue(mockBatch),
  };

  const mockFirebaseService = { getFirestore: jest.fn(() => mockFirestore) };
  const mockCloudinaryService = {
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  };

  const USER = 'user-123';

  const mockItem = {
    id: 'item-1',
    userId: USER,
    title: 'My Dream',
    imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/dream.jpg',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const docOf = (id: string, data: object) => ({
    exists: true,
    id,
    data: () => data,
  });

  const snap = (items: { id: string; data: object }[]) => ({
    docs: items.map((d) => ({ id: d.id, data: () => d.data })),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisionBoardService,
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    service = module.get<VisionBoardService>(VisionBoardService);

    jest.resetAllMocks();
    mockFirestore.collection.mockReturnThis();
    mockFirestore.where.mockReturnThis();
    mockFirestore.orderBy.mockReturnThis();
    mockFirestore.doc.mockReturnThis();
    mockFirestore.batch.mockReturnValue(mockBatch);
    mockBatch.commit.mockResolvedValue(undefined);
    mockFirebaseService.getFirestore.mockReturnValue(mockFirestore);
  });

  // ─── uploadImage ────────────────────────────────────────────────────────────

  describe('uploadImage', () => {
    const file = (mimetype: string, size: number) =>
      ({ mimetype, size, buffer: Buffer.from('img') }) as any;

    it('rejects unsupported MIME type', async () => {
      await expect(service.uploadImage(USER, file('image/gif', 100))).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects file exceeding 1MB', async () => {
      await expect(
        service.uploadImage(USER, file('image/png', 2 * 1024 * 1024)),
      ).rejects.toThrow(BadRequestException);
    });

    it('uploads valid file to Cloudinary and returns URL', async () => {
      mockCloudinaryService.uploadImage.mockResolvedValue(
        'https://res.cloudinary.com/test/image/upload/v1/dream.jpg',
      );

      const result = await service.uploadImage(USER, file('image/png', 500 * 1024));

      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(expect.any(Buffer), USER);
      expect(result.imageUrl).toContain('cloudinary.com');
    });

    it('throws BadRequestException if Cloudinary upload fails', async () => {
      mockCloudinaryService.uploadImage.mockRejectedValue(new Error('network error'));

      await expect(service.uploadImage(USER, file('image/jpeg', 100))).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates item and returns persisted doc', async () => {
      const docRef = { get: jest.fn().mockResolvedValue(docOf('item-1', mockItem)) };
      mockFirestore.add.mockResolvedValue(docRef);

      const result = await service.create(USER, {
        title: 'My Dream',
        imageUrl: 'https://res.cloudinary.com/test/image/upload/dream.jpg',
      } as any) as any;

      expect(mockFirestore.add).toHaveBeenCalled();
      expect(result.id).toBe('item-1');
    });

    it('rejects non-Cloudinary image URL', async () => {
      await expect(
        service.create(USER, {
          title: 'Hack',
          imageUrl: 'https://evil.com/malware.exe',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('defaults isActive to true when not provided', async () => {
      const docRef = { get: jest.fn().mockResolvedValue(docOf('item-2', mockItem)) };
      mockFirestore.add.mockResolvedValue(docRef);

      await service.create(USER, {
        title: 'X',
        imageUrl: 'https://res.cloudinary.com/x/image/upload/x.jpg',
      } as any);

      const addArg = mockFirestore.add.mock.calls[0][0];
      expect(addArg.isActive).toBe(true);
    });
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    // data passed to snap must NOT include 'id' — service does { id: doc.id, ...doc.data() }
    // so any 'id' in data() would overwrite doc.id
    const itemData = { userId: USER, title: 'My Dream', imageUrl: mockItem.imageUrl };

    it('returns only active items by default', async () => {
      mockFirestore.get.mockResolvedValue(
        snap([
          { id: 'a', data: { ...itemData, isActive: true } },
          { id: 'b', data: { ...itemData, isActive: false } },
        ]),
      );

      const result = await service.findAll(USER) as any[];

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('a');
    });

    it('returns archived (inactive) items when archived=true', async () => {
      mockFirestore.get.mockResolvedValue(
        snap([
          { id: 'a', data: { ...itemData, isActive: true } },
          { id: 'b', data: { ...itemData, isActive: false } },
        ]),
      );

      const result = await service.findAll(USER, true) as any[];

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('b');
    });

    it('treats items with undefined isActive as active (legacy)', async () => {
      mockFirestore.get.mockResolvedValue(
        snap([{ id: 'legacy', data: { userId: USER, title: 'Old Item' } }]),
      );

      const result = await service.findAll(USER) as any[];

      expect(result).toHaveLength(1);
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns item when owner matches', async () => {
      mockFirestore.get.mockResolvedValue(docOf('item-1', mockItem));

      const result = await service.findOne(USER, 'item-1') as any;

      expect(result.id).toBe('item-1');
      expect(result.title).toBe('My Dream');
    });

    it('throws BadRequestException when item not found', async () => {
      mockFirestore.get.mockResolvedValue({ exists: false });

      await expect(service.findOne(USER, 'ghost')).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException for wrong owner', async () => {
      mockFirestore.get.mockResolvedValue(docOf('item-1', { ...mockItem, userId: 'other' }));

      await expect(service.findOne(USER, 'item-1')).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates fields and returns updated doc', async () => {
      const updated = { ...mockItem, title: 'Updated Dream' };
      mockFirestore.get
        .mockResolvedValueOnce(docOf('item-1', mockItem))
        .mockResolvedValueOnce(docOf('item-1', updated));

      const result = await service.update(USER, 'item-1', { title: 'Updated Dream' } as any) as any;

      expect(mockFirestore.update).toHaveBeenCalled();
      expect(result.title).toBe('Updated Dream');
    });

    it('throws BadRequestException when item not found', async () => {
      mockFirestore.get.mockResolvedValue({ exists: false });

      await expect(service.update(USER, 'ghost', {} as any)).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException for wrong owner', async () => {
      mockFirestore.get.mockResolvedValue(docOf('item-1', { ...mockItem, userId: 'other' }));

      await expect(service.update(USER, 'item-1', {} as any)).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes item and removes image from Cloudinary', async () => {
      mockFirestore.get.mockResolvedValue(docOf('item-1', mockItem));
      mockCloudinaryService.deleteImage.mockResolvedValue(undefined);

      const result = await service.remove(USER, 'item-1');

      expect(mockCloudinaryService.deleteImage).toHaveBeenCalledWith(mockItem.imageUrl);
      expect(mockFirestore.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Vision board item deleted successfully' });
    });

    it('still deletes item even if Cloudinary deletion fails', async () => {
      mockFirestore.get.mockResolvedValue(docOf('item-1', mockItem));
      mockCloudinaryService.deleteImage.mockRejectedValue(new Error('cdn error'));

      const result = await service.remove(USER, 'item-1');

      expect(mockFirestore.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Vision board item deleted successfully' });
    });

    it('throws BadRequestException when item not found', async () => {
      mockFirestore.get.mockResolvedValue({ exists: false });

      await expect(service.remove(USER, 'ghost')).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException for wrong owner', async () => {
      mockFirestore.get.mockResolvedValue(docOf('item-1', { ...mockItem, userId: 'other' }));

      await expect(service.remove(USER, 'item-1')).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── updateOrder ────────────────────────────────────────────────────────────

  describe('updateOrder', () => {
    it('applies batch update for each owned item', async () => {
      mockFirestore.get.mockResolvedValue(docOf('item-1', mockItem));

      await service.updateOrder(USER, [{ id: 'item-1', order: 0 }]);

      expect(mockBatch.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ order: 0 }),
      );
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('skips items that do not exist', async () => {
      mockFirestore.get.mockResolvedValue({ exists: false });

      const result = await service.updateOrder(USER, [{ id: 'ghost', order: 0 }]);

      expect(mockBatch.update).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Order updated successfully' });
    });

    it('throws ForbiddenException if an item belongs to another user', async () => {
      mockFirestore.get.mockResolvedValue(docOf('item-x', { ...mockItem, userId: 'other' }));

      await expect(
        service.updateOrder(USER, [{ id: 'item-x', order: 0 }]),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── toggleArchive ───────────────────────────────────────────────────────────

  describe('toggleArchive', () => {
    it('archives an active item', async () => {
      const archivedItem = { ...mockItem, isActive: false };
      mockFirestore.get
        .mockResolvedValueOnce(docOf('item-1', mockItem))       // findOne
        .mockResolvedValueOnce(docOf('item-1', archivedItem));  // final get

      const result = await service.toggleArchive(USER, 'item-1') as any;

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
      expect(result.isActive).toBe(false);
    });

    it('restores an archived item', async () => {
      const archivedItem = { ...mockItem, isActive: false };
      const restoredItem = { ...mockItem, isActive: true };
      mockFirestore.get
        .mockResolvedValueOnce(docOf('item-1', archivedItem))
        .mockResolvedValueOnce(docOf('item-1', restoredItem));

      const result = await service.toggleArchive(USER, 'item-1') as any;

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
      expect(result.isActive).toBe(true);
    });

    it('treats legacy item with undefined isActive as active, archives it', async () => {
      const legacyItem = { userId: USER, title: 'Legacy', imageUrl: 'https://res.cloudinary.com/x/y.jpg' };
      mockFirestore.get
        .mockResolvedValueOnce(docOf('item-1', legacyItem))
        .mockResolvedValueOnce(docOf('item-1', { ...legacyItem, isActive: false }));

      await service.toggleArchive(USER, 'item-1');

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });
  });
});
