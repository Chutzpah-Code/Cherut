import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseService } from '../../config/firebase.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockAuth = {
    createUser: jest.fn(),
    verifyIdToken: jest.fn(),
  };

  const mockDoc = {
    exists: true,
    data: jest.fn(),
    id: 'uid-123',
  };

  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnValue(mockDoc),
    get: jest.fn(),
    set: jest.fn(),
  };

  // Firestore collection().doc() returns a ref with .get() and .set()
  const mockDocRef = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockFirebaseService = {
    getFirestore: jest.fn(),
    getAuth: jest.fn(),
  };

  const UID = 'uid-123';
  const EMAIL = 'test@x.com';
  const TOKEN = 'firebase-id-token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.resetAllMocks();

    mockFirebaseService.getAuth.mockReturnValue(mockAuth);
    mockFirebaseService.getFirestore.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef),
      }),
    });
    mockDocRef.get.mockResolvedValue({ exists: false });
    mockDocRef.set.mockResolvedValue(undefined);
  });

  // ─── register ────────────────────────────────────────────────────────────────

  describe('register', () => {
    it('creates Firebase Auth user and stores Firestore document', async () => {
      mockAuth.createUser.mockResolvedValue({ uid: UID, email: EMAIL, displayName: 'test' });

      const result = await service.register({ email: EMAIL, password: 'pass123', displayName: 'test' });

      expect(mockAuth.createUser).toHaveBeenCalledWith(expect.objectContaining({ email: EMAIL }));
      expect(mockDocRef.set).toHaveBeenCalledWith(expect.objectContaining({
        uid: UID,
        subscription: expect.objectContaining({ plan: 'free' }),
      }));
      expect(result.user.uid).toBe(UID);
    });

    it('defaults displayName to email prefix when not provided', async () => {
      mockAuth.createUser.mockResolvedValue({ uid: UID, email: EMAIL, displayName: 'test' });

      await service.register({ email: EMAIL, password: 'pass' });

      expect(mockAuth.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ displayName: 'test' }),
      );
    });

    it('throws ConflictException when email already exists', async () => {
      mockAuth.createUser.mockRejectedValue({ code: 'auth/email-already-exists' });

      await expect(
        service.register({ email: EMAIL, password: 'pass' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('throws BadRequestException when no token provided', async () => {
      await expect(service.login({ firebaseIdToken: '' })).rejects.toThrow(BadRequestException);
    });

    it('returns user data when token is valid and user exists in Firestore', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: UID, email: EMAIL });
      mockDocRef.get.mockResolvedValue({
        exists: true,
        data: () => ({ displayName: 'Alice', uid: UID }),
      });

      const result = await service.login({ firebaseIdToken: TOKEN });

      expect(result.user.uid).toBe(UID);
      expect(result.user.email).toBe(EMAIL);
    });

    it('creates Firestore record and returns user when Firebase user has no Firestore doc', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: UID, email: EMAIL, name: 'NewUser' });
      mockDocRef.get.mockResolvedValue({ exists: false });

      const result = await service.login({ firebaseIdToken: TOKEN });

      expect(mockDocRef.set).toHaveBeenCalledWith(expect.objectContaining({ uid: UID }));
      expect(result.user.uid).toBe(UID);
    });

    it('throws UnauthorizedException on invalid token (auth/ error code)', async () => {
      mockAuth.verifyIdToken.mockRejectedValue({ code: 'auth/id-token-expired' });

      await expect(service.login({ firebaseIdToken: TOKEN })).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException on generic verification failure', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(new Error('network error'));

      await expect(service.login({ firebaseIdToken: TOKEN })).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── validateToken ────────────────────────────────────────────────────────────

  describe('validateToken', () => {
    it('returns user data from Firestore when doc exists', async () => {
      mockDocRef.get.mockResolvedValue({
        exists: true,
        data: () => ({ email: EMAIL, displayName: 'Alice' }),
      });

      const result = await service.validateToken(UID) as any;

      expect(result.uid).toBe(UID);
      expect(result.email).toBe(EMAIL);
    });

    it('returns cached data on second call without hitting Firestore again', async () => {
      mockDocRef.get.mockResolvedValue({
        exists: true,
        data: () => ({ email: EMAIL }),
      });

      await service.validateToken(UID);
      await service.validateToken(UID);

      expect(mockDocRef.get).toHaveBeenCalledTimes(1);
    });

    it('auto-creates Firestore record and returns it when doc missing but decodedToken provided', async () => {
      mockDocRef.get.mockResolvedValue({ exists: false });

      const decoded = { email: EMAIL, name: 'NewUser' };
      const result = await service.validateToken(UID, decoded) as any;

      expect(mockDocRef.set).toHaveBeenCalledWith(expect.objectContaining({
        uid: UID,
        onboardingCompleted: false,
        subscription: expect.objectContaining({ plan: 'free' }),
      }));
      expect(result.uid).toBe(UID);
    });

    it('returns null when doc missing and no decodedToken', async () => {
      mockDocRef.get.mockResolvedValue({ exists: false });

      const result = await service.validateToken(UID);

      expect(result).toBeNull();
    });

    it('throws ServiceUnavailableException on Firestore quota exhaustion (code 8)', async () => {
      mockDocRef.get.mockRejectedValue({ code: 8 });

      await expect(service.validateToken(UID)).rejects.toThrow(ServiceUnavailableException);
    });
  });
});
