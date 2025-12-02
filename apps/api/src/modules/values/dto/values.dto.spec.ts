import { validate } from 'class-validator';
import { CreateValueDto, UpdateValueDto } from './index';

describe('Values DTOs', () => {
  describe('CreateValueDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = new CreateValueDto();
      dto.title = 'Test Value';
      dto.shortDescription = 'Test description';
      dto.behaviors = 'Test behaviors';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only required fields', async () => {
      const dto = new CreateValueDto();
      dto.title = 'Test Value';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when title is missing', async () => {
      const dto = new CreateValueDto();
      dto.shortDescription = 'Test description';
      dto.behaviors = 'Test behaviors';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when title is empty string', async () => {
      const dto = new CreateValueDto();
      dto.title = '';
      dto.shortDescription = 'Test description';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should pass validation even with whitespace title (class-validator behavior)', async () => {
      const dto = new CreateValueDto();
      dto.title = '   ';
      dto.shortDescription = 'Test description';

      const errors = await validate(dto);
      // Note: @IsNotEmpty() allows whitespace-only strings by default
      expect(errors.length).toBe(0);
    });

    it('should fail validation when title is not a string', async () => {
      const dto = new CreateValueDto();
      (dto as any).title = 123;
      dto.shortDescription = 'Test description';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when shortDescription is not a string', async () => {
      const dto = new CreateValueDto();
      dto.title = 'Test Value';
      (dto as any).shortDescription = 123;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when behaviors is not a string', async () => {
      const dto = new CreateValueDto();
      dto.title = 'Test Value';
      (dto as any).behaviors = 123;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should pass validation when optional fields are undefined', async () => {
      const dto = new CreateValueDto();
      dto.title = 'Test Value';
      dto.shortDescription = undefined;
      dto.behaviors = undefined;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('UpdateValueDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = new UpdateValueDto();
      dto.title = 'Updated Value';
      dto.shortDescription = 'Updated description';
      dto.behaviors = 'Updated behaviors';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when all fields are undefined', async () => {
      const dto = new UpdateValueDto();

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only title', async () => {
      const dto = new UpdateValueDto();
      dto.title = 'Only Title';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only shortDescription', async () => {
      const dto = new UpdateValueDto();
      dto.shortDescription = 'Only Description';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only behaviors', async () => {
      const dto = new UpdateValueDto();
      dto.behaviors = 'Only Behaviors';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when title is empty string', async () => {
      const dto = new UpdateValueDto();
      dto.title = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when title is not a string', async () => {
      const dto = new UpdateValueDto();
      (dto as any).title = 123;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should inherit validation from CreateValueDto', async () => {
      const dto = new UpdateValueDto();
      dto.title = 'Valid Title';
      (dto as any).shortDescription = 123; // Invalid type

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('Data types and constraints', () => {
    it('should handle very long strings', async () => {
      const longString = 'A'.repeat(10000);

      const dto = new CreateValueDto();
      dto.title = longString;
      dto.shortDescription = longString;
      dto.behaviors = longString;

      const errors = await validate(dto);
      // Should pass validation (no length constraints defined)
      expect(errors.length).toBe(0);
    });

    it('should handle special characters in strings', async () => {
      const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?/~`\'"\\';

      const dto = new CreateValueDto();
      dto.title = `Special ${specialChars} Value`;
      dto.shortDescription = `Description with ${specialChars}`;
      dto.behaviors = `Behaviors with ${specialChars}`;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle Unicode characters', async () => {
      const dto = new CreateValueDto();
      dto.title = 'Valor em Português 🇧🇷';
      dto.shortDescription = '测试中文描述 中国';
      dto.behaviors = 'Поведение на русском языке';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});