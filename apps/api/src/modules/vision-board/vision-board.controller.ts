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
  findAll(@Request() req) {
    const userId = req.user.uid;
    return this.visionBoardService.findAll(userId);
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
}
