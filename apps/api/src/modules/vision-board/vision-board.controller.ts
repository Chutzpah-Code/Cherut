import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { VisionBoardService } from './vision-board.service';
import { CreateVisionBoardItemDto } from './dto/create-vision-board-item.dto';
import { UpdateVisionBoardItemDto } from './dto/update-vision-board-item.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

/**
 * 🎯 VISION BOARD CONTROLLER
 *
 * Endpoints:
 * POST   /vision-board/upload       - Upload de imagem (retorna URL)
 * POST   /vision-board              - Criar item
 * GET    /vision-board              - Listar todos os itens
 * GET    /vision-board/:id          - Buscar um item
 * PATCH  /vision-board/:id          - Atualizar item
 * DELETE /vision-board/:id          - Deletar item
 * PATCH  /vision-board/reorder      - Reordenar itens (drag-and-drop)
 */

@Controller('vision-board')
@UseGuards(FirebaseAuthGuard) // Todas as rotas requerem autenticação
export class VisionBoardController {
  constructor(private readonly visionBoardService: VisionBoardService) {}

  /**
   * 📤 UPLOAD DE IMAGEM
   *
   * IMPORTANTE: Este endpoint retorna apenas a URL da imagem
   * O cliente deve usar essa URL ao criar o item do vision board
   *
   * PROTEÇÕES:
   * - Apenas imagens (PNG, JPG, JPEG, WEBP)
   * - Máximo 1MB
   * - Validação no backend (NUNCA confie só no frontend!)
   */
  @Post('upload')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 1 * 1024 * 1024, // 1MB
        files: 1,
      },
      fileFilter: (req, file, callback) => {
        // Validação adicional de MIME type
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (!allowedMimes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Only image files are allowed (PNG, JPG, JPEG, WEBP)'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user.uid;
    return this.visionBoardService.uploadImage(userId, file);
  }

  /**
   * 📤 UPLOAD DE ÁUDIO (trilha própria de visualização)
   *
   * PROTEÇÕES: MP3/M4A/WAV, máximo 10MB. Duração (máx 5min) é validada a
   * partir do valor reportado pelo cliente — sem checagem server-side de
   * duração real (sem ffprobe neste projeto).
   */
  @Post('upload-audio')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(
    FileInterceptor('audio', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1,
      },
      fileFilter: (req, file, callback) => {
        const allowedMimes = ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/webm'];

        if (!allowedMimes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Only MP3, M4A, or WAV files are allowed'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body('durationSec') durationSec: string,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user.uid;
    return this.visionBoardService.uploadAudio(userId, file, Number(durationSec));
  }

  /**
   * 📊 RESUMO DE PRÁTICA POR META (histórico 7 dias + contagem vitalícia)
   *
   * Declarada antes de GET /:id para não ser capturada pela rota param.
   */
  @Get('practice-summary')
  getPracticeSummary(@Request() req) {
    const userId = req.user.uid;
    return this.visionBoardService.getPracticeSummary(userId);
  }

  /**
   * 🧭 ÚLTIMO CHECK-IN DO USUÁRIO (pré-preenche a próxima sessão)
   *
   * Declarada antes de GET /:id para não ser capturada pela rota param.
   */
  @Get('session-state')
  getSessionState(@Request() req) {
    const userId = req.user.uid;
    return this.visionBoardService.getSessionState(userId);
  }

  /**
   * ✅ REGISTRAR SESSÃO DE PRÁTICA CONCLUÍDA
   */
  @Post('practice-sessions')
  logPracticeSession(
    @Body() body: { entries: { itemId: string; date: string }[]; feeling: string; energy: number; confidence: number },
    @Request() req,
  ) {
    const userId = req.user.uid;
    return this.visionBoardService.logPracticeSession(userId, body.entries, body.feeling, body.energy, body.confidence);
  }

  /**
   * ✨ CRIAR ITEM NO VISION BOARD
   */
  @Post()
  create(@Body() createDto: CreateVisionBoardItemDto, @Request() req) {
    const userId = req.user.uid;
    return this.visionBoardService.create(userId, createDto);
  }

  /**
   * 📋 LISTAR TODOS OS ITENS
   */
  @Get()
  findAll(@Request() req, @Query('archived') archived?: string) {
    const userId = req.user.uid;
    return this.visionBoardService.findAll(
      userId,
      archived === 'true'
    );
  }

  /**
   * 🔍 BUSCAR UM ITEM
   */
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.uid;
    return this.visionBoardService.findOne(userId, id);
  }

  /**
   * ✏️ ATUALIZAR ITEM
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateVisionBoardItemDto,
    @Request() req,
  ) {
    const userId = req.user.uid;
    return this.visionBoardService.update(userId, id, updateDto);
  }

  /**
   * 🗑️ DELETAR ITEM (e a imagem do Storage)
   */
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.uid;
    return this.visionBoardService.remove(userId, id);
  }

  /**
   * 🔄 REORDENAR ITENS (drag-and-drop)
   *
   * Body exemplo:
   * {
   *   "items": [
   *     { "id": "abc123", "order": 0 },
   *     { "id": "def456", "order": 1 },
   *     { "id": "ghi789", "order": 2 }
   *   ]
   * }
   */
  @Patch('reorder/items')
  updateOrder(
    @Body() body: { items: { id: string; order: number }[] },
    @Request() req,
  ) {
    const userId = req.user.uid;
    return this.visionBoardService.updateOrder(userId, body.items);
  }

  /**
   * 📦 ARQUIVAR/DESARQUIVAR ITEM (toggle isActive status)
   */
  @Patch(':id/archive')
  toggleArchive(@Param('id') id: string, @Request() req) {
    const userId = req.user.uid;
    return this.visionBoardService.toggleArchive(userId, id);
  }
}
