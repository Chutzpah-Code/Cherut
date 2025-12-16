import { Container, Title, Text, Stack, Card, Group, ThemeIcon, Box, Badge, Button, Divider } from '@mantine/core';
import { CheckCircle2, Target, Calendar, Zap, Heart, BarChart, BookOpen, Star, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function GettingStarted() {
  return (
    <Box style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 50%, #ffffff 100%)' }}>
      <Header />

      <Container size="lg" py={80} style={{ marginTop: '100px' }}>
        <Stack gap={80}>
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
              Getting Started with Cherut
            </Title>
            <Text size="xl" ta="center" maw={700} style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
              Follow this step-by-step guide to set up your personal excellence system and
              start achieving extraordinary results.
            </Text>
            <Badge size="xl" color="green" variant="light">
              Complete Onboarding Guide
            </Badge>
          </Stack>

          {/* Overview */}
          <Card padding="xl" radius={24} style={{ background: 'rgba(49, 67, 182, 0.05)', border: '2px solid rgba(49, 67, 182, 0.15)' }}>
            <Stack align="center" gap="lg">
              <ThemeIcon size={80} radius={20} style={{ background: 'linear-gradient(135deg, #3143B6 0%, #A855F7 100%)', color: 'white' }}>
                <BookOpen size={40} />
              </ThemeIcon>
              <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
                Your Journey to Excellence
              </Title>
              <Text size="lg" ta="center" maw={800} style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
                Cherut is designed to help you achieve peak performance across all areas of your life.
                This guide will walk you through setting up your complete personal excellence system in just 30 minutes.
              </Text>
              <Group gap="md">
                <Badge leftSection={<Clock size={16} />} size="lg" color="blue" variant="light">
                  30 minutes setup
                </Badge>
                <Badge leftSection={<CheckCircle2 size={16} />} size="lg" color="green" variant="light">
                  7 easy steps
                </Badge>
              </Group>
            </Stack>
          </Card>

          {/* Step-by-Step Checklist */}
          <Stack gap="xl">
            <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
              Your Onboarding Checklist
            </Title>

            {/* Step 1 */}
            <Card padding="xl" radius={20} style={{ background: 'white', border: '2px solid rgba(49, 67, 182, 0.15)' }}>
              <Stack gap="lg">
                <Group gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(49, 67, 182, 0.1)', color: '#3143B6' }}>
                    <CheckCircle2 size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Badge size="md" color="blue" variant="light">Step 1</Badge>
                    <Text size="xl" fw={700}>Complete Your Profile</Text>
                    <Text style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                      Set up your account with accurate information to personalize your Cherut experience.
                    </Text>
                  </Stack>
                </Group>

                <Divider style={{ borderColor: 'rgba(49, 67, 182, 0.1)' }} />

                <Stack gap="md" pl="md">
                  <Text fw={600} size="lg">What to do:</Text>
                  <Stack gap="xs">
                    <Text>• Upload a profile photo (helps with motivation and accountability)</Text>
                    <Text>• Set your timezone for accurate scheduling</Text>
                    <Text>• Choose your preferred notification settings</Text>
                    <Text>• Set your working hours for better task planning</Text>
                  </Stack>

                  <Text fw={600} size="sm" style={{ color: '#3143B6', marginTop: '8px' }}>
                    ⏱️ Time needed: 5 minutes
                  </Text>
                </Stack>
              </Stack>
            </Card>

            {/* Step 2 */}
            <Card padding="xl" radius={20} style={{ background: 'white', border: '2px solid rgba(168, 85, 247, 0.15)' }}>
              <Stack gap="lg">
                <Group gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                    <Heart size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Badge size="md" color="grape" variant="light">Step 2</Badge>
                    <Text size="xl" fw={700}>Define Your Core Values</Text>
                    <Text style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                      Establish the fundamental principles that guide your decisions and actions.
                    </Text>
                  </Stack>
                </Group>

                <Divider style={{ borderColor: 'rgba(168, 85, 247, 0.1)' }} />

                <Stack gap="md" pl="md">
                  <Text fw={600} size="lg">What to do:</Text>
                  <Stack gap="xs">
                    <Text>• Navigate to the Values section in your dashboard</Text>
                    <Text>• Choose 3-5 core values that resonate deeply with you</Text>
                    <Text>• Write a brief description for each value explaining what it means to you</Text>
                    <Text>• Rank them in order of importance</Text>
                    <Text>• Use these values as your north star for all decisions</Text>
                  </Stack>

                  <Text fw={600} size="sm" style={{ color: '#A855F7', marginTop: '8px' }}>
                    ⏱️ Time needed: 10 minutes
                  </Text>
                </Stack>
              </Stack>
            </Card>

            {/* Step 3 */}
            <Card padding="xl" radius={20} style={{ background: 'white', border: '2px solid rgba(47, 178, 100, 0.15)' }}>
              <Stack gap="lg">
                <Group gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(47, 178, 100, 0.1)', color: '#2FB264' }}>
                    <Target size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Badge size="md" color="green" variant="light">Step 3</Badge>
                    <Text size="xl" fw={700}>Set Up Your Life Areas</Text>
                    <Text style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                      Organize your goals into key life categories for balanced growth.
                    </Text>
                  </Stack>
                </Group>

                <Divider style={{ borderColor: 'rgba(47, 178, 100, 0.1)' }} />

                <Stack gap="md" pl="md">
                  <Text fw={600} size="lg">What to do:</Text>
                  <Stack gap="xs">
                    <Text>• Create 4-6 life areas (e.g., Health, Career, Relationships, Finance, Personal Growth)</Text>
                    <Text>• Write a vision statement for each area describing your ideal future</Text>
                    <Text>• Assign colors and icons to make them visually distinct</Text>
                    <Text>• Set priority levels for each area based on current focus</Text>
                  </Stack>

                  <Text fw={600} size="sm" style={{ color: '#2FB264', marginTop: '8px' }}>
                    ⏱️ Time needed: 8 minutes
                  </Text>
                </Stack>
              </Stack>
            </Card>

            {/* Step 4 */}
            <Card padding="xl" radius={20} style={{ background: 'white', border: '2px solid rgba(250, 173, 24, 0.15)' }}>
              <Stack gap="lg">
                <Group gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(250, 173, 24, 0.1)', color: '#FAAD18' }}>
                    <Star size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Badge size="md" color="yellow" variant="light">Step 4</Badge>
                    <Text size="xl" fw={700}>Create Your First OKRs</Text>
                    <Text style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                      Set objectives and key results that will drive meaningful progress.
                    </Text>
                  </Stack>
                </Group>

                <Divider style={{ borderColor: 'rgba(250, 173, 24, 0.1)' }} />

                <Stack gap="md" pl="md">
                  <Text fw={600} size="lg">What to do:</Text>
                  <Stack gap="xs">
                    <Text>• Start with 1-2 objectives per life area (keep it focused)</Text>
                    <Text>• Write inspiring, qualitative objectives (e.g., &quot;Achieve exceptional physical fitness&quot;)</Text>
                    <Text>• Add 2-4 measurable key results per objective (e.g., &quot;Run a 10K in under 50 minutes&quot;)</Text>
                    <Text>• Set realistic but challenging targets with specific deadlines</Text>
                    <Text>• Link each OKR to your core values</Text>
                  </Stack>

                  <Text fw={600} size="sm" style={{ color: '#FAAD18', marginTop: '8px' }}>
                    ⏱️ Time needed: 15 minutes
                  </Text>
                </Stack>
              </Stack>
            </Card>

            {/* Step 5 */}
            <Card padding="xl" radius={20} style={{ background: 'white', border: '2px solid rgba(236, 72, 153, 0.15)' }}>
              <Stack gap="lg">
                <Group gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899' }}>
                    <Zap size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Badge size="md" color="pink" variant="light">Step 5</Badge>
                    <Text size="xl" fw={700}>Build Success Habits</Text>
                    <Text style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                      Establish daily and weekly habits that support your objectives.
                    </Text>
                  </Stack>
                </Group>

                <Divider style={{ borderColor: 'rgba(236, 72, 153, 0.1)' }} />

                <Stack gap="md" pl="md">
                  <Text fw={600} size="lg">What to do:</Text>
                  <Stack gap="xs">
                    <Text>• Create 3-5 keystone habits that support multiple objectives</Text>
                    <Text>• Start small (e.g., &quot;Meditate for 5 minutes&quot; vs &quot;Meditate for 1 hour&quot;)</Text>
                    <Text>• Set specific times and triggers for each habit</Text>
                    <Text>• Link habits to your life areas and OKRs</Text>
                    <Text>• Enable habit tracking and streaks for motivation</Text>
                  </Stack>

                  <Text fw={600} size="sm" style={{ color: '#EC4899', marginTop: '8px' }}>
                    ⏱️ Time needed: 10 minutes
                  </Text>
                </Stack>
              </Stack>
            </Card>

            {/* Step 6 */}
            <Card padding="xl" radius={20} style={{ background: 'white', border: '2px solid rgba(6, 182, 212, 0.15)' }}>
              <Stack gap="lg">
                <Group gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4' }}>
                    <Calendar size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Badge size="md" color="cyan" variant="light">Step 6</Badge>
                    <Text size="xl" fw={700}>Plan Your First Week</Text>
                    <Text style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                      Create actionable tasks and schedule that moves you toward your goals.
                    </Text>
                  </Stack>
                </Group>

                <Divider style={{ borderColor: 'rgba(6, 182, 212, 0.1)' }} />

                <Stack gap="md" pl="md">
                  <Text fw={600} size="lg">What to do:</Text>
                  <Stack gap="xs">
                    <Text>• Break down your key results into specific, actionable tasks</Text>
                    <Text>• Use the Eisenhower Matrix to prioritize tasks (Urgent/Important)</Text>
                    <Text>• Schedule focused work blocks for your most important tasks</Text>
                    <Text>• Plan your habit execution times throughout the week</Text>
                    <Text>• Set up weekly review sessions to track progress</Text>
                  </Stack>

                  <Text fw={600} size="sm" style={{ color: '#06B6D4', marginTop: '8px' }}>
                    ⏱️ Time needed: 12 minutes
                  </Text>
                </Stack>
              </Stack>
            </Card>

            {/* Step 7 */}
            <Card padding="xl" radius={20} style={{ background: 'white', border: '2px solid rgba(147, 51, 234, 0.15)' }}>
              <Stack gap="lg">
                <Group gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(147, 51, 234, 0.1)', color: '#9333EA' }}>
                    <BarChart size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Badge size="md" color="violet" variant="light">Step 7</Badge>
                    <Text size="xl" fw={700}>Set Up Tracking & Reviews</Text>
                    <Text style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                      Establish systems to monitor progress and course-correct as needed.
                    </Text>
                  </Stack>
                </Group>

                <Divider style={{ borderColor: 'rgba(147, 51, 234, 0.1)' }} />

                <Stack gap="md" pl="md">
                  <Text fw={600} size="lg">What to do:</Text>
                  <Stack gap="xs">
                    <Text>• Configure your dashboard to show key metrics and progress</Text>
                    <Text>• Set up automated progress tracking for quantifiable goals</Text>
                    <Text>• Schedule daily check-ins (5 minutes) and weekly reviews (30 minutes)</Text>
                    <Text>• Enable analytics to understand your performance patterns</Text>
                    <Text>• Create alerts for important deadlines and milestones</Text>
                  </Stack>

                  <Text fw={600} size="sm" style={{ color: '#9333EA', marginTop: '8px' }}>
                    ⏱️ Time needed: 8 minutes
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Stack>

          {/* Pro Tips */}
          <Stack gap="xl">
            <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
              Pro Tips for Success
            </Title>

            <Stack gap="lg">
              <Card padding="lg" radius={16} style={{ background: 'rgba(47, 178, 100, 0.05)', border: '1px solid rgba(47, 178, 100, 0.2)' }}>
                <Group gap="md">
                  <ThemeIcon size={40} radius={12} style={{ background: 'rgba(47, 178, 100, 0.15)', color: '#2FB264' }}>
                    <CheckCircle2 size={24} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text fw={600}>Start Small, Think Big</Text>
                    <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                      It&apos;s better to consistently achieve smaller goals than to fail at overly ambitious ones.
                      Build momentum with early wins.
                    </Text>
                  </Stack>
                </Group>
              </Card>

              <Card padding="lg" radius={16} style={{ background: 'rgba(49, 67, 182, 0.05)', border: '1px solid rgba(49, 67, 182, 0.2)' }}>
                <Group gap="md">
                  <ThemeIcon size={40} radius={12} style={{ background: 'rgba(49, 67, 182, 0.15)', color: '#3143B6' }}>
                    <Calendar size={24} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text fw={600}>Weekly Reviews Are Key</Text>
                    <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                      Schedule a 30-minute weekly review every Sunday. Celebrate wins, analyze obstacles, and adjust your plans.
                    </Text>
                  </Stack>
                </Group>
              </Card>

              <Card padding="lg" radius={16} style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                <Group gap="md">
                  <ThemeIcon size={40} radius={12} style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7' }}>
                    <Heart size={24} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text fw={600}>Connect Everything to Values</Text>
                    <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                      When goals align with your core values, motivation becomes automatic. Always ask: &quot;Why does this matter to me?&quot;
                    </Text>
                  </Stack>
                </Group>
              </Card>
            </Stack>
          </Stack>

          {/* Next Steps */}
          <Card padding="xl" radius={20} style={{ background: 'rgba(49, 67, 182, 0.05)', border: '2px solid rgba(49, 67, 182, 0.2)' }}>
            <Stack align="center" gap="lg">
              <Title order={3} ta="center">Ready to Begin Your Excellence Journey?</Title>
              <Text ta="center" maw={700} style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.7 }}>
                You now have everything you need to start using Cherut effectively. Remember, the system is only as powerful
                as your commitment to using it consistently.
              </Text>
              <Group gap="md">
                <Button
                  component={Link}
                  href="/auth/register"
                  size="lg"
                  radius={12}
                  rightSection={<ArrowRight size={18} />}
                  style={{
                    background: '#3143B6',
                    border: 'none',
                    fontWeight: 600,
                  }}
                >
                  Sign Up
                </Button>
                <Button
                  component={Link}
                  href="/help-center"
                  size="lg"
                  radius={12}
                  variant="outline"
                  style={{
                    borderColor: '#3143B6',
                    color: '#3143B6',
                    fontWeight: 600,
                  }}
                >
                  Back to Help Center
                </Button>
              </Group>
            </Stack>
          </Card>

          {/* Support */}
          <Card padding="lg" radius={16} style={{ background: 'rgba(250, 173, 24, 0.05)', border: '1px solid rgba(250, 173, 24, 0.2)' }}>
            <Stack align="center" gap="md">
              <Text fw={600} size="lg">Need Help Getting Started?</Text>
              <Text ta="center" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                Our support team is here to help you succeed. Don&apos;t hesitate to reach out if you have questions.
              </Text>
              <Button
                component="a"
                href="mailto:chutzpahcode@gmail.com"
                size="md"
                radius={12}
                style={{ background: '#FAAD18', fontWeight: 600 }}
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