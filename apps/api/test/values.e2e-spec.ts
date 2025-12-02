import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { FirebaseService } from '../src/config/firebase.service';

describe('Values (e2e)', () => {
  let app: INestApplication<App>;
  let firebaseService: FirebaseService;

  // Mock authentication token
  const mockAuthToken = 'mock-jwt-token';
  const mockUserId = 'test-user-123';

  // Mock Firebase admin
  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    add: jest.fn(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn(),
    doc: jest.fn().mockReturnThis(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockAuth = {
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: mockUserId,
      email: 'test@example.com',
    }),
  };

  const mockFirebaseAdmin = {
    getFirestore: () => mockFirestore,
    getAuth: () => mockAuth,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FirebaseService)
      .useValue(mockFirebaseAdmin)
      .compile();

    app = moduleFixture.createNestApplication();
    firebaseService = moduleFixture.get<FirebaseService>(FirebaseService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/values (POST)', () => {
    it('should create a new value', async () => {
      const valueData = {
        title: 'Test Value',
        shortDescription: 'Test description',
        behaviors: 'Test behaviors',
      };

      const mockDocRef = { id: 'new-value-id' };
      mockFirestore.add.mockResolvedValue(mockDocRef);

      const response = await request(app.getHttpServer())
        .post('/values')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(valueData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'new-value-id',
        title: 'Test Value',
        shortDescription: 'Test description',
        behaviors: 'Test behaviors',
        userId: mockUserId,
      });

      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should create value with only required fields', async () => {
      const valueData = {
        title: 'Required Only',
      };

      const mockDocRef = { id: 'minimal-value-id' };
      mockFirestore.add.mockResolvedValue(mockDocRef);

      const response = await request(app.getHttpServer())
        .post('/values')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(valueData)
        .expect(201);

      expect(response.body.title).toBe('Required Only');
      expect(response.body.shortDescription).toBeUndefined();
      expect(response.body.behaviors).toBeUndefined();
    });

    it('should return 400 when title is missing', async () => {
      const valueData = {
        shortDescription: 'Without title',
      };

      await request(app.getHttpServer())
        .post('/values')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(valueData)
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      const valueData = {
        title: 'Test Value',
      };

      await request(app.getHttpServer())
        .post('/values')
        .send(valueData)
        .expect(401);
    });
  });

  describe('/values (GET)', () => {
    it('should return all values for authenticated user', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'value-1',
            data: () => ({
              title: 'Value 1',
              shortDescription: 'Description 1',
              userId: mockUserId,
              createdAt: '2023-01-01T00:00:00.000Z',
            }),
          },
          {
            id: 'value-2',
            data: () => ({
              title: 'Value 2',
              behaviors: 'Behaviors 2',
              userId: mockUserId,
              createdAt: '2023-01-02T00:00:00.000Z',
            }),
          },
        ],
      };

      mockFirestore.get.mockResolvedValue(mockSnapshot);

      const response = await request(app.getHttpServer())
        .get('/values')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Value 1');
      expect(response.body[1].title).toBe('Value 2');
    });

    it('should return empty array when user has no values', async () => {
      const mockSnapshot = { docs: [] };
      mockFirestore.get.mockResolvedValue(mockSnapshot);

      const response = await request(app.getHttpServer())
        .get('/values')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/values')
        .expect(401);
    });
  });

  describe('/values/:id (GET)', () => {
    it('should return a specific value', async () => {
      const mockDoc = {
        exists: true,
        id: 'value-1',
        data: () => ({
          title: 'Specific Value',
          shortDescription: 'Specific description',
          userId: mockUserId,
        }),
      };

      mockFirestore.get.mockResolvedValue(mockDoc);

      const response = await request(app.getHttpServer())
        .get('/values/value-1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      expect(response.body.title).toBe('Specific Value');
      expect(response.body.id).toBe('value-1');
    });

    it('should return 404 when value not found', async () => {
      const mockDoc = { exists: false };
      mockFirestore.get.mockResolvedValue(mockDoc);

      await request(app.getHttpServer())
        .get('/values/non-existent')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(404);
    });
  });

  describe('/values/:id (PATCH)', () => {
    it('should update a value', async () => {
      const updateData = {
        title: 'Updated Title',
        behaviors: 'Updated behaviors',
      };

      // Mock findOne calls
      const mockDoc = {
        exists: true,
        id: 'value-1',
        data: () => ({
          title: 'Original Title',
          userId: mockUserId,
        }),
      };

      mockFirestore.get.mockResolvedValue(mockDoc);

      const response = await request(app.getHttpServer())
        .patch('/values/value-1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(updateData)
        .expect(200);

      expect(mockFirestore.update).toHaveBeenCalledWith({
        title: 'Updated Title',
        behaviors: 'Updated behaviors',
        updatedAt: expect.any(String),
      });
    });

    it('should return 404 when updating non-existent value', async () => {
      const updateData = { title: 'Updated' };
      const mockDoc = { exists: false };
      mockFirestore.get.mockResolvedValue(mockDoc);

      await request(app.getHttpServer())
        .patch('/values/non-existent')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('/values/:id (DELETE)', () => {
    it('should delete a value', async () => {
      const mockDoc = {
        exists: true,
        id: 'value-1',
        data: () => ({
          title: 'To Delete',
          userId: mockUserId,
        }),
      };

      mockFirestore.get.mockResolvedValue(mockDoc);

      const response = await request(app.getHttpServer())
        .delete('/values/value-1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      expect(response.body.message).toBe('Value deleted successfully');
      expect(mockFirestore.delete).toHaveBeenCalled();
    });

    it('should return 404 when deleting non-existent value', async () => {
      const mockDoc = { exists: false };
      mockFirestore.get.mockResolvedValue(mockDoc);

      await request(app.getHttpServer())
        .delete('/values/non-existent')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(404);
    });
  });

  describe('Data validation', () => {
    it('should validate title is string', async () => {
      const valueData = {
        title: 123, // Invalid type
      };

      await request(app.getHttpServer())
        .post('/values')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(valueData)
        .expect(400);
    });

    it('should validate optional fields are strings when provided', async () => {
      const valueData = {
        title: 'Valid Title',
        shortDescription: 123, // Invalid type
      };

      await request(app.getHttpServer())
        .post('/values')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(valueData)
        .expect(400);
    });

    it('should handle very long strings', async () => {
      const longString = 'A'.repeat(10000);
      const valueData = {
        title: longString,
        shortDescription: longString,
        behaviors: longString,
      };

      const mockDocRef = { id: 'long-value-id' };
      mockFirestore.add.mockResolvedValue(mockDocRef);

      await request(app.getHttpServer())
        .post('/values')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(valueData)
        .expect(201);
    });

    it('should handle Unicode characters', async () => {
      const valueData = {
        title: 'Valor em Português 🇧🇷',
        shortDescription: '测试中文描述',
        behaviors: 'Поведение на русском',
      };

      const mockDocRef = { id: 'unicode-value-id' };
      mockFirestore.add.mockResolvedValue(mockDocRef);

      const response = await request(app.getHttpServer())
        .post('/values')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(valueData)
        .expect(201);

      expect(response.body.title).toBe('Valor em Português 🇧🇷');
    });
  });

  describe('Security', () => {
    it('should not allow access to other users values', async () => {
      const mockDoc = {
        exists: true,
        data: () => ({
          title: 'Other User Value',
          userId: 'other-user-456', // Different user
        }),
      };

      mockFirestore.get.mockResolvedValue(mockDoc);

      await request(app.getHttpServer())
        .get('/values/other-user-value')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(404); // Should return 404 to hide existence
    });

    it('should filter values by userId in listings', async () => {
      const response = await request(app.getHttpServer())
        .get('/values')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      // Verify the query was made with correct userId
      expect(mockFirestore.where).toHaveBeenCalledWith('userId', '==', mockUserId);
    });
  });
});