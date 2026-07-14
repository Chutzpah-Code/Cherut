import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { BillsService } from './bills.service';
import { FirebaseService } from '../../config/firebase.service';

// Stub FieldValue.increment so we can assert on it without firebase-admin internals
jest.mock('firebase-admin', () => ({
  firestore: {
    FieldValue: {
      increment: jest.fn((n: number) => ({ _type: 'increment', n })),
    },
  },
}));

describe('BillsService', () => {
  let service: BillsService;

  // Reusable mock primitives
  const mockAdd = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockGet = jest.fn();
  const mockDocGet = jest.fn();
  const mockDocUpdate = jest.fn();
  const mockBatchDelete = jest.fn();
  const mockBatchCommit = jest.fn();

  const mockDocRef = {
    get: mockDocGet,
    update: mockDocUpdate,
    delete: mockDelete,
    ref: { _ref: true },
  };

  const mockCollection = {
    add: mockAdd,
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: mockGet,
    doc: jest.fn().mockReturnValue(mockDocRef),
  };

  const mockBatch = {
    delete: mockBatchDelete,
    commit: mockBatchCommit,
  };

  const mockFirestore = {
    collection: jest.fn().mockReturnValue(mockCollection),
    batch: jest.fn().mockReturnValue(mockBatch),
  };

  const mockFirebaseService = {
    getFirestore: jest.fn(() => mockFirestore),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillsService,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    service = module.get<BillsService>(BillsService);
    jest.clearAllMocks();
    // Re-wire mocks cleared by clearAllMocks
    mockFirestore.collection.mockReturnValue(mockCollection);
    mockFirestore.batch.mockReturnValue(mockBatch);
    mockCollection.where.mockReturnThis();
    mockCollection.limit.mockReturnThis();
    mockCollection.doc.mockReturnValue(mockDocRef);
    mockBatch.commit.mockResolvedValue({});
  });

  // ─── assertOwner helper ────────────────────────────────────────────────────

  function ownerDoc(data: object) {
    return { exists: true, id: 'doc-id', data: () => data };
  }

  function missingDoc() {
    return { exists: false, id: 'doc-id', data: () => null };
  }

  // ─── createBill ───────────────────────────────────────────────────────────

  describe('createBill', () => {
    it('creates a bill after validating account and category ownership', async () => {
      const accountDoc = ownerDoc({ userId: 'u1', balance: 0 });
      const categoryDoc = ownerDoc({ userId: 'u1', name: 'Rent' });
      mockDocGet
        .mockResolvedValueOnce(accountDoc)
        .mockResolvedValueOnce(categoryDoc);
      mockAdd.mockResolvedValue({ id: 'new-bill' });

      const dto = {
        name: 'Rent',
        accountId: 'acc-1',
        categoryId: 'cat-1',
        amount: 1500,
        type: 'expense' as const,
        frequency: 'monthly' as const,
        dueDay: 5,
        startDate: '2026-07-01',
      };

      const result = await service.createBill('u1', dto);
      expect(result.id).toBe('new-bill');
      expect(result.name).toBe('Rent');
      expect(result.isActive).toBe(true);
      expect(mockAdd).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundException when account does not belong to user', async () => {
      mockDocGet.mockResolvedValueOnce({ exists: true, id: 'acc-1', data: () => ({ userId: 'other-user' }) });

      await expect(
        service.createBill('u1', {
          name: 'Rent', accountId: 'acc-1', categoryId: 'cat-1',
          amount: 100, type: 'expense', frequency: 'monthly', dueDay: 5, startDate: '2026-07-01',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(mockAdd).not.toHaveBeenCalled();
    });
  });

  // ─── listBills ────────────────────────────────────────────────────────────

  describe('listBills', () => {
    it('returns bills sorted alphabetically by name', async () => {
      mockGet.mockResolvedValue({
        docs: [
          { id: 'b2', data: () => ({ name: 'Rent', userId: 'u1' }) },
          { id: 'b1', data: () => ({ name: 'Netflix', userId: 'u1' }) },
          { id: 'b3', data: () => ({ name: 'Spotify', userId: 'u1' }) },
        ],
      });

      const result = await service.listBills('u1') as any[];
      expect(result.map((b) => b.name)).toEqual(['Netflix', 'Rent', 'Spotify']);
    });
  });

  // ─── deleteBill ───────────────────────────────────────────────────────────

  describe('deleteBill', () => {
    it('batch-deletes all linked occurrences and the bill itself', async () => {
      const billDoc = ownerDoc({ userId: 'u1', name: 'Rent' });
      mockDocGet.mockResolvedValueOnce(billDoc);

      const occ1 = { ref: { _ref: 'occ1' } };
      const occ2 = { ref: { _ref: 'occ2' } };
      mockGet.mockResolvedValue({ docs: [occ1, occ2], size: 2 });

      await service.deleteBill('u1', 'bill-1');

      // Batch should have 3 deletes: 2 occurrences + 1 bill
      expect(mockBatchDelete).toHaveBeenCalledTimes(3);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundException for bill not owned by user', async () => {
      mockDocGet.mockResolvedValueOnce({ exists: true, id: 'b1', data: () => ({ userId: 'other' }) });
      await expect(service.deleteBill('u1', 'bill-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── payOccurrence ────────────────────────────────────────────────────────

  describe('payOccurrence', () => {
    it('throws ConflictException when occurrence is already paid', async () => {
      const paidOcc = ownerDoc({ userId: 'u1', status: 'paid', billId: 'bill-1', amount: 100 });
      mockDocGet.mockResolvedValueOnce(paidOcc);

      await expect(
        service.payOccurrence('u1', 'occ-1', { accountId: 'acc-1', amount: 100, paidAt: '2026-07-14' }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates a transaction and calls FieldValue.increment on account balance', async () => {
      const pendingOcc = ownerDoc({ userId: 'u1', status: 'pending', billId: 'bill-1', amount: 1500 });
      const bill = ownerDoc({ userId: 'u1', type: 'expense', categoryId: 'cat-1', name: 'Rent', accountId: 'acc-1' });
      const account = ownerDoc({ userId: 'u1', balance: 5000 });

      mockDocGet
        .mockResolvedValueOnce(pendingOcc) // assertOwner(OCCURRENCES)
        .mockResolvedValueOnce(bill)        // assertOwner(BILLS)
        .mockResolvedValueOnce(account);    // assertOwner(ACCOUNTS)

      mockAdd.mockResolvedValue({ id: 'tx-99' });
      mockDocUpdate.mockResolvedValue({});

      const result: any = await service.payOccurrence('u1', 'occ-1', {
        accountId: 'acc-1',
        amount: 1500,
        paidAt: '2026-07-14',
      });

      expect(result.status).toBe('paid');
      expect(result.transactionId).toBe('tx-99');
      expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'u1',
        accountId: 'acc-1',
        categoryId: 'cat-1',
        amount: 1500,
        type: 'expense',
        billOccurrenceId: 'occ-1',
      }));
      expect(admin.firestore.FieldValue.increment).toHaveBeenCalledWith(-1500);
    });

    it('increments balance positively for income bills', async () => {
      const pendingOcc = ownerDoc({ userId: 'u1', status: 'pending', billId: 'bill-2', amount: 3000 });
      const bill = ownerDoc({ userId: 'u1', type: 'income', categoryId: 'cat-2', name: 'Salary', accountId: 'acc-1' });
      const account = ownerDoc({ userId: 'u1', balance: 0 });

      mockDocGet
        .mockResolvedValueOnce(pendingOcc)
        .mockResolvedValueOnce(bill)
        .mockResolvedValueOnce(account);

      mockAdd.mockResolvedValue({ id: 'tx-100' });
      mockDocUpdate.mockResolvedValue({});

      await service.payOccurrence('u1', 'occ-2', { accountId: 'acc-1', amount: 3000, paidAt: '2026-07-14' });

      expect(admin.firestore.FieldValue.increment).toHaveBeenCalledWith(3000);
    });
  });

  // ─── computeDueDate (via internal logic) ──────────────────────────────────

  describe('occurrence status assignment in generateOccurrencesForPeriod', () => {
    it('creates occurrence with status "overdue" when dueDate is in the past', async () => {
      // Bill with dueDay=1 → dueDate for 2020-01 = 2020-01-01, which is in the past
      const activeBill = {
        id: 'bill-past', name: 'Old Rent', userId: 'u1', isActive: true,
        dueDay: 1, startDate: '2020-01-01', amount: 500, type: 'expense',
      };
      mockGet
        .mockResolvedValueOnce({ empty: false, docs: [{ id: activeBill.id, data: () => activeBill }] })
        .mockResolvedValueOnce({ empty: true, docs: [] }); // no existing occurrence

      mockAdd.mockResolvedValue({ id: 'occ-new' });

      // Call via getOccurrences which calls generateOccurrencesForPeriod twice (month + month+1)
      // We only need to assert on the first generation (2020-01)
      mockGet
        .mockResolvedValueOnce({ empty: false, docs: [{ id: activeBill.id, data: () => activeBill }] }) // bills for month+1
        .mockResolvedValueOnce({ empty: true, docs: [] })  // no existing for month+1
        .mockResolvedValueOnce({ empty: false, docs: [], size: 0, docs: [] }); // final query for occurrences in period
      // This is complex — just test that add was called with status 'overdue'

      await (service as any).generateOccurrencesForPeriod('u1', '2020-01');

      expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({ status: 'overdue' }));
    });

    it('creates occurrence with status "pending" when dueDate is in the future', async () => {
      const futureYear = new Date().getFullYear() + 1;
      const futurePeriod = `${futureYear}-01`;
      const activeBill = {
        id: 'bill-future', name: 'Future Bill', userId: 'u1', isActive: true,
        dueDay: 15, startDate: `${futureYear}-01-01`, amount: 200, type: 'expense',
      };
      mockGet
        .mockResolvedValueOnce({ empty: false, docs: [{ id: activeBill.id, data: () => activeBill }] })
        .mockResolvedValueOnce({ empty: true, docs: [] });

      mockAdd.mockResolvedValue({ id: 'occ-future' });

      await (service as any).generateOccurrencesForPeriod('u1', futurePeriod);

      expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending' }));
    });

    it('skips bills where startDate comes after the requested period', async () => {
      const activeBill = {
        id: 'bill-late', name: 'Late Bill', userId: 'u1', isActive: true,
        dueDay: 10, startDate: '2027-06-01', amount: 100, type: 'expense',
      };
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [{ id: activeBill.id, data: () => activeBill }],
      });

      mockAdd.mockResolvedValue({ id: 'should-not-happen' });

      await (service as any).generateOccurrencesForPeriod('u1', '2026-01');

      expect(mockAdd).not.toHaveBeenCalled();
    });

    it('skips if occurrence already exists for that period', async () => {
      const activeBill = {
        id: 'bill-dup', name: 'Dupe Bill', userId: 'u1', isActive: true,
        dueDay: 5, startDate: '2026-01-01', amount: 300, type: 'expense',
      };
      const existingOcc = { id: 'occ-existing', data: () => ({ billId: 'bill-dup', period: '2026-07' }) };
      mockGet
        .mockResolvedValueOnce({ empty: false, docs: [{ id: activeBill.id, data: () => activeBill }] })
        .mockResolvedValueOnce({ empty: false, docs: [existingOcc] }); // occurrence already exists

      await (service as any).generateOccurrencesForPeriod('u1', '2026-07');

      expect(mockAdd).not.toHaveBeenCalled();
    });
  });

  // ─── updateBill ───────────────────────────────────────────────────────────

  describe('updateBill', () => {
    it('updates bill fields and returns merged result', async () => {
      const existing = ownerDoc({ userId: 'u1', name: 'Old Name', amount: 100 });
      mockDocGet.mockResolvedValueOnce(existing);
      mockDocUpdate.mockResolvedValue({});

      const result: any = await service.updateBill('u1', 'bill-1', { name: 'New Name', amount: 150 });

      expect(result.name).toBe('New Name');
      expect(result.amount).toBe(150);
      expect(mockDocUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name', amount: 150 }));
    });
  });
});
