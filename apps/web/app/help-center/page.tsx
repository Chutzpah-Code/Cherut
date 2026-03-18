'use client';

import { Container, Title, Text, Stack, Card, Group, ThemeIcon, Box, Badge, SimpleGrid, Button, Divider } from '@mantine/core';
import { HelpCircle, BookOpen, MessageSquare, Target, Users, Zap, Settings, Calendar, BarChart } from 'lucide-react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function HelpCenter() {
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
        <Stack gap={80}>
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
              <span style={{ color: '#4686FE' }}>Help</span> Center
            </Title>
            <Text
              ta="center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '24px',
                lineHeight: '32px',
                color: '#666666',
                fontWeight: 400,
                maxWidth: '700px',
                margin: '0 auto',
              }}
            >
              Find answers, get support, and master your Cherut performance system.
              We're here to help you achieve extraordinary results.
            </Text>
          </Stack>

          {/* Quick Actions */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
            <Card
              component="a"
              href="/getting-started"
              padding="xl"
              radius={16}
              style={{
                background: 'white',
                border: '1px solid #CCCCCC',
                boxShadow: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                height: '100%',
              }}
              styles={{
                root: {
                  '&:hover': {
                    borderColor: '#4686FE',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }
                }
              }}
            >
              <Stack align="center" gap="lg" h="100%">
                <ThemeIcon
                  size={64}
                  radius={16}
                  style={{
                    background: '#F5F5F5',
                    color: '#4686FE',
                    border: 'none',
                  }}
                >
                  <BookOpen size={32} />
                </ThemeIcon>
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#000000',
                    textAlign: 'center',
                  }}
                >
                  Getting Started
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    color: '#666666',
                    lineHeight: '24px',
                    textAlign: 'center',
                  }}
                >
                  New to Cherut? Start here for a complete onboarding guide.
                </Text>
              </Stack>
            </Card>

            <Card
              component="a"
              href="/contact"
              padding="xl"
              radius={16}
              style={{
                background: 'white',
                border: '1px solid #CCCCCC',
                boxShadow: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                height: '100%',
              }}
              styles={{
                root: {
                  '&:hover': {
                    borderColor: '#4686FE',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }
                }
              }}
            >
              <Stack align="center" gap="lg" h="100%">
                <ThemeIcon
                  size={64}
                  radius={16}
                  style={{
                    background: '#F5F5F5',
                    color: '#4686FE',
                    border: 'none',
                  }}
                >
                  <MessageSquare size={32} />
                </ThemeIcon>
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#000000',
                    textAlign: 'center',
                  }}
                >
                  Contact Support
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    color: '#666666',
                    lineHeight: '24px',
                    textAlign: 'center',
                  }}
                >
                  Need direct help? Reach out to our support team.
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius={16}
              style={{
                background: 'white',
                border: '1px solid #CCCCCC',
                boxShadow: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                height: '100%',
              }}
              styles={{
                root: {
                  '&:hover': {
                    borderColor: '#4686FE',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }
                }
              }}
            >
              <Stack align="center" gap="lg" h="100%">
                <ThemeIcon
                  size={64}
                  radius={16}
                  style={{
                    background: '#F5F5F5',
                    color: '#4686FE',
                    border: 'none',
                  }}
                >
                  <HelpCircle size={32} />
                </ThemeIcon>
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#000000',
                    textAlign: 'center',
                  }}
                >
                  FAQ
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    color: '#666666',
                    lineHeight: '24px',
                    textAlign: 'center',
                  }}
                >
                  Quick answers to the most common questions.
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>

          {/* Popular Topics */}
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
              Popular Topics
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
              <Stack gap="lg">
                <Card padding="xl" radius={16} style={{ background: 'white', border: '1px solid #CCCCCC', boxShadow: 'none' }}>
                  <Group gap="lg" align="flex-start">
                    <ThemeIcon
                      size={48}
                      radius={12}
                      style={{
                        background: '#F5F5F5',
                        color: '#4686FE',
                        border: 'none',
                        flexShrink: 0,
                      }}
                    >
                      <Target size={24} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: 'Inter Display, sans-serif',
                          fontSize: '18px',
                          fontWeight: 600,
                          color: '#000000',
                        }}
                      >
                        Setting Up Your First OKR
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '16px',
                          fontWeight: 400,
                          color: '#666666',
                          lineHeight: '24px',
                        }}
                      >
                        Learn how to create effective objectives and key results
                      </Text>
                    </Stack>
                  </Group>
                </Card>

                <Card padding="xl" radius={16} style={{ background: 'white', border: '1px solid #CCCCCC', boxShadow: 'none' }}>
                  <Group gap="lg" align="flex-start">
                    <ThemeIcon
                      size={48}
                      radius={12}
                      style={{
                        background: '#F5F5F5',
                        color: '#4686FE',
                        border: 'none',
                        flexShrink: 0,
                      }}
                    >
                      <Zap size={24} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: 'Inter Display, sans-serif',
                          fontSize: '18px',
                          fontWeight: 600,
                          color: '#000000',
                        }}
                      >
                        Building Effective Habits
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '16px',
                          fontWeight: 400,
                          color: '#666666',
                          lineHeight: '24px',
                        }}
                      >
                        Create habits that stick and drive consistent progress
                      </Text>
                    </Stack>
                  </Group>
                </Card>

                <Card padding="xl" radius={16} style={{ background: 'white', border: '1px solid #CCCCCC', boxShadow: 'none' }}>
                  <Group gap="lg" align="flex-start">
                    <ThemeIcon
                      size={48}
                      radius={12}
                      style={{
                        background: '#F5F5F5',
                        color: '#4686FE',
                        border: 'none',
                        flexShrink: 0,
                      }}
                    >
                      <Calendar size={24} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: 'Inter Display, sans-serif',
                          fontSize: '18px',
                          fontWeight: 600,
                          color: '#000000',
                        }}
                      >
                        Task Management Mastery
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '16px',
                          fontWeight: 400,
                          color: '#666666',
                          lineHeight: '24px',
                        }}
                      >
                        Organize and prioritize your work for maximum efficiency
                      </Text>
                    </Stack>
                  </Group>
                </Card>
              </Stack>

              <Stack gap="lg">
                <Card padding="xl" radius={16} style={{ background: 'white', border: '1px solid #CCCCCC', boxShadow: 'none' }}>
                  <Group gap="lg" align="flex-start">
                    <ThemeIcon
                      size={48}
                      radius={12}
                      style={{
                        background: '#F5F5F5',
                        color: '#4686FE',
                        border: 'none',
                        flexShrink: 0,
                      }}
                    >
                      <BarChart size={24} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: 'Inter Display, sans-serif',
                          fontSize: '18px',
                          fontWeight: 600,
                          color: '#000000',
                        }}
                      >
                        Understanding Analytics
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '16px',
                          fontWeight: 400,
                          color: '#666666',
                          lineHeight: '24px',
                        }}
                      >
                        Make sense of your performance data and insights
                      </Text>
                    </Stack>
                  </Group>
                </Card>

                <Card padding="xl" radius={16} style={{ background: 'white', border: '1px solid #CCCCCC', boxShadow: 'none' }}>
                  <Group gap="lg" align="flex-start">
                    <ThemeIcon
                      size={48}
                      radius={12}
                      style={{
                        background: '#F5F5F5',
                        color: '#4686FE',
                        border: 'none',
                        flexShrink: 0,
                      }}
                    >
                      <Users size={24} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: 'Inter Display, sans-serif',
                          fontSize: '18px',
                          fontWeight: 600,
                          color: '#000000',
                        }}
                      >
                        Vision Board Creation
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '16px',
                          fontWeight: 400,
                          color: '#666666',
                          lineHeight: '24px',
                        }}
                      >
                        Visualize your goals with powerful imagery and inspiration
                      </Text>
                    </Stack>
                  </Group>
                </Card>

                <Card padding="xl" radius={16} style={{ background: 'white', border: '1px solid #CCCCCC', boxShadow: 'none' }}>
                  <Group gap="lg" align="flex-start">
                    <ThemeIcon
                      size={48}
                      radius={12}
                      style={{
                        background: '#F5F5F5',
                        color: '#4686FE',
                        border: 'none',
                        flexShrink: 0,
                      }}
                    >
                      <Settings size={24} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: 'Inter Display, sans-serif',
                          fontSize: '18px',
                          fontWeight: 600,
                          color: '#000000',
                        }}
                      >
                        Account & Settings
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '16px',
                          fontWeight: 400,
                          color: '#666666',
                          lineHeight: '24px',
                        }}
                      >
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
              Frequently Asked Questions
            </Title>

            <Stack gap="lg">
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
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#000000',
                    }}
                  >
                    How do I get started with Cherut?
                  </Text>
                  <Divider />
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#666666',
                      lineHeight: '24px',
                    }}
                  >
                    After creating your account, you'll be guided through our onboarding process. Start by setting up
                    your life areas (like Health, Career, Relationships), then create your first objective with
                    measurable key results. The system will guide you through each step.
                  </Text>
                </Stack>
              </Card>

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
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#000000',
                    }}
                  >
                    What's the difference between objectives and key results?
                  </Text>
                  <Divider />
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#666666',
                      lineHeight: '24px',
                    }}
                  >
                    Objectives are qualitative, inspirational goals (e.g., "Become financially independent").
                    Key Results are specific, measurable outcomes that indicate progress toward the objective
                    (e.g., "Save $50,000", "Increase monthly income to $10,000"). Each objective should have 2-5 key results.
                  </Text>
                </Stack>
              </Card>

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
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#000000',
                    }}
                  >
                    How does habit tracking work in Cherut?
                  </Text>
                  <Divider />
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#666666',
                      lineHeight: '24px',
                    }}
                  >
                    Create habits linked to your objectives and life areas. Track daily completion, view streak analytics,
                    and receive insights on your consistency patterns. The system helps you identify which habits drive
                    the most progress toward your goals.
                  </Text>
                </Stack>
              </Card>

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
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#000000',
                    }}
                  >
                    How is my data protected and stored?
                  </Text>
                  <Divider />
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#666666',
                      lineHeight: '24px',
                    }}
                  >
                    Your data is encrypted at rest and in transit using industry-standard security measures.
                    We use secure cloud infrastructure and never sell or share your personal information.
                    You can export or delete your data at any time.
                  </Text>
                </Stack>
              </Card>

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
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#000000',
                    }}
                  >
                    What does beta access include?
                  </Text>
                  <Divider />
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#666666',
                      lineHeight: '24px',
                    }}
                  >
                    Beta users get free access to all core features during the testing period. This includes
                    OKRs, task management, habit tracking, vision boards, journal, and analytics. Your data
                    will be preserved when we launch the full platform.
                  </Text>
                </Stack>
              </Card>

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
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#000000',
                    }}
                  >
                    Is there a mobile app?
                  </Text>
                  <Divider />
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#666666',
                      lineHeight: '24px',
                    }}
                  >
                    The mobile app is currently in development and will be available at our public launch in Q4 2025.
                    In the meantime, the web platform is fully responsive and works great on mobile browsers.
                  </Text>
                </Stack>
              </Card>
            </Stack>
          </Stack>

          {/* Support Options */}
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
              Need More Help?
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
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
                    size={64}
                    radius={16}
                    style={{
                      background: '#4686FE',
                      color: 'white',
                      border: 'none',
                    }}
                  >
                    <MessageSquare size={32} />
                  </ThemeIcon>
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#000000',
                      textAlign: 'center',
                    }}
                  >
                    Direct Support
                  </Text>
                  <Text
                    ta="center"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#666666',
                      lineHeight: '24px',
                    }}
                  >
                    Get personalized help from our support team. We typically respond within 24 hours.
                  </Text>
                  <Button
                    component="a"
                    href="/contact"
                    size="lg"
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
                    Contact Support
                  </Button>
                </Stack>
              </Card>

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
                    size={64}
                    radius={16}
                    style={{
                      background: '#4686FE',
                      color: 'white',
                      border: 'none',
                    }}
                  >
                    <Users size={32} />
                  </ThemeIcon>
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#000000',
                      textAlign: 'center',
                    }}
                  >
                    Community
                  </Text>
                  <Text
                    ta="center"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#666666',
                      lineHeight: '24px',
                    }}
                  >
                    Join our beta community to connect with other high performers and share insights.
                  </Text>
                  <Button
                    component="a"
                    href="https://discord.gg/AyjZ58KXGy"
                    target="_blank"
                    size="lg"
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
                    Join Community
                  </Button>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>

          {/* Beta Notice */}
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
              <Badge
                size="lg"
                style={{
                  background: 'rgba(250, 173, 24, 0.1)',
                  color: '#FAAD18',
                  border: 'none',
                  padding: '8px 16px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                Beta Testing Period
              </Badge>
              <Text
                style={{
                  fontFamily: 'Inter Display, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#000000',
                  textAlign: 'center',
                }}
              >
                Help Us Improve
              </Text>
              <Text
                ta="center"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '18px',
                  lineHeight: '26px',
                  color: '#666666',
                  fontWeight: 400,
                  maxWidth: '700px',
                }}
              >
                During our beta phase, your feedback is invaluable. If you encounter any issues or have
                suggestions for improvement, please don't hesitate to reach out. Your input shapes the
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