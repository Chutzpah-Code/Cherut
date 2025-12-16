'use client';

import { Container, Title, Text, Stack, Card, Group, ThemeIcon, Box, Badge, SimpleGrid, Button, Divider } from '@mantine/core';
import { HelpCircle, BookOpen, MessageSquare, Target, Users, Zap, Settings, Calendar, BarChart } from 'lucide-react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function HelpCenter() {
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
              Help Center
            </Title>
            <Text size="xl" ta="center" maw={700} style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
              Find answers, get support, and master your Cherut performance system.
              We&apos;re here to help you achieve extraordinary results.
            </Text>
          </Stack>

          {/* Quick Actions */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            <Card
              component="a"
              href="/getting-started"
              padding="xl"
              radius={20}
              style={{
                background: 'rgba(49, 67, 182, 0.05)',
                border: '1px solid rgba(49, 67, 182, 0.15)',
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              styles={{
                root: {
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                  }
                }
              }}
            >
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius={16} style={{ background: 'rgba(49, 67, 182, 0.1)', color: '#3143B6' }}>
                  <BookOpen size={32} />
                </ThemeIcon>
                <Text size="lg" fw={700} ta="center">Getting Started</Text>
                <Text size="sm" ta="center" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                  New to Cherut? Start here for a complete onboarding guide.
                </Text>
              </Stack>
            </Card>

            <Card padding="xl" radius={20} style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.15)', cursor: 'pointer' }}>
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius={16} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                  <MessageSquare size={32} />
                </ThemeIcon>
                <Text size="lg" fw={700} ta="center">Contact Support</Text>
                <Text size="sm" ta="center" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                  Need direct help? Reach out to our support team.
                </Text>
              </Stack>
            </Card>

            <Card padding="xl" radius={20} style={{ background: 'rgba(47, 178, 100, 0.05)', border: '1px solid rgba(47, 178, 100, 0.15)', cursor: 'pointer' }}>
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius={16} style={{ background: 'rgba(47, 178, 100, 0.1)', color: '#2FB264' }}>
                  <HelpCircle size={32} />
                </ThemeIcon>
                <Text size="lg" fw={700} ta="center">FAQ</Text>
                <Text size="sm" ta="center" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                  Quick answers to the most common questions.
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>

          {/* Popular Topics */}
          <Stack gap="xl">
            <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
              Popular Topics
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
              <Stack gap="md">
                <Card padding="lg" radius={16} style={{ background: 'white', border: '1px solid rgba(49, 67, 182, 0.15)' }}>
                  <Group gap="md">
                    <ThemeIcon size={40} radius={12} style={{ background: 'rgba(49, 67, 182, 0.1)', color: '#3143B6' }}>
                      <Target size={24} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Text fw={600}>Setting Up Your First OKR</Text>
                      <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                        Learn how to create effective objectives and key results
                      </Text>
                    </Stack>
                  </Group>
                </Card>

                <Card padding="lg" radius={16} style={{ background: 'white', border: '1px solid rgba(168, 85, 247, 0.15)' }}>
                  <Group gap="md">
                    <ThemeIcon size={40} radius={12} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                      <Zap size={24} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Text fw={600}>Building Effective Habits</Text>
                      <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                        Create habits that stick and drive consistent progress
                      </Text>
                    </Stack>
                  </Group>
                </Card>

                <Card padding="lg" radius={16} style={{ background: 'white', border: '1px solid rgba(47, 178, 100, 0.15)' }}>
                  <Group gap="md">
                    <ThemeIcon size={40} radius={12} style={{ background: 'rgba(47, 178, 100, 0.1)', color: '#2FB264' }}>
                      <Calendar size={24} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Text fw={600}>Task Management Mastery</Text>
                      <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                        Organize and prioritize your work for maximum efficiency
                      </Text>
                    </Stack>
                  </Group>
                </Card>
              </Stack>

              <Stack gap="md">
                <Card padding="lg" radius={16} style={{ background: 'white', border: '1px solid rgba(250, 173, 24, 0.15)' }}>
                  <Group gap="md">
                    <ThemeIcon size={40} radius={12} style={{ background: 'rgba(250, 173, 24, 0.1)', color: '#FAAD18' }}>
                      <BarChart size={24} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Text fw={600}>Understanding Analytics</Text>
                      <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                        Make sense of your performance data and insights
                      </Text>
                    </Stack>
                  </Group>
                </Card>

                <Card padding="lg" radius={16} style={{ background: 'white', border: '1px solid rgba(236, 72, 153, 0.15)' }}>
                  <Group gap="md">
                    <ThemeIcon size={40} radius={12} style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899' }}>
                      <Users size={24} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Text fw={600}>Vision Board Creation</Text>
                      <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                        Visualize your goals with powerful imagery and inspiration
                      </Text>
                    </Stack>
                  </Group>
                </Card>

                <Card padding="lg" radius={16} style={{ background: 'white', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                  <Group gap="md">
                    <ThemeIcon size={40} radius={12} style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4' }}>
                      <Settings size={24} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Text fw={600}>Account & Settings</Text>
                      <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                        Customize your Cherut experience and manage preferences
                      </Text>
                    </Stack>
                  </Group>
                </Card>
              </Stack>
            </SimpleGrid>
          </Stack>

          {/* FAQ Section */}
          <Stack gap="xl">
            <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
              Frequently Asked Questions
            </Title>

            <Stack gap="lg">
              <Card padding="lg" radius={16} style={{ background: 'white', border: '1px solid rgba(49, 67, 182, 0.1)' }}>
                <Stack gap="md">
                  <Text fw={600} size="lg">How do I get started with Cherut?</Text>
                  <Divider />
                  <Text style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.6 }}>
                    After creating your account, you&apos;ll be guided through our onboarding process. Start by setting up
                    your life areas (like Health, Career, Relationships), then create your first objective with
                    measurable key results. The system will guide you through each step.
                  </Text>
                </Stack>
              </Card>

              <Card padding="lg" radius={16} style={{ background: 'white', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
                <Stack gap="md">
                  <Text fw={600} size="lg">What&apos;s the difference between objectives and key results?</Text>
                  <Divider />
                  <Text style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.6 }}>
                    Objectives are qualitative, inspirational goals (e.g., &quot;Become financially independent&quot;).
                    Key Results are specific, measurable outcomes that indicate progress toward the objective
                    (e.g., &quot;Save $50,000&quot;, &quot;Increase monthly income to $10,000&quot;). Each objective should have 2-5 key results.
                  </Text>
                </Stack>
              </Card>

              <Card padding="lg" radius={16} style={{ background: 'white', border: '1px solid rgba(47, 178, 100, 0.1)' }}>
                <Stack gap="md">
                  <Text fw={600} size="lg">How does habit tracking work in Cherut?</Text>
                  <Divider />
                  <Text style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.6 }}>
                    Create habits linked to your objectives and life areas. Track daily completion, view streak analytics,
                    and receive insights on your consistency patterns. The system helps you identify which habits drive
                    the most progress toward your goals.
                  </Text>
                </Stack>
              </Card>

              <Card padding="lg" radius={16} style={{ background: 'white', border: '1px solid rgba(250, 173, 24, 0.1)' }}>
                <Stack gap="md">
                  <Text fw={600} size="lg">How is my data protected and stored?</Text>
                  <Divider />
                  <Text style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.6 }}>
                    Your data is encrypted at rest and in transit using industry-standard security measures.
                    We use secure cloud infrastructure and never sell or share your personal information.
                    You can export or delete your data at any time.
                  </Text>
                </Stack>
              </Card>

              <Card padding="lg" radius={16} style={{ background: 'white', border: '1px solid rgba(236, 72, 153, 0.1)' }}>
                <Stack gap="md">
                  <Text fw={600} size="lg">What does beta access include?</Text>
                  <Divider />
                  <Text style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.6 }}>
                    Beta users get free access to all core features during the testing period. This includes
                    OKRs, task management, habit tracking, vision boards, journal, and analytics. Your data
                    will be preserved when we launch the full platform.
                  </Text>
                </Stack>
              </Card>

              <Card padding="lg" radius={16} style={{ background: 'white', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
                <Stack gap="md">
                  <Text fw={600} size="lg">Is there a mobile app?</Text>
                  <Divider />
                  <Text style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.6 }}>
                    The mobile app is currently in development and will be available at our public launch in Q4 2025.
                    In the meantime, the web platform is fully responsive and works great on mobile browsers.
                  </Text>
                </Stack>
              </Card>
            </Stack>
          </Stack>

          {/* Support Options */}
          <Stack gap="xl">
            <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
              Need More Help?
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
              <Card padding="xl" radius={20} style={{ background: 'rgba(49, 67, 182, 0.05)', border: '2px solid rgba(49, 67, 182, 0.2)' }}>
                <Stack align="center" gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(49, 67, 182, 0.1)', color: '#3143B6' }}>
                    <MessageSquare size={32} />
                  </ThemeIcon>
                  <Title order={3} ta="center">Direct Support</Title>
                  <Text ta="center" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                    Get personalized help from our support team. We typically respond within 24 hours.
                  </Text>
                  <Button
                    component="a"
                    href="/contact"
                    radius={12}
                    style={{ background: '#3143B6', fontWeight: 600 }}
                  >
                    Contact Support
                  </Button>
                </Stack>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'rgba(168, 85, 247, 0.05)', border: '2px solid rgba(168, 85, 247, 0.2)' }}>
                <Stack align="center" gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                    <Users size={32} />
                  </ThemeIcon>
                  <Title order={3} ta="center">Community</Title>
                  <Text ta="center" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                    Join our beta community to connect with other high performers and share insights.
                  </Text>
                  <Button
                    component="a"
                    href="https://discord.com/invite/zJp9sWsUNp"
                    target="_blank"
                    radius={12}
                    style={{ background: '#A855F7', fontWeight: 600 }}
                  >
                    Join Community
                  </Button>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>

          {/* Beta Notice */}
          <Card padding="xl" radius={20} style={{ background: 'rgba(47, 178, 100, 0.05)', border: '2px solid rgba(47, 178, 100, 0.2)' }}>
            <Stack align="center" gap="md">
              <Badge size="lg" color="green" variant="light">
                Beta Testing Period
              </Badge>
              <Title order={3} ta="center">Help Us Improve</Title>
              <Text ta="center" maw={700} style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.7 }}>
                During our beta phase, your feedback is invaluable. If you encounter any issues or have
                suggestions for improvement, please don&apos;t hesitate to reach out. Your input shapes the
                future of Cherut.
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}