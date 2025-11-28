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
  Progress,
  SimpleGrid,
} from '@mantine/core';
import {
  IconUsers,
  IconUserCheck,
  IconCurrencyDollar,
  IconTrendingUp,
  IconShieldCheck,
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
 * Dashboard principal do administrador
 *
 * MÉTRICAS EXIBIDAS:
 * - Total de usuários
 * - Usuários ativos (com assinatura)
 * - Revenue mensal
 * - Taxa de conversão
 * - Distribuição de planos
 * - Usuários recentes
 */

interface DashboardData {
  overview: {
    totalUsers: number;
    totalAdmins: number;
    activeSubscriptions: number;
    newUsersLast30Days: number;
    onboardingCompletionRate: number;
  };
  planDistribution: {
    free: number;
    core: number;
    pro: number;
    elite: number;
  };
  lastUpdated: string;
}

interface SalesData {
  monthlyRevenue: number;
  salesByPlan: {
    core: number;
    pro: number;
    elite: number;
  };
  totalPaidUsers: number;
  averageRevenuePerUser: number;
  conversionRate: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;

      try {
        const token = await user.getIdToken();
        const apiUrl = getSecureApiUrl();

        // Carregar dados em paralelo
        const [overviewResponse, salesResponse] = await Promise.all([
          fetch(`${apiUrl}/admin/overview`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/admin/sales`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!overviewResponse.ok || !salesResponse.ok) {
          throw new Error('Failed to load dashboard data');
        }

        const [overview, sales] = await Promise.all([
          overviewResponse.json(),
          salesResponse.json(),
        ]);

        setDashboardData(overview);
        setSalesData(sales);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <Stack align="center" mt="xl">
        <Loader size="lg" />
        <Text>Loading dashboard...</Text>
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

  if (!dashboardData || !salesData) {
    return (
      <Alert color="yellow" title="No Data">
        Unable to load dashboard data.
      </Alert>
    );
  }

  const { overview, planDistribution } = dashboardData;

  // Cards de métricas principais
  const metrics = [
    {
      title: 'Total Users',
      value: overview.totalUsers.toLocaleString(),
      icon: IconUsers,
      color: 'blue',
      description: `${overview.newUsersLast30Days} new in last 30 days`,
    },
    {
      title: 'Active Users',
      value: overview.activeSubscriptions.toLocaleString(),
      icon: IconUserCheck,
      color: 'green',
      description: `${Math.round((overview.activeSubscriptions / overview.totalUsers) * 100)}% activation rate`,
    },
    {
      title: 'Monthly Revenue',
      value: `$${salesData.monthlyRevenue.toLocaleString()}`,
      icon: IconCurrencyDollar,
      color: 'yellow',
      description: `$${salesData.averageRevenuePerUser.toFixed(2)} ARPU`,
    },
    {
      title: 'Conversion Rate',
      value: `${salesData.conversionRate}%`,
      icon: IconTrendingUp,
      color: 'violet',
      description: `${salesData.totalPaidUsers} paying users`,
    },
  ];

  return (
    <div>
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>Admin Dashboard</Title>
          <Text c="dimmed">Cherut system overview</Text>
        </div>
        <Badge
          size="lg"
          variant="filled"
          color="blue"
          leftSection={<IconShieldCheck size={16} />}
        >
          Admin Access
        </Badge>
      </Group>

      {/* Métricas principais */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
        {metrics.map((metric) => (
          <Card key={metric.title} shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>
                {metric.title}
              </Text>
              <metric.icon size={20} color={`var(--mantine-color-${metric.color}-6)`} />
            </Group>

            <Text size="xl" fw={700} c={metric.color}>
              {metric.value}
            </Text>

            <Text size="xs" c="dimmed" mt="xs">
              {metric.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      {/* Distribuição de Planos e Detalhes */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Plan Distribution</Title>

            <Stack gap="md">
              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Free</Text>
                  <Text size="sm" fw={500}>{planDistribution.free}</Text>
                </Group>
                <Progress
                  value={(planDistribution.free / overview.totalUsers) * 100}
                  color="gray"
                />
              </div>

              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Core</Text>
                  <Text size="sm" fw={500}>{planDistribution.core}</Text>
                </Group>
                <Progress
                  value={(planDistribution.core / overview.totalUsers) * 100}
                  color="green"
                />
              </div>

              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Pro</Text>
                  <Text size="sm" fw={500}>{planDistribution.pro}</Text>
                </Group>
                <Progress
                  value={(planDistribution.pro / overview.totalUsers) * 100}
                  color="blue"
                />
              </div>

              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Elite</Text>
                  <Text size="sm" fw={500}>{planDistribution.elite}</Text>
                </Group>
                <Progress
                  value={(planDistribution.elite / overview.totalUsers) * 100}
                  color="violet"
                />
              </div>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Business Metrics</Title>

            <Stack gap="lg">
              <div>
                <Text size="sm" c="dimmed">Onboarding Rate</Text>
                <Group justify="space-between">
                  <Text size="lg" fw={700}>{overview.onboardingCompletionRate}%</Text>
                  <Badge color="green" variant="light">
                    {Math.round((overview.onboardingCompletionRate / 100) * overview.totalUsers)} completed
                  </Badge>
                </Group>
              </div>

              <div>
                <Text size="sm" c="dimmed">Administrators</Text>
                <Group justify="space-between">
                  <Text size="lg" fw={700}>{overview.totalAdmins}</Text>
                  <Badge color="red" variant="light">
                    {Math.round((overview.totalAdmins / overview.totalUsers) * 100)}% of total
                  </Badge>
                </Group>
              </div>

              <div>
                <Text size="sm" c="dimmed">Growth (30d)</Text>
                <Group justify="space-between">
                  <Text size="lg" fw={700}>+{overview.newUsersLast30Days}</Text>
                  <Badge color="blue" variant="light">
                    {Math.round((overview.newUsersLast30Days / overview.totalUsers) * 100)}% growth
                  </Badge>
                </Group>
              </div>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Footer com timestamp */}
      <Text size="xs" c="dimmed" ta="center" mt="xl">
        Last updated: {new Date(dashboardData.lastUpdated).toLocaleString('en-US')}
      </Text>
    </div>
  );
}