'use client';

import { Container, Title, Text, Stack, Badge, Card, Group, SimpleGrid, ThemeIcon, Divider, Box, Button } from '@mantine/core';
import { CheckCircle2, Clock, Target, Calendar, Sparkles, Zap, ArrowRight } from 'lucide-react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function Roadmap() {
  return (
    <Box style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <Header />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <Container size="lg" py={80} style={{ marginTop: '100px' }}>
        <Stack gap={60}>
          {/* Hero Section */}
          <Stack align="center" gap="lg">
            <Title
              order={1}
              ta="center"
              style={{
                fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'clamp(36px, 6vw, 48px)',
                lineHeight: 1.2,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#000000',
              }}
            >
              Product <span style={{ color: '#4686FE' }}>Roadmap</span>
            </Title>
            <Text
              ta="center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '24px',
                lineHeight: '32px',
                color: '#666666',
                fontWeight: 400,
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              Our journey to building the world's most comprehensive performance system
            </Text>
          </Stack>

          {/* Current Status */}
          <Card
            padding="xl"
            radius={16}
            style={{
              background: 'white',
              border: '2px solid #4686FE',
              boxShadow: 'none',
            }}
          >
            <Stack gap="md">
              <Group gap="md">
                <ThemeIcon
                  size={40}
                  radius={12}
                  style={{
                    background: '#4686FE',
                    color: 'white',
                    border: 'none',
                  }}
                >
                  <Target size={24} />
                </ThemeIcon>
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#000000',
                  }}
                >
                  Current Status - Beta Testing
                </Text>
              </Group>
              <Text
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#666666',
                  lineHeight: '24px',
                }}
              >
                We're currently in private beta with select users, refining the core features and gathering feedback
                to ensure we deliver an exceptional experience at launch.
              </Text>
            </Stack>
          </Card>

          {/* Roadmap Timeline */}
          <Stack gap="xl">
            <Title
              order={2}
              ta="center"
              style={{
                fontFamily: 'Inter Display, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                color: '#000000',
              }}
            >
              Development Timeline
            </Title>

            <Stack gap="xl">
              {/* Q3 2025 - Beta Launch */}
              <Card
                padding="xl"
                radius={16}
                style={{
                  background: 'white',
                  border: '2px solid #22C55E',
                  boxShadow: 'none',
                }}
              >
                <Stack gap="lg">
                  <Group gap="md">
                    <ThemeIcon
                      size={50}
                      radius={16}
                      style={{
                        background: '#22C55E',
                        color: 'white',
                        border: 'none',
                      }}
                    >
                      <CheckCircle2 size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Badge
                        size="sm"
                        style={{
                          background: 'rgba(34, 197, 94, 0.1)',
                          color: '#22C55E',
                          border: 'none',
                        }}
                      >
                        Completed
                      </Badge>
                      <Text
                        style={{
                          fontFamily: 'Inter Display, sans-serif',
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#000000',
                        }}
                      >
                        Q3 2025 - Private Beta Launch
                      </Text>
                    </Stack>
                  </Group>
                  <Card
                    padding="lg"
                    radius={16}
                    style={{
                      background: '#F5F5F5',
                      border: '1px solid #CCCCCC',
                      boxShadow: 'none',
                    }}
                  >
                    <Stack gap="xs">
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#000000',
                        }}
                      >
                        Core Features Released:
                      </Text>
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                        {['OKR Framework', 'Task Management', 'Habit Tracking', 'Vision Board', 'Life Areas', 'Daily Journal'].map((feature) => (
                          <Text
                            key={feature}
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '12px',
                              color: '#666666',
                            }}
                          >
                            • {feature}
                          </Text>
                        ))}
                      </SimpleGrid>
                    </Stack>
                  </Card>
                </Stack>
              </Card>

              {/* Q4 2025 - Public Launch */}
              <Card
                padding="xl"
                radius={16}
                style={{
                  background: 'white',
                  border: '2px solid #4686FE',
                  boxShadow: 'none',
                }}
              >
                <Stack gap="lg">
                  <Group gap="md">
                    <ThemeIcon
                      size={50}
                      radius={16}
                      style={{
                        background: '#4686FE',
                        color: 'white',
                        border: 'none',
                      }}
                    >
                      <Clock size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Badge
                        size="sm"
                        style={{
                          background: 'rgba(70, 134, 254, 0.1)',
                          color: '#4686FE',
                          border: 'none',
                        }}
                      >
                        In Progress
                      </Badge>
                      <Text
                        style={{
                          fontFamily: 'Inter Display, sans-serif',
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#000000',
                        }}
                      >
                        Q4 2025 - Public Launch
                      </Text>
                    </Stack>
                  </Group>
                  <Card
                    padding="lg"
                    radius={16}
                    style={{
                      background: '#F5F5F5',
                      border: '1px solid #CCCCCC',
                      boxShadow: 'none',
                    }}
                  >
                    <Stack gap="xs">
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#000000',
                        }}
                      >
                        Launch Features:
                      </Text>
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                        {['Public release with pricing', 'Mobile app (iOS/Android)', 'Notification system', 'Profile photo CRUD', 'Basic payment system', 'Data export features'].map((feature) => (
                          <Text
                            key={feature}
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '12px',
                              color: '#666666',
                            }}
                          >
                            • {feature}
                          </Text>
                        ))}
                      </SimpleGrid>
                    </Stack>
                  </Card>
                </Stack>
              </Card>

              {/* Q1 2026 - Advanced Features */}
              <Card
                padding="xl"
                radius={16}
                style={{
                  background: 'white',
                  border: '1px solid #CCCCCC',
                  boxShadow: 'none',
                }}
              >
                <Stack gap="lg">
                  <Group gap="md">
                    <ThemeIcon
                      size={50}
                      radius={16}
                      style={{
                        background: '#F5F5F5',
                        color: '#4686FE',
                        border: 'none',
                      }}
                    >
                      <Sparkles size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Badge
                        size="sm"
                        style={{
                          background: 'rgba(168, 85, 247, 0.1)',
                          color: '#A855F7',
                          border: 'none',
                        }}
                      >
                        Planned
                      </Badge>
                      <Text
                        style={{
                          fontFamily: 'Inter Display, sans-serif',
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#000000',
                        }}
                      >
                        Q1 2026 - Advanced Features
                      </Text>
                    </Stack>
                  </Group>
                  <Card
                    padding="lg"
                    radius={16}
                    style={{
                      background: '#F5F5F5',
                      border: '1px solid #CCCCCC',
                      boxShadow: 'none',
                    }}
                  >
                    <Stack gap="xs">
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#000000',
                        }}
                      >
                        Enhanced Capabilities:
                      </Text>
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                        {['Values module with alignment scoring', 'Advanced journal with AI insights', 'Calendar integrations', 'Time tracking integration', 'Advanced analytics & reports', 'Community features'].map((feature) => (
                          <Text
                            key={feature}
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '12px',
                              color: '#666666',
                            }}
                          >
                            • {feature}
                          </Text>
                        ))}
                      </SimpleGrid>
                    </Stack>
                  </Card>
                </Stack>
              </Card>

              {/* Q2 2026 - CherutOS */}
              <Card
                padding="xl"
                radius={16}
                style={{
                  background: 'white',
                  border: '1px solid #CCCCCC',
                  boxShadow: 'none',
                }}
              >
                <Stack gap="lg">
                  <Group gap="md">
                    <ThemeIcon
                      size={50}
                      radius={16}
                      style={{
                        background: '#F5F5F5',
                        color: '#4686FE',
                        border: 'none',
                      }}
                    >
                      <Zap size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Badge
                        size="sm"
                        style={{
                          background: 'rgba(250, 173, 24, 0.1)',
                          color: '#FAAD18',
                          border: 'none',
                        }}
                      >
                        Future
                      </Badge>
                      <Text
                        style={{
                          fontFamily: 'Inter Display, sans-serif',
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#000000',
                        }}
                      >
                        Q2 2026 - CherutOS & Enterprise
                      </Text>
                    </Stack>
                  </Group>
                  <Card
                    padding="lg"
                    radius={16}
                    style={{
                      background: '#F5F5F5',
                      border: '1px solid #CCCCCC',
                      boxShadow: 'none',
                    }}
                  >
                    <Stack gap="xs">
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#000000',
                        }}
                      >
                        Revolutionary Platform:
                      </Text>
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                        {['CherutOS workspace', 'Custom apps & extensions', 'Enterprise team features', 'Admin dashboard', 'Full payment ecosystem', 'External platform integrations'].map((feature) => (
                          <Text
                            key={feature}
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '12px',
                              color: '#666666',
                            }}
                          >
                            • {feature}
                          </Text>
                        ))}
                      </SimpleGrid>
                    </Stack>
                  </Card>
                </Stack>
              </Card>
            </Stack>
          </Stack>

          {/* Feature Categories */}
          <Stack gap="xl">
            <Title
              order={2}
              ta="center"
              style={{
                fontFamily: 'Inter Display, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                color: '#000000',
              }}
            >
              Feature Categories
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={32}>
              {[
                {
                  icon: Target,
                  title: 'Core Performance',
                  features: [
                    { name: 'OKR Framework', status: 'completed' },
                    { name: 'Task Management', status: 'completed' },
                    { name: 'Habit Tracking', status: 'completed' },
                    { name: 'Life Areas', status: 'completed' },
                    { name: 'Time Tracking', status: 'progress' },
                  ],
                },
                {
                  icon: Sparkles,
                  title: 'Personal Growth',
                  features: [
                    { name: 'Vision Board', status: 'completed' },
                    { name: 'Daily Journal', status: 'completed' },
                    { name: 'Values Module', status: 'progress' },
                    { name: 'AI Insights', status: 'planned' },
                    { name: 'Semantic Search', status: 'planned' },
                  ],
                },
                {
                  icon: Calendar,
                  title: 'Ecosystem',
                  features: [
                    { name: 'Mobile App', status: 'progress' },
                    { name: 'Calendar Integration', status: 'planned' },
                    { name: 'Third-party Apps', status: 'planned' },
                    { name: 'CherutOS', status: 'planned' },
                    { name: 'Extensions', status: 'planned' },
                  ],
                },
              ].map((category, index) => (
                <Card
                  key={index}
                  padding="xl"
                  radius={16}
                  style={{
                    background: 'white',
                    border: '1px solid #CCCCCC',
                    boxShadow: 'none',
                  }}
                >
                  <Stack gap="md">
                    <ThemeIcon
                      size={48}
                      radius={12}
                      style={{
                        background: '#F5F5F5',
                        color: '#4686FE',
                        border: 'none',
                      }}
                    >
                      <category.icon size={24} />
                    </ThemeIcon>
                    <Text
                      style={{
                        fontFamily: 'Inter Display, sans-serif',
                        fontSize: '20px',
                        fontWeight: 600,
                        color: '#000000',
                      }}
                    >
                      {category.title}
                    </Text>
                    <Stack gap="xs">
                      {category.features.map((feature) => (
                        <Text
                          key={feature.name}
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            color: '#666666',
                          }}
                        >
                          {feature.status === 'completed' ? '✅' : feature.status === 'progress' ? '🔄' : '📅'} {feature.name}
                        </Text>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>

          {/* Beta Information */}
          <Card
            padding="xl"
            radius={16}
            style={{
              background: '#F5F5F5',
              border: '1px solid #CCCCCC',
              boxShadow: 'none',
            }}
          >
            <Stack align="center" gap="lg">
              <ThemeIcon
                size={60}
                radius={16}
                style={{
                  background: '#4686FE',
                  color: 'white',
                  border: 'none',
                }}
              >
                <CheckCircle2 size={32} />
              </ThemeIcon>
              <Title
                order={3}
                ta="center"
                style={{
                  fontFamily: 'Inter Display, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#000000',
                }}
              >
                Join Our Beta
              </Title>
              <Text
                ta="center"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '18px',
                  lineHeight: '26px',
                  color: '#666666',
                  fontWeight: 400,
                  maxWidth: '600px',
                }}
              >
                Get early access to Cherut and help shape the future of performance systems.
                Your feedback during beta will directly influence our final product.
              </Text>
              <Button
                component="a"
                href="/auth/register"
                size="lg"
                rightSection={<ArrowRight size={20} />}
                style={{
                  background: '#4686FE',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  height: '56px',
                  padding: '0 32px',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Inter, sans-serif',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      background: '#3366E5',
                    },
                  },
                }}
              >
                Start Your Journey
              </Button>
            </Stack>
          </Card>

          <Divider style={{ borderColor: '#CCCCCC' }} />

          {/* Legend */}
          <Stack gap="md">
            <Text
              ta="center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#000000',
              }}
            >
              Legend
            </Text>
            <Group justify="center" gap="xl">
              {[
                { symbol: '✅', label: 'Completed' },
                { symbol: '🔄', label: 'In Development' },
                { symbol: '📅', label: 'Planned' },
              ].map((item) => (
                <Group key={item.label} gap="xs">
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                    }}
                  >
                    {item.symbol}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      color: '#666666',
                    }}
                  >
                    {item.label}
                  </Text>
                </Group>
              ))}
            </Group>
          </Stack>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}