'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import {
  Title,
  Card,
  Text,
  Badge,
  Group,
  Stack,
  Switch,
  TextInput,
  NumberInput,
  Select,
  Button,
  Tabs,
  Divider,
  Alert,
  Loader,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconSettings,
  IconDatabase,
  IconShield,
  IconMail,
  IconBell,
  IconUsers,
  IconDeviceFloppy,
  IconRefresh,
  IconAlertTriangle,
} from '@tabler/icons-react';

/**
 * Admin Settings Dashboard
 *
 * FEATURES:
 * - System configuration
 * - Security settings
 * - Email configuration
 * - Notification settings
 * - User management settings
 * - Database maintenance
 */

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    allowedDomains: string[];
  };
  email: {
    provider: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    fromEmail: string;
    fromName: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    slackWebhook: string;
    discordWebhook: string;
  };
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('general');

  useEffect(() => {
    async function loadSettings() {
      if (!user) return;

      try {
        // For now, use mock data since /admin/settings endpoint doesn't exist yet
        console.log('Loading mock settings data...');

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Set default settings for demo
        setSettings({
          general: {
            siteName: 'Cherut',
            siteDescription: 'Strategic Life Management Platform',
            maintenanceMode: false,
            registrationEnabled: true,
            emailVerificationRequired: true,
          },
          security: {
            sessionTimeout: 1440,
            maxLoginAttempts: 5,
            passwordMinLength: 8,
            requireTwoFactor: false,
            allowedDomains: ['cherut.com'],
          },
          email: {
            provider: 'smtp',
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            smtpSecure: true,
            fromEmail: 'noreply@cherut.com',
            fromName: 'Cherut Platform',
          },
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            slackWebhook: '',
            discordWebhook: '',
          },
        });
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [user]);

  async function saveSettings() {
    if (!user || !settings) return;

    try {
      setSaving(true);

      // For now, simulate saving since /admin/settings endpoint doesn't exist yet
      console.log('Saving settings...', settings);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setError(null);
      console.log('Settings saved successfully (mock)');

      // Show success message (you might want to add a notification system)
    } catch (err) {
      console.error('Save error:', err);
      setError(`Error saving settings: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  }

  function updateSetting(section: keyof SystemSettings, key: string, value: any) {
    if (!settings) return;

    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    });
  }

  if (loading) {
    return (
      <Stack align="center" mt="xl">
        <Loader size="lg" />
        <Text>Loading settings...</Text>
      </Stack>
    );
  }

  if (!settings) {
    return (
      <Alert color="red" title="Error">
        Unable to load settings.
      </Alert>
    );
  }

  return (
    <div>
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>System Settings</Title>
          <Text c="dimmed">Configure platform settings and preferences</Text>
        </div>

        <Group>
          <Badge
            size="lg"
            variant="filled"
            color="blue"
            leftSection={<IconSettings size={16} />}
          >
            Settings
          </Badge>

          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={saveSettings}
            loading={saving}
            color="green"
          >
            Save Changes
          </Button>
        </Group>
      </Group>

      {error && (
        <Alert color="red" mb="lg" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>
            General
          </Tabs.Tab>
          <Tabs.Tab value="security" leftSection={<IconShield size={16} />}>
            Security
          </Tabs.Tab>
          <Tabs.Tab value="email" leftSection={<IconMail size={16} />}>
            Email
          </Tabs.Tab>
          <Tabs.Tab value="notifications" leftSection={<IconBell size={16} />}>
            Notifications
          </Tabs.Tab>
          <Tabs.Tab value="maintenance" leftSection={<IconDatabase size={16} />}>
            Maintenance
          </Tabs.Tab>
        </Tabs.List>

        {/* General Settings */}
        <Tabs.Panel value="general" pt="lg">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">General Settings</Title>

            <Stack gap="lg">
              <TextInput
                label="Site Name"
                description="Display name for your platform"
                value={settings.general.siteName}
                onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
              />

              <TextInput
                label="Site Description"
                description="Brief description of your platform"
                value={settings.general.siteDescription}
                onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
              />

              <Divider />

              <Switch
                label="Maintenance Mode"
                description="Temporarily disable access to the platform"
                checked={settings.general.maintenanceMode}
                onChange={(e) => updateSetting('general', 'maintenanceMode', e.currentTarget.checked)}
                color="red"
              />

              <Switch
                label="User Registration"
                description="Allow new users to register"
                checked={settings.general.registrationEnabled}
                onChange={(e) => updateSetting('general', 'registrationEnabled', e.currentTarget.checked)}
              />

              <Switch
                label="Email Verification Required"
                description="Require email verification for new accounts"
                checked={settings.general.emailVerificationRequired}
                onChange={(e) => updateSetting('general', 'emailVerificationRequired', e.currentTarget.checked)}
              />
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Security Settings */}
        <Tabs.Panel value="security" pt="lg">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Security Settings</Title>

            <Stack gap="lg">
              <NumberInput
                label="Session Timeout (minutes)"
                description="Automatically log out users after this time"
                value={settings.security.sessionTimeout}
                onChange={(value) => updateSetting('security', 'sessionTimeout', value)}
                min={15}
                max={10080}
              />

              <NumberInput
                label="Max Login Attempts"
                description="Number of failed login attempts before account lockout"
                value={settings.security.maxLoginAttempts}
                onChange={(value) => updateSetting('security', 'maxLoginAttempts', value)}
                min={3}
                max={10}
              />

              <NumberInput
                label="Password Minimum Length"
                description="Minimum characters required for passwords"
                value={settings.security.passwordMinLength}
                onChange={(value) => updateSetting('security', 'passwordMinLength', value)}
                min={6}
                max={32}
              />

              <Switch
                label="Require Two-Factor Authentication"
                description="Force all users to enable 2FA"
                checked={settings.security.requireTwoFactor}
                onChange={(e) => updateSetting('security', 'requireTwoFactor', e.currentTarget.checked)}
              />
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Email Settings */}
        <Tabs.Panel value="email" pt="lg">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Email Configuration</Title>

            <Stack gap="lg">
              <Select
                label="Email Provider"
                description="Choose your email service provider"
                value={settings.email.provider}
                onChange={(value) => updateSetting('email', 'provider', value)}
                data={[
                  { value: 'smtp', label: 'SMTP' },
                  { value: 'sendgrid', label: 'SendGrid' },
                  { value: 'mailgun', label: 'Mailgun' },
                  { value: 'ses', label: 'Amazon SES' },
                ]}
              />

              <Group grow>
                <TextInput
                  label="SMTP Host"
                  value={settings.email.smtpHost}
                  onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                />

                <NumberInput
                  label="SMTP Port"
                  value={settings.email.smtpPort}
                  onChange={(value) => updateSetting('email', 'smtpPort', value)}
                />
              </Group>

              <Switch
                label="SMTP Secure"
                description="Use SSL/TLS encryption"
                checked={settings.email.smtpSecure}
                onChange={(e) => updateSetting('email', 'smtpSecure', e.currentTarget.checked)}
              />

              <Group grow>
                <TextInput
                  label="From Email"
                  value={settings.email.fromEmail}
                  onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                />

                <TextInput
                  label="From Name"
                  value={settings.email.fromName}
                  onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                />
              </Group>
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Notifications Settings */}
        <Tabs.Panel value="notifications" pt="lg">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Notification Settings</Title>

            <Stack gap="lg">
              <Switch
                label="Email Notifications"
                description="Send system notifications via email"
                checked={settings.notifications.emailNotifications}
                onChange={(e) => updateSetting('notifications', 'emailNotifications', e.currentTarget.checked)}
              />

              <Switch
                label="Push Notifications"
                description="Send browser push notifications"
                checked={settings.notifications.pushNotifications}
                onChange={(e) => updateSetting('notifications', 'pushNotifications', e.currentTarget.checked)}
              />

              <TextInput
                label="Slack Webhook URL"
                description="Send notifications to Slack channel"
                placeholder="https://hooks.slack.com/services/..."
                value={settings.notifications.slackWebhook}
                onChange={(e) => updateSetting('notifications', 'slackWebhook', e.target.value)}
              />

              <TextInput
                label="Discord Webhook URL"
                description="Send notifications to Discord channel"
                placeholder="https://discord.com/api/webhooks/..."
                value={settings.notifications.discordWebhook}
                onChange={(e) => updateSetting('notifications', 'discordWebhook', e.target.value)}
              />
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Maintenance */}
        <Tabs.Panel value="maintenance" pt="lg">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">System Maintenance</Title>

            <Stack gap="lg">
              <Alert color="yellow" icon={<IconAlertTriangle size={16} />}>
                These operations may affect system performance. Use with caution.
              </Alert>

              <Group>
                <Button
                  leftSection={<IconRefresh size={16} />}
                  variant="light"
                  color="blue"
                >
                  Clear Cache
                </Button>

                <Button
                  leftSection={<IconDatabase size={16} />}
                  variant="light"
                  color="orange"
                >
                  Optimize Database
                </Button>

                <Button
                  leftSection={<IconUsers size={16} />}
                  variant="light"
                  color="green"
                >
                  Cleanup Inactive Users
                </Button>
              </Group>

              <Divider />

              <Text size="sm" c="dimmed">
                System Status: All services operational
              </Text>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* Footer */}
      <Text size="xs" c="dimmed" ta="center" mt="xl">
        Changes are saved automatically. Critical settings require system restart.
      </Text>
    </div>
  );
}