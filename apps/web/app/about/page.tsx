import { Container, Title, Text, Stack, Card, Group, SimpleGrid, ThemeIcon, Box, Avatar, Badge } from '@mantine/core';
import { Target, Heart, Zap, Users, Award, Globe, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function About() {
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
              About Cherut
            </Title>
            <Text size="xl" ta="center" maw={700} style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
              We're building the world's most comprehensive personal excellence platform,
              designed for ambitious individuals who refuse to settle for ordinary.
            </Text>
          </Stack>

          {/* Mission Statement */}
          <Card padding="xl" radius={24} style={{ background: 'rgba(49, 67, 182, 0.05)', border: '2px solid rgba(49, 67, 182, 0.15)' }}>
            <Stack align="center" gap="lg">
              <ThemeIcon size={80} radius={20} style={{ background: 'linear-gradient(135deg, #3143B6 0%, #A855F7 100%)', color: 'white' }}>
                <Target size={40} />
              </ThemeIcon>
              <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
                Our Mission
              </Title>
              <Text size="lg" ta="center" maw={800} style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
                To empower elite performers with the tools, insights, and systems they need to achieve
                extraordinary results across all areas of life. We believe that with the right framework,
                anyone can transform their potential into reality.
              </Text>
            </Stack>
          </Card>

          {/* Core Values */}
          <Stack gap="xl">
            <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
              What Drives Us
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(49, 67, 182, 0.15)', height: '100%' }}>
                <Stack gap="lg" h="100%">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(49, 67, 182, 0.1)', color: '#3143B6' }}>
                    <Zap size={32} />
                  </ThemeIcon>
                  <Text size="lg" fw={700}>Excellence First</Text>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                    We're obsessed with creating tools that don't just work, but work exceptionally well.
                    Every feature is designed with elite performance in mind.
                  </Text>
                </Stack>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(168, 85, 247, 0.15)', height: '100%' }}>
                <Stack gap="lg" h="100%">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                    <Heart size={32} />
                  </ThemeIcon>
                  <Text size="lg" fw={700}>Human-Centered</Text>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                    Technology serves humans, not the other way around. Our platform adapts to your life,
                    values, and goals, creating a truly personal experience.
                  </Text>
                </Stack>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(47, 178, 100, 0.15)', height: '100%' }}>
                <Stack gap="lg" h="100%">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(47, 178, 100, 0.1)', color: '#2FB264' }}>
                    <Globe size={32} />
                  </ThemeIcon>
                  <Text size="lg" fw={700}>Global Impact</Text>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                    By empowering individuals to reach their full potential, we're contributing to a world
                    where excellence becomes the norm, not the exception.
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>

          {/* The Story */}
          <Stack gap="xl">
            <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
              Our Story
            </Title>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
              <Stack gap="lg">
                <Text size="lg" fw={600} style={{ color: '#3143B6' }}>
                  Born from Frustration
                </Text>
                <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
                  Cherut was born from the frustration of using disconnected productivity tools that promised
                  everything but delivered mediocrity. We were tired of jumping between apps, losing track
                  of goals, and feeling like our potential was being wasted on ineffective systems.
                </Text>
                <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
                  We realized that high achievers needed more than just another task manager or habit tracker.
                  They needed a comprehensive system that could handle the complexity of an ambitious life
                  while remaining elegant and intuitive.
                </Text>
              </Stack>

              <Stack gap="lg">
                <Text size="lg" fw={600} style={{ color: '#A855F7' }}>
                  Built for Elite Performance
                </Text>
                <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
                  Every aspect of Cherut is designed with one question in mind: "How would the world's top
                  performers approach this?" From our OKR framework inspired by Google and Intel, to our
                  values-based decision making system, we study excellence to create excellence.
                </Text>
                <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
                  We're not building another productivity app. We're crafting a performance operating system
                  for the next generation of leaders, entrepreneurs, athletes, and change-makers.
                </Text>
              </Stack>
            </SimpleGrid>
          </Stack>

          {/* Why Cherut */}
          <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <Stack gap="lg">
              <Title order={3} ta="center" style={{ fontSize: '24px', fontWeight: 700 }}>
                Why "Cherut"?
              </Title>
              <Text size="md" ta="center" maw={700} mx="auto" style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
                "Cherut" (חרות) is a Hebrew word meaning "freedom" or "liberty" - not just political freedom,
                but the deeper freedom that comes from self-mastery and the ability to shape your own destiny.
                It represents the liberation you feel when you're operating at your highest potential.
              </Text>
              <Text size="md" ta="center" maw={700} mx="auto" style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
                This is the freedom we want to give you - the freedom to pursue your biggest dreams with
                confidence, clarity, and the right tools to make them reality.
              </Text>
            </Stack>
          </Card>

          {/* What Makes Us Different */}
          <Stack gap="xl">
            <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
              What Makes Us Different
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
              <Card padding="xl" radius={20} style={{ background: 'rgba(250, 173, 24, 0.05)', border: '1px solid rgba(250, 173, 24, 0.2)' }}>
                <Stack gap="md">
                  <Group gap="md">
                    <ThemeIcon size={40} radius={12} style={{ background: 'rgba(250, 173, 24, 0.15)', color: '#FAAD18' }}>
                      <Award size={24} />
                    </ThemeIcon>
                    <Text size="lg" fw={700}>No Compromises</Text>
                  </Group>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    We don't build for the masses. We build for people who demand excellence and are willing
                    to invest in their growth. Every feature is crafted for peak performance.
                  </Text>
                </Stack>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'rgba(236, 72, 153, 0.05)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                <Stack gap="md">
                  <Group gap="md">
                    <ThemeIcon size={40} radius={12} style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899' }}>
                      <Users size={24} />
                    </ThemeIcon>
                    <Text size="lg" fw={700}>Community Driven</Text>
                  </Group>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    Our beta community shapes every decision. We listen, iterate, and improve based on
                    real feedback from real high achievers using Cherut daily.
                  </Text>
                </Stack>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <Stack gap="md">
                  <Group gap="md">
                    <ThemeIcon size={40} radius={12} style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' }}>
                      <CheckCircle2 size={24} />
                    </ThemeIcon>
                    <Text size="lg" fw={700}>Holistic Approach</Text>
                  </Group>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    We understand that peak performance isn't just about productivity. It's about aligning
                    your actions with your values and creating sustainable excellence.
                  </Text>
                </Stack>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'rgba(147, 51, 234, 0.05)', border: '1px solid rgba(147, 51, 234, 0.2)' }}>
                <Stack gap="md">
                  <Group gap="md">
                    <ThemeIcon size={40} radius={12} style={{ background: 'rgba(147, 51, 234, 0.15)', color: '#9333EA' }}>
                      <Zap size={24} />
                    </ThemeIcon>
                    <Text size="lg" fw={700}>Future-Ready</Text>
                  </Group>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    We're building for tomorrow's challenges today. Our platform evolves with you and
                    incorporates cutting-edge insights from performance science.
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>

          {/* CTA */}
          <Card padding="xl" radius={20} style={{ background: 'rgba(49, 67, 182, 0.05)', border: '2px solid rgba(49, 67, 182, 0.2)' }}>
            <Stack align="center" gap="md">
              <Title order={3} ta="center">Join the Elite Performance Revolution</Title>
              <Text ta="center" maw={600} style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                Ready to unlock your full potential? Join our beta community and start building
                your elite performance system today.
              </Text>
              <Link href="/auth/register" style={{ textDecoration: 'none' }}>
                <Text style={{ color: '#3143B6', fontWeight: 600, fontSize: '18px' }}>
                  Start Your Journey →
                </Text>
              </Link>
            </Stack>
          </Card>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}