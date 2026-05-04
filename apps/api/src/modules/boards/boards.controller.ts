import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Controller('boards')
@UseGuards(FirebaseAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // ─── Boards ────────────────────────────────────────────────────────────────

  @Post()
  createBoard(@Request() req, @Body() dto: CreateBoardDto) {
    return this.boardsService.createBoard(req.user.uid, dto);
  }

  @Post('default')
  ensureDefaultBoard(@Request() req) {
    return this.boardsService.createDefaultBoard(req.user.uid);
  }

  @Get()
  findAllBoards(@Request() req) {
    return this.boardsService.findAllBoards(req.user.uid);
  }

  @Get(':boardId')
  findOneBoard(@Request() req, @Param('boardId') boardId: string) {
    return this.boardsService.findOneBoard(req.user.uid, boardId);
  }

  @Patch(':boardId')
  updateBoard(
    @Request() req,
    @Param('boardId') boardId: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardsService.updateBoard(req.user.uid, boardId, dto);
  }

  @Delete(':boardId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBoard(@Request() req, @Param('boardId') boardId: string) {
    return this.boardsService.deleteBoard(req.user.uid, boardId);
  }

  // ─── Columns ───────────────────────────────────────────────────────────────

  @Post(':boardId/columns')
  createColumn(
    @Request() req,
    @Param('boardId') boardId: string,
    @Body() dto: CreateColumnDto,
  ) {
    return this.boardsService.createColumn(req.user.uid, boardId, dto);
  }

  @Get(':boardId/columns')
  findAllColumns(@Request() req, @Param('boardId') boardId: string) {
    return this.boardsService.findAllColumns(req.user.uid, boardId);
  }

  @Patch(':boardId/columns/:columnId')
  updateColumn(
    @Request() req,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.boardsService.updateColumn(req.user.uid, boardId, columnId, dto);
  }

  @Delete(':boardId/columns/:columnId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteColumn(
    @Request() req,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.boardsService.deleteColumn(req.user.uid, boardId, columnId);
  }

  // ─── Kanban ────────────────────────────────────────────────────────────────

  @Get(':boardId/kanban')
  getKanban(@Request() req, @Param('boardId') boardId: string) {
    return this.boardsService.getKanban(req.user.uid, boardId);
  }
}
