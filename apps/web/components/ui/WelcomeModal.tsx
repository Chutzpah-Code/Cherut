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
    icon: Target,
    title: 'OKR Framework',
    description: 'Defina objetivos e resultados-chave como os top performers mundiais.',
    color: '#3143B6',
  },
  {
    icon: CheckCircle2,
    title: 'Gerenciamento de Tarefas',
    description: 'Organize seu trabalho com quadros intuitivos e acompanhe o progresso.',
    color: '#06b6d4',
  },
  {
    icon: TrendingUp,
    title: 'Acompanhamento de Hábitos',
    description: 'Construa rotinas diárias que se transformam em resultados extraordinários.',
    color: '#2FB264',
  },
  {
    icon: Shield,
    title: 'Áreas da Vida',
    description: 'Alcance excelência holística organizando metas por diferentes áreas.',
    color: '#FAAD18',
  },
  {
    icon: ImageIcon,
    title: 'Vision Board',
    description: 'Visualize seus sonhos e mantenha a motivação através de imagens.',
    color: '#a855f7',
  },
];

const steps = [
  {
    title: 'Bem-vindo ao Cherut! 🎉',
    subtitle: 'Sua plataforma de excelência pessoal premium',
    content: (
      <Stack gap="lg">
        <Box>
          <Text size="lg" c="dimmed" ta="center" mb="md">
            Transforme sua ambição em realidade com um sistema completo para performance de elite.
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
            GRATUITO DURANTE O BETA
          </Badge>
        </Box>

        <Paper p="xl" radius="md" style={{ background: 'rgba(49, 67, 182, 0.05)', border: '1px solid rgba(49, 67, 182, 0.1)' }}>
          <Text size="sm" fw={600} mb="xs" style={{ color: '#3143B6' }}>
            💡 Dica Rápida
          </Text>
          <Text size="sm" c="dimmed">
            Você pode acessar esta ajuda a qualquer momento clicando no ícone de interrogação no cabeçalho.
          </Text>
        </Paper>
      </Stack>
    ),
  },
  {
    title: 'Recursos Principais',
    subtitle: 'Tudo que você precisa para performar no seu máximo',
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
    title: 'Primeiros Passos',
    subtitle: 'Comece sua jornada de excelência agora',
    content: (
      <Stack gap="md">
        <Paper p="md" radius="md" style={{ border: '1px solid #2FB26420', background: '#2FB26410' }}>
          <Group gap="sm" align="flex-start">
            <ThemeIcon size={24} radius="xl" style={{ background: '#2FB264', color: 'white', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>1</span>
            </ThemeIcon>
            <Box>
              <Text fw={600} size="sm">Configure seu perfil</Text>
              <Text size="xs" c="dimmed">Acesse &quot;Perfil&quot; para personalizar suas informações.</Text>
            </Box>
          </Group>
        </Paper>

        <Paper p="md" radius="md" style={{ border: '1px solid #3143B620', background: '#3143B610' }}>
          <Group gap="sm" align="flex-start">
            <ThemeIcon size={24} radius="xl" style={{ background: '#3143B6', color: 'white', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>2</span>
            </ThemeIcon>
            <Box>
              <Text fw={600} size="sm">Defina seus objetivos</Text>
              <Text size="xs" c="dimmed">Vá para &quot;Objetivos&quot; e crie seu primeiro OKR.</Text>
            </Box>
          </Group>
        </Paper>

        <Paper p="md" radius="md" style={{ border: '1px solid #FAAD1820', background: '#FAAD1810' }}>
          <Group gap="sm" align="flex-start">
            <ThemeIcon size={24} radius="xl" style={{ background: '#FAAD18', color: 'white', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>3</span>
            </ThemeIcon>
            <Box>
              <Text fw={600} size="sm">Organize suas áreas</Text>
              <Text size="xs" c="dimmed">Configure suas &quot;Áreas da Vida&quot; para uma visão holística.</Text>
            </Box>
          </Group>
        </Paper>

        <Paper p="md" radius="md" style={{ border: '1px solid #06b6d420', background: '#06b6d410' }}>
          <Group gap="sm" align="flex-start">
            <ThemeIcon size={24} radius="xl" style={{ background: '#06b6d4', color: 'white', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>4</span>
            </ThemeIcon>
            <Box>
              <Text fw={600} size="sm">Comece a executar</Text>
              <Text size="xs" c="dimmed">Use &quot;Tarefas&quot; e &quot;Hábitos&quot; para ação consistente.</Text>
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
          Pular
        </Button>

        <Stack gap={0}>
          {/* Header com progresso */}
          <Box p="xl" pb="md" style={{ background: 'linear-gradient(135deg, rgba(49, 67, 182, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)' }}>
            <Group justify="space-between" mb="md">
              <Badge size="sm" radius="xl" variant="light" color="blue">
                {currentStep + 1} de {steps.length}
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

            <Title order={2} size="h3" mb={4}>
              {currentStepData.title}
            </Title>
            <Text c="dimmed" size="sm">
              {currentStepData.subtitle}
            </Text>
          </Box>

          <Divider />

          {/* Content */}
          <Box p="xl" style={{ minHeight: 400 }}>
            {currentStepData.content}
          </Box>

          <Divider />

          {/* Footer with navigation */}
          <Group p="xl" pt="md" justify="space-between">
            <Button
              variant="subtle"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              c="dimmed"
            >
              Anterior
            </Button>

            <Group gap="xs">
              <Button
                variant="outline"
                onClick={handleSkip}
                c="dimmed"
                style={{ borderColor: 'var(--mantine-color-gray-3)' }}
              >
                Pular tutorial
              </Button>
              <Button
                onClick={handleNext}
                rightSection={currentStep === steps.length - 1 ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
                style={{ background: '#3143B6' }}
              >
                {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
              </Button>
            </Group>
          </Group>
        </Stack>
      </Box>
    </Modal>
  );
}