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
  const [createError, setCreateError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFullDescription('');
    setDueDateValue(null);
    setImageUrl(null);
    setImageFile(null);
    setUploadError(null);
    setCreateError(null);
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
    setCreateError(null);
    setUploadError(null);

    // Frontend validation before making API call
    if (!title.trim()) {
      setCreateError('Please enter a title');
      return;
    }

    if (!imageUrl) {
      setCreateError('Please upload an image');
      return;
    }

    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        fullDescription: fullDescription.trim() || undefined,
        imageUrl,
        dueDate: dueDateValue ? dueDateValue.toISOString().split('T')[0] : undefined,
      });

      resetForm();
    } catch (error: any) {
      let errorMessage = 'Failed to create vision board item. Please try again.';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setCreateError(errorMessage);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          <Text
            style={{
              fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '20px',
              fontWeight: 600,
              color: '#000000',
            }}
          >
            Add to Vision Board
          </Text>
        }
        size="lg"
        radius={16}
        styles={{
          content: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
        }}
      >
        <Stack gap="lg">
        {/* Upload de Imagem */}
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
                    border: '2px dashed #CCCCCC',
                    borderRadius: 8,
                    padding: '40px 20px',
                    textAlign: 'center',
                    cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                    backgroundColor: '#F5F5F5',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isUploadingImage) {
                      e.currentTarget.style.borderColor = '#4686FE';
                      e.currentTarget.style.backgroundColor = 'rgba(70, 134, 254, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#CCCCCC';
                    e.currentTarget.style.backgroundColor = '#F5F5F5';
                  }}
                >
                  {isUploadingImage ? (
                    <>
                      <Loader size="lg" color="#4686FE" />
                      <Text
                        mt="md"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#666666',
                        }}
                      >
                        Uploading image...
                      </Text>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={48} strokeWidth={1.5} color="#999999" />
                      <Text
                        mt="md"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#000000',
                        }}
                      >
                        Click to upload image
                      </Text>
                      <Text
                        mt="xs"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          color: '#666666',
                        }}
                      >
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
                    variant="outline"
                    leftSection={<Upload size={16} />}
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
                    Change Image
                  </Button>
                )}
              </FileButton>
            </Box>
          )}

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
          placeholder="E.g., Trip to Kyoto, Run a 5K, Read 20 Books"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setCreateError(null); // Clear error when user types
          }}
          required
          withAsterisk
          maxLength={100}
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
          placeholder="Detailed description about your goal, why it's important, how you'll achieve it..."
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
          description="When do you want to achieve this?"
          placeholder="Select date"
          value={dueDateValue}
          onChange={setDueDateValue}
          clearable
          minDate={new Date()}
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

        {/* Create Error Alert */}
        {createError && (
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
            {createError}
          </Alert>
        )}

        {/* Action buttons */}
        <Group justify="flex-end" mt="lg">
          <Button
            variant="outline"
            onClick={handleClose}
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
            onClick={handleCreate}
            loading={isCreating}
            disabled={!title.trim() || !imageUrl || isUploadingImage}
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
            Add to Vision Board
          </Button>
        </Group>
      </Stack>
    </Modal>
    </>
  );
}
