import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { FirebaseService } from '../src/config/firebase.service';

describe('Journal (e2e)', () => {
  let app: INestApplication<App>;
  let firebaseService: FirebaseService;

  const mockAuthToken = 'mock-jwt-token';
  const mockUserId = 'test-user-123';

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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/journal (POST)', () => {
    it('should create a new journal entry', async () => {
      const entryData = {
        title: 'Test Journal Entry',
        content: 'This is a test content for the journal entry.',
      };

      const mockDocRef = { id: 'new-entry-id' };
      mockFirestore.add.mockResolvedValue(mockDocRef);

      const response = await request(app.getHttpServer())
        .post('/journal')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(entryData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'new-entry-id',
        title: 'Test Journal Entry',
        content: 'This is a test content for the journal entry.',
        userId: mockUserId,
      });

      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should create entry without title', async () => {
      const entryData = {
        content: 'Content without title',
      };

      const mockDocRef = { id: 'no-title-entry' };
      mockFirestore.add.mockResolvedValue(mockDocRef);

      const response = await request(app.getHttpServer())
        .post('/journal')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(entryData)
        .expect(201);

      expect(response.body.content).toBe('Content without title');
      expect(response.body.title).toBeUndefined();
    });

    it('should return 400 when content is missing', async () => {
      const entryData = {
        title: 'Title only',
      };

      await request(app.getHttpServer())
        .post('/journal')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(entryData)
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      const entryData = {
        title: 'Test',
        content: 'Test content',
      };

      await request(app.getHttpServer())
        .post('/journal')
        .send(entryData)
        .expect(401);
    });
  });

  describe('/journal (GET)', () => {
    it('should return all journal entries for authenticated user', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'entry-1',
            data: () => ({
              title: 'Entry 1',
              content: 'Content 1',
              userId: mockUserId,
              createdAt: '2023-01-02T00:00:00.000Z',
            }),
          },
          {
            id: 'entry-2',
            data: () => ({
              title: 'Entry 2',
              content: 'Content 2',
              userId: mockUserId,
              createdAt: '2023-01-01T00:00:00.000Z',
            }),
          },
        ],
      };

      mockFirestore.get.mockResolvedValue(mockSnapshot);

      const response = await request(app.getHttpServer())
        .get('/journal')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Entry 1');
      expect(response.body[1].title).toBe('Entry 2');
      expect(mockFirestore.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });

    it('should search journal entries by title', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'matching-entry',
            data: () => ({
              title: 'Meeting Notes',
              content: 'Important meeting content',
              userId: mockUserId,
            }),
          },
        ],
      };

      mockFirestore.get.mockResolvedValue(mockSnapshot);

      const response = await request(app.getHttpServer())
        .get('/journal?search=meeting')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Meeting Notes');
    });

    it('should return empty array when user has no entries', async () => {
      const mockSnapshot = { docs: [] };
      mockFirestore.get.mockResolvedValue(mockSnapshot);

      const response = await request(app.getHttpServer())
        .get('/journal')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/journal')
        .expect(401);
    });
  });

  describe('/journal/search/date (GET)', () => {
    it('should find entries by date range', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'date-entry',
            data: () => ({
              title: 'January Entry',
              content: 'Content from January',
              createdAt: '2023-01-15T00:00:00.000Z',
              userId: mockUserId,
            }),
          },
        ],
      };

      mockFirestore.get.mockResolvedValue(mockSnapshot);

      const response = await request(app.getHttpServer())
        .get('/journal/search/date?startDate=2023-01-01&endDate=2023-01-31')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('January Entry');
    });

    it('should handle missing date parameters', async () => {
      const mockSnapshot = { docs: [] };
      mockFirestore.get.mockResolvedValue(mockSnapshot);

      const response = await request(app.getHttpServer())
        .get('/journal/search/date?startDate=2023-01-01')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('/journal/:id (GET)', () => {
    it('should return a specific journal entry', async () => {
      const mockDoc = {
        exists: true,
        id: 'entry-1',
        data: () => ({
          title: 'Specific Entry',
          content: 'Specific content',
          userId: mockUserId,
          createdAt: '2023-01-01T00:00:00.000Z',
        }),
      };

      mockFirestore.get.mockResolvedValue(mockDoc);

      const response = await request(app.getHttpServer())
        .get('/journal/entry-1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      expect(response.body.title).toBe('Specific Entry');
      expect(response.body.id).toBe('entry-1');
    });

    it('should return 404 when entry not found', async () => {
      const mockDoc = { exists: false };
      mockFirestore.get.mockResolvedValue(mockDoc);

      await request(app.getHttpServer())
        .get('/journal/non-existent')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(404);
    });
  });

  describe('/journal/:id (PATCH)', () => {
    it('should update a journal entry', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const mockDoc = {
        exists: true,
        id: 'entry-1',
        data: () => ({
          title: 'Original Title',
          content: 'Original content',
          userId: mockUserId,
        }),
      };

      mockFirestore.get.mockResolvedValue(mockDoc);

      const response = await request(app.getHttpServer())
        .patch('/journal/entry-1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(updateData)
        .expect(200);

      expect(mockFirestore.update).toHaveBeenCalledWith({
        title: 'Updated Title',
        content: 'Updated content',
        updatedAt: expect.any(String),
      });
    });

    it('should return 404 when updating non-existent entry', async () => {
      const updateData = { title: 'Updated' };
      const mockDoc = { exists: false };
      mockFirestore.get.mockResolvedValue(mockDoc);

      await request(app.getHttpServer())
        .patch('/journal/non-existent')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('/journal/:id (DELETE)', () => {
    it('should delete a journal entry', async () => {
      const mockDoc = {
        exists: true,
        id: 'entry-1',
        data: () => ({
          title: 'To Delete',
          content: 'Content to delete',
          userId: mockUserId,
        }),
      };

      mockFirestore.get.mockResolvedValue(mockDoc);

      const response = await request(app.getHttpServer())
        .delete('/journal/entry-1')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      expect(response.body.message).toBe('Journal entry deleted successfully');
      expect(mockFirestore.delete).toHaveBeenCalled();
    });

    it('should return 404 when deleting non-existent entry', async () => {
      const mockDoc = { exists: false };
      mockFirestore.get.mockResolvedValue(mockDoc);

      await request(app.getHttpServer())
        .delete('/journal/non-existent')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(404);
    });
  });

  describe('Data validation and content handling', () => {
    it('should handle very long content', async () => {
      const longContent = 'A'.repeat(50000);
      const entryData = {
        title: 'Long Content Entry',
        content: longContent,
      };

      const mockDocRef = { id: 'long-content-entry' };
      mockFirestore.add.mockResolvedValue(mockDocRef);

      const response = await request(app.getHttpServer())
        .post('/journal')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(entryData)
        .expect(201);

      expect(response.body.content).toBe(longContent);
    });

    it('should preserve line breaks and formatting', async () => {
      const formattedContent = `Line 1
      Line 2

      Paragraph with spaces.

      - Bullet point 1
      - Bullet point 2`;

      const entryData = {
        title: 'Formatted Entry',
        content: formattedContent,
      };

      const mockDocRef = { id: 'formatted-entry' };
      mockFirestore.add.mockResolvedValue(mockDocRef);

      const response = await request(app.getHttpServer())
        .post('/journal')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(entryData)
        .expect(201);

      expect(response.body.content).toBe(formattedContent);
    });

    it('should handle Unicode and special characters', async () => {
      const entryData = {
        title: 'Emoji and Unicode 🚀',
        content: 'Content with émojis 😄 and ñoñó characters 测试',
      };

      const mockDocRef = { id: 'unicode-entry' };
      mockFirestore.add.mockResolvedValue(mockDocRef);

      const response = await request(app.getHttpServer())
        .post('/journal')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(entryData)
        .expect(201);

      expect(response.body.title).toBe('Emoji and Unicode 🚀');
      expect(response.body.content).toBe('Content with émojis 😄 and ñoñó characters 测试');
    });

    it('should validate content is required', async () => {
      const entryData = {
        title: 'No content',
      };

      await request(app.getHttpServer())
        .post('/journal')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .send(entryData)
        .expect(400);
    });
  });

  describe('Security and privacy', () => {
    it('should not allow access to other users entries', async () => {
      const mockDoc = {
        exists: true,
        data: () => ({
          title: 'Other User Entry',
          content: 'Private content',
          userId: 'other-user-456',
        }),
      };

      mockFirestore.get.mockResolvedValue(mockDoc);

      await request(app.getHttpServer())
        .get('/journal/other-user-entry')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(404);
    });

    it('should filter entries by userId in search', async () => {
      await request(app.getHttpServer())
        .get('/journal?search=test')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      expect(mockFirestore.where).toHaveBeenCalledWith('userId', '==', mockUserId);
    });

    it('should filter entries by userId in date range search', async () => {
      await request(app.getHttpServer())
        .get('/journal/search/date?startDate=2023-01-01')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      expect(mockFirestore.where).toHaveBeenCalledWith('userId', '==', mockUserId);
    });
  });

  describe('Search functionality', () => {
    it('should handle empty search queries', async () => {
      const mockSnapshot = { docs: [] };
      mockFirestore.get.mockResolvedValue(mockSnapshot);

      const response = await request(app.getHttpServer())
        .get('/journal?search=')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should handle special characters in search', async () => {
      const mockSnapshot = { docs: [] };
      mockFirestore.get.mockResolvedValue(mockSnapshot);

      const response = await request(app.getHttpServer())
        .get('/journal?search=@#$%^&*()')
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });
});