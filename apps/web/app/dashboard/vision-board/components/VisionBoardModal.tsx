'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  Image,
  Box,
  Text,
  FileButton,
  Loader,
  Alert,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Trash2, Upload, AlertCircle } from 'lucide-react';
import { VisionBoardItem } from '@/lib/api/services/vision-board';
import { imageValidation } from '@/lib/api/services/vision-board';

interface VisionBoardModalProps {
  opened: boolean;
  onClose: () => void;
  item: VisionBoardItem | null;
  onSave: (id: string, updates: {
    title: string;
    description?: string;
    fullDescription?: string;
    dueDate?: string;
    imageUrl?: string;
  }) => Promise<void>;
  onDelete: (id: string) => void;
  onUploadImage: (file: File) => Promise<{ imageUrl: string }>;
  isSaving: boolean;
}

export function VisionBoardModal({
  opened,
  onClose,
  item,
  onSave,
  onDelete,
  onUploadImage,
  isSaving,
}: VisionBoardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [dueDateValue, setDueDateValue] = useState<Date | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || '');
      setFullDescription(item.fullDescription || '');
      setNewImageUrl(null);
      setUploadError(null);

      if (item.dueDate) {
        setDueDateValue(new Date(item.dueDate + 'T00:00:00'));
      } else {
        setDueDateValue(null);
      }
    }
  }, [item]);

  if (!item) return null;

  const handleImageChange = async (file: File | null) => {
    if (!file) return;

    setUploadError(null);

    // Validar arquivo
    const validation = imageValidation.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    setIsUploadingImage(true);

    try {
      const { imageUrl } = await onUploadImage(file);
      setNewImageUrl(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    await onSave(item.id, {
      title,
      description,
      fullDescription,
      dueDate: dueDateValue ? dueDateValue.toISOString().split('T')[0] : undefined,
      imageUrl: newImageUrl || undefined,
    });
  };

  const currentImageUrl = newImageUrl || item.imageUrl;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="lg">
          Edit Vision Board Item
        </Text>
      }
      size="xl"
    >
      <Stack gap="md">
        {/* Imagem Preview */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Image
          </Text>
          <Box
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%', // 16:9 aspect ratio
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: 'var(--mantine-color-gray-1)',
            }}
          >
            <Image
              src={currentImageUrl}
              alt={title}
              fit="cover"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
          </Box>

          {/* Upload novo */}
          <FileButton
            onChange={handleImageChange}
            accept="image/png,image/jpeg,image/jpg,image/webp"
            disabled={isUploadingImage}
          >
            {(props) => (
              <Button
                {...props}
                variant="light"
                leftSection={isUploadingImage ? <Loader size={16} /> : <Upload size={16} />}
                fullWidth
                mt="sm"
                disabled={isUploadingImage}
              >
                {isUploadingImage ? 'Uploading...' : 'Replace Image'}
              </Button>
            )}
          </FileButton>

          {uploadError && (
            <Alert icon={<AlertCircle size={16} />} color="red" mt="xs">
              {uploadError}
            </Alert>
          )}
        </Box>

        {/* Form */}
        <TextInput
          label="Title"
          placeholder="E.g., Trip to Kyoto"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          withAsterisk
        />

        <Textarea
          label="Short Description"
          placeholder="Brief description (visible on card)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={500}
        />

        <Textarea
          label="Full Description"
          placeholder="Detailed description (visible only in modal)"
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          rows={4}
          maxLength={2000}
        />

        <DateInput
          label="Due Date"
          description="Target completion date"
          placeholder="Select date"
          value={dueDateValue}
          onChange={setDueDateValue}
          clearable
        />

        {/* Action buttons */}
        <Group justify="space-between" mt="md">
          <Button
            variant="light"
            color="red"
            leftSection={<Trash2 size={16} />}
            onClick={() => onDelete(item.id)}
          >
            Delete
          </Button>

          <Group>
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={isSaving}
              disabled={!title.trim() || isUploadingImage}
            >
              Save Changes
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
