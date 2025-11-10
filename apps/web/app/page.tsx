'use client';

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
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <Box
      style={{
        background: '#ffffff',
        minHeight: '100vh',
      }}
    >
      {/* Hero Section */}
      <Container size="lg" py={120}>
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.8;
            }
          }

          @keyframes gradient {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          @keyframes typewriter {
            0% {
              max-width: 0;
            }
            100% {
              max-width: 100%;
            }
          }

          @keyframes blink {
            0%, 100% {
              border-right-color: #3143B6;
            }
            50% {
              border-right-color: transparent;
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }

          .hero-badge {
            animation: fadeInUp 0.6s ease-out 0.1s both, float 3s ease-in-out infinite;
          }

          .hero-title {
            animation: fadeInUp 0.6s ease-out 0.2s both;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: linear-gradient(135deg, #000000 0%, #3143B6 100%);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: fadeInUp 0.6s ease-out 0.2s both, gradient 8s ease infinite;
          }

          .hero-subtitle {
            display: inline-block;
            overflow: hidden;
            white-space: nowrap;
            border-right: 4px solid #3143B6;
            padding-right: 2px;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
            font-weight: 700;
            background: linear-gradient(
              90deg,
              #3143B6 0%,
              #FC7124 25%,
              #FAAD18 50%,
              #2FB264 75%,
              #3143B6 100%
            );
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            max-width: 0;
            animation:
              typewriter 2.5s steps(22, end) 0.5s forwards,
              blink 0.75s step-end infinite,
              shimmer 4s linear 2s infinite;
          }

          .hero-subtitle-wrapper {
            display: flex;
            justify-content: center;
            min-height: 24px;
          }

          .hero-description {
            animation: fadeInUp 0.8s ease-out 3s both;
          }

          .description-word {
            display: inline-block;
            opacity: 0;
            animation: fadeInUp 0.5s ease-out forwards;
          }

          .description-word:nth-child(1) { animation-delay: 3.0s; }
          .description-word:nth-child(2) { animation-delay: 3.1s; }
          .description-word:nth-child(3) { animation-delay: 3.2s; }
          .description-word:nth-child(4) { animation-delay: 3.3s; }
          .description-word:nth-child(5) { animation-delay: 3.4s; }
          .description-word:nth-child(6) { animation-delay: 3.5s; }
          .description-word:nth-child(7) { animation-delay: 3.6s; }
          .description-word:nth-child(8) { animation-delay: 3.7s; }
          .description-word:nth-child(9) { animation-delay: 3.8s; }
          .description-word:nth-child(10) { animation-delay: 3.9s; }

          .description-highlight {
            background: linear-gradient(
              135deg,
              #3143B6 0%,
              #a855f7 100%
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 600;
            position: relative;
          }

          .description-highlight::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(135deg, #3143B6 0%, #a855f7 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .description-highlight:hover::after {
            opacity: 1;
          }

          .hero-buttons {
            animation: fadeInUp 0.6s ease-out 0.5s both;
          }

          .btn-primary {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
          }

          .btn-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }

          .btn-primary:hover::before {
            left: 100%;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(49, 67, 182, 0.25);
          }

          .btn-secondary {
            transition: all 0.3s ease;
          }

          .btn-secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          }
        `}</style>

        <Stack align="center" gap={48}>
          <Badge
            className="hero-badge"
            size="lg"
            radius="xl"
            style={{
              background: 'rgba(49, 67, 182, 0.1)',
              color: '#3143B6',
              border: '1px solid rgba(49, 67, 182, 0.2)',
              padding: '6px 16px',
              fontSize: '14px',
              fontWeight: 600,
            }}
            leftSection={<Sparkles size={14} />}
          >
            FREE DURING BETA TESTING
          </Badge>

          <Title
            order={1}
            ta="center"
            className="hero-title"
            style={{
              lineHeight: 1.05,
              fontSize: 'clamp(48px, 9vw, 96px)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              maxWidth: '1000px',
            }}
          >
            Your Elite Performance System
          </Title>

          <Box className="hero-subtitle-wrapper">
            <span className="hero-subtitle">
              ALL IN, ALL THE TIME
            </span>
          </Box>

          <Text
            className="hero-description"
            size="xl"
            ta="center"
            maw={700}
            style={{
              lineHeight: 1.7,
              fontSize: '22px',
              color: 'hsl(0 0% 0% / 0.6)',
              fontWeight: 400,
            }}
          >
            Transform your{' '}
            <span className="description-highlight">ambition</span> into{' '}
            <span className="description-highlight">achievement</span>. Built for{' '}
            <span className="description-highlight">elite athletes</span>,{' '}
            ambitious professionals, and anyone ready to unlock their full potential
            through structured goal setting and systematic execution.
          </Text>

          <Group className="hero-buttons" gap="md" mt={32}>
            <Button
              className="btn-primary"
              component={Link}
              href="/auth/register"
              size="xl"
              radius={48}
              rightSection={<ArrowRight size={20} />}
              style={{
                background: '#3143B6',
                border: 'none',
                padding: '16px 40px',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: 'none',
                height: '56px',
              }}
            >
              Start Free
            </Button>
            <Button
              className="btn-secondary"
              component={Link}
              href="#features"
              size="xl"
              radius={48}
              variant="outline"
              style={{
                color: 'hsl(0 0% 0% / 0.87)',
                borderColor: 'hsl(0 0% 0% / 0.2)',
                background: 'transparent',
                padding: '16px 40px',
                fontSize: '16px',
                fontWeight: 600,
                height: '56px',
              }}
            >
              Learn More
            </Button>
          </Group>
        </Stack>
      </Container>

      {/* Pain Points Section */}
      <Box style={{ background: '#F5F5F5', paddingTop: 80, paddingBottom: 80 }}>
        <Container size="lg">
          <Stack align="center" gap={60}>
            <Title
              order={2}
              ta="center"
              style={{
                fontSize: '40px',
                fontWeight: 700,
                color: 'hsl(0 0% 0% / 0.87)',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              Stop Letting Your Potential Go to Waste
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={32} w="100%">
              <Card
                padding="xl"
                radius={20}
                style={{
                  background: 'white',
                  border: '1px solid hsl(0 0% 0% / 0.08)',
                  boxShadow: 'none',
                }}
              >
                <Stack gap="md">
                  <ThemeIcon
                    size={60}
                    radius={16}
                    style={{
                      background: 'rgba(252, 113, 36, 0.1)',
                      color: '#FC7124',
                    }}
                  >
                    <Target size={28} />
                  </ThemeIcon>
                  <Text size="lg" fw={700} c="black">
                    Lost in Overwhelm
                  </Text>
                  <Text
                    size="md"
                    style={{
                      color: 'hsl(0 0% 0% / 0.6)',
                      lineHeight: 1.6,
                    }}
                  >
                    Big dreams but no clear path forward. You know what you want but struggle to
                    break it down into actionable steps.
                  </Text>
                </Stack>
              </Card>

              <Card
                padding="xl"
                radius={20}
                style={{
                  background: 'white',
                  border: '1px solid hsl(0 0% 0% / 0.08)',
                  boxShadow: 'none',
                }}
              >
                <Stack gap="md">
                  <ThemeIcon
                    size={60}
                    radius={16}
                    style={{
                      background: 'rgba(250, 173, 24, 0.1)',
                      color: '#FAAD18',
                    }}
                  >
                    <TrendingUp size={28} />
                  </ThemeIcon>
                  <Text size="lg" fw={700} c="black">
                    Inconsistent Progress
                  </Text>
                  <Text
                    size="md"
                    style={{
                      color: 'hsl(0 0% 0% / 0.6)',
                      lineHeight: 1.6,
                    }}
                  >
                    Bursts of motivation followed by plateaus. You start strong but struggle to
                    maintain momentum toward your goals.
                  </Text>
                </Stack>
              </Card>

              <Card
                padding="xl"
                radius={20}
                style={{
                  background: 'white',
                  border: '1px solid hsl(0 0% 0% / 0.08)',
                  boxShadow: 'none',
                }}
              >
                <Stack gap="md">
                  <ThemeIcon
                    size={60}
                    radius={16}
                    style={{
                      background: 'rgba(47, 178, 100, 0.1)',
                      color: '#2FB264',
                    }}
                  >
                    <Zap size={28} />
                  </ThemeIcon>
                  <Text size="lg" fw={700} c="black">
                    Missing the Edge
                  </Text>
                  <Text
                    size="md"
                    style={{
                      color: 'hsl(0 0% 0% / 0.6)',
                      lineHeight: 1.6,
                    }}
                  >
                    You're good, but not elite. You know there's another level you haven't
                    reached, but don't have the system to get there.
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container size="lg" py={100} id="features">
        <Stack align="center" gap={60}>
          <Stack align="center" gap="md">
            <Title
              order={2}
              ta="center"
              style={{
                fontSize: '40px',
                fontWeight: 700,
                color: 'hsl(0 0% 0% / 0.87)',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              Everything You Need to Perform at Your Peak
            </Title>
            <Text
              size="lg"
              ta="center"
              maw={600}
              style={{
                color: 'hsl(0 0% 0% / 0.6)',
                lineHeight: 1.7,
              }}
            >
              A complete system designed for those who refuse to settle for average
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={40} w="100%">
            <Card
              padding="xl"
              radius={20}
              style={{
                background: 'white',
                border: '1px solid hsl(0 0% 0% / 0.08)',
                boxShadow: 'none',
              }}
            >
              <Stack gap="md">
                <ThemeIcon
                  size={64}
                  radius={16}
                  style={{
                    background: 'rgba(49, 67, 182, 0.1)',
                    color: '#3143B6',
                  }}
                >
                  <Target size={32} />
                </ThemeIcon>
                <Text
                  size="24px"
                  fw={700}
                  style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                >
                  OKR Framework
                </Text>
                <Text
                  size="md"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    lineHeight: 1.7,
                  }}
                >
                  Set objectives and key results like the world's top performers. Break down
                  ambitious goals into measurable milestones that drive real progress.
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius={20}
              style={{
                background: 'white',
                border: '1px solid hsl(0 0% 0% / 0.08)',
                boxShadow: 'none',
              }}
            >
              <Stack gap="md">
                <ThemeIcon
                  size={64}
                  radius={16}
                  style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    color: '#06b6d4',
                  }}
                >
                  <CheckCircle2 size={32} />
                </ThemeIcon>
                <Text
                  size="24px"
                  fw={700}
                  style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                >
                  Task Management
                </Text>
                <Text
                  size="md"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    lineHeight: 1.7,
                  }}
                >
                  Organize your work with intuitive task boards. Track progress, set priorities,
                  and never lose sight of what matters most.
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius={20}
              style={{
                background: 'white',
                border: '1px solid hsl(0 0% 0% / 0.08)',
                boxShadow: 'none',
              }}
            >
              <Stack gap="md">
                <ThemeIcon
                  size={64}
                  radius={16}
                  style={{
                    background: 'rgba(47, 178, 100, 0.1)',
                    color: '#2FB264',
                  }}
                >
                  <TrendingUp size={32} />
                </ThemeIcon>
                <Text
                  size="24px"
                  fw={700}
                  style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                >
                  Habit Tracking
                </Text>
                <Text
                  size="md"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    lineHeight: 1.7,
                  }}
                >
                  Build the daily routines that compound into extraordinary results. Track
                  streaks, monitor consistency, and develop elite habits.
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius={20}
              style={{
                background: 'white',
                border: '1px solid hsl(0 0% 0% / 0.08)',
                boxShadow: 'none',
              }}
            >
              <Stack gap="md">
                <ThemeIcon
                  size={64}
                  radius={16}
                  style={{
                    background: 'rgba(250, 173, 24, 0.1)',
                    color: '#FAAD18',
                  }}
                >
                  <Shield size={32} />
                </ThemeIcon>
                <Text
                  size="24px"
                  fw={700}
                  style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                >
                  Life Areas Balance
                </Text>
                <Text
                  size="md"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    lineHeight: 1.7,
                  }}
                >
                  Achieve holistic excellence. Organize goals across health, career, relationships,
                  and personal growth for balanced peak performance.
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>

      {/* Pricing Section */}
      <Box style={{ background: '#F5F5F5', paddingTop: 100, paddingBottom: 100 }}>
        <Container size="lg">
          <Stack align="center" gap={60}>
            <Stack align="center" gap="md">
              <Title
                order={2}
                ta="center"
                style={{
                  fontSize: '40px',
                  fontWeight: 700,
                  color: 'hsl(0 0% 0% / 0.87)',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                }}
              >
                Choose Your Performance Level
              </Title>
              <Text
                size="lg"
                ta="center"
                maw={700}
                style={{
                  color: 'hsl(0 0% 0% / 0.6)',
                  lineHeight: 1.7,
                }}
              >
                All plans are free during our beta testing period. Your data will be preserved
                when we launch. Start building your elite performance system today.
              </Text>
              <Badge
                size="lg"
                radius="xl"
                style={{
                  background: 'rgba(47, 178, 100, 0.1)',
                  color: '#2FB264',
                  border: 'none',
                  padding: '6px 16px',
                }}
                leftSection={<Star size={14} />}
              >
                Beta Launch: Q4 2025
              </Badge>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl" w="100%">
              {/* Free Beta */}
              <Card
                padding="xl"
                radius={20}
                style={{
                  background: 'white',
                  border: '1px solid hsl(0 0% 0% / 0.08)',
                  boxShadow: 'none',
                  minHeight: '450px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack gap="lg" style={{ flex: 1 }}>
                  <Stack gap="xs">
                    <Text
                      size="xl"
                      fw={700}
                      style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                    >
                      Test Drive
                    </Text>
                    <Group align="baseline" gap={4}>
                      <Text
                        size="48px"
                        fw={800}
                        style={{
                          lineHeight: 1,
                          color: 'hsl(0 0% 0% / 0.87)',
                        }}
                      >
                        Free
                      </Text>
                    </Group>
                    <Text
                      size="sm"
                      fw={500}
                      style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                    >
                      During Beta Testing
                    </Text>
                  </Stack>
                  <Divider />
                  <Stack gap="xs">
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#2FB264' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                      >
                        All core features
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#2FB264' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                      >
                        Basic limitations
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#2FB264' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                      >
                        Community support
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#2FB264' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                      >
                        Data preserved in beta
                      </Text>
                    </Group>
                  </Stack>
                  <Button
                    component={Link}
                    href="/auth/register"
                    variant="outline"
                    radius={48}
                    fullWidth
                    mt="auto"
                    style={{
                      color: 'hsl(0 0% 0% / 0.87)',
                      borderColor: 'hsl(0 0% 0% / 0.2)',
                      background: 'transparent',
                      height: '48px',
                      fontWeight: 600,
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          background: 'hsl(0 0% 0% / 0.04)',
                        },
                      },
                    }}
                  >
                    Start Free
                  </Button>
                </Stack>
              </Card>

              {/* Core */}
              <Card
                padding="xl"
                radius={20}
                style={{
                  background: 'white',
                  border: '2px solid #3143B6',
                  boxShadow: '0 4px 20px rgba(49, 67, 182, 0.12)',
                  minHeight: '450px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack gap="lg" style={{ flex: 1 }}>
                  <Stack gap="xs">
                    <Text
                      size="xl"
                      fw={700}
                      style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                    >
                      Core
                    </Text>
                    <Group align="baseline" gap={4}>
                      <Text
                        size="48px"
                        fw={800}
                        style={{
                          lineHeight: 1,
                          color: 'hsl(0 0% 0% / 0.87)',
                        }}
                      >
                        $10
                      </Text>
                      <Text
                        size="md"
                        fw={500}
                        style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                      >
                        /mo
                      </Text>
                    </Group>
                    <Text
                      size="sm"
                      fw={500}
                      style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                    >
                      Unlock Your Potential
                    </Text>
                  </Stack>
                  <Divider />
                  <Stack gap="xs">
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#3143B6' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        All features unlocked
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#3143B6' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        No limitations
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#3143B6' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Priority support
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#3143B6' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Unlimited goals & tasks
                      </Text>
                    </Group>
                  </Stack>
                  <Button
                    component={Link}
                    href="/auth/register"
                    radius={48}
                    fullWidth
                    mt="auto"
                    style={{
                      background: '#3143B6',
                      border: 'none',
                      height: '48px',
                      fontWeight: 600,
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          background: '#2535a0',
                        },
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </Stack>
              </Card>

              {/* Pro */}
              <Card
                padding="xl"
                radius={20}
                style={{
                  background: 'white',
                  border: '1px solid hsl(0 0% 0% / 0.08)',
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
                        size="xl"
                        fw={700}
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Pro
                      </Text>
                      <Badge
                        size="sm"
                        radius="xl"
                        style={{
                          background: 'rgba(168, 85, 247, 0.1)',
                          color: '#a855f7',
                          border: 'none',
                        }}
                      >
                        Popular
                      </Badge>
                    </Group>
                    <Group align="baseline" gap={4}>
                      <Text
                        size="48px"
                        fw={800}
                        style={{
                          lineHeight: 1,
                          color: 'hsl(0 0% 0% / 0.87)',
                        }}
                      >
                        $20
                      </Text>
                      <Text
                        size="md"
                        fw={500}
                        style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                      >
                        /mo
                      </Text>
                    </Group>
                    <Text
                      size="sm"
                      fw={500}
                      style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                    >
                      Connect Everything
                    </Text>
                  </Stack>
                  <Divider />
                  <Stack gap="xs">
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Everything in Core
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Calendar integrations
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Third-party apps
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Advanced analytics
                      </Text>
                    </Group>
                  </Stack>
                  <Button
                    component={Link}
                    href="/auth/register"
                    radius={48}
                    fullWidth
                    mt="auto"
                    style={{
                      background: '#a855f7',
                      border: 'none',
                      height: '48px',
                      fontWeight: 600,
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          background: '#9333ea',
                        },
                      },
                    }}
                  >
                    Go Pro
                  </Button>
                </Stack>
              </Card>

              {/* Elite */}
              <Card
                padding="xl"
                radius={20}
                style={{
                  background: 'white',
                  border: '1px solid hsl(0 0% 0% / 0.08)',
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
                        size="xl"
                        fw={700}
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Elite
                      </Text>
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
                    </Group>
                    <Group align="baseline" gap={4}>
                      <Text
                        size="48px"
                        fw={800}
                        style={{
                          lineHeight: 1,
                          color: 'hsl(0 0% 0% / 0.87)',
                        }}
                      >
                        $30
                      </Text>
                      <Text
                        size="md"
                        fw={500}
                        style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                      >
                        /mo
                      </Text>
                    </Group>
                    <Text
                      size="sm"
                      fw={500}
                      style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                    >
                      AI-Powered Excellence
                    </Text>
                  </Stack>
                  <Divider />
                  <Stack gap="xs">
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#FAAD18' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Everything in Pro
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#FAAD18' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        AI goal recommendations
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#FAAD18' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Smart insights & patterns
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#FAAD18' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Personalized coaching
                      </Text>
                    </Group>
                  </Stack>
                  <Button
                    component={Link}
                    href="/auth/register"
                    radius={48}
                    fullWidth
                    mt="auto"
                    style={{
                      background: '#FAAD18',
                      border: 'none',
                      height: '48px',
                      fontWeight: 600,
                      color: 'hsl(0 0% 0% / 0.87)',
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          background: '#e09b00',
                        },
                      },
                    }}
                  >
                    Go Elite
                  </Button>
                </Stack>
              </Card>
            </SimpleGrid>

            <Text
              size="sm"
              ta="center"
              maw={600}
              style={{ color: 'hsl(0 0% 0% / 0.6)' }}
            >
              Note: After the beta period ends, free tier users will have limited data retention.
              Upgrade to any paid plan to maintain full access to your performance history.
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* Social Proof Section */}
      <Container size="lg" py={100}>
        <Stack align="center" gap={60}>
          <Stack align="center" gap={40}>
            <Title
              order={2}
              ta="center"
              style={{
                fontSize: '40px',
                fontWeight: 700,
                color: 'hsl(0 0% 0% / 0.87)',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              Join Elite Performers Worldwide
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={60} w="100%">
              <Stack align="center" gap="xs">
                <Text
                  size="60px"
                  fw={800}
                  style={{
                    lineHeight: 1,
                    color: 'hsl(0 0% 0% / 0.87)',
                  }}
                >
                  10+
                </Text>
                <Text
                  size="md"
                  fw={500}
                  style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                >
                  Beta Testers
                </Text>
              </Stack>
              <Stack align="center" gap="xs">
                <Text
                  size="60px"
                  fw={800}
                  style={{
                    lineHeight: 1,
                    color: 'hsl(0 0% 0% / 0.87)',
                  }}
                >
                  100+
                </Text>
                <Text
                  size="md"
                  fw={500}
                  style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                >
                  Goals Set
                </Text>
              </Stack>
              <Stack align="center" gap="xs">
                <Text
                  size="60px"
                  fw={800}
                  style={{
                    lineHeight: 1,
                    color: 'hsl(0 0% 0% / 0.87)',
                  }}
                >
                  1K+
                </Text>
                <Text
                  size="md"
                  fw={500}
                  style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                >
                  Tasks Completed
                </Text>
              </Stack>
            </SimpleGrid>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={32} w="100%">
            <Card
              padding="xl"
              radius={20}
              style={{
                background: 'white',
                border: '1px solid hsl(0 0% 0% / 0.08)',
                boxShadow: 'none',
              }}
            >
              <Stack gap="md">
                <Group>
                  <Avatar
                    size="lg"
                    radius="xl"
                    style={{
                      background: 'linear-gradient(135deg, #3143B6 0%, #06b6d4 100%)',
                    }}
                  >
                    SC
                  </Avatar>
                  <Stack gap={0}>
                    <Text
                      size="sm"
                      fw={600}
                      style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                    >
                      Sarah Chen
                    </Text>
                    <Text
                      size="xs"
                      style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                    >
                      Professional Athlete
                    </Text>
                  </Stack>
                </Group>
                <Rating value={5} readOnly size="sm" color="#FAAD18" />
                <Text
                  size="sm"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    lineHeight: 1.7,
                  }}
                >
                  "This system transformed how I approach my training goals. I've achieved more
                  in 3 months than I did in the past year. The OKR framework is a game-changer."
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius={20}
              style={{
                background: 'white',
                border: '1px solid hsl(0 0% 0% / 0.08)',
                boxShadow: 'none',
              }}
            >
              <Stack gap="md">
                <Group>
                  <Avatar
                    size="lg"
                    radius="xl"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                    }}
                  >
                    MR
                  </Avatar>
                  <Stack gap={0}>
                    <Text
                      size="sm"
                      fw={600}
                      style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                    >
                      Marcus Rodriguez
                    </Text>
                    <Text
                      size="xs"
                      style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                    >
                      Tech Entrepreneur
                    </Text>
                  </Stack>
                </Group>
                <Rating value={5} readOnly size="sm" color="#FAAD18" />
                <Text
                  size="sm"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    lineHeight: 1.7,
                  }}
                >
                  "Finally, a tool that matches the intensity of my ambitions. The structure it
                  provides has helped me scale two companies while maintaining work-life balance."
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius={20}
              style={{
                background: 'white',
                border: '1px solid hsl(0 0% 0% / 0.08)',
                boxShadow: 'none',
              }}
            >
              <Stack gap="md">
                <Group>
                  <Avatar
                    size="lg"
                    radius="xl"
                    style={{
                      background: 'linear-gradient(135deg, #2FB264 0%, #22c55e 100%)',
                    }}
                  >
                    EJ
                  </Avatar>
                  <Stack gap={0}>
                    <Text
                      size="sm"
                      fw={600}
                      style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                    >
                      Emily Johnson
                    </Text>
                    <Text
                      size="xs"
                      style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                    >
                      Medical Student
                    </Text>
                  </Stack>
                </Group>
                <Rating value={5} readOnly size="sm" color="#FAAD18" />
                <Text
                  size="sm"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    lineHeight: 1.7,
                  }}
                >
                  "I went from feeling overwhelmed to being in complete control. The habit tracking
                  keeps me consistent, and I can see my progress across all areas of my life."
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>

      {/* Enterprise Section */}
      <Box style={{ background: '#F5F5F5', paddingTop: 80, paddingBottom: 80 }}>
        <Container size="lg">
          <Paper
            p={{ base: 40, sm: 50, md: 60 }}
            radius={20}
            style={{
              background: 'rgba(49, 67, 182, 0.05)',
              border: '1px solid rgba(49, 67, 182, 0.15)',
              boxShadow: 'none',
            }}
          >
            <Stack align="center" gap={32}>
              <ThemeIcon
                size={80}
                radius={20}
                style={{
                  background: 'rgba(49, 67, 182, 0.1)',
                  color: '#3143B6',
                }}
              >
                <Users size={40} />
              </ThemeIcon>
              <Title
                order={2}
                ta="center"
                fw={700}
                style={{
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  color: 'hsl(0 0% 0% / 0.87)',
                  letterSpacing: '-0.01em',
                }}
              >
                Enterprise Solutions Coming Soon
              </Title>
              <Text
                size="lg"
                ta="center"
                maw={700}
                style={{
                  color: 'hsl(0 0% 0% / 0.6)',
                  lineHeight: 1.7,
                }}
              >
                We're developing powerful team collaboration features and enterprise-grade security
                for organizations that want to scale elite performance across their entire workforce.
              </Text>
              <Button
                component={Link}
                href="/enterprise-waitlist"
                size="lg"
                radius={48}
                leftSection={<Brain size={20} />}
                style={{
                  background: '#3143B6',
                  border: 'none',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  height: '56px',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      background: '#2535a0',
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

      {/* CTA Section */}
      <Container size="lg" py={100}>
        <Paper
          p={{ base: 40, sm: 60, md: 80 }}
          radius={20}
          style={{
            background: 'linear-gradient(135deg, rgba(49, 67, 182, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
            border: '1px solid hsl(0 0% 0% / 0.08)',
            boxShadow: 'none',
          }}
        >
          <Stack align="center" gap={32}>
            <Title
              order={2}
              ta="center"
              fw={800}
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                color: 'hsl(0 0% 0% / 0.87)',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              Ready to Unlock Your Full Potential?
            </Title>
            <Text
              size="lg"
              ta="center"
              maw={600}
              style={{
                color: 'hsl(0 0% 0% / 0.6)',
                lineHeight: 1.7,
              }}
            >
              Join elite performers who refuse to settle for average. Start building your
              performance system today—completely free during beta.
            </Text>
            <Button
              component={Link}
              href="/auth/register"
              size="xl"
              radius={48}
              rightSection={<ArrowRight size={20} />}
              style={{
                background: '#3143B6',
                border: 'none',
                padding: '16px 40px',
                fontSize: '16px',
                fontWeight: 600,
                height: '56px',
              }}
              styles={{
                root: {
                  '&:hover': {
                    background: '#2535a0',
                  },
                },
              }}
            >
              Start Your Elite Journey
            </Button>
            <Text
              size="sm"
              style={{ color: 'hsl(0 0% 0% / 0.6)' }}
            >
              No credit card required • Free during beta • Cancel anytime
            </Text>
          </Stack>
        </Paper>
      </Container>

      {/* Footer */}
      <Box style={{ background: '#F5F5F5', paddingTop: 60, paddingBottom: 60 }}>
        <Container size="lg">
          <Divider mb={40} style={{ borderColor: 'hsl(0 0% 0% / 0.1)' }} />
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Text
                size="lg"
                fw={700}
                style={{ color: 'hsl(0 0% 0% / 0.87)' }}
              >
                Cherut
              </Text>
              <Text
                size="xs"
                style={{ color: 'hsl(0 0% 0% / 0.6)' }}
              >
                All in, all the time
              </Text>
              <Text
                size="xs"
                mt="md"
                style={{ color: 'hsl(0 0% 0% / 0.6)' }}
              >
                © 2025 Cherut. All rights reserved.
              </Text>
            </Stack>

            <Group gap={60} align="flex-start">
              <Stack gap="xs">
                <Text
                  size="sm"
                  fw={600}
                  style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                >
                  Product
                </Text>
                <Text
                  component={Link}
                  href="#features"
                  size="xs"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    textDecoration: 'none',
                  }}
                >
                  Features
                </Text>
                <Text
                  component={Link}
                  href="#pricing"
                  size="xs"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    textDecoration: 'none',
                  }}
                >
                  Pricing
                </Text>
                <Text
                  size="xs"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    cursor: 'pointer',
                  }}
                >
                  Roadmap
                </Text>
              </Stack>

              <Stack gap="xs">
                <Text
                  size="sm"
                  fw={600}
                  style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                >
                  Company
                </Text>
                <Text
                  size="xs"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    cursor: 'pointer',
                  }}
                >
                  About
                </Text>
                <Text
                  size="xs"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    cursor: 'pointer',
                  }}
                >
                  Blog
                </Text>
                <Text
                  size="xs"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    cursor: 'pointer',
                  }}
                >
                  Careers
                </Text>
              </Stack>

              <Stack gap="xs">
                <Text
                  size="sm"
                  fw={600}
                  style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                >
                  Support
                </Text>
                <Text
                  size="xs"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    cursor: 'pointer',
                  }}
                >
                  Help Center
                </Text>
                <Text
                  size="xs"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    cursor: 'pointer',
                  }}
                >
                  Contact
                </Text>
                <Text
                  size="xs"
                  style={{
                    color: 'hsl(0 0% 0% / 0.6)',
                    cursor: 'pointer',
                  }}
                >
                  Privacy Policy
                </Text>
              </Stack>
            </Group>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}
