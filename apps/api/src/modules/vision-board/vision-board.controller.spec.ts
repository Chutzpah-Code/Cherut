import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { VisionBoardController } from './vision-board.controller';
import { VisionBoardService } from './vision-board.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

describe('VisionBoardController', () => {
  let controller: VisionBoardController;
  let service: VisionBoardService;

  const mockService = {
    uploadImage: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateOrder: jest.fn(),
    toggleArchive: jest.fn(),
  };

  const req = { user: { uid: 'user-123' } };

  const mockItem = {
    id: 'item-1',
    userId: 'user-123',
    title: 'My Dream',
    imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/dream.jpg',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisionBoardController],
      providers: [{ provide: VisionBoardService, useValue: mockService }],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<VisionBoardController>(VisionBoardController);
    service = module.get<VisionBoardService>(VisionBoardService);
    jest.clearAllMocks();
  });

  describe('authentication', () => {
    it('should be protected by FirebaseAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', VisionBoardController);
      expect(guards).toContain(FirebaseAuthGuard);
    });
  });

  describe('uploadImage', () => {
    it('throws BadRequestException when no file is provided', async () => {
      await expect(controller.uploadImage(undefined as any, req)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('delegates to service with userId and file', async () => {
      const file = { mimetype: 'image/png', buffer: Buffer.from('x'), size: 100 } as any;
      mockService.uploadImage.mockResolvedValue({ imageUrl: 'https://res.cloudinary.com/x/y.jpg' });

      const result = await controller.uploadImage(file, req);

      expect(service.uploadImage).toHaveBeenCalledWith('user-123', file);
      expect(result).toEqual({ imageUrl: expect.stringContaining('cloudinary') });
    });
  });

  describe('create', () => {
    it('passes userId and dto to service', async () => {
      const dto = { title: 'Dream', imageUrl: 'https://res.cloudinary.com/x/y.jpg' } as any;
      mockService.create.mockResolvedValue(mockItem);

      await controller.create(dto, req);

      expect(service.create).toHaveBeenCalledWith('user-123', dto);
    });
  });

  describe('findAll', () => {
    it('passes archived=true when query param is "true"', async () => {
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(req, 'true');

      expect(service.findAll).toHaveBeenCalledWith('user-123', true);
    });

    it('passes archived=false when query param is absent', async () => {
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(req, undefined);

      expect(service.findAll).toHaveBeenCalledWith('user-123', false);
    });

    it('passes archived=false when query param is "false"', async () => {
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(req, 'false');

      expect(service.findAll).toHaveBeenCalledWith('user-123', false);
    });
  });

  describe('findOne', () => {
    it('passes id and userId to service', async () => {
      mockService.findOne.mockResolvedValue(mockItem);

      await controller.findOne('item-1', req);

      expect(service.findOne).toHaveBeenCalledWith('user-123', 'item-1');
    });
  });

  describe('update', () => {
    it('passes id, dto and userId to service', async () => {
      const dto = { title: 'Updated' } as any;
      mockService.update.mockResolvedValue({ ...mockItem, title: 'Updated' });

      await controller.update('item-1', dto, req);

      expect(service.update).toHaveBeenCalledWith('user-123', 'item-1', dto);
    });
  });

  describe('remove', () => {
    it('passes id and userId to service', async () => {
      mockService.remove.mockResolvedValue({ message: 'Vision board item deleted successfully' });

      await controller.remove('item-1', req);

      expect(service.remove).toHaveBeenCalledWith('user-123', 'item-1');
    });
  });

  describe('updateOrder', () => {
    it('passes userId and items list to service', async () => {
      const body = { items: [{ id: 'item-1', order: 0 }, { id: 'item-2', order: 1 }] };
      mockService.updateOrder.mockResolvedValue({ message: 'Order updated successfully' });

      await controller.updateOrder(body, req);

      expect(service.updateOrder).toHaveBeenCalledWith('user-123', body.items);
    });
  });

  describe('toggleArchive', () => {
    it('passes id and userId to service', async () => {
      mockService.toggleArchive.mockResolvedValue({ ...mockItem, isActive: false });

      await controller.toggleArchive('item-1', req);

      expect(service.toggleArchive).toHaveBeenCalledWith('user-123', 'item-1');
    });
  });
});
