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
  Sparkles,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface WelcomeModalProps {
  opened: boolean;
  onClose: () => void;
}

const features = [
  {
    icon: Shield,
    title: 'Life Areas',
    description: 'Set up foundational life categories. All other features depend on this setup.',
    color: '#FAAD18',
  },
  {
    icon: Target,
    title: 'OKR Framework',
    description: 'Set objectives and key results like world-class performers using proven methodology.',
    color: '#3143B6',
  },
  {
    icon: CheckCircle2,
    title: 'Task Management',
    description: 'Organize work with intuitive boards, track progress, and manage priorities effectively.',
    color: '#06b6d4',
  },
  {
    icon: TrendingUp,
    title: 'Habit Tracking',
    description: 'Build daily routines that compound into extraordinary results over time.',
    color: '#2FB264',
  },
  {
    icon: ImageIcon,
    title: 'Vision Board',
    description: 'Visualize your dreams and maintain motivation through inspiring imagery.',
    color: '#a855f7',
  },
];

const steps = [
  {
    title: 'Welcome to Cherut! 🎉',
    subtitle: 'Your premium personal excellence platform',
    content: (
      <Stack gap="lg">
        <Box>
          <Text size="lg" c="dimmed" ta="center" mb="md">
            Transform your ambition into reality with a complete system designed for elite performance.
          </Text>
          <Badge
            size="lg"
            radius="xl"
            style={{
              background: 'rgba(49, 67, 182, 0.1)',
              color: '#3143B6',
              border: '1px solid rgba(49, 67, 182, 0.2)',
              margin: 'auto',
              display: 'block',
              width: 'fit-content',
            }}
            leftSection={<Sparkles size={14} />}
          >
            FREE DURING BETA
          </Badge>
        </Box>

        <Paper p="xl" radius="md" style={{ background: 'rgba(49, 67, 182, 0.05)', border: '1px solid rgba(49, 67, 182, 0.1)' }}>
          <Text size="sm" fw={600} mb="xs" style={{ color: '#3143B6' }}>
            💡 Quick Tip
          </Text>
          <Text size="sm" c="dimmed">
            You can access this help anytime by clicking the help icon (?) in the header.
          </Text>
        </Paper>
      </Stack>
    ),
  },
  {
    title: 'Core Features',
    subtitle: 'Everything you need to perform at your peak',
    content: (
      <SimpleGrid cols={1} spacing="md">
        {features.map((feature, index) => (
          <Paper key={index} p="md" radius="md" style={{ border: '1px solid var(--mantine-color-gray-3)' }}>
            <Group gap="md">
              <ThemeIcon
                size={40}
                radius="md"
                style={{ background: `${feature.color}20`, color: feature.color }}
              >
                <feature.icon size={20} />
              </ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Text fw={600} size="sm" mb={4}>
                  {feature.title}
                </Text>
                <Text size="xs" c="dimmed">
                  {feature.description}
                </Text>
              </Box>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
    ),
  },
  {
    title: 'Getting Started Guide',
    subtitle: 'Your roadmap to elite performance',
    content: (
      <Stack gap="md">
        <Paper p="md" radius="md" style={{ border: '1px solid #FAAD1820', background: '#FAAD1810' }}>
          <Group gap="sm" align="flex-start">
            <ThemeIcon size={24} radius="xl" style={{ background: '#FAAD18', color: 'white', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>1</span>
            </ThemeIcon>
            <Box>
              <Text fw={600} size="sm">⚠️ Setup Life Areas FIRST</Text>
              <Text size="xs" c="dimmed">
                Life Areas are the foundation - all other features depend on them. Create categories like &quot;Health&quot;, &quot;Career&quot;, &quot;Relationships&quot;.
                <strong> Rename instead of deleting</strong> to avoid breaking existing objectives and tasks linked to them.
              </Text>
            </Box>
          </Group>
        </Paper>

        <Paper p="md" radius="md" style={{ border: '1px solid #3143B620', background: '#3143B610' }}>
          <Group gap="sm" align="flex-start">
            <ThemeIcon size={24} radius="xl" style={{ background: '#3143B6', color: 'white', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>2</span>
            </ThemeIcon>
            <Box>
              <Text fw={600} size="sm">Create Objectives (OKRs)</Text>
              <Text size="xs" c="dimmed">
                Set quarterly/yearly goals with measurable Key Results. Each objective must be linked to a Life Area.
                This methodology is used by Google, Intel, and other top-performing organizations.
              </Text>
            </Box>
          </Group>
        </Paper>

        <Paper p="md" radius="md" style={{ border: '1px solid #06b6d420', background: '#06b6d410' }}>
          <Group gap="sm" align="flex-start">
            <ThemeIcon size={24} radius="xl" style={{ background: '#06b6d4', color: 'white', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>3</span>
            </ThemeIcon>
            <Box>
              <Text fw={600} size="sm">Manage Tasks & Execution</Text>
              <Text size="xs" c="dimmed">
                Break down objectives into actionable tasks. Use Kanban boards to track progress through stages:
                To Do → In Progress → Review → Done. Tasks can be linked to objectives for better tracking.
              </Text>
            </Box>
          </Group>
        </Paper>

        <Paper p="md" radius="md" style={{ border: '1px solid #2FB26420', background: '#2FB26410' }}>
          <Group gap="sm" align="flex-start">
            <ThemeIcon size={24} radius="xl" style={{ background: '#2FB264', color: 'white', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>4</span>
            </ThemeIcon>
            <Box>
              <Text fw={600} size="sm">Build Consistent Habits</Text>
              <Text size="xs" c="dimmed">
                Track daily/weekly habits that support your objectives. Set frequency, monitor streaks,
                and build the systems that create lasting change. Small consistent actions compound into massive results.
              </Text>
            </Box>
          </Group>
        </Paper>

        <Paper p="md" radius="md" style={{ border: '1px solid #a855f720', background: '#a855f710' }}>
          <Group gap="sm" align="flex-start">
            <ThemeIcon size={24} radius="xl" style={{ background: '#a855f7', color: 'white', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>5</span>
            </ThemeIcon>
            <Box>
              <Text fw={600} size="sm">Visualize with Vision Board</Text>
              <Text size="xs" c="dimmed">
                Upload inspiring images that represent your goals and dreams. Visual motivation helps maintain
                focus and emotional connection to your objectives during challenging times.
              </Text>
            </Box>
          </Group>
        </Paper>
      </Stack>
    ),
  },
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
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('cherut-welcome-modal-seen', 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('cherut-welcome-modal-seen', 'true');
    onClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <Modal
      opened={opened}
      onClose={handleSkip}
      size="lg"
      centered
      withCloseButton={false}
      styles={{
        content: {
          borderRadius: '16px',
          padding: 0,
        },
        body: {
          padding: 0,
        },
      }}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Box pos="relative">
        <Button
          variant="subtle"
          size="xs"
          pos="absolute"
          top={16}
          right={16}
          style={{ zIndex: 1000 }}
          onClick={handleSkip}
          leftSection={<X size={16} />}
          c="dimmed"
        >
          Skip
        </Button>

        <Stack gap={0}>
          {/* Header com progresso */}
          <Box p="xl" pb="md" style={{ background: 'linear-gradient(135deg, rgba(49, 67, 182, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)' }}>
            <Group justify="space-between" mb="md">
              <Badge size="sm" radius="xl" variant="light" color="blue">
                {currentStep + 1} of {steps.length}
              </Badge>
              <Group gap={4}>
                {steps.map((_, index) => (
                  <Box
                    key={index}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: index <= currentStep ? '#3143B6' : '#e9ecef',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </Group>
            </Group>

            <Title order={2} size="h2" mb={4} style={{ fontSize: '24px', fontWeight: 700 }}>
              {currentStepData.title}
            </Title>
            <Text c="dimmed" size="md" style={{ fontSize: '16px' }}>
              {currentStepData.subtitle}
            </Text>
          </Box>

          <Divider />

          {/* Content */}
          <Box p="xl" style={{ minHeight: 400, fontSize: '16px' }}>
            {currentStepData.content}
          </Box>

          <Divider />

          {/* Footer with navigation */}
          <Stack p="xl" pt="md" gap="md">
            <Group justify="space-between" w="100%" gap="md">
              <Button
                variant="subtle"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                c="dimmed"
                style={{
                  flex: 1,
                  minWidth: '100px',
                  maxWidth: '150px',
                  whiteSpace: 'nowrap'
                }}
                size="md"
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                rightSection={currentStep === steps.length - 1 ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
                style={{
                  background: '#3143B6',
                  flex: 1,
                  minWidth: '120px',
                  maxWidth: '150px',
                  whiteSpace: 'nowrap'
                }}
                size="md"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Button>
            </Group>

            <Button
              variant="outline"
              onClick={handleSkip}
              c="dimmed"
              style={{
                borderColor: 'var(--mantine-color-gray-3)',
                alignSelf: 'center',
                width: 'fit-content'
              }}
              size="sm"
            >
              Skip tutorial
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
}