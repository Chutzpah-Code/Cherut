import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

/**
 * 🌥️ CLOUDINARY SERVICE
 *
 * Serviço responsável por gerenciar uploads de imagens no Cloudinary.
 *
 * FUNCIONALIDADES:
 * - Upload de imagens via buffer
 * - Geração de URLs públicas
 * - Deleção de imagens
 * - Transformações automáticas (resize, otimização)
 *
 * BENEFÍCIOS DO CLOUDINARY:
 * - 25GB gratuitos
 * - CDN global automático
 * - Otimização de imagens
 * - Transformações on-the-fly
 * - Backup automático
 */

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    this.initializeCloudinary();
  }

  /**
   * Inicializa o Cloudinary com as credenciais do .env
   */
  private initializeCloudinary() {
    const cloudName = this.configService.get<string>('cloudinary.cloudName');
    const apiKey = this.configService.get<string>('cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('cloudinary.apiSecret');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.error('Cloudinary credentials are missing. Please check your .env file.');
      throw new Error('Cloudinary configuration is incomplete');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    this.logger.log('✅ Cloudinary initialized successfully');
  }

  /**
   * Faz upload de uma imagem para o Cloudinary
   *
   * @param fileBuffer - Buffer da imagem
   * @param userId - ID do usuário (para organizar as imagens)
   * @returns URL pública da imagem
   */
  async uploadImage(fileBuffer: Buffer, userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `cherut/vision-board/${userId}`, // Organiza por usuário
          resource_type: 'image',
          // Transformações automáticas
          transformation: [
            {
              width: 1200, // Máximo 1200px de largura
              height: 1200, // Máximo 1200px de altura
              crop: 'limit', // Não aumenta imagens pequenas
              quality: 'auto:good', // Otimização automática
              fetch_format: 'auto', // Formato automático (WebP se suportado)
            },
          ],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error('Error uploading image to Cloudinary', error);
            return reject(error);
          }

          if (!result) {
            this.logger.error('No result from Cloudinary upload');
            return reject(new Error('Upload failed: no result'));
          }

          this.logger.log(`Image uploaded successfully: ${result.public_id}`);
          resolve(result.secure_url); // URL HTTPS da imagem
        },
      );

      // Envia o buffer para o stream
      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Deleta uma imagem do Cloudinary
   *
   * @param imageUrl - URL da imagem no Cloudinary
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extrai o public_id da URL
      // Exemplo: https://res.cloudinary.com/demo/image/upload/v1234/cherut/vision-board/user123/abc.jpg
      // public_id: cherut/vision-board/user123/abc
      const publicId = this.extractPublicId(imageUrl);

      if (!publicId) {
        this.logger.warn('Could not extract public_id from URL', imageUrl);
        return;
      }

      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Image deleted successfully: ${publicId}`);
    } catch (error) {
      this.logger.error('Error deleting image from Cloudinary', error);
      // Não lança erro - imagem pode já ter sido deletada
    }
  }

  async uploadAvatar(fileBuffer: Buffer, userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `cherut/avatars/${userId}`,
          resource_type: 'image',
          transformation: [
            { width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto:good', fetch_format: 'auto' },
          ],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed: no result'));
          this.logger.log(`Avatar uploaded: ${result.public_id}`);
          resolve(result.secure_url);
        },
      );
      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Extrai o public_id de uma URL do Cloudinary
   */
  private extractPublicId(url: string): string | null {
    try {
      // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
      const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}
