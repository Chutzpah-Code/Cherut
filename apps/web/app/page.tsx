'use client';

import { useAdminRedirect } from '@/hooks/useAdminRedirect';
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Card,
  SimpleGrid,
  Badge,
  ThemeIcon,
  Box,
  Divider,
  Paper,
  Avatar,
  Rating,
} from '@mantine/core';
import {
  Target,
  TrendingUp,
  Zap,
  Shield,
  Users,
  Brain,
  CheckCircle2,
  ArrowRight,
  Star,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/ui/Footer';
import Header from '@/components/ui/Header';

export default function Home() {
  useAdminRedirect();

  return (
    <Box
      style={{
        background: '#FFFFFF',
        minHeight: '100vh',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Header />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

        html {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Hero Section */}
      <Container
        size="lg"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          paddingTop: '120px',
          paddingBottom: '80px',
        }}
      >
        <Stack align="center" gap={64} style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
          <Title
            order={1}
            ta="center"
            style={{
              fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: 'clamp(48px, 8vw, 64px)',
              lineHeight: 1.1,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#000000',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            Your Elite{' '}
            <span style={{ color: '#4686FE' }}>
              Performance
            </span>
            {' '}System
          </Title>

          <Text
            ta="center"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: 'clamp(20px, 3vw, 24px)',
              lineHeight: 1.5,
              color: '#666666',
              fontWeight: 400,
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Turn Dreams Into{' '}
            <span style={{ color: '#4686FE', fontWeight: 600 }}>
              Reality
            </span>
            . Built for ambitious individuals who refuse to settle for{' '}
            <span style={{ color: '#999999', textDecoration: 'line-through' }}>
              ordinary
            </span>
            .
          </Text>

          <Group gap="lg" justify="center" style={{ marginTop: '48px' }}>
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
              Get Started
            </Button>
            <Button
              component="a"
              href="#features"
              size="lg"
              variant="outline"
              style={{
                borderColor: '#CCCCCC',
                color: '#333333',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                height: '56px',
                padding: '0 32px',
                background: 'white',
                transition: 'all 0.2s ease',
                fontFamily: 'Inter, sans-serif',
              }}
              styles={{
                root: {
                  '&:hover': {
                    borderColor: '#4686FE',
                    color: '#4686FE',
                  },
                },
              }}
            >
              Learn More
            </Button>
          </Group>
        </Stack>
      </Container>

      {/* Pain Points Section */}
      <Box
        style={{
          background: '#F5F5F5',
          padding: '120px 0',
        }}
      >
        <Container size="lg">
          <Stack align="center" gap={60}>
            <Title
              order={2}
              ta="center"
              style={{
                fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'clamp(36px, 6vw, 48px)',
                lineHeight: 1.2,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#000000',
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              Stop Letting Your{' '}
              <span style={{ color: '#4686FE' }}>
                Potential
              </span>
              {' '}Go to{' '}
              <span style={{ color: '#999999', textDecoration: 'line-through' }}>
                Waste
              </span>
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={32} w="100%">
              <Card
                padding="xl"
                radius={16}
                style={{
                  background: 'white',
                  border: '1px solid #CCCCCC',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  height: '100%',
                }}
              >
                <Stack gap="lg">
                  <ThemeIcon size={48} radius={12} style={{ background: '#F5F5F5', color: '#4686FE', border: 'none' }}>
                    <Target size={24} />
                  </ThemeIcon>
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '24px',
                      fontWeight: 600,
                      color: '#000000',
                      lineHeight: '32px',
                    }}
                  >
                    Lost in Overwhelm
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
                    Big dreams but no clear path forward. You know what you want but struggle to break it down into actionable steps.
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
                  transition: 'all 0.2s ease',
                  height: '100%',
                }}
              >
                <Stack gap="lg">
                  <ThemeIcon size={48} radius={12} style={{ background: '#F5F5F5', color: '#4686FE', border: 'none' }}>
                    <TrendingUp size={24} />
                  </ThemeIcon>
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '24px',
                      fontWeight: 600,
                      color: '#000000',
                      lineHeight: '32px',
                    }}
                  >
                    Inconsistent Progress
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
                    Bursts of motivation followed by plateaus. You start strong but struggle to maintain momentum toward your goals.
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
                  transition: 'all 0.2s ease',
                  height: '100%',
                }}
              >
                <Stack gap="lg">
                  <ThemeIcon size={48} radius={12} style={{ background: '#F5F5F5', color: '#4686FE', border: 'none' }}>
                    <Zap size={24} />
                  </ThemeIcon>
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '24px',
                      fontWeight: 600,
                      color: '#000000',
                      lineHeight: '32px',
                    }}
                  >
                    Missing the Edge
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
                    You're good, but not elite. You know there's another level you haven't reached, but don't have the system to get there.
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        id="features"
        style={{
          background: '#FFFFFF',
          padding: '120px 0',
        }}
      >
        <Container size="lg">
          <Stack align="center" gap={60}>
            <Stack align="center" gap="md">
              <Title
                order={2}
                ta="center"
                style={{
                  fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: 'clamp(36px, 6vw, 48px)',
                  lineHeight: 1.2,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#000000',
                  maxWidth: '800px',
                  margin: '0 auto',
                }}
              >
                Everything You Need to{' '}
                <span style={{ color: '#4686FE' }}>
                  Perform at Your Peak
                </span>
              </Title>
              <Text
                ta="center"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '20px',
                  lineHeight: '28px',
                  color: '#666666',
                  fontWeight: 400,
                  maxWidth: '600px',
                  margin: '0 auto',
                }}
              >
                A complete system designed for those who refuse to settle for average
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={32} w="100%">
              {[
                {
                  icon: Target,
                  title: 'OKR Framework',
                  description: 'Set objectives and key results like the world\'s top performers. Break down ambitious goals into measurable milestones.',
                },
                {
                  icon: Star,
                  title: 'Core Values',
                  description: 'Define and align with your personal values. Create reinforcing behaviors that keep you authentic to what matters most.',
                },
                {
                  icon: Users,
                  title: 'Vision Board',
                  description: 'Visualize your dreams with powerful imagery. Create inspiring boards that keep your aspirations front and center daily.',
                },
                {
                  icon: BookOpen,
                  title: 'Daily Journal',
                  description: 'Reflect, plan, and grow through guided journaling. Track thoughts, insights, and breakthroughs on your journey to excellence.',
                },
                {
                  icon: TrendingUp,
                  title: 'Habit Tracking',
                  description: 'Build the daily routines that compound into extraordinary results. Track streaks, monitor consistency, and develop elite habits.',
                },
                {
                  icon: Shield,
                  title: 'Strategic Focus Areas',
                  description: 'Achieve holistic excellence. Organize goals across health, career, relationships, and personal growth for balanced peak performance.',
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  padding="xl"
                  radius={16}
                  style={{
                    background: 'white',
                    border: '1px solid #CCCCCC',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease',
                    height: '100%',
                  }}
                >
                  <Stack gap="lg">
                    <ThemeIcon
                      size={48}
                      radius={12}
                      style={{
                        background: '#F5F5F5',
                        color: '#4686FE',
                        border: 'none',
                      }}
                    >
                      <feature.icon size={24} />
                    </ThemeIcon>
                    <Text
                      style={{
                        fontFamily: 'Inter Display, sans-serif',
                        fontSize: '24px',
                        fontWeight: 600,
                        color: '#000000',
                        lineHeight: '32px',
                      }}
                    >
                      {feature.title}
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
                      {feature.description}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box
        id="pricing"
        style={{
          background: '#F5F5F5',
          padding: '120px 0',
        }}
      >
        <Container size="lg">
          <Stack align="center" gap={60}>
            <Stack align="center" gap="md">
              <Title
                order={2}
                ta="center"
                style={{
                  fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: 'clamp(36px, 6vw, 48px)',
                  lineHeight: 1.2,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#000000',
                  maxWidth: '800px',
                  margin: '0 auto',
                }}
              >
                Choose Your{' '}
                <span style={{ color: '#4686FE' }}>
                  Performance Level
                </span>
              </Title>
              <Text
                ta="center"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '20px',
                  lineHeight: '28px',
                  color: '#666666',
                  fontWeight: 400,
                  maxWidth: '700px',
                  margin: '0 auto',
                }}
              >
                All plans are free during our beta testing period. Your data will be preserved when we launch. Start building your elite performance system today.
              </Text>
              <Badge
                size="lg"
                radius="xl"
                style={{
                  background: 'rgba(70, 134, 254, 0.1)',
                  color: '#4686FE',
                  border: 'none',
                  padding: '8px 16px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
                leftSection={<Star size={16} />}
              >
                Beta Launch: Q4 2025
              </Badge>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl" w="100%">
              {[
                {
                  name: 'Test Drive',
                  price: 'Free',
                  period: 'During Beta Testing',
                  features: [
                    'All core features',
                    'Basic limitations',
                    'Community support',
                    'Data preserved in beta',
                  ],
                  cta: 'Start Free',
                  variant: 'outline',
                },
                {
                  name: 'Core',
                  price: '$10',
                  period: '/mo',
                  subtitle: 'Unlock Your Potential',
                  features: [
                    'All features unlocked',
                    'No limitations',
                    'Priority support',
                    'Unlimited goals & tasks',
                  ],
                  cta: 'Get Started',
                  variant: 'primary',
                  popular: true,
                },
                {
                  name: 'Pro',
                  price: '$20',
                  period: '/mo',
                  subtitle: 'Connect Everything',
                  features: [
                    'Everything in Core',
                    'Calendar integrations',
                    'Third-party apps',
                    'Advanced analytics',
                  ],
                  cta: 'Go Pro',
                  variant: 'outline',
                },
                {
                  name: 'Elite',
                  price: '$30',
                  period: '/mo',
                  subtitle: 'AI-Powered Excellence',
                  features: [
                    'Everything in Pro',
                    'AI goal recommendations',
                    'Smart insights & patterns',
                    'Personalized coaching',
                  ],
                  cta: 'Go Elite',
                  variant: 'outline',
                  premium: true,
                },
              ].map((plan, index) => (
                <Card
                  key={index}
                  padding="xl"
                  radius={16}
                  style={{
                    background: 'white',
                    border: plan.popular ? '2px solid #4686FE' : '1px solid #CCCCCC',
                    boxShadow: 'none',
                    minHeight: '450px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Stack gap="lg" style={{ flex: 1 }}>
                    <Stack gap="xs">
                      <Group justify="space-between" align="flex-start">
                        <Text
                          style={{
                            fontFamily: 'Inter Display, sans-serif',
                            fontSize: '20px',
                            fontWeight: 600,
                            color: '#000000',
                          }}
                        >
                          {plan.name}
                        </Text>
                        {plan.popular && (
                          <Badge
                            size="sm"
                            radius="xl"
                            style={{
                              background: 'rgba(70, 134, 254, 0.1)',
                              color: '#4686FE',
                              border: 'none',
                            }}
                          >
                            Popular
                          </Badge>
                        )}
                        {plan.premium && (
                          <Badge
                            size="sm"
                            radius="xl"
                            style={{
                              background: 'rgba(250, 173, 24, 0.1)',
                              color: '#FAAD18',
                              border: 'none',
                            }}
                          >
                            Premium
                          </Badge>
                        )}
                      </Group>
                      <Group align="baseline" gap={4}>
                        <Text
                          style={{
                            fontFamily: 'Inter Display, sans-serif',
                            fontSize: '48px',
                            fontWeight: 800,
                            lineHeight: 1,
                            color: '#000000',
                          }}
                        >
                          {plan.price}
                        </Text>
                        {plan.period && (
                          <Text
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '16px',
                              fontWeight: 500,
                              color: '#666666',
                            }}
                          >
                            {plan.period}
                          </Text>
                        )}
                      </Group>
                      {plan.subtitle && (
                        <Text
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#666666',
                          }}
                        >
                          {plan.subtitle}
                        </Text>
                      )}
                    </Stack>
                    <Divider />
                    <Stack gap="xs">
                      {plan.features.map((feature, fIndex) => (
                        <Group key={fIndex} gap="xs">
                          <CheckCircle2 size={16} style={{ color: plan.popular ? '#4686FE' : '#666666' }} />
                          <Text
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '14px',
                              color: '#333333',
                            }}
                          >
                            {feature}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                    <Button
                      component="a"
                      href="/auth/register"
                      radius={12}
                      fullWidth
                      mt="auto"
                      style={{
                        background: plan.variant === 'primary' ? '#4686FE' : 'transparent',
                        border: plan.variant === 'outline' ? '1px solid #CCCCCC' : 'none',
                        height: '48px',
                        fontWeight: 600,
                        fontFamily: 'Inter, sans-serif',
                        color: plan.variant === 'primary' ? 'white' : '#333333',
                      }}
                      styles={{
                        root: {
                          '&:hover': {
                            background: plan.variant === 'primary' ? '#3366E5' : 'rgba(0,0,0,0.04)',
                          },
                        },
                      }}
                    >
                      {plan.cta}
                    </Button>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>

            <Text
              ta="center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#666666',
                maxWidth: '600px',
              }}
            >
              Note: After the beta period ends, free tier users will have limited data retention. Upgrade to any paid plan to maintain full access to your performance history.
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* Social Proof Section */}
      <Container id="testimonials" size="lg" py={120}>
        <Stack align="center" gap={60}>
          <Stack align="center" gap={40}>
            <Title
              order={2}
              ta="center"
              style={{
                fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'clamp(36px, 6vw, 48px)',
                lineHeight: 1.2,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#000000',
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              Join{' '}
              <span style={{ color: '#4686FE' }}>
                Elite Performers
              </span>
              {' '}Worldwide
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={60} w="100%">
              <Stack align="center" gap="xs">
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '60px',
                    fontWeight: 800,
                    lineHeight: 1,
                    color: '#000000',
                  }}
                >
                  10+
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#666666',
                  }}
                >
                  Beta Testers
                </Text>
              </Stack>
              <Stack align="center" gap="xs">
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '60px',
                    fontWeight: 800,
                    lineHeight: 1,
                    color: '#000000',
                  }}
                >
                  100+
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#666666',
                  }}
                >
                  Goals Set
                </Text>
              </Stack>
              <Stack align="center" gap="xs">
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '60px',
                    fontWeight: 800,
                    lineHeight: 1,
                    color: '#000000',
                  }}
                >
                  1K+
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#666666',
                  }}
                >
                  Tasks Completed
                </Text>
              </Stack>
            </SimpleGrid>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={32} w="100%">
            {[
              {
                name: 'Sarah Chen',
                role: 'Professional Athlete',
                initials: 'SC',
                quote: 'This system transformed how I approach my training goals. I\'ve achieved more in 3 months than I did in the past year. The OKR framework is a game-changer.',
              },
              {
                name: 'Marcus Rodriguez',
                role: 'Tech Entrepreneur',
                initials: 'MR',
                quote: 'Finally, a tool that matches the intensity of my ambitions. The structure it provides has helped me scale two companies while maintaining work-life balance.',
              },
              {
                name: 'Emily Johnson',
                role: 'Medical Student',
                initials: 'EJ',
                quote: 'I went from feeling overwhelmed to being in complete control. The habit tracking keeps me consistent, and I can see my progress across all areas of my life.',
              },
            ].map((testimonial, index) => (
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
                <Stack gap="lg">
                  <Group>
                    <Avatar
                      size={60}
                      radius="xl"
                      style={{
                        background: '#4686FE',
                        color: 'white',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                      }}
                    >
                      {testimonial.initials}
                    </Avatar>
                    <Stack gap={4}>
                      <Text
                        style={{
                          fontFamily: 'Inter Display, sans-serif',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#000000',
                        }}
                      >
                        {testimonial.name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#666666',
                        }}
                      >
                        {testimonial.role}
                      </Text>
                    </Stack>
                  </Group>
                  <Rating
                    value={5}
                    readOnly
                    size="md"
                    color="#4686FE"
                  />
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      color: '#333333',
                      lineHeight: 1.6,
                      fontWeight: 400,
                    }}
                  >
                    {testimonial.quote}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>

      {/* Enterprise Section */}
      <Box style={{ background: '#F5F5F5', paddingTop: 80, paddingBottom: 80 }}>
        <Container size="lg">
          <Paper
            p={{ base: 40, sm: 50, md: 60 }}
            radius={16}
            style={{
              background: 'white',
              border: '1px solid #CCCCCC',
              boxShadow: 'none',
            }}
          >
            <Stack align="center" gap={32}>
              <ThemeIcon
                size={64}
                radius={16}
                style={{
                  background: '#F5F5F5',
                  color: '#4686FE',
                  border: 'none',
                }}
              >
                <Users size={32} />
              </ThemeIcon>
              <Title
                order={2}
                ta="center"
                style={{
                  fontFamily: 'Inter Display, sans-serif',
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  fontWeight: 700,
                  color: '#000000',
                  letterSpacing: '-0.01em',
                }}
              >
                Enterprise Solutions Coming Soon
              </Title>
              <Text
                ta="center"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: '#666666',
                  fontWeight: 400,
                  maxWidth: '700px',
                }}
              >
                We're developing powerful team collaboration features and enterprise-grade security for organizations that want to scale elite performance across their entire workforce.
              </Text>
              <Button
                component="a"
                href="/enterprise-waitlist"
                size="xl"
                radius={12}
                leftSection={<Brain size={20} />}
                style={{
                  borderColor: '#4686FE',
                  color: '#4686FE',
                  background: 'transparent',
                  border: '2px solid #4686FE',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  height: '56px',
                  fontFamily: 'Inter, sans-serif',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      background: '#4686FE',
                      color: 'white',
                    },
                  },
                }}
              >
                Join Enterprise Waitlist
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}