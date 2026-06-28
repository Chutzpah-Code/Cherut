'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Lock, Shield, Camera } from 'lucide-react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import {
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
  Badge,
  Tooltip,
  Box,
  Text,
  useMantineColorScheme,
  useComputedColorScheme,
} from '@mantine/core';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/hooks/useProfile';
import { UpdateProfileDto } from '@/lib/api/services/profile';
import { changePassword } from '@/lib/firebase/auth';
import { getPasswordErrorMessage } from '@/lib/utils/auth-errors';
import { useRateLimit } from '@/hooks/useRateLimit';
import { RateLimitDisplay } from '@/components/auth/RateLimitDisplay';

// ── Shared style constants ─────────────────────────────────────────────────────

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#64748B',
  marginBottom: 16,
};

const INPUT_STYLES = {
  input: { height: 48, fontSize: 14, border: '1px solid #E2E8F0' },
  label: { fontSize: 14, fontWeight: 500 as const, color: '#333333', marginBottom: 4 },
};

const TEXTAREA_STYLES = {
  input: { fontSize: 14, border: '1px solid #E2E8F0' },
  label: { fontSize: 14, fontWeight: 500 as const, color: '#333333', marginBottom: 4 },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarHovered, setAvatarHovered] = useState(false);
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

  const [passwordModalOpened, setPasswordModalOpened] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const passwordChangeRateLimit = useRateLimit({ action: 'passwordChange' });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        timezone: profile.timezone || '',
        language: profile.language || 'en',
        preferences: {
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
      passwordChangeRateLimit.recordSuccess();
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setPasswordSuccess(false);
        setPasswordModalOpened(false);
      }, 2000);
    } catch (error: any) {
      passwordChangeRateLimit.recordFailure();
      setPasswordError(getPasswordErrorMessage(error));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordModalClose = () => {
    setPasswordModalOpened(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setPasswordSuccess(false);
    setPasswordLoading(false);
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    const forcedTheme = 'light' as const;
    setColorScheme(forcedTheme);
    localStorage.setItem('mantine-color-scheme-cherut', forcedTheme);
    const updated = {
      ...formData,
      preferences: { ...formData.preferences, theme: forcedTheme },
    };
    setFormData(updated);
    try {
      await updateMutation.mutateAsync(updated);
    } catch (error) {
      console.error('Error updating theme preference:', error);
    }
  };

  if (isLoading) {
    return (
      <Center h={300}>
        <Loader size="lg" color="#4686FE" />
      </Center>
    );
  }

  const displayInitial = (formData.displayName?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase();

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      {/* ── Hero strip ────────────────────────────────────────────────────── */}
      <Box
        style={{
          background: 'linear-gradient(135deg, rgba(70,134,254,0.08) 0%, rgba(0,82,204,0.04) 100%)',
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          padding: '36px 24px 28px',
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            uploadAvatarMutation.mutate(file);
            e.target.value = '';
          }}
        />

        <Box
          style={{
            width: 104,
            height: 104,
            borderRadius: '50%',
            padding: 4,
            background: 'white',
            boxShadow: '0 4px 20px rgba(70,134,254,0.2)',
            margin: '0 auto 16px',
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={() => avatarInputRef.current?.click()}
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
        >
          <Avatar
            src={profile?.avatarUrl ?? undefined}
            size={96}
            radius={999}
            color="blue"
            style={{ width: '100%', height: '100%' }}
          >
            {displayInitial}
          </Avatar>

          {/* camera overlay */}
          <Box
            style={{
              position: 'absolute',
              inset: 4,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: avatarHovered || uploadAvatarMutation.isPending ? 1 : 0,
              transition: 'opacity 0.18s ease',
              pointerEvents: 'none',
            }}
          >
            {uploadAvatarMutation.isPending
              ? <Loader size="xs" color="white" />
              : <Camera size={22} color="white" />
            }
          </Box>
        </Box>

        <Text
          style={{
            fontFamily: 'Inter Display, -apple-system, sans-serif',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: formData.displayName ? '#0F172A' : '#94A3B8',
            lineHeight: 1.2,
            marginBottom: 4,
          }}
        >
          {formData.displayName || 'Your Name'}
        </Text>

        <Text style={{ fontSize: 14, color: '#64748B' }}>{user?.email}</Text>

        {profile && !profile.displayName && (
          <Badge variant="light" color="blue" size="sm" mt={12} style={{ cursor: 'default' }}>
            Add your name below
          </Badge>
        )}
      </Box>

      {/* ── Cards zone ────────────────────────────────────────────────────── */}
      <Stack gap="lg" style={{ maxWidth: 680, margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <Stack gap="lg">

            {/* Personal Information */}
            <Card
              padding="xl"
              radius={12}
              withBorder={false}
              shadow="none"
              style={{ border: '1px solid #E2E8F0', borderLeft: '3px solid #4686FE' }}
            >
              <div style={SECTION_LABEL}>Personal Information</div>
              <Stack gap="md">
                <TextInput
                  label="Display Name"
                  placeholder="Your full name"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  radius={8}
                  styles={INPUT_STYLES}
                />
                <Textarea
                  label="Bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  radius={8}
                  styles={TEXTAREA_STYLES}
                />
              </Stack>
            </Card>

            {/* Regional Settings */}
            <Card
              padding="xl"
              radius={12}
              withBorder={false}
              shadow="none"
              style={{ border: '1px solid #E2E8F0' }}
            >
              <div style={SECTION_LABEL}>Regional Settings</div>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Timezone"
                    placeholder="Select timezone"
                    value={formData.timezone || null}
                    onChange={(value) => setFormData({ ...formData, timezone: value || '' })}
                    radius={8}
                    styles={INPUT_STYLES}
                    data={[
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
                    radius={8}
                    styles={INPUT_STYLES}
                    data={[{ value: 'en', label: 'English' }]}
                  />
                </Grid.Col>
              </Grid>
            </Card>

            {/* Preferences */}
            <Card
              padding="xl"
              radius={12}
              withBorder={false}
              shadow="none"
              style={{ border: '1px solid #E2E8F0' }}
            >
              <div style={SECTION_LABEL}>Preferences</div>
              <Stack gap="md">
                <Tooltip label="Dark mode coming soon" position="top-start" withArrow>
                  <Select
                    label="Theme"
                    value={formData.preferences?.theme}
                    onChange={(value) => handleThemeChange(value as 'light' | 'dark')}
                    radius={8}
                    styles={INPUT_STYLES}
                    disabled
                    data={[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                    ]}
                  />
                </Tooltip>

                <Select
                  label="Week Starts On"
                  value={String(formData.preferences?.weekStartsOn ?? 0)}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        weekStartsOn: parseInt(value || '0'),
                      },
                    })
                  }
                  radius={8}
                  styles={INPUT_STYLES}
                  data={[
                    { value: '0', label: 'Sunday' },
                    { value: '1', label: 'Monday' },
                  ]}
                />

                <Group justify="space-between" align="center" py={4}>
                  <Box>
                    <Text size="sm" fw={500} c="#333333">Notifications</Text>
                    <Text size="xs" c="dimmed">Enable or disable all notifications</Text>
                  </Box>
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
                    color="blue"
                  />
                </Group>

                <Divider />

                <Group align="center" gap="md">
                  <Button
                    type="submit"
                    leftSection={<Save size={16} />}
                    loading={updateMutation.isPending}
                    radius={8}
                    style={{
                      height: 48,
                      backgroundColor: '#4686FE',
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>

                  {updateMutation.isSuccess && (
                    <Text size="sm" fw={500} style={{ color: '#16A34A' }}>
                      Saved
                    </Text>
                  )}
                </Group>
              </Stack>
            </Card>

          </Stack>
        </form>

        {/* Security */}
        <Card
          padding="xl"
          radius={12}
          withBorder={false}
          shadow="none"
          style={{ border: '1px solid #E2E8F0' }}
        >
          <div style={SECTION_LABEL}>Security</div>
          <Text size="sm" c="dimmed" mb="md">
            Keep your account secure by updating your password regularly.
          </Text>
          <Button
            variant="outline"
            leftSection={<Lock size={16} />}
            onClick={() => setPasswordModalOpened(true)}
            radius={8}
            style={{
              height: 44,
              borderColor: '#E2E8F0',
              color: '#333333',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Change Password
          </Button>
        </Card>
      </Stack>

      {/* ── Password Modal ─────────────────────────────────────────────────── */}
      <Modal
        opened={passwordModalOpened}
        onClose={handlePasswordModalClose}
        title={
          <Group gap="xs">
            <Shield size={20} />
            <Text fw={600} size="lg">Change Password</Text>
          </Group>
        }
        centered
        radius={16}
        styles={{
          header: { padding: '24px 24px 0 24px' },
          body: { padding: '24px' },
        }}
      >
        {passwordSuccess ? (
          <Alert
            icon={<CheckCircle size={20} />}
            title="Password Changed Successfully!"
            color="green"
            radius="md"
          >
            Your password has been updated successfully.
          </Alert>
        ) : (
          <form onSubmit={handlePasswordChange}>
            <Stack gap="lg">
              <RateLimitDisplay
                result={passwordChangeRateLimit.result}
                message={passwordChangeRateLimit.warningMessage}
                showProgress={true}
              />

              {passwordError && (
                <Alert icon={<AlertCircle size={20} />} title="Error" color="red" radius="md">
                  {passwordError}
                </Alert>
              )}

              <Text size="sm" c="dimmed">
                Enter your current password and choose a new one to secure your account.
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
                radius={8}
                styles={INPUT_STYLES}
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
                radius={8}
                styles={INPUT_STYLES}
              />

              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
                radius={8}
                styles={INPUT_STYLES}
              />

              <Group justify="flex-end" gap="sm" wrap="wrap">
                <Button
                  variant="outline"
                  onClick={handlePasswordModalClose}
                  disabled={passwordLoading}
                  radius={8}
                  style={{
                    height: 44,
                    borderColor: '#E2E8F0',
                    color: '#333333',
                    flex: '1 1 auto',
                    minWidth: 110,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={passwordLoading}
                  leftSection={<Lock size={16} />}
                  radius={8}
                  style={{
                    height: 44,
                    backgroundColor: '#4686FE',
                    border: 'none',
                    flex: '1 1 auto',
                    minWidth: 110,
                  }}
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>
    </>
  );
}
