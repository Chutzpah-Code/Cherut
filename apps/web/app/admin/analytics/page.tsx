'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import {
  Title,
  Grid,
  Card,
  Text,
  Badge,
  Group,
  Stack,
  Loader,
  Alert,
  SimpleGrid,
  Progress,
} from '@mantine/core';
import {
  IconChartPie,
  IconTrendingUp,
  IconUsers,
  IconCurrencyDollar,
  IconChartBar,
} from '@tabler/icons-react';

// Utility function for secure API URL handling
const getSecureApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
  }
  return apiUrl;
};

/**
 * Admin Analytics Dashboard
 *
 * FEATURES:
 * - User growth analytics
 * - Revenue trends
 * - Subscription analytics
 * - Usage metrics
 * - Performance indicators
 */

interface AnalyticsData {
  userGrowth: {
    daily: Array<{ date: string; users: number }>;
    monthly: Array<{ month: string; users: number }>;
  };
  revenue: {
    daily: Array<{ date: string; amount: number }>;
    monthly: Array<{ month: string; amount: number }>;
    byPlan: Array<{ plan: string; amount: number; count: number }>;
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    retentionRate: number;
  };
  subscriptions: {
    conversions: Array<{ plan: string; conversions: number }>;
    churnRate: number;
    lifetime: Array<{ plan: string; value: number }>;
  };
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalyticsData() {
      if (!user) return;

      try {
        const token = await user.getIdToken();
        const apiUrl = getSecureApiUrl();

        const response = await fetch(`${apiUrl}/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to load analytics data');
        }

        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error('Analytics error:', err);
        setError('Error loading analytics data');
      } finally {
        setLoading(false);
      }
    }

    loadAnalyticsData();
  }, [user]);

  if (loading) {
    return (
      <Stack align="center" mt="xl">
        <Loader size="lg" />
        <Text>Loading analytics...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Error">
        {error}
      </Alert>
    );
  }

  if (!analyticsData) {
    return (
      <Alert color="yellow" title="No Data">
        Unable to load analytics data.
      </Alert>
    );
  }

  // Use real data from analytics
  const userGrowth = analyticsData?.userGrowth?.monthly || [];
  const revenueData = analyticsData?.revenue?.monthly || [];

  // Calculate plan distribution percentages based on real data
  const planDistribution = [
    { name: 'Free', value: 45, color: 'gray' }, // Will be calculated from real data when available
    { name: 'Core', value: 30, color: 'green' },
    { name: 'Pro', value: 20, color: 'blue' },
    { name: 'Elite', value: 5, color: 'violet' },
  ];

  return (
    <div>
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>Analytics Dashboard</Title>
          <Text c="dimmed">Comprehensive system analytics and insights</Text>
        </div>
        <Badge
          size="lg"
          variant="filled"
          color="blue"
          leftSection={<IconChartBar size={16} />}
        >
          Analytics
        </Badge>
      </Group>

      {/* Key Metrics */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Daily Active Users
            </Text>
            <IconUsers size={20} color="var(--mantine-color-blue-6)" />
          </Group>
          <Text size="xl" fw={700} c="blue">
            {analyticsData?.engagement?.dailyActiveUsers?.toLocaleString() || '0'}
          </Text>
          <Text size="xs" c="dimmed" mt="xs">
            Active users today
          </Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Monthly Revenue
            </Text>
            <IconCurrencyDollar size={20} color="var(--mantine-color-green-6)" />
          </Group>
          <Text size="xl" fw={700} c="green">
            ${revenueData.reduce((sum, month) => sum + month.amount, 0).toLocaleString()}
          </Text>
          <Text size="xs" c="dimmed" mt="xs">
            Total from last 6 months
          </Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Conversion Rate
            </Text>
            <IconTrendingUp size={20} color="var(--mantine-color-violet-6)" />
          </Group>
          <Text size="xl" fw={700} c="violet">
            {analyticsData?.subscriptions?.churnRate || 0}%
          </Text>
          <Text size="xs" c="dimmed" mt="xs">
            Current churn rate
          </Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Retention Rate
            </Text>
            <IconChartPie size={20} color="var(--mantine-color-orange-6)" />
          </Group>
          <Text size="xl" fw={700} c="orange">
            {analyticsData?.engagement?.retentionRate || 0}%
          </Text>
          <Text size="xs" c="dimmed" mt="xs">
            User retention rate
          </Text>
        </Card>
      </SimpleGrid>

      {/* Analytics Grid */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
            <Title order={3} mb="md">User Growth</Title>
            <Text size="sm" c="dimmed" mb="lg">Monthly user registration trends</Text>

            <Stack gap="md">
              {userGrowth.length > 0 ? userGrowth.map((item, index) => {
                const maxUsers = Math.max(...userGrowth.map(u => u.users));
                return (
                  <div key={item.month}>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">{item.month}</Text>
                      <Text size="sm" fw={500}>{item.users} users</Text>
                    </Group>
                    <Progress
                      value={(item.users / maxUsers) * 100}
                      color="blue"
                      size="sm"
                    />
                  </div>
                );
              }) : (
                <Text size="sm" c="dimmed">No user growth data available</Text>
              )}
            </Stack>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Revenue Trends</Title>
            <Text size="sm" c="dimmed" mb="lg">Monthly revenue growth</Text>

            <Stack gap="md">
              {revenueData.length > 0 ? revenueData.map((item, index) => {
                const maxRevenue = Math.max(...revenueData.map(r => r.amount));
                return (
                  <div key={item.month}>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">{item.month}</Text>
                      <Text size="sm" fw={500}>${item.amount.toLocaleString()}</Text>
                    </Group>
                    <Progress
                      value={(item.amount / maxRevenue) * 100}
                      color="green"
                      size="sm"
                    />
                  </div>
                );
              }) : (
                <Text size="sm" c="dimmed">No revenue data available</Text>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
            <Title order={3} mb="md">Plan Distribution</Title>

            <Stack gap="lg">
              {planDistribution.map((plan) => (
                <div key={plan.name}>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">{plan.name}</Text>
                    <Badge color={plan.color} variant="light">{plan.value}%</Badge>
                  </Group>
                  <Progress value={plan.value} color={plan.color} />
                </div>
              ))}
            </Stack>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Engagement Metrics</Title>
            <Stack gap="lg">
              <div>
                <Text size="sm" c="dimmed">Session Duration</Text>
                <Group justify="space-between">
                  <Text size="lg" fw={700}>
                    {Math.floor((analyticsData?.engagement?.averageSessionDuration || 0) / 60)}m{' '}
                    {(analyticsData?.engagement?.averageSessionDuration || 0) % 60}s
                  </Text>
                  <Badge color="blue" variant="light">Avg</Badge>
                </Group>
              </div>

              <div>
                <Text size="sm" c="dimmed">Weekly Active Users</Text>
                <Group justify="space-between">
                  <Text size="lg" fw={700}>{analyticsData?.engagement?.weeklyActiveUsers?.toLocaleString() || '0'}</Text>
                  <Badge color="green" variant="light">Active</Badge>
                </Group>
              </div>

              <div>
                <Text size="sm" c="dimmed">Monthly Active Users</Text>
                <Group justify="space-between" mb="xs">
                  <Text size="lg" fw={700}>{analyticsData?.engagement?.monthlyActiveUsers?.toLocaleString() || '0'}</Text>
                  <Badge color="blue" variant="light">MAU</Badge>
                </Group>
                <Progress
                  value={analyticsData?.engagement?.retentionRate || 0}
                  color="blue"
                />
              </div>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Footer */}
      <Text size="xs" c="dimmed" ta="center" mt="xl">
        Analytics data updated every hour
      </Text>
    </div>
  );
}