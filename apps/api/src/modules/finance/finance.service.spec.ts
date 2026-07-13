import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FirebaseService } from '../../config/firebase.service';

describe('FinanceService', () => {
  let service: FinanceService;

  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    add: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockFirebaseService = { getFirestore: jest.fn(() => mockFirestore) };

  const USER = 'user-123';

  const mockAccount = {
    id: 'acc-1',
    name: 'Checking',
    type: 'checking',
    balance: 1000,
    currency: 'USD',
    userId: USER,
  };

  const docExists = (id: string, data: object) => ({
    exists: true,
    id,
    data: () => data,
  });

  const docMissing = () => ({ exists: false });

  const snap = (docs: { id: string; data: object }[]) => ({
    docs: docs.map((d) => ({ id: d.id, data: () => d.data })),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);

    // resetAllMocks clears both call history and default return values from previous tests
    jest.resetAllMocks();
    // Re-wire chainable methods after reset
    mockFirestore.collection.mockReturnThis();
    mockFirestore.where.mockReturnThis();
    mockFirestore.orderBy.mockReturnThis();
    mockFirestore.limit.mockReturnThis();
    mockFirestore.doc.mockReturnThis();
    mockFirebaseService.getFirestore.mockReturnValue(mockFirestore);

    // Silence exchange-rate fetch in tests
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({ rates: { BRL: 5 } }),
    } as any);
  });

  // ─── Accounts ──────────────────────────────────────────────────────────────

  describe('createAccount', () => {
    it('creates account with defaults', async () => {
      mockFirestore.add.mockResolvedValue({ id: 'acc-1' });

      const result = await service.createAccount(USER, { name: 'Checking', type: 'checking' } as any);

      expect(result.id).toBe('acc-1');
      expect(result.balance).toBe(0);
      expect(result.currency).toBe('USD');
      expect(result.userId).toBe(USER);
    });

    it('preserves explicit balance and currency', async () => {
      mockFirestore.add.mockResolvedValue({ id: 'acc-2' });

      const result = await service.createAccount(USER, {
        name: 'Poupança',
        type: 'savings',
        balance: 500,
        currency: 'BRL',
      } as any);

      expect(result.balance).toBe(500);
      expect(result.currency).toBe('BRL');
    });
  });

  describe('findAccounts', () => {
    it('returns all accounts for user', async () => {
      mockFirestore.get.mockResolvedValue(snap([{ id: 'acc-1', data: mockAccount }]));

      const result = await service.findAccounts(USER);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('acc-1');
    });
  });

  describe('updateAccount', () => {
    it('updates account fields', async () => {
      mockFirestore.get
        .mockResolvedValueOnce(docExists('acc-1', mockAccount))
        .mockResolvedValueOnce(docExists('acc-1', { ...mockAccount, name: 'Updated' }));

      const result = await service.updateAccount(USER, 'acc-1', { name: 'Updated' } as any) as any;

      expect(mockFirestore.update).toHaveBeenCalled();
      expect(result.name).toBe('Updated');
    });

    it('throws NotFoundException for wrong owner', async () => {
      mockFirestore.get.mockResolvedValue(docExists('acc-1', { ...mockAccount, userId: 'other' }));

      await expect(service.updateAccount(USER, 'acc-1', {} as any)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when not found', async () => {
      mockFirestore.get.mockResolvedValue(docMissing());

      await expect(service.updateAccount(USER, 'acc-1', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAccount', () => {
    it('deletes owned account', async () => {
      mockFirestore.get.mockResolvedValue(docExists('acc-1', mockAccount));

      const result = await service.deleteAccount(USER, 'acc-1');

      expect(mockFirestore.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Account deleted' });
    });
  });

  // ─── Categories ─────────────────────────────────────────────────────────────

  describe('createCategory', () => {
    it('creates a category', async () => {
      mockFirestore.add.mockResolvedValue({ id: 'cat-1' });

      const result = await service.createCategory(USER, { name: 'Food', type: 'expense' } as any);

      expect(result.id).toBe('cat-1');
      expect(result.userId).toBe(USER);
    });
  });

  describe('findCategories', () => {
    it('returns categories, filtered by type when provided', async () => {
      mockFirestore.get.mockResolvedValue(
        snap([{ id: 'cat-1', data: { name: 'Food', type: 'expense' } }]),
      );

      const result = await service.findCategories(USER, 'expense');

      expect(result).toHaveLength(1);
      expect(mockFirestore.where).toHaveBeenCalledWith('type', '==', 'expense');
    });
  });

  // ─── Transactions ───────────────────────────────────────────────────────────

  describe('createTransaction', () => {
    it('creates transaction and adjusts account balance', async () => {
      mockFirestore.add.mockResolvedValue({ id: 'tx-1' });
      // adjustBalance calls assertOwner which calls doc().get()
      mockFirestore.get.mockResolvedValue(docExists('acc-1', mockAccount));

      const result = await service.createTransaction(USER, {
        accountId: 'acc-1',
        amount: 100,
        type: 'income',
        date: '2024-01-15',
        categoryId: 'cat-1',
        description: 'Salary',
      } as any);

      expect(result.id).toBe('tx-1');
      // balance should be incremented for income
      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ balance: 1100 }),
      );
    });

    it('decrements balance for expense', async () => {
      mockFirestore.add.mockResolvedValue({ id: 'tx-2' });
      mockFirestore.get.mockResolvedValue(docExists('acc-1', mockAccount));

      await service.createTransaction(USER, {
        accountId: 'acc-1',
        amount: 200,
        type: 'expense',
        date: '2024-01-15',
        categoryId: 'cat-1',
        description: 'Groceries',
      } as any);

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ balance: 800 }),
      );
    });
  });

  describe('deleteTransaction', () => {
    it('reverses balance on delete', async () => {
      const tx = { userId: USER, accountId: 'acc-1', amount: 100, type: 'income' };
      mockFirestore.get
        .mockResolvedValueOnce(docExists('tx-1', tx))  // assertOwner for tx
        .mockResolvedValueOnce(docExists('acc-1', mockAccount)); // assertOwner inside adjustBalance

      const result = await service.deleteTransaction(USER, 'tx-1');

      expect(result).toEqual({ message: 'Transaction deleted' });
      // income reversal → expense → balance decremented
      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ balance: 900 }),
      );
    });
  });

  // ─── Recurring ──────────────────────────────────────────────────────────────

  describe('applyRecurring', () => {
    it('creates a transaction and advances nextDueDate', async () => {
      const rule = {
        userId: USER,
        accountId: 'acc-1',
        categoryId: 'cat-1',
        amount: 50,
        type: 'expense',
        description: 'Netflix',
        frequency: 'monthly',
        nextDueDate: '2024-01-15',
      };

      mockFirestore.add.mockResolvedValue({ id: 'tx-new' });
      mockFirestore.get
        .mockResolvedValueOnce(docExists('rule-1', rule))  // assertOwner for rule
        .mockResolvedValueOnce(docExists('acc-1', mockAccount)); // adjustBalance

      const result = await service.applyRecurring(USER, 'rule-1') as any;

      expect(result.transaction.id).toBe('tx-new');
      expect(result.nextDueDate).toBe('2024-02-15');
    });
  });

  describe('calcNextDueDate (via applyRecurring)', () => {
    const frequencies: [string, string, string][] = [
      ['daily',   '2024-01-15', '2024-01-16'],
      ['weekly',  '2024-01-15', '2024-01-22'],
      ['monthly', '2024-01-15', '2024-02-15'],
      ['yearly',  '2024-01-15', '2025-01-15'],
    ];

    it.each(frequencies)('%s: advances date correctly', async (frequency, from, expected) => {
      const rule = {
        userId: USER, accountId: 'acc-1', categoryId: 'cat-1',
        amount: 10, type: 'expense', description: 'sub',
        frequency, nextDueDate: from,
      };
      mockFirestore.add.mockResolvedValue({ id: 'tx-x' });
      mockFirestore.get
        .mockResolvedValueOnce(docExists('r-1', rule))
        .mockResolvedValueOnce(docExists('acc-1', mockAccount));

      const result = await service.applyRecurring(USER, 'r-1') as any;
      expect(result.nextDueDate).toBe(expected);
    });
  });

  // ─── Budgets ────────────────────────────────────────────────────────────────

  describe('findBudgets', () => {
    it('returns empty array when no budgets', async () => {
      mockFirestore.get.mockResolvedValue(snap([]));

      const result = await service.findBudgets(USER, '2024-01');

      expect(result).toEqual([]);
    });

    it('cross-references transactions to compute spent', async () => {
      const budget = { categoryId: 'cat-1', limit: 300, month: '2024-01', userId: USER };
      const txDocs = [
        { id: 'tx-1', data: { categoryId: 'cat-1', amount: 50, type: 'expense', date: '2024-01-10', userId: USER } },
        { id: 'tx-2', data: { categoryId: 'cat-1', amount: 80, type: 'expense', date: '2024-01-20', userId: USER } },
        { id: 'tx-3', data: { categoryId: 'cat-1', amount: 200, type: 'income', date: '2024-01-05', userId: USER } },
      ];

      // Dispatch get() by collection name so budgets and transactions queries are fully isolated
      const makeColl = (getMock: jest.Mock) => {
        const coll: any = { where: () => coll, get: getMock };
        return coll;
      };
      mockFirestore.collection.mockImplementation((name: string) =>
        name === 'finance_budgets'
          ? makeColl(jest.fn().mockResolvedValue(snap([{ id: 'bud-1', data: budget }])))
          : makeColl(jest.fn().mockResolvedValue(snap(txDocs))),
      );

      const result = await service.findBudgets(USER, '2024-01') as any[];

      expect(result[0].spent).toBe(130);
    });
  });

  // ─── Investments ─────────────────────────────────────────────────────────────

  describe('createInvestment', () => {
    it('creates investment with totalContributed = 0', async () => {
      mockFirestore.add.mockResolvedValue({ id: 'inv-1' });

      const result = await service.createInvestment(USER, {
        name: 'PETR4',
        type: 'stock',
      } as any);

      expect(result.totalContributed).toBe(0);
      expect(result.currency).toBe('USD');
    });
  });

  describe('createInvestmentEntry', () => {
    it('updates totalContributed and adjusts linked account balance', async () => {
      const investment = { userId: USER, totalContributed: 100, accountId: 'acc-1', name: 'PETR4' };

      mockFirestore.add.mockResolvedValue({ id: 'entry-1' });
      mockFirestore.get
        .mockResolvedValueOnce(docExists('inv-1', investment))  // assertOwner for investmentId
        .mockResolvedValueOnce(docExists('inv-1', investment))  // assertOwner inside createInvestmentEntry
        .mockResolvedValueOnce(docExists('acc-1', mockAccount)); // adjustBalance

      await service.createInvestmentEntry(USER, {
        investmentId: 'inv-1',
        amount: 50,
        date: '2024-01-20',
      } as any);

      // totalContributed updated to 150
      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ totalContributed: 150 }),
      );
      // account balance decremented (expense)
      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ balance: 950 }),
      );
    });

    it('rejects invalid amount', async () => {
      mockFirestore.get.mockResolvedValue(docExists('inv-1', { userId: USER }));

      await expect(
        service.createInvestmentEntry(USER, { investmentId: 'inv-1', amount: -5, date: '2024-01-01' } as any),
      ).rejects.toThrow();
    });
  });

  describe('deleteInvestmentEntry', () => {
    it('reverses totalContributed and restores account balance', async () => {
      const entry = { userId: USER, investmentId: 'inv-1', amount: 50 };
      const investment = { userId: USER, totalContributed: 150, accountId: 'acc-1' };

      mockFirestore.get
        .mockResolvedValueOnce(docExists('entry-1', entry))
        .mockResolvedValueOnce(docExists('inv-1', investment))
        .mockResolvedValueOnce(docExists('acc-1', mockAccount));

      const result = await service.deleteInvestmentEntry(USER, 'entry-1');

      expect(result).toEqual({ message: 'Entry deleted' });
      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({ totalContributed: 100 }),
      );
    });
  });
});
