import { registerAs } from '@nestjs/config';

/**
 * 📚 EXPLICAÇÃO: Cloudinary Configuration
 *
 * Configuração do Cloudinary para upload de imagens.
 * Cloudinary oferece 25GB gratuitos de armazenamento.
 *
 * O QUE ELE FAZ:
 * - Configura as credenciais do Cloudinary
 * - Define o cloud_name, api_key e api_secret
 *
 * COMO OBTER AS CREDENCIAIS:
 * 1. Acesse https://cloudinary.com/users/register/free
 * 2. Crie uma conta gratuita
 * 3. No dashboard, copie:
 *    - Cloud Name
 *    - API Key
 *    - API Secret
 * 4. Adicione no arquivo .env
 */

export default registerAs('cloudinary', () => ({
  /**
   * Nome do seu cloud no Cloudinary
   * Exemplo: dxxx123
   */
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,

  /**
   * API Key do Cloudinary
   * Exemplo: 123456789012345
   */
  apiKey: process.env.CLOUDINARY_API_KEY,

  /**
   * API Secret do Cloudinary
   * Mantém em segredo! Nunca commita no git
   */
  apiSecret: process.env.CLOUDINARY_API_SECRET,

  /**
   * Pasta onde as imagens serão armazenadas
   * Formato: cherut/vision-board/
   */
  folder: 'cherut/vision-board',
}));
