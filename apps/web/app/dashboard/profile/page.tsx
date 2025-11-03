'use client';

import { useState, useEffect } from 'react';
import { Mail, Globe, Clock, Save } from 'lucide-react';
import {
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  TextInput,
  Textarea,
  Select,
  Switch,
  Loader,
  Center,
  Avatar,
  Divider,
  Grid,
} from '@mantine/core';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { UpdateProfileDto } from '@/lib/api/services/profile';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();

  const [formData, setFormData] = useState<UpdateProfileDto>({
    displayName: '',
    bio: '',
    timezone: '',
    language: 'en',
    preferences: {
      theme: 'dark',
      notifications: true,
      weekStartsOn: 0,
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        timezone: profile.timezone || '',
        language: profile.language || 'en',
        preferences: {
          theme: profile.preferences?.theme || 'dark',
          notifications: profile.preferences?.notifications ?? true,
          weekStartsOn: profile.preferences?.weekStartsOn ?? 0,
        },
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    return (
      <Center h={300}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <div>
        <Title order={1} size="h2" mb="xs">Profile</Title>
        <Text c="dimmed" size="sm">Manage your account settings and preferences</Text>
      </div>

      <Grid gutter="md">
        {/* Profile Card */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card shadow="sm" padding="lg" withBorder>
            <Stack align="center" gap="md">
              <Avatar
                size={96}
                radius="xl"
                color="red"
              >
                {user?.email?.[0].toUpperCase() || 'U'}
              </Avatar>

              <div style={{ textAlign: 'center' }}>
                <Text fw={600} size="lg">
                  {formData.displayName || 'User'}
                </Text>
                <Text size="sm" c="dimmed" style={{ wordBreak: 'break-all' }}>
                  {user?.email}
                </Text>
              </div>

              <Divider w="100%" />

              <Stack gap="sm" w="100%">
                <Group gap="xs" wrap="nowrap">
                  <Mail size={16} style={{ flexShrink: 0, opacity: 0.6 }} />
                  <Text size="sm" truncate>{user?.email}</Text>
                </Group>

                {formData.timezone && (
                  <Group gap="xs" wrap="nowrap">
                    <Clock size={16} style={{ flexShrink: 0, opacity: 0.6 }} />
                    <Text size="sm" truncate>{formData.timezone}</Text>
                  </Group>
                )}

                {formData.language && (
                  <Group gap="xs" wrap="nowrap">
                    <Globe size={16} style={{ flexShrink: 0, opacity: 0.6 }} />
                    <Text size="sm">{formData.language.toUpperCase()}</Text>
                  </Group>
                )}
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Settings Form */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card shadow="sm" padding="lg" withBorder>
            <Title order={3} size="h4" mb="lg">Profile Settings</Title>

            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                {/* Personal Information */}
                <div>
                  <Title order={4} size="h5" mb="md">Personal Information</Title>
                  <Stack gap="md">
                    <TextInput
                      label="Display Name"
                      placeholder="Your name"
                      value={formData.displayName}
                      onChange={(e) =>
                        setFormData({ ...formData, displayName: e.target.value })
                      }
                    />

                    <Textarea
                      label="Bio"
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                    />
                  </Stack>
                </div>

                <Divider />

                {/* Regional Settings */}
                <div>
                  <Title order={4} size="h5" mb="md">Regional Settings</Title>
                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        label="Timezone"
                        placeholder="Select timezone"
                        value={formData.timezone}
                        onChange={(value) => setFormData({ ...formData, timezone: value || '' })}
                        data={[
                          { value: '', label: 'Select timezone' },
                          { value: 'America/New_York', label: 'Eastern Time (ET)' },
                          { value: 'America/Chicago', label: 'Central Time (CT)' },
                          { value: 'America/Denver', label: 'Mountain Time (MT)' },
                          { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                          { value: 'America/Sao_Paulo', label: 'Brasília Time (BRT)' },
                          { value: 'Europe/London', label: 'London (GMT)' },
                          { value: 'Europe/Paris', label: 'Paris (CET)' },
                          { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
                          { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
                          { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
                        ]}
                      />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        label="Language"
                        value={formData.language}
                        onChange={(value) => setFormData({ ...formData, language: value || 'en' })}
                        data={[
                          { value: 'en', label: 'English' },
                          { value: 'pt', label: 'Português' },
                          { value: 'es', label: 'Español' },
                          { value: 'fr', label: 'Français' },
                          { value: 'de', label: 'Deutsch' },
                        ]}
                      />
                    </Grid.Col>
                  </Grid>
                </div>

                <Divider />

                {/* Preferences */}
                <div>
                  <Title order={4} size="h5" mb="md">Preferences</Title>
                  <Stack gap="md">
                    <Select
                      label="Theme"
                      value={formData.preferences?.theme}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            theme: value as 'light' | 'dark',
                          },
                        })
                      }
                      data={[
                        { value: 'dark', label: 'Dark' },
                        { value: 'light', label: 'Light' },
                      ]}
                    />

                    <Select
                      label="Week Starts On"
                      value={String(formData.preferences?.weekStartsOn)}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            weekStartsOn: parseInt(value || '0'),
                          },
                        })
                      }
                      data={[
                        { value: '0', label: 'Sunday' },
                        { value: '1', label: 'Monday' },
                      ]}
                    />

                    <Switch
                      label="Enable notifications"
                      checked={formData.preferences?.notifications ?? true}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            notifications: e.currentTarget.checked,
                          },
                        })
                      }
                    />
                  </Stack>
                </div>

                <Divider />

                {/* Submit Button */}
                <Group justify="flex-start">
                  <Button
                    type="submit"
                    leftSection={<Save size={20} />}
                    loading={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>

                  {updateMutation.isSuccess && (
                    <Text size="sm" c="green">Profile updated successfully!</Text>
                  )}
                </Group>
              </Stack>
            </form>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
