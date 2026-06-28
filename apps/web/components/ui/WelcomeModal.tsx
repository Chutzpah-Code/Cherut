'use client';

import {
  Modal,
  Stack,
  Title,
  Text,
  Button,
  Group,
  Paper,
  ThemeIcon,
  Badge,
  Divider,
  Box,
  SimpleGrid,
} from '@mantine/core';
import {
  Target,
  CheckCircle2,
  TrendingUp,
  Shield,
  ImageIcon,
  ArrowRight,
  Heart,
  BookOpen,
  Wallet,
  Clock,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface WelcomeModalProps {
  opened: boolean;
  onClose: () => void;
}

const modules = [
  { icon: Shield,       title: 'Life Areas',    color: '#FAAD18', description: 'The foundation — all features connect here', startHere: true },
  { icon: Target,       title: 'Objectives',    color: '#4686FE', description: 'OKRs: goals with measurable key results' },
  { icon: CheckCircle2, title: 'Tasks',         color: '#06b6d4', description: 'Kanban boards with time tracking' },
  { icon: TrendingUp,   title: 'Habits',        color: '#2FB264', description: 'Daily streaks and frequency tracking' },
  { icon: Wallet,       title: 'Finance',       color: '#0052CC', description: 'Accounts, budgets, investments' },
  { icon: BookOpen,     title: 'Journal',       color: '#8b5cf6', description: 'Daily entries with search' },
  { icon: ImageIcon,    title: 'Vision Board',  color: '#a855f7', description: 'Inspiring images for your goals' },
  { icon: Heart,        title: 'Values',        color: '#e11d48', description: 'Core principles and behaviors' },
];

const HEADER_GRADIENT = 'linear-gradient(135deg, rgba(70,134,254,0.08) 0%, rgba(0,82,204,0.04) 100%)';
const PRIMARY = '#4686FE';
const ACCENT = '#0052CC';
const BORDER = '1px solid #E2E8F0';

function StepWelcome() {
  return (
    <Stack gap="lg">
      <Stack gap="xs" align="center">
        <Text size="md" c="dimmed" ta="center" maw={420}>
          Your personal productivity system — habits, goals, tasks, finance and more.
        </Text>
        <Badge
          size="md"
          radius="xl"
          variant="light"
          color="blue"
          style={{ width: 'fit-content' }}
        >
          Free during Beta
        </Badge>
      </Stack>

      <Paper
        p="md"
        radius="md"
        style={{ background: 'rgba(70,134,254,0.05)', border: '1px solid rgba(70,134,254,0.12)' }}
      >
        <Text size="sm" fw={600} mb={4} style={{ color: PRIMARY }}>
          Quick tip
        </Text>
        <Text size="sm" c="dimmed">
          You can access this guide anytime by clicking the help icon (?) in the header.
        </Text>
      </Paper>
    </Stack>
  );
}

function StepModules() {
  return (
    <Stack gap="md">
      <SimpleGrid cols={2} spacing="sm">
        {modules.map((mod) => (
          <Paper
            key={mod.title}
            p="sm"
            radius="md"
            style={{ border: BORDER, position: 'relative' }}
          >
            <Group gap="sm" wrap="nowrap" align="flex-start">
              <ThemeIcon
                size={36}
                radius="md"
                style={{ background: `${mod.color}18`, color: mod.color, flexShrink: 0 }}
              >
                <mod.icon size={18} />
              </ThemeIcon>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group gap={6} mb={2} wrap="nowrap">
                  <Text fw={600} size="sm" style={{ lineHeight: 1.2 }}>
                    {mod.title}
                  </Text>
                  {mod.startHere && (
                    <Badge size="xs" variant="light" color="yellow" style={{ flexShrink: 0 }}>
                      Start here
                    </Badge>
                  )}
                </Group>
                <Text size="xs" c="dimmed" style={{ lineHeight: 1.4 }}>
                  {mod.description}
                </Text>
              </Box>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      <Box>
        <Divider mb="sm" />
        <Group gap="xs" align="center">
          <Text size="xs" c="dimmed" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}>
            Coming Soon
          </Text>
          {['Reports', 'Cherut OS'].map((name) => (
            <Badge
              key={name}
              size="sm"
              variant="light"
              color="gray"
              leftSection={<Clock size={10} />}
            >
              {name}
            </Badge>
          ))}
        </Group>
      </Box>
    </Stack>
  );
}

const gettingStartedSteps = [
  {
    title: 'Create Life Areas first',
    body: 'Add categories like Health, Career, Finance. Everything links here. Rename instead of deleting.',
    accent: true,
  },
  {
    title: 'Set Objectives (OKRs)',
    body: 'Link each goal to a Life Area. Add measurable Key Results to track progress.',
  },
  {
    title: 'Break goals into Tasks',
    body: 'Use Kanban boards. Connect tasks to objectives for better tracking.',
  },
  {
    title: 'Build daily Habits',
    body: 'Small consistent actions. Track streaks to build lasting routines.',
  },
];

function StepGettingStarted() {
  return (
    <Stack gap="sm">
      {gettingStartedSteps.map((step, i) => (
        <Paper
          key={i}
          p="md"
          radius="md"
          style={{
            border: BORDER,
            borderLeft: step.accent ? `3px solid ${PRIMARY}` : BORDER,
          }}
        >
          <Group gap="sm" align="flex-start" wrap="nowrap">
            <Box
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: PRIMARY,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </Box>
            <Box>
              <Text fw={600} size="sm" mb={2}>
                {step.title}
              </Text>
              <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
                {step.body}
              </Text>
            </Box>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}

const steps = [
  { title: 'Welcome to Cherut',   subtitle: 'Get to know your workspace',          content: <StepWelcome /> },
  { title: 'Your Modules',        subtitle: 'Everything in one place',              content: <StepModules /> },
  { title: 'Getting Started',     subtitle: 'Four steps to set everything up',      content: <StepGettingStarted /> },
];

export default function WelcomeModal({ opened, onClose }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleFinish = () => {
    localStorage.setItem('cherut-welcome-modal-seen', 'true');
    onClose();
  };

  const isLast = currentStep === steps.length - 1;
  const { title, subtitle, content } = steps[currentStep];

  return (
    <Modal
      opened={opened}
      onClose={handleFinish}
      size="lg"
      centered
      withCloseButton={false}
      styles={{
        content: { borderRadius: 16, padding: 0 },
        body: { padding: 0 },
      }}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Box pos="relative">
        {/* Skip */}
        <Button
          variant="subtle"
          size="xs"
          pos="absolute"
          top={14}
          right={14}
          style={{ zIndex: 10, color: '#64748B' }}
          onClick={handleFinish}
          leftSection={<X size={14} />}
        >
          Skip
        </Button>

        <Stack gap={0}>
          {/* Header */}
          <Box p="xl" pb="md" style={{ background: HEADER_GRADIENT }}>
            <Group justify="space-between" mb="md">
              <Text style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748B' }}>
                {currentStep + 1} of {steps.length}
              </Text>
              <Group gap={6}>
                {steps.map((_, i) => (
                  <Box
                    key={i}
                    style={{
                      width: i === currentStep ? 20 : 8,
                      height: 8,
                      borderRadius: 4,
                      background: i <= currentStep ? PRIMARY : '#E2E8F0',
                      transition: 'all 0.25s ease',
                    }}
                  />
                ))}
              </Group>
            </Group>

            <Title
              order={2}
              style={{ fontFamily: 'Inter Display, -apple-system, sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#0F172A', marginBottom: 4 }}
            >
              {title}
            </Title>
            <Text size="sm" c="dimmed">{subtitle}</Text>
          </Box>

          <Divider />

          {/* Content */}
          <Box p="xl" style={{ minHeight: 320 }}>
            {content}
          </Box>

          <Divider />

          {/* Footer */}
          <Group p="lg" justify="space-between">
            <Button
              variant="subtle"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              style={{ color: '#64748B' }}
              size="md"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              rightSection={isLast ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
              style={{ background: isLast ? ACCENT : PRIMARY, height: 44, borderRadius: 8, paddingInline: 24 }}
              size="md"
            >
              {isLast ? "Let's go" : 'Next'}
            </Button>
          </Group>
        </Stack>
      </Box>
    </Modal>
  );
}
