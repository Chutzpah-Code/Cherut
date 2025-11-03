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
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Hero Section */}
      <Container size="lg" py={80}>
        <Stack align="center" gap="xl">
          <Badge
            size="lg"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            leftSection={<Sparkles size={14} />}
          >
            Free During Beta Testing
          </Badge>

          <Title
            order={1}
            ta="center"
            style={{
              background: 'linear-gradient(90deg, #ffffff 0%, #a0a0a0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 900,
            }}
          >
            Your Elite Performance System
          </Title>

          <Text
            size="sm"
            fw={700}
            c="dimmed"
            tt="uppercase"
            style={{ letterSpacing: 2 }}
          >
            All in, all the time
          </Text>

          <Text
            size="xl"
            ta="center"
            maw={700}
            c="dimmed"
            style={{ lineHeight: 1.6 }}
          >
            Transform your ambition into achievement. Built for elite athletes, ambitious
            professionals, and anyone ready to unlock their full potential through structured
            goal setting and systematic execution.
          </Text>

          <Group gap="md" mt="xl">
            <Button
              component={Link}
              href="/auth/register"
              size="xl"
              radius="md"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
              rightSection={<ArrowRight size={20} />}
              style={{
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.35)',
              }}
            >
              Start Free
            </Button>
            <Button
              component={Link}
              href="#features"
              size="xl"
              radius="md"
              variant="outline"
              c="white"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: 'transparent',
              }}
              styles={{
                root: {
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
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
      <Container size="lg" py={60}>
        <Stack align="center" gap="xl">
          <Title order={2} ta="center" size={36} fw={700} c="white">
            Stop Letting Your Potential Go to Waste
          </Title>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" w="100%">
            <Card
              padding="xl"
              radius="md"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Stack gap="md">
                <ThemeIcon
                  size={50}
                  radius="md"
                  variant="gradient"
                  gradient={{ from: 'red', to: 'orange', deg: 45 }}
                >
                  <Target size={28} />
                </ThemeIcon>
                <Text size="lg" fw={600} c="white">
                  Lost in Overwhelm
                </Text>
                <Text size="sm" c="dimmed">
                  Big dreams but no clear path forward. You know what you want but struggle to
                  break it down into actionable steps.
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius="md"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Stack gap="md">
                <ThemeIcon
                  size={50}
                  radius="md"
                  variant="gradient"
                  gradient={{ from: 'orange', to: 'yellow', deg: 45 }}
                >
                  <TrendingUp size={28} />
                </ThemeIcon>
                <Text size="lg" fw={600} c="white">
                  Inconsistent Progress
                </Text>
                <Text size="sm" c="dimmed">
                  Bursts of motivation followed by plateaus. You start strong but struggle to
                  maintain momentum toward your goals.
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius="md"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Stack gap="md">
                <ThemeIcon
                  size={50}
                  radius="md"
                  variant="gradient"
                  gradient={{ from: 'yellow', to: 'green', deg: 45 }}
                >
                  <Zap size={28} />
                </ThemeIcon>
                <Text size="lg" fw={600} c="white">
                  Missing the Edge
                </Text>
                <Text size="sm" c="dimmed">
                  You're good, but not elite. You know there's another level you haven't
                  reached, but don't have the system to get there.
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>

      {/* Features Section */}
      <Container size="lg" py={80} id="features">
        <Stack align="center" gap={60}>
          <Stack align="center" gap="md">
            <Title order={2} ta="center" size={36} fw={700} c="white">
              Everything You Need to Perform at Your Peak
            </Title>
            <Text size="lg" ta="center" maw={600} c="dimmed">
              A complete system designed for those who refuse to settle for average
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={40} w="100%">
            <Card
              padding="xl"
              radius="md"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Stack gap="md">
                <ThemeIcon
                  size={60}
                  radius="md"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                >
                  <Target size={32} />
                </ThemeIcon>
                <Text size="24px" fw={700} c="white">
                  OKR Framework
                </Text>
                <Text size="md" c="dimmed" style={{ lineHeight: 1.6 }}>
                  Set objectives and key results like the world's top performers. Break down
                  ambitious goals into measurable milestones that drive real progress.
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius="md"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Stack gap="md">
                <ThemeIcon
                  size={60}
                  radius="md"
                  variant="gradient"
                  gradient={{ from: 'cyan', to: 'teal', deg: 45 }}
                >
                  <CheckCircle2 size={32} />
                </ThemeIcon>
                <Text size="24px" fw={700} c="white">
                  Task Management
                </Text>
                <Text size="md" c="dimmed" style={{ lineHeight: 1.6 }}>
                  Organize your work with intuitive task boards. Track progress, set priorities,
                  and never lose sight of what matters most.
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius="md"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Stack gap="md">
                <ThemeIcon
                  size={60}
                  radius="md"
                  variant="gradient"
                  gradient={{ from: 'teal', to: 'green', deg: 45 }}
                >
                  <TrendingUp size={32} />
                </ThemeIcon>
                <Text size="24px" fw={700} c="white">
                  Habit Tracking
                </Text>
                <Text size="md" c="dimmed" style={{ lineHeight: 1.6 }}>
                  Build the daily routines that compound into extraordinary results. Track
                  streaks, monitor consistency, and develop elite habits.
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius="md"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Stack gap="md">
                <ThemeIcon
                  size={60}
                  radius="md"
                  variant="gradient"
                  gradient={{ from: 'green', to: 'lime', deg: 45 }}
                >
                  <Shield size={32} />
                </ThemeIcon>
                <Text size="24px" fw={700} c="white">
                  Life Areas Balance
                </Text>
                <Text size="md" c="dimmed" style={{ lineHeight: 1.6 }}>
                  Achieve holistic excellence. Organize goals across health, career, relationships,
                  and personal growth for balanced peak performance.
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>

      {/* Pricing Section */}
      <Container size="lg" py={80}>
        <Stack align="center" gap={60}>
          <Stack align="center" gap="md">
            <Title order={2} ta="center" size={36} fw={700} c="white">
              Choose Your Performance Level
            </Title>
            <Text size="lg" ta="center" maw={700} c="dimmed">
              All plans are free during our beta testing period. Your data will be preserved
              when we launch. Start building your elite performance system today.
            </Text>
            <Badge size="lg" variant="light" color="green" leftSection={<Star size={14} />}>
              Beta Launch: Q4 2025
            </Badge>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl" w="100%">
            {/* Free Beta */}
            <Card
              padding="xl"
              radius="lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                minHeight: '420px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack gap="lg" style={{ flex: 1 }}>
                <Stack gap="xs">
                  <Text size="xl" fw={700} c="white">
                    Test Drive
                  </Text>
                  <Group align="baseline" gap={4}>
                    <Text size="48px" fw={900} c="white" style={{ lineHeight: 1 }}>
                      Free
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed" fw={500}>
                    During Beta Testing
                  </Text>
                </Stack>
                <Divider my="sm" />
                <Stack gap="xs">
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    <Text size="sm" c="dimmed">
                      All core features
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    <Text size="sm" c="dimmed">
                      Basic limitations
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    <Text size="sm" c="dimmed">
                      Community support
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    <Text size="sm" c="dimmed">
                      Data preserved in beta
                    </Text>
                  </Group>
                </Stack>
                <Button
                  component={Link}
                  href="/auth/register"
                  variant="outline"
                  radius="md"
                  fullWidth
                  mt="md"
                  c="white"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'transparent',
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
              radius="lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                minHeight: '420px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack gap="lg" style={{ flex: 1 }}>
                <Stack gap="xs">
                  <Text size="xl" fw={700} c="white">
                    Core
                  </Text>
                  <Group align="baseline" gap={4}>
                    <Text size="48px" fw={900} c="white" style={{ lineHeight: 1 }}>
                      $10
                    </Text>
                    <Text size="md" c="dimmed" fw={500}>
                      /mo
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed" fw={500}>
                    Unlock Your Potential
                  </Text>
                </Stack>
                <Divider my="sm" />
                <Stack gap="xs">
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#3b82f6' }} />
                    <Text size="sm" c="white">
                      All features unlocked
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#3b82f6' }} />
                    <Text size="sm" c="white">
                      No limitations
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#3b82f6' }} />
                    <Text size="sm" c="white">
                      Priority support
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#3b82f6' }} />
                    <Text size="sm" c="white">
                      Unlimited goals & tasks
                    </Text>
                  </Group>
                </Stack>
                <Button
                  component={Link}
                  href="/auth/register"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                  radius="md"
                  fullWidth
                  mt="md"
                >
                  Get Started
                </Button>
              </Stack>
            </Card>

            {/* Pro */}
            <Card
              padding="xl"
              radius="lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(168, 85, 247, 0.5)',
                minHeight: '420px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack gap="lg" style={{ flex: 1 }}>
                <Stack gap="xs">
                  <Group justify="space-between" align="flex-start">
                    <Text size="xl" fw={700} c="white">
                      Pro
                    </Text>
                    <Badge size="sm" variant="light" color="violet">
                      Popular
                    </Badge>
                  </Group>
                  <Group align="baseline" gap={4}>
                    <Text size="48px" fw={900} c="white" style={{ lineHeight: 1 }}>
                      $20
                    </Text>
                    <Text size="md" c="dimmed" fw={500}>
                      /mo
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed" fw={500}>
                    Connect Everything
                  </Text>
                </Stack>
                <Divider my="sm" />
                <Stack gap="xs">
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                    <Text size="sm" c="white">
                      Everything in Core
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                    <Text size="sm" c="white">
                      Calendar integrations
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                    <Text size="sm" c="white">
                      Third-party apps
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                    <Text size="sm" c="white">
                      Advanced analytics
                    </Text>
                  </Group>
                </Stack>
                <Button
                  component={Link}
                  href="/auth/register"
                  variant="gradient"
                  gradient={{ from: 'violet', to: 'purple', deg: 45 }}
                  radius="md"
                  fullWidth
                  mt="md"
                >
                  Go Pro
                </Button>
              </Stack>
            </Card>

            {/* Elite */}
            <Card
              padding="xl"
              radius="lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(234, 179, 8, 0.5)',
                minHeight: '420px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack gap="lg" style={{ flex: 1 }}>
                <Stack gap="xs">
                  <Group justify="space-between" align="flex-start">
                    <Text size="xl" fw={700} c="white">
                      Elite
                    </Text>
                    <Badge size="sm" variant="light" color="yellow">
                      Premium
                    </Badge>
                  </Group>
                  <Group align="baseline" gap={4}>
                    <Text size="48px" fw={900} c="white" style={{ lineHeight: 1 }}>
                      $30
                    </Text>
                    <Text size="md" c="dimmed" fw={500}>
                      /mo
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed" fw={500}>
                    AI-Powered Excellence
                  </Text>
                </Stack>
                <Divider my="sm" />
                <Stack gap="xs">
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#eab308' }} />
                    <Text size="sm" c="white">
                      Everything in Pro
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#eab308' }} />
                    <Text size="sm" c="white">
                      AI goal recommendations
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#eab308' }} />
                    <Text size="sm" c="white">
                      Smart insights & patterns
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <CheckCircle2 size={16} style={{ color: '#eab308' }} />
                    <Text size="sm" c="white">
                      Personalized coaching
                    </Text>
                  </Group>
                </Stack>
                <Button
                  component={Link}
                  href="/auth/register"
                  variant="gradient"
                  gradient={{ from: 'yellow', to: 'orange', deg: 45 }}
                  radius="md"
                  fullWidth
                  mt="md"
                >
                  Go Elite
                </Button>
              </Stack>
            </Card>
          </SimpleGrid>

          <Text size="sm" c="dimmed" ta="center" maw={600}>
            Note: After the beta period ends, free tier users will have limited data retention.
            Upgrade to any paid plan to maintain full access to your performance history.
          </Text>
        </Stack>
      </Container>

      {/* Social Proof Section */}
      <Container size="lg" py={80}>
        <Stack align="center" gap={60}>
          <Stack align="center" gap="xl">
            <Title order={2} ta="center" size={36} fw={700} c="white">
              Join Elite Performers Worldwide
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" w="100%">
              <Stack align="center" gap="xs">
                <Text size="60px" fw={900} c="white" style={{ lineHeight: 1 }}>
                  10+
                </Text>
                <Text size="md" c="dimmed" fw={500}>
                  Beta Testers
                </Text>
              </Stack>
              <Stack align="center" gap="xs">
                <Text size="60px" fw={900} c="white" style={{ lineHeight: 1 }}>
                  100+
                </Text>
                <Text size="md" c="dimmed" fw={500}>
                  Goals Set
                </Text>
              </Stack>
              <Stack align="center" gap="xs">
                <Text size="60px" fw={900} c="white" style={{ lineHeight: 1 }}>
                  1K+
                </Text>
                <Text size="md" c="dimmed" fw={500}>
                  Tasks Completed
                </Text>
              </Stack>
            </SimpleGrid>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" w="100%">
            <Card
              padding="xl"
              radius="md"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Stack gap="md">
                <Group>
                  <Avatar size="lg" radius="xl" color="blue">
                    SC
                  </Avatar>
                  <Stack gap={0}>
                    <Text size="sm" fw={600} c="white">
                      Sarah Chen
                    </Text>
                    <Text size="xs" c="dimmed">
                      Professional Athlete
                    </Text>
                  </Stack>
                </Group>
                <Rating value={5} readOnly size="sm" />
                <Text size="sm" c="dimmed">
                  "This system transformed how I approach my training goals. I've achieved more
                  in 3 months than I did in the past year. The OKR framework is a game-changer."
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius="md"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Stack gap="md">
                <Group>
                  <Avatar size="lg" radius="xl" color="violet">
                    MR
                  </Avatar>
                  <Stack gap={0}>
                    <Text size="sm" fw={600} c="white">
                      Marcus Rodriguez
                    </Text>
                    <Text size="xs" c="dimmed">
                      Tech Entrepreneur
                    </Text>
                  </Stack>
                </Group>
                <Rating value={5} readOnly size="sm" />
                <Text size="sm" c="dimmed">
                  "Finally, a tool that matches the intensity of my ambitions. The structure it
                  provides has helped me scale two companies while maintaining work-life balance."
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius="md"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Stack gap="md">
                <Group>
                  <Avatar size="lg" radius="xl" color="green">
                    EJ
                  </Avatar>
                  <Stack gap={0}>
                    <Text size="sm" fw={600} c="white">
                      Emily Johnson
                    </Text>
                    <Text size="xs" c="dimmed">
                      Medical Student
                    </Text>
                  </Stack>
                </Group>
                <Rating value={5} readOnly size="sm" />
                <Text size="sm" c="dimmed">
                  "I went from feeling overwhelmed to being in complete control. The habit tracking
                  keeps me consistent, and I can see my progress across all areas of my life."
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>

      {/* Enterprise Section */}
      <Container size="lg" py={60}>
        <Paper
          p={{ base: 40, sm: 50, md: 60 }}
          radius="lg"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          <Stack align="center" gap="xl">
            <ThemeIcon
              size={80}
              radius="md"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            >
              <Users size={40} />
            </ThemeIcon>
            <Title
              order={2}
              ta="center"
              fw={700}
              c="white"
              style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}
            >
              Enterprise Solutions Coming Soon
            </Title>
            <Text size="lg" ta="center" maw={700} c="dimmed" style={{ lineHeight: 1.6 }}>
              We're developing powerful team collaboration features and enterprise-grade security
              for organizations that want to scale elite performance across their entire workforce.
            </Text>
            <Button
              size="lg"
              radius="md"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
              leftSection={<Brain size={20} />}
              style={{
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.35)',
              }}
            >
              Join Enterprise Waitlist
            </Button>
          </Stack>
        </Paper>
      </Container>

      {/* CTA Section */}
      <Container size="lg" py={80}>
        <Paper
          p={{ base: 40, sm: 60, md: 80 }}
          radius="lg"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Stack align="center" gap="xl">
            <Title
              order={2}
              ta="center"
              fw={900}
              c="white"
              style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
            >
              Ready to Unlock Your Full Potential?
            </Title>
            <Text size="lg" ta="center" maw={600} c="dimmed" style={{ lineHeight: 1.6 }}>
              Join elite performers who refuse to settle for average. Start building your
              performance system today—completely free during beta.
            </Text>
            <Button
              component={Link}
              href="/auth/register"
              size="xl"
              radius="md"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
              rightSection={<ArrowRight size={20} />}
              style={{
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.35)',
              }}
            >
              Start Your Elite Journey
            </Button>
            <Text size="sm" c="dimmed">
              No credit card required • Free during beta • Cancel anytime
            </Text>
          </Stack>
        </Paper>
      </Container>

      {/* Footer */}
      <Container size="lg" py={40}>
        <Divider mb="xl" />
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <Text size="lg" fw={700} c="white">
              Cherut
            </Text>
            <Text size="xs" c="dimmed">
              All in, all the time
            </Text>
            <Text size="xs" c="dimmed" mt="md">
              © 2025 Cherut. All rights reserved.
            </Text>
          </Stack>

          <Group gap={60} align="flex-start">
            <Stack gap="xs">
              <Text size="sm" fw={600} c="white">
                Product
              </Text>
              <Text
                component={Link}
                href="#features"
                size="xs"
                c="dimmed"
                style={{ textDecoration: 'none' }}
              >
                Features
              </Text>
              <Text
                component={Link}
                href="#pricing"
                size="xs"
                c="dimmed"
                style={{ textDecoration: 'none' }}
              >
                Pricing
              </Text>
              <Text size="xs" c="dimmed" style={{ cursor: 'pointer' }}>
                Roadmap
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text size="sm" fw={600} c="white">
                Company
              </Text>
              <Text size="xs" c="dimmed" style={{ cursor: 'pointer' }}>
                About
              </Text>
              <Text size="xs" c="dimmed" style={{ cursor: 'pointer' }}>
                Blog
              </Text>
              <Text size="xs" c="dimmed" style={{ cursor: 'pointer' }}>
                Careers
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text size="sm" fw={600} c="white">
                Support
              </Text>
              <Text size="xs" c="dimmed" style={{ cursor: 'pointer' }}>
                Help Center
              </Text>
              <Text size="xs" c="dimmed" style={{ cursor: 'pointer' }}>
                Contact
              </Text>
              <Text size="xs" c="dimmed" style={{ cursor: 'pointer' }}>
                Privacy Policy
              </Text>
            </Stack>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
