'use client';

import React, { useState } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  Box,
  Text,
  FileButton,
  Image,
  Loader,
  Alert,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Upload, AlertCircle, ImageIcon } from 'lucide-react';
import { imageValidation } from '@/lib/api/services/vision-board';

interface CreateVisionBoardModalProps {
  opened: boolean;
  onClose: () => void;
  onCreate: (data: {
    title: string;
    description?: string;
    fullDescription?: string;
    imageUrl: string;
    dueDate?: string;
  }) => Promise<void>;
  onUploadImage: (file: File) => Promise<{ imageUrl: string }>;
  isCreating: boolean;
}

export function CreateVisionBoardModal({
  opened,
  onClose,
  onCreate,
  onUploadImage,
  isCreating,
}: CreateVisionBoardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [dueDateValue, setDueDateValue] = useState<Date | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFullDescription('');
    setDueDateValue(null);
    setImageUrl(null);
    setImageFile(null);
    setUploadError(null);
  };

  const handleImageChange = async (file: File | null) => {
    if (!file) return;

    setUploadError(null);

    // Validar arquivo
    const validation = imageValidation.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    setImageFile(file);
    setIsUploadingImage(true);

    try {
      const { imageUrl: url } = await onUploadImage(file);
      setImageUrl(url);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image. Please try again.');
      setImageFile(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreate = async () => {
    if (!imageUrl) {
      setUploadError('Please upload an image');
      return;
    }

    await onCreate({
      title,
      description: description || undefined,
      fullDescription: fullDescription || undefined,
      imageUrl,
      dueDate: dueDateValue ? dueDateValue.toISOString().split('T')[0] : undefined,
    });

    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={600} size="lg">
          Add to Vision Board
        </Text>
      }
      size="lg"
    >
      <Stack gap="md">
        {/* Upload de Imagem */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Image <Text component="span" c="red">*</Text>
          </Text>

          {!imageUrl ? (
            <FileButton
              onChange={handleImageChange}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              disabled={isUploadingImage}
            >
              {(props) => (
                <Box
                  {...props}
                  style={{
                    border: '2px dashed var(--mantine-color-gray-4)',
                    borderRadius: 8,
                    padding: '40px 20px',
                    textAlign: 'center',
                    cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                    backgroundColor: 'var(--mantine-color-gray-0)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isUploadingImage) {
                      e.currentTarget.style.borderColor = 'var(--mantine-color-blue-6)';
                      e.currentTarget.style.backgroundColor = 'var(--mantine-color-blue-0)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--mantine-color-gray-4)';
                    e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
                  }}
                >
                  {isUploadingImage ? (
                    <>
                      <Loader size="lg" />
                      <Text size="sm" c="dimmed" mt="md">
                        Uploading image...
                      </Text>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={48} strokeWidth={1.5} color="var(--mantine-color-gray-6)" />
                      <Text size="sm" fw={500} mt="md">
                        Click to upload image
                      </Text>
                      <Text size="xs" c="dimmed" mt="xs">
                        PNG, JPG, JPEG, WEBP (max 1MB)
                      </Text>
                    </>
                  )}
                </Box>
              )}
            </FileButton>
          ) : (
            <Box>
              <Box
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '56.25%', // 16:9
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={imageUrl}
                  alt="Preview"
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

              <FileButton
                onChange={handleImageChange}
                accept="image/png,image/jpeg,image/jpg,image/webp"
                disabled={isUploadingImage}
              >
                {(props) => (
                  <Button
                    {...props}
                    variant="light"
                    leftSection={<Upload size={16} />}
                    fullWidth
                    mt="sm"
                    disabled={isUploadingImage}
                  >
                    Change Image
                  </Button>
                )}
              </FileButton>
            </Box>
          )}

          {uploadError && (
            <Alert icon={<AlertCircle size={16} />} color="red" mt="xs">
              {uploadError}
            </Alert>
          )}
        </Box>

        {/* Form */}
        <TextInput
          label="Title"
          placeholder="E.g., Trip to Kyoto, Run a 5K, Read 20 Books"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          withAsterisk
          maxLength={100}
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
          placeholder="Detailed description about your goal, why it's important, how you'll achieve it..."
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          rows={4}
          maxLength={2000}
        />

        <DateInput
          label="Due Date"
          description="When do you want to achieve this?"
          placeholder="Select date"
          value={dueDateValue}
          onChange={setDueDateValue}
          clearable
          minDate={new Date()}
        />

        {/* Action buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            loading={isCreating}
            disabled={!title.trim() || !imageUrl || isUploadingImage}
          >
            Add to Vision Board
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
