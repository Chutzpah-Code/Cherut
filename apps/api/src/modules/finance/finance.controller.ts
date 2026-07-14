import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import {
  CreateAccountDto, UpdateAccountDto,
  CreateCategoryDto, UpdateCategoryDto,
  CreateTransactionDto, UpdateTransactionDto,
  CreateBudgetDto, UpdateBudgetDto,
  CreateInvestmentDto, UpdateInvestmentDto,
  CreateInvestmentEntryDto,
} from './dto';
import { PayStatementDto } from './dto/pay-statement.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('finance')
@UseGuards(FirebaseAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Overview
  @Get('overview')
  getOverview(
    @Request() req,
    @Query('month') month?: string,
    @Query('displayCurrency') displayCurrency?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.getOverview(req.user.uid, month, displayCurrency ?? 'USD', startDate, endDate);
  }

  // Accounts
  @Post('accounts')
  createAccount(@Request() req, @Body() dto: CreateAccountDto) {
    return this.financeService.createAccount(req.user.uid, dto);
  }

  @Get('accounts')
  findAccounts(@Request() req) {
    return this.financeService.findAccounts(req.user.uid);
  }

  @Patch('accounts/:id')
  updateAccount(@Request() req, @Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.financeService.updateAccount(req.user.uid, id, dto);
  }

  @Delete('accounts/:id')
  deleteAccount(@Request() req, @Param('id') id: string) {
    return this.financeService.deleteAccount(req.user.uid, id);
  }

  @Post('accounts/:id/recalculate-balance')
  recalculateBalance(@Request() req, @Param('id') id: string) {
    return this.financeService.recalculateBalance(req.user.uid, id);
  }

  // Categories
  @Post('categories')
  createCategory(@Request() req, @Body() dto: CreateCategoryDto) {
    return this.financeService.createCategory(req.user.uid, dto);
  }

  @Get('categories')
  findCategories(@Request() req, @Query('type') type?: string) {
    return this.financeService.findCategories(req.user.uid, type);
  }

  @Patch('categories/:id')
  updateCategory(@Request() req, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.financeService.updateCategory(req.user.uid, id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Request() req, @Param('id') id: string) {
    return this.financeService.deleteCategory(req.user.uid, id);
  }

  // Transactions
  @Post('transactions')
  createTransaction(@Request() req, @Body() dto: CreateTransactionDto) {
    return this.financeService.createTransaction(req.user.uid, dto);
  }

  @Get('transactions')
  findTransactions(
    @Request() req,
    @Query('accountId') accountId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
  ) {
    return this.financeService.findTransactions(req.user.uid, { accountId, startDate, endDate, type });
  }

  @Patch('transactions/:id')
  updateTransaction(@Request() req, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.financeService.updateTransaction(req.user.uid, id, dto);
  }

  @Delete('transactions/:id')
  deleteTransaction(@Request() req, @Param('id') id: string) {
    return this.financeService.deleteTransaction(req.user.uid, id);
  }

  // Budgets
  @Post('budgets')
  createBudget(@Request() req, @Body() dto: CreateBudgetDto) {
    return this.financeService.createBudget(req.user.uid, dto);
  }

  @Get('budgets')
  findBudgets(@Request() req, @Query('month') month?: string) {
    return this.financeService.findBudgets(req.user.uid, month);
  }

  @Patch('budgets/:id')
  updateBudget(@Request() req, @Param('id') id: string, @Body() dto: UpdateBudgetDto) {
    return this.financeService.updateBudget(req.user.uid, id, dto);
  }

  @Delete('budgets/:id')
  deleteBudget(@Request() req, @Param('id') id: string) {
    return this.financeService.deleteBudget(req.user.uid, id);
  }

  // Investments
  @Post('investments')
  createInvestment(@Request() req, @Body() dto: CreateInvestmentDto) {
    return this.financeService.createInvestment(req.user.uid, dto);
  }

  @Get('investments')
  findInvestments(@Request() req) {
    return this.financeService.findInvestments(req.user.uid);
  }

  @Patch('investments/:id')
  updateInvestment(@Request() req, @Param('id') id: string, @Body() dto: UpdateInvestmentDto) {
    return this.financeService.updateInvestment(req.user.uid, id, dto);
  }

  @Delete('investments/:id')
  deleteInvestment(@Request() req, @Param('id') id: string) {
    return this.financeService.deleteInvestment(req.user.uid, id);
  }

  @Post('investments/entries')
  createInvestmentEntry(@Request() req, @Body() dto: CreateInvestmentEntryDto) {
    return this.financeService.createInvestmentEntry(req.user.uid, dto);
  }

  @Get('investments/:id/entries')
  findInvestmentEntries(@Request() req, @Param('id') id: string) {
    return this.financeService.findInvestmentEntries(req.user.uid, id);
  }

  @Delete('investments/entries/:id')
  deleteInvestmentEntry(@Request() req, @Param('id') id: string) {
    return this.financeService.deleteInvestmentEntry(req.user.uid, id);
  }

  // Statements (credit card)
  @Get('accounts/:id/statement/current')
  getCurrentStatement(@Request() req, @Param('id') id: string) {
    return this.financeService.getCurrentStatement(req.user.uid, id);
  }

  @Get('accounts/:id/statements')
  getStatements(@Request() req, @Param('id') id: string) {
    return this.financeService.getStatements(req.user.uid, id);
  }

  @Post('accounts/:id/statement/close')
  closeStatement(@Request() req, @Param('id') id: string) {
    return this.financeService.closeStatement(req.user.uid, id);
  }

  @Post('accounts/:id/statements/:sid/pay')
  payStatement(@Request() req, @Param('id') id: string, @Param('sid') sid: string, @Body() dto: PayStatementDto) {
    return this.financeService.payStatement(req.user.uid, id, sid, dto);
  }
}
