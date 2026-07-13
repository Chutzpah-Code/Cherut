import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { FirebaseService } from '../../config/firebase.service';

describe('AdminService', () => {
  let service: AdminService;

  const mockAuth = {
    createUser: jest.fn(),
    setCustomUserClaims: jest.fn(),
  };

  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    set: jest.fn(),
    get: jest.fn(),
  };

  const mockFirebaseService = {
    getFirestore: jest.fn(() => mockFirestore),
    getAuth: jest.fn(() => mockAuth),
  };

  const snap = (items: { id: string; data: object; ref?: object }[]) => ({
    docs: items.map((d) => ({
      id: d.id,
      data: () => d.data,
      ref: d.ref ?? { update: jest.fn(), id: d.id },
    })),
    empty: items.length === 0,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);

    jest.resetAllMocks();
    mockFirestore.collection.mockReturnThis();
    mockFirestore.where.mockReturnThis();
    mockFirestore.orderBy.mockReturnThis();
    mockFirestore.limit.mockReturnThis();
    mockFirestore.offset.mockReturnThis();
    mockFirestore.doc.mockReturnThis();
    mockFirebaseService.getFirestore.mockReturnValue(mockFirestore);
    mockFirebaseService.getAuth.mockReturnValue(mockAuth);
  });

  // ─── getUsers ────────────────────────────────────────────────────────────────

  describe('getUsers', () => {
    it('returns users list with total count', async () => {
      mockFirestore.get.mockResolvedValue(snap([
        { id: 'u1', data: { email: 'a@x.com', displayName: 'Alice' } },
        { id: 'u2', data: { email: 'b@x.com', displayName: 'Bob' } },
      ]));

      const result = await service.getUsers({} as any);

      expect(result.total).toBe(2);
      expect(result.users).toHaveLength(2);
    });

    it('filters users in memory by search term on email', async () => {
      mockFirestore.get.mockResolvedValue(snap([
        { id: 'u1', data: { email: 'alice@x.com', displayName: 'Alice' } },
        { id: 'u2', data: { email: 'bob@x.com', displayName: 'Bob' } },
      ]));

      const result = await service.getUsers({ search: 'alice' } as any);

      expect(result.total).toBe(1);
      expect(result.users[0].email).toBe('alice@x.com');
    });

    it('throws BadRequestException on Firestore failure', async () => {
      mockFirestore.get.mockRejectedValue(new Error('Firestore down'));

      await expect(service.getUsers({} as any)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── createAdmin ─────────────────────────────────────────────────────────────

  describe('createAdmin', () => {
    it('creates Firebase Auth user and Firestore document with role=admin', async () => {
      mockAuth.createUser.mockResolvedValue({
        uid: 'new-admin',
        email: 'admin@x.com',
        displayName: 'Admin',
      });
      mockFirestore.set.mockResolvedValue(undefined);

      const result = await service.createAdmin({ email: 'admin@x.com', password: 'pass' } as any);

      expect(mockAuth.createUser).toHaveBeenCalledWith(expect.objectContaining({ email: 'admin@x.com' }));
      expect(mockFirestore.set).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }));
      expect(result.user.role).toBe('admin');
    });

    it('throws BadRequestException when email already exists', async () => {
      mockAuth.createUser.mockRejectedValue({ code: 'auth/email-already-exists' });

      await expect(
        service.createAdmin({ email: 'dup@x.com', password: 'pass' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── promoteUser ─────────────────────────────────────────────────────────────

  describe('promoteUser', () => {
    it('throws NotFoundException when user email not found', async () => {
      mockFirestore.get.mockResolvedValue(snap([]));

      await expect(service.promoteUser({ email: 'ghost@x.com' } as any)).rejects.toThrow(NotFoundException);
    });

    it('returns early with message if user is already admin', async () => {
      mockFirestore.get.mockResolvedValue(snap([
        { id: 'u1', data: { email: 'a@x.com', role: 'admin', subscription: {} } },
      ]));

      const result = await service.promoteUser({ email: 'a@x.com' } as any);

      expect(result.message).toBe('User is already an admin');
    });

    it('updates role and sets Firebase custom claim', async () => {
      const mockRef = { update: jest.fn().mockResolvedValue(undefined), id: 'u1' };
      mockFirestore.get.mockResolvedValue({
        docs: [{ id: 'u1', data: () => ({ email: 'a@x.com', role: 'user', subscription: {} }), ref: mockRef }],
        empty: false,
      });
      mockAuth.setCustomUserClaims.mockResolvedValue(undefined);

      const result = await service.promoteUser({ email: 'a@x.com' } as any);

      expect(mockRef.update).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }));
      expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith('u1', { role: 'admin' });
      expect(result.user.role).toBe('admin');
    });
  });

  // ─── getDashboardOverview ─────────────────────────────────────────────────────

  describe('getDashboardOverview', () => {
    it('returns totalUsers, totalAdmins, activeSubscriptions and planDistribution', async () => {
      const allUsersData = [
        { role: 'admin', onboardingCompleted: true, subscription: { plan: 'elite', status: 'active' } },
        { role: 'user', onboardingCompleted: true, subscription: { plan: 'free', status: 'active' } },
        { role: 'user', onboardingCompleted: false, subscription: { plan: 'pro', status: 'active' } },
      ];
      const activeSubsData = allUsersData.filter(u => u.subscription.status === 'active');

      mockFirestore.get
        .mockResolvedValueOnce({ docs: allUsersData.map((d, i) => ({ id: `u${i}`, data: () => d })) })
        .mockResolvedValueOnce({ docs: activeSubsData.map((d, i) => ({ id: `u${i}`, data: () => d })) });

      const result = await service.getDashboardOverview();

      expect(result.overview.totalUsers).toBe(3);
      expect(result.overview.totalAdmins).toBe(1);
      expect(result.overview.activeSubscriptions).toBe(3);
      expect(result.planDistribution.elite).toBe(1);
      expect(result.planDistribution.pro).toBe(1);
    });
  });

  // ─── getSalesReport ───────────────────────────────────────────────────────────

  describe('getSalesReport', () => {
    it('calculates monthlyRevenue from active paid subscriptions', async () => {
      mockFirestore.get.mockResolvedValue({ docs: [
        { id: 'u1', data: () => ({ subscription: { plan: 'pro', status: 'active' } }) },  // 19.99
        { id: 'u2', data: () => ({ subscription: { plan: 'core', status: 'active' } }) }, // 9.99
      ]});

      const result = await service.getSalesReport();

      expect(result.monthlyRevenue).toBeCloseTo(29.98);
      expect(result.salesByPlan.pro).toBe(1);
      expect(result.salesByPlan.core).toBe(1);
      expect(result.totalPaidUsers).toBe(2);
    });

    it('returns 0 revenue when no paid subscriptions', async () => {
      mockFirestore.get.mockResolvedValue({ docs: [
        { id: 'u1', data: () => ({ subscription: { plan: 'free', status: 'active' } }) },
      ]});

      const result = await service.getSalesReport();

      expect(result.monthlyRevenue).toBe(0);
    });
  });
});
