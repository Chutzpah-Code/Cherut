import { Test, TestingModule } from '@nestjs/testing';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

describe('FinanceController', () => {
  let controller: FinanceController;
  let service: FinanceService;

  const mockService = {
    getOverview: jest.fn(),
    createAccount: jest.fn(),
    findAccounts: jest.fn(),
    updateAccount: jest.fn(),
    deleteAccount: jest.fn(),
    createCategory: jest.fn(),
    findCategories: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
    createTransaction: jest.fn(),
    findTransactions: jest.fn(),
    updateTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
    createRecurring: jest.fn(),
    findRecurring: jest.fn(),
    updateRecurring: jest.fn(),
    deleteRecurring: jest.fn(),
    applyRecurring: jest.fn(),
    createBudget: jest.fn(),
    findBudgets: jest.fn(),
    updateBudget: jest.fn(),
    deleteBudget: jest.fn(),
    createInvestment: jest.fn(),
    findInvestments: jest.fn(),
    updateInvestment: jest.fn(),
    deleteInvestment: jest.fn(),
    createInvestmentEntry: jest.fn(),
    findInvestmentEntries: jest.fn(),
    deleteInvestmentEntry: jest.fn(),
    getCurrentStatement: jest.fn(),
    getStatements: jest.fn(),
    closeStatement: jest.fn(),
    payStatement: jest.fn(),
  };

  const req = { user: { uid: 'user-123' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinanceController],
      providers: [{ provide: FinanceService, useValue: mockService }],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<FinanceController>(FinanceController);
    service = module.get<FinanceService>(FinanceService);
    jest.clearAllMocks();
  });

  describe('authentication', () => {
    it('should be protected by FirebaseAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', FinanceController);
      expect(guards).toContain(FirebaseAuthGuard);
    });
  });

  describe('getOverview', () => {
    it('delegates with defaults', async () => {
      mockService.getOverview.mockResolvedValue({ totalBalanceConverted: 0 });
      await controller.getOverview(req);
      expect(service.getOverview).toHaveBeenCalledWith('user-123', undefined, 'USD', undefined, undefined);
    });

    it('passes query params through', async () => {
      mockService.getOverview.mockResolvedValue({});
      await controller.getOverview(req, '2024-01', 'BRL');
      expect(service.getOverview).toHaveBeenCalledWith('user-123', '2024-01', 'BRL', undefined, undefined);
    });
  });

  describe('accounts', () => {
    it('createAccount passes uid and dto', async () => {
      const dto = { name: 'Checking' } as any;
      mockService.createAccount.mockResolvedValue({ id: 'acc-1' });
      await controller.createAccount(req, dto);
      expect(service.createAccount).toHaveBeenCalledWith('user-123', dto);
    });

    it('findAccounts passes uid', async () => {
      mockService.findAccounts.mockResolvedValue([]);
      await controller.findAccounts(req);
      expect(service.findAccounts).toHaveBeenCalledWith('user-123');
    });

    it('updateAccount passes uid, id, dto', async () => {
      const dto = { name: 'Updated' } as any;
      mockService.updateAccount.mockResolvedValue({ id: 'acc-1' });
      await controller.updateAccount(req, 'acc-1', dto);
      expect(service.updateAccount).toHaveBeenCalledWith('user-123', 'acc-1', dto);
    });

    it('deleteAccount passes uid and id', async () => {
      mockService.deleteAccount.mockResolvedValue({ message: 'Account deleted' });
      await controller.deleteAccount(req, 'acc-1');
      expect(service.deleteAccount).toHaveBeenCalledWith('user-123', 'acc-1');
    });
  });

  describe('categories', () => {
    it('findCategories passes type filter', async () => {
      mockService.findCategories.mockResolvedValue([]);
      await controller.findCategories(req, 'expense');
      expect(service.findCategories).toHaveBeenCalledWith('user-123', 'expense');
    });
  });

  describe('transactions', () => {
    it('findTransactions passes all filters', async () => {
      mockService.findTransactions.mockResolvedValue([]);
      await controller.findTransactions(req, 'acc-1', '2024-01-01', '2024-01-31', 'expense');
      expect(service.findTransactions).toHaveBeenCalledWith('user-123', {
        accountId: 'acc-1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        type: 'expense',
      });
    });
  });

  describe('recurring', () => {
    it('findRecurring converts isActive string to boolean', async () => {
      mockService.findRecurring.mockResolvedValue([]);

      await controller.findRecurring(req, 'true');
      expect(service.findRecurring).toHaveBeenCalledWith('user-123', true);

      await controller.findRecurring(req, 'false');
      expect(service.findRecurring).toHaveBeenCalledWith('user-123', false);

      await controller.findRecurring(req, undefined);
      expect(service.findRecurring).toHaveBeenCalledWith('user-123', undefined);
    });

    it('applyRecurring delegates correctly', async () => {
      mockService.applyRecurring.mockResolvedValue({ transaction: {}, nextDueDate: '2024-02-15' });
      await controller.applyRecurring(req, 'rule-1');
      expect(service.applyRecurring).toHaveBeenCalledWith('user-123', 'rule-1');
    });
  });

  describe('budgets', () => {
    it('findBudgets passes month', async () => {
      mockService.findBudgets.mockResolvedValue([]);
      await controller.findBudgets(req, '2024-01');
      expect(service.findBudgets).toHaveBeenCalledWith('user-123', '2024-01');
    });
  });

  describe('investments', () => {
    it('createInvestmentEntry passes dto', async () => {
      const dto = { investmentId: 'inv-1', amount: 100, date: '2024-01-01' } as any;
      mockService.createInvestmentEntry.mockResolvedValue({ id: 'entry-1' });
      await controller.createInvestmentEntry(req, dto);
      expect(service.createInvestmentEntry).toHaveBeenCalledWith('user-123', dto);
    });

    it('findInvestmentEntries passes investmentId', async () => {
      mockService.findInvestmentEntries.mockResolvedValue([]);
      await controller.findInvestmentEntries(req, 'inv-1');
      expect(service.findInvestmentEntries).toHaveBeenCalledWith('user-123', 'inv-1');
    });
  });

  describe('statements', () => {
    it('getCurrentStatement delegates', async () => {
      mockService.getCurrentStatement.mockResolvedValue({ status: 'open' });
      await controller.getCurrentStatement(req, 'acc-1');
      expect(service.getCurrentStatement).toHaveBeenCalledWith('user-123', 'acc-1');
    });

    it('closeStatement delegates', async () => {
      mockService.closeStatement.mockResolvedValue({ id: 'stmt-1', status: 'closed' });
      await controller.closeStatement(req, 'acc-1');
      expect(service.closeStatement).toHaveBeenCalledWith('user-123', 'acc-1');
    });

    it('payStatement passes all params', async () => {
      const dto = { fromAccountId: 'acc-2', amount: 500 };
      mockService.payStatement.mockResolvedValue({ status: 'paid' });
      await controller.payStatement(req, 'acc-1', 'stmt-1', dto as any);
      expect(service.payStatement).toHaveBeenCalledWith('user-123', 'acc-1', 'stmt-1', dto);
    });
  });
});
