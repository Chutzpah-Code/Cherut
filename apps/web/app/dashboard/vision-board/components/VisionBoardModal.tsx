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
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || '');
      setFullDescription(item.fullDescription || '');
      setNewImageUrl(null);
      setUploadError(null);
      setSaveError(null);

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
    setSaveError(null);

    try {
      await onSave(item.id, {
        title,
        description: description.trim() || undefined,
        fullDescription: fullDescription.trim() || undefined,
        dueDate: dueDateValue ? dueDateValue.toISOString().split('T')[0] : undefined,
        imageUrl: newImageUrl || undefined,
      });
    } catch (error: any) {
      let errorMessage = 'Failed to save changes. Please try again.';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setSaveError(errorMessage);
    }
  };

  const currentImageUrl = newImageUrl || item.imageUrl;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Text
            style={{
              fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '20px',
              fontWeight: 600,
              color: '#000000',
            }}
          >
            Edit Vision Board Item
          </Text>
        }
        size="xl"
        radius={16}
        styles={{
          content: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
        }}
      >
        <Stack gap="lg">
        {/* Imagem Preview */}
        <Box>
          <Text
            mb="xs"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: '#000000',
            }}
          >
            Image
          </Text>
          <Box
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%', // 16:9 aspect ratio
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: '#F5F5F5',
              border: '1px solid #CCCCCC',
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
                variant="outline"
                leftSection={isUploadingImage ? <Loader size={16} color="#4686FE" /> : <Upload size={16} />}
                fullWidth
                mt="sm"
                disabled={isUploadingImage}
                radius={8}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  borderColor: '#CCCCCC',
                  color: '#333333',
                  fontSize: '16px',
                  fontWeight: 600,
                  height: '48px',
                  background: 'white',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      borderColor: '#4686FE',
                      color: '#4686FE',
                    },
                  },
                }}
              >
                {isUploadingImage ? 'Uploading...' : 'Replace Image'}
              </Button>
            )}
          </FileButton>

          {uploadError && (
            <Alert
              icon={<AlertCircle size={16} />}
              color="red"
              mt="xs"
              radius={16}
              styles={{
                root: {
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                },
                title: { color: '#dc2626', fontWeight: 600, fontFamily: 'Inter, sans-serif' },
                message: { color: '#dc2626', fontFamily: 'Inter, sans-serif' },
              }}
            >
              {uploadError}
            </Alert>
          )}
        </Box>

        {/* Form */}
        <TextInput
          label="Title"
          placeholder="E.g., Trip to Kyoto"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaveError(null); // Clear error when user types
          }}
          required
          withAsterisk
          size="md"
          radius={8}
          styles={{
            label: {
              fontFamily: 'Inter, sans-serif',
              color: '#000000',
              fontWeight: 600,
              marginBottom: 8,
              fontSize: '14px',
            },
            input: {
              fontFamily: 'Inter, sans-serif',
              backgroundColor: 'white',
              border: '1px solid #CCCCCC',
              color: '#000000',
              height: '48px',
              fontSize: '16px',
              '&::placeholder': {
                color: '#999999',
              },
              '&:focus': {
                borderColor: '#4686FE',
                boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
              },
            },
          }}
        />

        <Textarea
          label="Short Description"
          placeholder="Brief description (visible on card)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={500}
          radius={8}
          styles={{
            label: {
              fontFamily: 'Inter, sans-serif',
              color: '#000000',
              fontWeight: 600,
              marginBottom: 8,
              fontSize: '14px',
            },
            input: {
              fontFamily: 'Inter, sans-serif',
              backgroundColor: 'white',
              border: '1px solid #CCCCCC',
              color: '#000000',
              fontSize: '16px',
              '&::placeholder': {
                color: '#999999',
              },
              '&:focus': {
                borderColor: '#4686FE',
                boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
              },
            },
          }}
        />

        <Textarea
          label="Full Description"
          placeholder="Detailed description (visible only in modal)"
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          rows={4}
          maxLength={2000}
          radius={8}
          styles={{
            label: {
              fontFamily: 'Inter, sans-serif',
              color: '#000000',
              fontWeight: 600,
              marginBottom: 8,
              fontSize: '14px',
            },
            input: {
              fontFamily: 'Inter, sans-serif',
              backgroundColor: 'white',
              border: '1px solid #CCCCCC',
              color: '#000000',
              fontSize: '16px',
              '&::placeholder': {
                color: '#999999',
              },
              '&:focus': {
                borderColor: '#4686FE',
                boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
              },
            },
          }}
        />

        <DateInput
          label="Due Date"
          description="Target completion date"
          placeholder="Select date"
          value={dueDateValue}
          onChange={setDueDateValue}
          clearable
          radius={8}
          styles={{
            label: {
              fontFamily: 'Inter, sans-serif',
              color: '#000000',
              fontWeight: 600,
              marginBottom: 8,
              fontSize: '14px',
            },
            input: {
              fontFamily: 'Inter, sans-serif',
              backgroundColor: 'white',
              border: '1px solid #CCCCCC',
              color: '#000000',
              height: '48px',
              fontSize: '16px',
              '&::placeholder': {
                color: '#999999',
              },
              '&:focus': {
                borderColor: '#4686FE',
                boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
              },
            },
            description: {
              fontFamily: 'Inter, sans-serif',
              color: '#666666',
              fontSize: '14px',
            },
          }}
        />

        {/* Save Error Alert */}
        {saveError && (
          <Alert
            icon={<AlertCircle size={16} />}
            color="red"
            mt="xs"
            radius={16}
            styles={{
              root: {
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              },
              title: { color: '#dc2626', fontWeight: 600, fontFamily: 'Inter, sans-serif' },
              message: { color: '#dc2626', fontFamily: 'Inter, sans-serif' },
            }}
          >
            {saveError}
          </Alert>
        )}

        {/* Action buttons */}
        <Group justify="space-between" mt="lg">
          <Button
            variant="outline"
            color="red"
            leftSection={<Trash2 size={16} />}
            onClick={() => onDelete(item.id)}
            radius={8}
            style={{
              fontFamily: 'Inter, sans-serif',
              borderColor: '#dc2626',
              color: '#dc2626',
              fontSize: '16px',
              fontWeight: 600,
              height: '48px',
              background: 'white',
            }}
            styles={{
              root: {
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                },
              },
            }}
          >
            Delete
          </Button>

          <Group>
            <Button
              variant="outline"
              onClick={onClose}
              radius={8}
              style={{
                fontFamily: 'Inter, sans-serif',
                borderColor: '#CCCCCC',
                color: '#333333',
                fontSize: '16px',
                fontWeight: 600,
                height: '48px',
                background: 'white',
              }}
              styles={{
                root: {
                  '&:hover': {
                    borderColor: '#4686FE',
                    color: '#4686FE',
                  },
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={isSaving}
              disabled={!title.trim() || isUploadingImage}
              radius={8}
              style={{
                fontFamily: 'Inter, sans-serif',
                background: '#4686FE',
                border: 'none',
                fontSize: '16px',
                fontWeight: 600,
                color: 'white',
                height: '48px',
              }}
              styles={{
                root: {
                  '&:hover': {
                    background: '#3366E5',
                  },
                },
              }}
            >
              Save Changes
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
    </>
  );
}
