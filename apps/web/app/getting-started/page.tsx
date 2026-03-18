'use client';

import { Container, Title, Text, Stack, Card, Group, ThemeIcon, Box, Badge, Button, Divider } from '@mantine/core';
import { CheckCircle2, Target, Calendar, Zap, Heart, BarChart, BookOpen, Star, ArrowRight, Clock } from 'lucide-react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function GettingStarted() {
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
              Getting Started with <span style={{ color: '#4686FE' }}>Cherut</span>
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
              Follow this step-by-step guide to set up your personal excellence system and
              start achieving extraordinary results.
            </Text>
            <Badge
              size="lg"
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#22C55E',
                border: 'none',
                padding: '8px 16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
              }}
            >
              Complete Onboarding Guide
            </Badge>
          </Stack>

          {/* Overview */}
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
                size={80}
                radius={20}
                style={{
                  background: '#4686FE',
                  color: 'white',
                  border: 'none',
                }}
              >
                <BookOpen size={40} />
              </ThemeIcon>
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
                Your Journey to Excellence
              </Title>
              <Text
                ta="center"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '20px',
                  lineHeight: '28px',
                  color: '#666666',
                  fontWeight: 400,
                  maxWidth: '800px',
                }}
              >
                Cherut is designed to help you achieve peak performance across all areas of your life.
                This guide will walk you through setting up your complete personal excellence system in just 30 minutes.
              </Text>
              <Group gap="lg">
                <Badge
                  leftSection={<Clock size={16} />}
                  size="lg"
                  style={{
                    background: 'rgba(70, 134, 254, 0.1)',
                    color: '#4686FE',
                    border: 'none',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  30 minutes setup
                </Badge>
                <Badge
                  leftSection={<CheckCircle2 size={16} />}
                  size="lg"
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#22C55E',
                    border: 'none',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  7 easy steps
                </Badge>
              </Group>
            </Stack>
          </Card>

          {/* Step-by-Step Checklist */}
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
              Your Onboarding Checklist
            </Title>

            {/* Step 1 */}
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
                <Group gap="lg" align="flex-start">
                  <ThemeIcon
                    size={60}
                    radius={16}
                    style={{
                      background: '#F5F5F5',
                      color: '#4686FE',
                      border: 'none',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Badge
                      size="md"
                      style={{
                        background: 'rgba(70, 134, 254, 0.1)',
                        color: '#4686FE',
                        border: 'none',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      Step 1
                    </Badge>
                    <Text
                      style={{
                        fontFamily: 'Inter Display, sans-serif',
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#000000',
                      }}
                    >
                      Complete Your Profile
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
                      Set up your account with accurate information to personalize your Cherut experience.
                    </Text>
                  </Stack>
                </Group>

                <Divider />

                <Stack gap="lg" pl="md">
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#000000',
                    }}
                  >
                    What to do:
                  </Text>
                  <Stack gap="xs">
                    <Text
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        color: '#666666',
                        lineHeight: '24px',
                      }}
                    >
                      • Upload a profile photo (helps with motivation and accountability)
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
                      • Set your timezone for accurate scheduling
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
                      • Choose your preferred notification settings
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
                      • Set your working hours for better task planning
                    </Text>
                  </Stack>

                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#4686FE',
                      marginTop: '8px',
                    }}
                  >
                    ⏱️ Time needed: 5 minutes
                  </Text>
                </Stack>
              </Stack>
            </Card>

            {/* Step 2 */}
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
                <Group gap="lg" align="flex-start">
                  <ThemeIcon
                    size={60}
                    radius={16}
                    style={{
                      background: '#F5F5F5',
                      color: '#4686FE',
                      border: 'none',
                      flexShrink: 0,
                    }}
                  >
                    <Heart size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Badge
                      size="md"
                      style={{
                        background: 'rgba(70, 134, 254, 0.1)',
                        color: '#4686FE',
                        border: 'none',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      Step 2
                    </Badge>
                    <Text
                      style={{
                        fontFamily: 'Inter Display, sans-serif',
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#000000',
                      }}
                    >
                      Define Your Core Values
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
                      Establish the fundamental principles that guide your decisions and actions.
                    </Text>
                  </Stack>
                </Group>

                <Divider />

                <Stack gap="lg" pl="md">
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#000000',
                    }}
                  >
                    What to do:
                  </Text>
                  <Stack gap="xs">
                    <Text
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        color: '#666666',
                        lineHeight: '24px',
                      }}
                    >
                      • Navigate to the Values section in your dashboard
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
                      • Choose 3-5 core values that resonate deeply with you
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
                      • Write a brief description for each value explaining what it means to you
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
                      • Rank them in order of importance
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
                      • Use these values as your north star for all decisions
                    </Text>
                  </Stack>

                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#4686FE',
                      marginTop: '8px',
                    }}
                  >
                    ⏱️ Time needed: 10 minutes
                  </Text>
                </Stack>
              </Stack>
            </Card>

            {/* Step 3 */}
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
                <Group gap="lg" align="flex-start">
                  <ThemeIcon
                    size={60}
                    radius={16}
                    style={{
                      background: '#F5F5F5',
                      color: '#4686FE',
                      border: 'none',
                      flexShrink: 0,
                    }}
                  >
                    <Target size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Badge
                      size="md"
                      style={{
                        background: 'rgba(70, 134, 254, 0.1)',
                        color: '#4686FE',
                        border: 'none',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      Step 3
                    </Badge>
                    <Text
                      style={{
                        fontFamily: 'Inter Display, sans-serif',
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#000000',
                      }}
                    >
                      Set Up Your Life Areas
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
                      Organize your goals into key life categories for balanced growth.
                    </Text>
                  </Stack>
                </Group>

                <Divider />

                <Stack gap="lg" pl="md">
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#000000',
                    }}
                  >
                    What to do:
                  </Text>
                  <Stack gap="xs">
                    <Text
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        color: '#666666',
                        lineHeight: '24px',
                      }}
                    >
                      • Create 4-6 life areas (e.g., Health, Career, Relationships, Finance, Personal Growth)
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
                      • Write a vision statement for each area describing your ideal future
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
                      • Assign colors and icons to make them visually distinct
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
                      • Set priority levels for each area based on current focus
                    </Text>
                  </Stack>

                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#4686FE',
                      marginTop: '8px',
                    }}
                  >
                    ⏱️ Time needed: 8 minutes
                  </Text>
                </Stack>
              </Stack>
            </Card>

            {/* Step 4 */}
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
                <Group gap="lg" align="flex-start">
                  <ThemeIcon
                    size={60}
                    radius={16}
                    style={{
                      background: '#F5F5F5',
                      color: '#4686FE',
                      border: 'none',
                      flexShrink: 0,
                    }}
                  >
                    <Star size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Badge
                      size="md"
                      style={{
                        background: 'rgba(70, 134, 254, 0.1)',
                        color: '#4686FE',
                        border: 'none',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      Step 4
                    </Badge>
                    <Text
                      style={{
                        fontFamily: 'Inter Display, sans-serif',
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#000000',
                      }}
                    >
                      Create Your First OKRs
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
                      Set objectives and key results that will drive meaningful progress.
                    </Text>
                  </Stack>
                </Group>

                <Divider />

                <Stack gap="lg" pl="md">
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#000000',
                    }}
                  >
                    What to do:
                  </Text>
                  <Stack gap="xs">
                    <Text
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        color: '#666666',
                        lineHeight: '24px',
                      }}
                    >
                      • Start with 1-2 objectives per life area (keep it focused)
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
                      • Write inspiring, qualitative objectives (e.g., "Achieve exceptional physical fitness")
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
                      • Add 2-4 measurable key results per objective (e.g., "Run a 10K in under 50 minutes")
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
                      • Set realistic but challenging targets with specific deadlines
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
                      • Link each OKR to your core values
                    </Text>
                  </Stack>

                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#4686FE',
                      marginTop: '8px',
                    }}
                  >
                    ⏱️ Time needed: 15 minutes
                  </Text>
                </Stack>
              </Stack>
            </Card>

            {/* Step 5 */}
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
                <Group gap="lg" align="flex-start">
                  <ThemeIcon
                    size={60}
                    radius={16}
                    style={{
                      background: '#F5F5F5',
                      color: '#4686FE',
                      border: 'none',
                      flexShrink: 0,
                    }}
                  >
                    <Zap size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Badge
                      size="md"
                      style={{
                        background: 'rgba(70, 134, 254, 0.1)',
                        color: '#4686FE',
                        border: 'none',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      Step 5
                    </Badge>
                    <Text
                      style={{
                        fontFamily: 'Inter Display, sans-serif',
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#000000',
                      }}
                    >
                      Build Success Habits
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
                      Establish daily and weekly habits that support your objectives.
                    </Text>
                  </Stack>
                </Group>

                <Divider />

                <Stack gap="lg" pl="md">
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#000000',
                    }}
                  >
                    What to do:
                  </Text>
                  <Stack gap="xs">
                    <Text
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        color: '#666666',
                        lineHeight: '24px',
                      }}
                    >
                      • Create 3-5 keystone habits that support multiple objectives
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
                      • Start small (e.g., "Meditate for 5 minutes" vs "Meditate for 1 hour")
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
                      • Set specific times and triggers for each habit
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
                      • Link habits to your life areas and OKRs
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
                      • Enable habit tracking and streaks for motivation
                    </Text>
                  </Stack>

                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#4686FE',
                      marginTop: '8px',
                    }}
                  >
                    ⏱️ Time needed: 10 minutes
                  </Text>
                </Stack>
              </Stack>
            </Card>

            {/* Step 6 */}
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
                <Group gap="lg" align="flex-start">
                  <ThemeIcon
                    size={60}
                    radius={16}
                    style={{
                      background: '#F5F5F5',
                      color: '#4686FE',
                      border: 'none',
                      flexShrink: 0,
                    }}
                  >
                    <Calendar size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Badge
                      size="md"
                      style={{
                        background: 'rgba(70, 134, 254, 0.1)',
                        color: '#4686FE',
                        border: 'none',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      Step 6
                    </Badge>
                    <Text
                      style={{
                        fontFamily: 'Inter Display, sans-serif',
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#000000',
                      }}
                    >
                      Plan Your First Week
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
                      Create actionable tasks and schedule that moves you toward your goals.
                    </Text>
                  </Stack>
                </Group>

                <Divider />

                <Stack gap="lg" pl="md">
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#000000',
                    }}
                  >
                    What to do:
                  </Text>
                  <Stack gap="xs">
                    <Text
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        color: '#666666',
                        lineHeight: '24px',
                      }}
                    >
                      • Break down your key results into specific, actionable tasks
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
                      • Use the Eisenhower Matrix to prioritize tasks (Urgent/Important)
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
                      • Schedule focused work blocks for your most important tasks
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
                      • Plan your habit execution times throughout the week
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
                      • Set up weekly review sessions to track progress
                    </Text>
                  </Stack>

                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#4686FE',
                      marginTop: '8px',
                    }}
                  >
                    ⏱️ Time needed: 12 minutes
                  </Text>
                </Stack>
              </Stack>
            </Card>

            {/* Step 7 */}
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
                <Group gap="lg" align="flex-start">
                  <ThemeIcon
                    size={60}
                    radius={16}
                    style={{
                      background: '#F5F5F5',
                      color: '#4686FE',
                      border: 'none',
                      flexShrink: 0,
                    }}
                  >
                    <BarChart size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Badge
                      size="md"
                      style={{
                        background: 'rgba(70, 134, 254, 0.1)',
                        color: '#4686FE',
                        border: 'none',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      Step 7
                    </Badge>
                    <Text
                      style={{
                        fontFamily: 'Inter Display, sans-serif',
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#000000',
                      }}
                    >
                      Set Up Tracking & Reviews
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
                      Establish systems to monitor progress and course-correct as needed.
                    </Text>
                  </Stack>
                </Group>

                <Divider />

                <Stack gap="lg" pl="md">
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#000000',
                    }}
                  >
                    What to do:
                  </Text>
                  <Stack gap="xs">
                    <Text
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        color: '#666666',
                        lineHeight: '24px',
                      }}
                    >
                      • Configure your dashboard to show key metrics and progress
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
                      • Set up automated progress tracking for quantifiable goals
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
                      • Schedule daily check-ins (5 minutes) and weekly reviews (30 minutes)
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
                      • Enable analytics to understand your performance patterns
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
                      • Create alerts for important deadlines and milestones
                    </Text>
                  </Stack>

                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#4686FE',
                      marginTop: '8px',
                    }}
                  >
                    ⏱️ Time needed: 8 minutes
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Stack>

          {/* Pro Tips */}
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
              Pro Tips for Success
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
                    <CheckCircle2 size={24} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: 'Inter Display, sans-serif',
                        fontSize: '20px',
                        fontWeight: 600,
                        color: '#000000',
                      }}
                    >
                      Start Small, Think Big
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
                      It's better to consistently achieve smaller goals than to fail at overly ambitious ones.
                      Build momentum with early wins.
                    </Text>
                  </Stack>
                </Group>
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
                        fontSize: '20px',
                        fontWeight: 600,
                        color: '#000000',
                      }}
                    >
                      Weekly Reviews Are Key
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
                      Schedule a 30-minute weekly review every Sunday. Celebrate wins, analyze obstacles, and adjust your plans.
                    </Text>
                  </Stack>
                </Group>
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
                    <Heart size={24} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: 'Inter Display, sans-serif',
                        fontSize: '20px',
                        fontWeight: 600,
                        color: '#000000',
                      }}
                    >
                      Connect Everything to Values
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
                      When goals align with your core values, motivation becomes automatic. Always ask: "Why does this matter to me?"
                    </Text>
                  </Stack>
                </Group>
              </Card>
            </Stack>
          </Stack>

          {/* Next Steps */}
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
              <Text
                style={{
                  fontFamily: 'Inter Display, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#000000',
                  textAlign: 'center',
                }}
              >
                Ready to Begin Your Excellence Journey?
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
                You now have everything you need to start using Cherut effectively. Remember, the system is only as powerful
                as your commitment to using it consistently.
              </Text>
              <Group gap="lg">
                <Button
                  component="a"
                  href="/auth/register"
                  size="lg"
                  rightSection={<ArrowRight size={18} />}
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
                  Sign Up
                </Button>
                <Button
                  component="a"
                  href="/help-center"
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
                  Back to Help Center
                </Button>
              </Group>
            </Stack>
          </Card>

          {/* Support */}
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
              <Text
                style={{
                  fontFamily: 'Inter Display, sans-serif',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#000000',
                }}
              >
                Need Help Getting Started?
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
                Our support team is here to help you succeed. Don't hesitate to reach out if you have questions.
              </Text>
              <Button
                component="a"
                href="mailto:chutzpahcode@gmail.com"
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
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}