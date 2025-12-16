import { Container, Title, Text, Stack, Badge, Card, Group, SimpleGrid, ThemeIcon, Divider, Box } from '@mantine/core';
import { CheckCircle2, Clock, Target, Calendar, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function Roadmap() {
  return (
    <Box style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 50%, #ffffff 100%)' }}>
      <Header />

      <Container size="lg" py={80} style={{ marginTop: '100px' }}>
        <Stack gap={60}>
          {/* Hero Section */}
          <Stack align="center" gap="lg">
            <Title
              order={1}
              ta="center"
              style={{
                fontSize: '48px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #3143B6 0%, #A855F7 50%, #EC4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Product Roadmap
            </Title>
            <Text size="xl" ta="center" maw={600} style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
              Our journey to building the world&apos;s most comprehensive performance system
            </Text>
          </Stack>

          {/* Current Status */}
          <Card padding="xl" radius={20} style={{ background: 'white', border: '2px solid #3143B6' }}>
            <Stack gap="md">
              <Group gap="md">
                <ThemeIcon size={40} radius={12} style={{ background: '#3143B6' }}>
                  <Target size={24} />
                </ThemeIcon>
                <Text size="xl" fw={700}>Current Status - Beta Testing</Text>
              </Group>
              <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                We&apos;re currently in private beta with select users, refining the core features and gathering feedback
                to ensure we deliver an exceptional experience at launch.
              </Text>
            </Stack>
          </Card>

          {/* Roadmap Timeline */}
          <Stack gap="xl">
            <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
              Development Timeline
            </Title>

            <Stack gap="xl">
              {/* Q3 2025 - Beta Launch */}
              <Card padding="xl" radius={20} style={{ background: 'white', border: '2px solid #2FB264' }}>
                <Stack gap="lg">
                  <Group gap="md">
                    <ThemeIcon size={50} radius={16} style={{ background: '#2FB264', color: 'white' }}>
                      <CheckCircle2 size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Badge size="sm" color="green">Completed</Badge>
                      <Text size="lg" fw={700}>Q3 2025 - Private Beta Launch</Text>
                    </Stack>
                  </Group>
                  <Card padding="lg" radius={16} style={{ background: 'rgba(47, 178, 100, 0.05)', border: '1px solid rgba(47, 178, 100, 0.2)' }}>
                    <Stack gap="xs">
                      <Text size="sm" fw={600}>Core Features Released:</Text>
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                        <Text size="xs">• OKR Framework</Text>
                        <Text size="xs">• Task Management</Text>
                        <Text size="xs">• Habit Tracking</Text>
                        <Text size="xs">• Vision Board</Text>
                        <Text size="xs">• Life Areas</Text>
                        <Text size="xs">• Daily Journal</Text>
                      </SimpleGrid>
                    </Stack>
                  </Card>
                </Stack>
              </Card>

              {/* Q4 2025 - Public Launch */}
              <Card padding="xl" radius={20} style={{ background: 'white', border: '2px solid #3143B6' }}>
                <Stack gap="lg">
                  <Group gap="md">
                    <ThemeIcon size={50} radius={16} style={{ background: '#3143B6', color: 'white' }}>
                      <Clock size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Badge size="sm" color="blue">In Progress</Badge>
                      <Text size="lg" fw={700}>Q4 2025 - Public Launch</Text>
                    </Stack>
                  </Group>
                  <Card padding="lg" radius={16} style={{ background: 'rgba(49, 67, 182, 0.05)', border: '1px solid rgba(49, 67, 182, 0.2)' }}>
                    <Stack gap="xs">
                      <Text size="sm" fw={600}>Launch Features:</Text>
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                        <Text size="xs">• Public release with pricing</Text>
                        <Text size="xs">• Mobile app (iOS/Android)</Text>
                        <Text size="xs">• Notification system</Text>
                        <Text size="xs">• Profile photo CRUD</Text>
                        <Text size="xs">• Basic payment system</Text>
                        <Text size="xs">• Data export features</Text>
                      </SimpleGrid>
                    </Stack>
                  </Card>
                </Stack>
              </Card>

              {/* Q1 2026 - Advanced Features */}
              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <Stack gap="lg">
                  <Group gap="md">
                    <ThemeIcon size={50} radius={16} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                      <Sparkles size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Badge size="sm" color="grape">Planned</Badge>
                      <Text size="lg" fw={700}>Q1 2026 - Advanced Features</Text>
                    </Stack>
                  </Group>
                  <Card padding="lg" radius={16} style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                    <Stack gap="xs">
                      <Text size="sm" fw={600}>Enhanced Capabilities:</Text>
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                        <Text size="xs">• Values module with alignment scoring</Text>
                        <Text size="xs">• Advanced journal with AI insights</Text>
                        <Text size="xs">• Calendar integrations</Text>
                        <Text size="xs">• Time tracking integration</Text>
                        <Text size="xs">• Advanced analytics & reports</Text>
                        <Text size="xs">• Community features</Text>
                      </SimpleGrid>
                    </Stack>
                  </Card>
                </Stack>
              </Card>

              {/* Q2 2026 - CherutOS */}
              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(250, 173, 24, 0.3)' }}>
                <Stack gap="lg">
                  <Group gap="md">
                    <ThemeIcon size={50} radius={16} style={{ background: 'rgba(250, 173, 24, 0.1)', color: '#FAAD18' }}>
                      <Zap size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Badge size="sm" color="yellow">Future</Badge>
                      <Text size="lg" fw={700}>Q2 2026 - CherutOS & Enterprise</Text>
                    </Stack>
                  </Group>
                  <Card padding="lg" radius={16} style={{ background: 'rgba(250, 173, 24, 0.05)', border: '1px solid rgba(250, 173, 24, 0.2)' }}>
                    <Stack gap="xs">
                      <Text size="sm" fw={600}>Revolutionary Platform:</Text>
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                        <Text size="xs">• CherutOS workspace</Text>
                        <Text size="xs">• Custom apps & extensions</Text>
                        <Text size="xs">• Enterprise team features</Text>
                        <Text size="xs">• Admin dashboard</Text>
                        <Text size="xs">• Full payment ecosystem</Text>
                        <Text size="xs">• External platform integrations</Text>
                      </SimpleGrid>
                    </Stack>
                  </Card>
                </Stack>
              </Card>
            </Stack>
          </Stack>

          {/* Feature Categories */}
          <Stack gap="xl">
            <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
              Feature Categories
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
              {/* Core Performance */}
              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(49, 67, 182, 0.2)' }}>
                <Stack gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(49, 67, 182, 0.1)', color: '#3143B6' }}>
                    <Target size={32} />
                  </ThemeIcon>
                  <Text size="lg" fw={700}>Core Performance</Text>
                  <Stack gap="xs">
                    <Text size="xs">✅ OKR Framework</Text>
                    <Text size="xs">✅ Task Management</Text>
                    <Text size="xs">✅ Habit Tracking</Text>
                    <Text size="xs">✅ Life Areas</Text>
                    <Text size="xs">🔄 Time Tracking</Text>
                  </Stack>
                </Stack>
              </Card>

              {/* Personal Growth */}
              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                <Stack gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                    <Sparkles size={32} />
                  </ThemeIcon>
                  <Text size="lg" fw={700}>Personal Growth</Text>
                  <Stack gap="xs">
                    <Text size="xs">✅ Vision Board</Text>
                    <Text size="xs">✅ Daily Journal</Text>
                    <Text size="xs">🔄 Values Module</Text>
                    <Text size="xs">📅 AI Insights</Text>
                    <Text size="xs">📅 Semantic Search</Text>
                  </Stack>
                </Stack>
              </Card>

              {/* Ecosystem */}
              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(250, 173, 24, 0.2)' }}>
                <Stack gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(250, 173, 24, 0.1)', color: '#FAAD18' }}>
                    <Calendar size={32} />
                  </ThemeIcon>
                  <Text size="lg" fw={700}>Ecosystem</Text>
                  <Stack gap="xs">
                    <Text size="xs">🔄 Mobile App</Text>
                    <Text size="xs">📅 Calendar Integration</Text>
                    <Text size="xs">📅 Third-party Apps</Text>
                    <Text size="xs">📅 CherutOS</Text>
                    <Text size="xs">📅 Extensions</Text>
                  </Stack>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>

          {/* Beta Information */}
          <Card padding="xl" radius={20} style={{ background: 'rgba(47, 178, 100, 0.05)', border: '2px solid rgba(47, 178, 100, 0.2)' }}>
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius={16} style={{ background: 'rgba(47, 178, 100, 0.1)', color: '#2FB264' }}>
                <CheckCircle2 size={32} />
              </ThemeIcon>
              <Title order={3} ta="center">Join Our Beta</Title>
              <Text ta="center" maw={600} style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                Get early access to Cherut and help shape the future of performance systems.
                Your feedback during beta will directly influence our final product.
              </Text>
              <Link href="/auth/register" style={{ textDecoration: 'none' }}>
                <Text style={{ color: '#3143B6', fontWeight: 600, fontSize: '18px' }}>
                  Start Your Journey →
                </Text>
              </Link>
            </Stack>
          </Card>

          <Divider style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }} />

          {/* Legend */}
          <Stack gap="md">
            <Text size="sm" fw={600} ta="center">Legend</Text>
            <Group justify="center" gap="xl">
              <Group gap="xs">
                <Text size="xs">✅</Text>
                <Text size="xs">Completed</Text>
              </Group>
              <Group gap="xs">
                <Text size="xs">🔄</Text>
                <Text size="xs">In Development</Text>
              </Group>
              <Group gap="xs">
                <Text size="xs">📅</Text>
                <Text size="xs">Planned</Text>
              </Group>
            </Group>
          </Stack>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}