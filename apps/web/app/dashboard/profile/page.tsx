'use client';

import { useState, useEffect } from 'react';
import { Mail, Globe, Clock, Save, Lock, Shield } from 'lucide-react';
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
  PasswordInput,
  Alert,
  Modal,
  useMantineColorScheme,
  useComputedColorScheme,
} from '@mantine/core';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { UpdateProfileDto } from '@/lib/api/services/profile';
import { changePassword } from '@/lib/firebase/auth';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { getPasswordErrorMessage, createRateLimitError } from '@/lib/utils/auth-errors';
import { useRateLimit } from '@/hooks/useRateLimit';
import { RateLimitDisplay } from '@/components/auth/RateLimitDisplay';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();

  // Theme integration hooks
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

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

  // Password change state
  const [passwordModalOpened, setPasswordModalOpened] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Rate limiting for password changes
  const passwordChangeRateLimit = useRateLimit({ action: 'passwordChange' });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        timezone: profile.timezone || '',
        language: profile.language || 'en',
        preferences: {
          // Use current Mantine theme instead of profile theme to ensure sync
          theme: computedColorScheme as 'light' | 'dark',
          notifications: profile.preferences?.notifications ?? true,
          weekStartsOn: profile.preferences?.weekStartsOn ?? 0,
        },
      });
    }
  }, [profile, computedColorScheme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    // Check rate limit before proceeding
    if (!passwordChangeRateLimit.canSubmit) {
      setPasswordError(passwordChangeRateLimit.warningMessage);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      // Record successful password change
      passwordChangeRateLimit.recordSuccess();
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => {
        setPasswordSuccess(false);
        setPasswordModalOpened(false);
      }, 2000);
    } catch (error: any) {
      // Record failed password change attempt
      passwordChangeRateLimit.recordFailure();
      setPasswordError(getPasswordErrorMessage(error));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordModalClose = () => {
    setPasswordModalOpened(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError('');
    setPasswordSuccess(false);
    setPasswordLoading(false);
  };

  // Handle theme change with bidirectional sync
  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    // 1. Update Mantine theme immediately for instant visual feedback
    setColorScheme(newTheme);
    localStorage.setItem('mantine-color-scheme-cherut', newTheme);

    // 2. Update form data
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        theme: newTheme,
      },
    });

    // 3. Save to backend profile
    try {
      await updateMutation.mutateAsync({
        ...formData,
        preferences: {
          ...formData.preferences,
          theme: newTheme,
        },
      });
    } catch (error) {
      console.error('Error updating theme preference:', error);
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
                      onChange={(value) => handleThemeChange(value as 'light' | 'dark')}
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

                    <Group justify="space-between">
                      <div>
                        <Text size="sm" fw={500}>Notifications</Text>
                        <Text size="xs" c="dimmed">
                          Enable or disable all notifications
                        </Text>
                      </div>
                      <Switch
                        checked={formData.preferences?.notifications === true}
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
                    </Group>
                  </Stack>
                </div>

                <Divider />

                {/* Security Section */}
                <div>
                  <Title order={4} size="h5" mb="md">Security</Title>
                  <Stack gap="md">
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Keep your account secure by updating your password regularly
                      </Text>
                      <Button
                        variant="outline"
                        leftSection={<Lock size={16} />}
                        onClick={() => setPasswordModalOpened(true)}
                      >
                        Change Password
                      </Button>
                    </div>
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

      {/* Change Password Modal */}
      <Modal
        opened={passwordModalOpened}
        onClose={handlePasswordModalClose}
        title={
          <Group gap="xs">
            <Shield size={20} />
            <Text fw={600}>Change Password</Text>
          </Group>
        }
        centered
        radius="md"
      >
        {passwordSuccess ? (
          <Stack gap="lg" ta="center">
            <Alert
              icon={<CheckCircle size={20} />}
              title="Password Changed Successfully!"
              color="green"
              radius="md"
            >
              Your password has been updated successfully.
            </Alert>
          </Stack>
        ) : (
          <form onSubmit={handlePasswordChange}>
            <Stack gap="lg">
              {/* Rate limit display */}
              <RateLimitDisplay
                result={passwordChangeRateLimit.result}
                message={passwordChangeRateLimit.warningMessage}
                showProgress={true}
              />

              {passwordError && (
                <Alert
                  icon={<AlertCircle size={20} />}
                  title="Error"
                  color="red"
                  radius="md"
                >
                  {passwordError}
                </Alert>
              )}

              <Text size="sm" c="dimmed">
                Enter your current password and choose a new password to secure your account.
              </Text>

              <PasswordInput
                label="Current Password"
                placeholder="Enter your current password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                required
                autoFocus
              />

              <PasswordInput
                label="New Password"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
                description="Must be at least 6 characters long"
              />

              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
              />

              <Group justify="flex-end" gap="sm">
                <Button
                  variant="outline"
                  onClick={handlePasswordModalClose}
                  disabled={passwordLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={passwordLoading}
                  leftSection={<Lock size={16} />}
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>

    </Stack>
  );
}
