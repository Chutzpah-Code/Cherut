import { Test, TestingModule } from '@nestjs/testing';
import { ValuesController } from './values.controller';
import { ValuesService } from './values.service';
import { CreateValueDto, UpdateValueDto } from './dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

describe('ValuesController', () => {
  let controller: ValuesController;
  let service: ValuesService;

  const mockValue = {
    id: 'test-value-id',
    title: 'Test Value',
    shortDescription: 'Test description',
    behaviors: 'Test behaviors',
    userId: 'user-123',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  const mockValuesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: { uid: 'user-123' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ValuesController],
      providers: [
        {
          provide: ValuesService,
          useValue: mockValuesService,
        },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ValuesController>(ValuesController);
    service = module.get<ValuesService>(ValuesService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new value', async () => {
      const createValueDto: CreateValueDto = {
        title: 'Test Value',
        shortDescription: 'Test description',
        behaviors: 'Test behaviors',
      };

      mockValuesService.create.mockResolvedValue(mockValue);

      const result = await controller.create(mockRequest, createValueDto);

      expect(service.create).toHaveBeenCalledWith('user-123', createValueDto);
      expect(result).toEqual(mockValue);
    });

    it('should create value with only title', async () => {
      const createValueDto: CreateValueDto = {
        title: 'Required Only',
      };

      const minimalValue = { ...mockValue, title: 'Required Only' };
      mockValuesService.create.mockResolvedValue(minimalValue);

      const result = await controller.create(mockRequest, createValueDto);

      expect(service.create).toHaveBeenCalledWith('user-123', createValueDto);
      expect(result).toEqual(minimalValue);
    });
  });

  describe('findAll', () => {
    it('should return all values for the authenticated user', async () => {
      const mockValues = [mockValue, { ...mockValue, id: 'value-2', title: 'Value 2' }];
      mockValuesService.findAll.mockResolvedValue(mockValues);

      const result = await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockValues);
    });

    it('should return empty array when user has no values', async () => {
      mockValuesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith('user-123');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific value by id', async () => {
      mockValuesService.findOne.mockResolvedValue(mockValue);

      const result = await controller.findOne(mockRequest, 'test-value-id');

      expect(service.findOne).toHaveBeenCalledWith('user-123', 'test-value-id');
      expect(result).toEqual(mockValue);
    });
  });

  describe('update', () => {
    it('should update a value', async () => {
      const updateValueDto: UpdateValueDto = {
        title: 'Updated Title',
        behaviors: 'Updated behaviors',
      };

      const updatedValue = {
        ...mockValue,
        title: 'Updated Title',
        behaviors: 'Updated behaviors',
        updatedAt: '2023-01-02T00:00:00.000Z',
      };

      mockValuesService.update.mockResolvedValue(updatedValue);

      const result = await controller.update(mockRequest, 'test-value-id', updateValueDto);

      expect(service.update).toHaveBeenCalledWith('user-123', 'test-value-id', updateValueDto);
      expect(result).toEqual(updatedValue);
    });

    it('should update with partial data', async () => {
      const updateValueDto: UpdateValueDto = {
        title: 'Only Title Updated',
      };

      const updatedValue = {
        ...mockValue,
        title: 'Only Title Updated',
        updatedAt: '2023-01-02T00:00:00.000Z',
      };

      mockValuesService.update.mockResolvedValue(updatedValue);

      const result = await controller.update(mockRequest, 'test-value-id', updateValueDto);

      expect(service.update).toHaveBeenCalledWith('user-123', 'test-value-id', updateValueDto);
      expect(result).toEqual(updatedValue);
    });
  });

  describe('remove', () => {
    it('should delete a value', async () => {
      const deleteResponse = { message: 'Value deleted successfully' };
      mockValuesService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove(mockRequest, 'test-value-id');

      expect(service.remove).toHaveBeenCalledWith('user-123', 'test-value-id');
      expect(result).toEqual(deleteResponse);
    });
  });

  describe('authentication', () => {
    it('should be protected by FirebaseAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', ValuesController);
      expect(guards).toContain(FirebaseAuthGuard);
    });
  });
});