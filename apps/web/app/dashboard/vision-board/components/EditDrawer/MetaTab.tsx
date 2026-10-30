'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, TextInput, Textarea, Button, Box, Text, FileButton, Loader, Alert, Checkbox, Image } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Trash2, Upload, AlertCircle } from 'lucide-react';
import { imageValidation } from '@/lib/api/services/vision-board';
import { EditDrawerFormState, SetField } from './types';

interface MetaTabProps {
  formState: EditDrawerFormState;
  setField: SetField;
  onUploadImage: (file: File) => Promise<{ imageUrl: string }>;
  onDelete: () => void;
}

export function MetaTab({ formState, setField, onUploadImage, onDelete }: MetaTabProps) {
  const t = useTranslations('visionBoard.editDrawer');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageChange = async (file: File | null) => {
    if (!file) return;
    setUploadError(null);

    const validation = imageValidation.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || t('invalidFile'));
      return;
    }

    setIsUploadingImage(true);
    try {
      const { imageUrl } = await onUploadImage(file);
      setField('imageUrl', imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(t('uploadFailed'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <Stack gap="lg">
      <Box>
        <Text mb="xs" fw={600} size="sm">{t('image')}</Text>
        <Box
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%',
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#F5F5F5',
            border: '1px solid #CCCCCC',
          }}
        >
          <Image
            src={formState.imageUrl}
            alt={formState.title}
            fit="cover"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        </Box>

        <FileButton onChange={handleImageChange} accept="image/png,image/jpeg,image/jpg,image/webp" disabled={isUploadingImage}>
          {(props) => (
            <Button
              {...props}
              variant="outline"
              leftSection={isUploadingImage ? <Loader size={16} color="#4686FE" /> : <Upload size={16} />}
              fullWidth
              mt="sm"
              disabled={isUploadingImage}
              radius={8}
            >
              {isUploadingImage ? t('uploading') : t('replaceImage')}
            </Button>
          )}
        </FileButton>

        {uploadError && (
          <Alert icon={<AlertCircle size={16} />} color="red" mt="xs" radius={8}>
            {uploadError}
          </Alert>
        )}
      </Box>

      <TextInput
        label={t('titleLabel')}
        placeholder={t('titlePlaceholder')}
        value={formState.title}
        onChange={(e) => setField('title', e.target.value)}
        required
        withAsterisk
        radius={8}
      />

      <Textarea
        label={t('shortDescription')}
        placeholder={t('shortDescriptionPlaceholder')}
        value={formState.description}
        onChange={(e) => setField('description', e.target.value)}
        rows={2}
        maxLength={500}
        radius={8}
      />

      <Textarea
        label={t('fullDescription')}
        placeholder={t('fullDescriptionPlaceholder')}
        value={formState.fullDescription}
        onChange={(e) => setField('fullDescription', e.target.value)}
        rows={4}
        maxLength={2000}
        radius={8}
      />

      <DateInput
        label={t('dueDate')}
        description={t('dueDateDesc')}
        placeholder={t('dueDatePlaceholder')}
        value={formState.dueDateValue}
        onChange={(v) => setField('dueDateValue', v)}
        clearable
        radius={8}
      />

      <Checkbox
        label={t('completed')}
        checked={formState.completed}
        onChange={(e) => setField('completed', e.currentTarget.checked)}
        color="green"
      />

      <Button
        variant="outline"
        color="red"
        leftSection={<Trash2 size={16} />}
        onClick={onDelete}
        radius={8}
      >
        {t('deleteGoal')}
      </Button>
    </Stack>
  );
}
