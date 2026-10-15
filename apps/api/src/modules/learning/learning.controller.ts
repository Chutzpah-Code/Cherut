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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LearningService } from './learning.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { AdminOnly } from '../auth/guards/admin.guard';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateCourseModuleDto,
  UpdateCourseModuleDto,
  CreateLessonDto,
  UpdateLessonDto,
  EnrollDto,
  UpdateLessonProgressNotesDto,
} from './dto';

@Controller('learning')
@UseGuards(FirebaseAuthGuard)
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  private isAdmin(user: any): boolean {
    return user?.role === 'admin' || user?.isSystemAdmin === true;
  }

  // ─── Courses — reading ───────────────────────────────────────────────────

  @Get('courses')
  findAllCourses(@Request() req) {
    return this.learningService.findAllCourses(req.user.uid, req.user.subscription?.plan, this.isAdmin(req.user));
  }

  @Get('courses/:id')
  findCourseDetail(@Request() req, @Param('id') id: string) {
    return this.learningService.findCourseDetail(req.user.uid, id, req.user.subscription?.plan, this.isAdmin(req.user));
  }

  // ─── Courses — admin authoring ───────────────────────────────────────────

  @Post('courses')
  @AdminOnly()
  createCourse(@Body() dto: CreateCourseDto) {
    return this.learningService.createCourse(dto);
  }

  @Patch('courses/:id')
  @AdminOnly()
  updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.learningService.updateCourse(id, dto);
  }

  @Delete('courses/:id')
  @AdminOnly()
  deleteCourse(@Param('id') id: string) {
    return this.learningService.deleteCourse(id);
  }

  @Post('courses/:id/cover')
  @AdminOnly()
  @UseInterceptors(
    FileInterceptor('cover', {
      limits: { fileSize: 2 * 1024 * 1024, files: 1 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        cb(
          allowed.includes(file.mimetype) ? null : new BadRequestException('Only JPEG, PNG or WebP images are allowed'),
          allowed.includes(file.mimetype),
        );
      },
    }),
  )
  uploadCourseCover(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.learningService.uploadCourseCover(id, file);
  }

  // ─── Modules — admin authoring ───────────────────────────────────────────

  @Post('courses/:id/modules')
  @AdminOnly()
  createModule(@Param('id') courseId: string, @Body() dto: CreateCourseModuleDto) {
    return this.learningService.createModule(courseId, dto);
  }

  @Patch('modules/:id')
  @AdminOnly()
  updateModule(@Param('id') id: string, @Body() dto: UpdateCourseModuleDto) {
    return this.learningService.updateModule(id, dto);
  }

  @Delete('modules/:id')
  @AdminOnly()
  deleteModule(@Param('id') id: string) {
    return this.learningService.deleteModule(id);
  }

  // ─── Lessons — admin authoring ───────────────────────────────────────────

  @Post('modules/:id/lessons')
  @AdminOnly()
  createLesson(@Param('id') moduleId: string, @Body() dto: CreateLessonDto) {
    return this.learningService.createLesson(moduleId, dto);
  }

  @Patch('lessons/:id')
  @AdminOnly()
  updateLesson(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.learningService.updateLesson(id, dto);
  }

  @Delete('lessons/:id')
  @AdminOnly()
  deleteLesson(@Param('id') id: string) {
    return this.learningService.deleteLesson(id);
  }

  // ─── Progress + enrollment — any authenticated user ─────────────────────

  @Post('lessons/:id/toggle')
  toggleLessonProgress(@Request() req, @Param('id') lessonId: string) {
    return this.learningService.toggleLessonProgress(req.user.uid, lessonId);
  }

  @Post('courses/:id/enroll')
  enroll(@Request() req, @Param('id') courseId: string, @Body() dto: EnrollDto) {
    return this.learningService.enrollInCourse(req.user.uid, courseId, dto.pace);
  }

  @Patch('lessons/:id/progress-notes')
  updateLessonProgressNotes(@Request() req, @Param('id') lessonId: string, @Body() dto: UpdateLessonProgressNotesDto) {
    return this.learningService.updateLessonProgressNotes(req.user.uid, lessonId, dto);
  }
}
