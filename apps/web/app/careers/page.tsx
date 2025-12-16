import { Container, Title, Text, Stack, Card, Group, Badge, ThemeIcon, Box, Button } from '@mantine/core';
import { Briefcase, Users, Zap, Heart, Trophy, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function Careers() {
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
              Build the Future with Us
            </Title>
            <Text size="xl" ta="center" maw={700} style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
              Join a team of exceptional individuals building the world's most comprehensive
              personal excellence platform. Shape the future of human performance.
            </Text>
          </Stack>

          {/* Mission Statement */}
          <Card padding="xl" radius={24} style={{ background: 'rgba(49, 67, 182, 0.05)', border: '2px solid rgba(49, 67, 182, 0.15)' }}>
            <Stack align="center" gap="lg">
              <ThemeIcon size={80} radius={20} style={{ background: 'linear-gradient(135deg, #3143B6 0%, #A855F7 100%)', color: 'white' }}>
                <Briefcase size={40} />
              </ThemeIcon>
              <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
                Our Mission
              </Title>
              <Text size="lg" ta="center" maw={800} style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
                We're building more than just software - we're creating a movement. Our mission is to empower
                every ambitious individual with the tools and insights they need to achieve extraordinary results
                and live their highest potential.
              </Text>
            </Stack>
          </Card>

          {/* Why Work With Us */}
          <Stack gap="xl">
            <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
              Why Work with Cherut?
            </Title>

            <Stack gap="lg">
              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(49, 67, 182, 0.15)' }}>
                <Group gap="lg">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(49, 67, 182, 0.1)', color: '#3143B6' }}>
                    <Trophy size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text size="lg" fw={700}>Elite Performance Culture</Text>
                    <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                      We practice what we preach. Our team uses Cherut daily and embodies the principles of
                      high performance in everything we do. You'll work alongside passionate, driven individuals
                      committed to excellence.
                    </Text>
                  </Stack>
                </Group>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(168, 85, 247, 0.15)' }}>
                <Group gap="lg">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                    <Zap size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text size="lg" fw={700}>Cutting-Edge Innovation</Text>
                    <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                      Work with the latest technologies and methodologies. From AI-powered insights to
                      revolutionary UX design, you'll be at the forefront of performance technology innovation.
                    </Text>
                  </Stack>
                </Group>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(47, 178, 100, 0.15)' }}>
                <Group gap="lg">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(47, 178, 100, 0.1)', color: '#2FB264' }}>
                    <Users size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text size="lg" fw={700}>Meaningful Impact</Text>
                    <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                      Your work directly impacts thousands of high achievers worldwide. Build features that
                      help entrepreneurs scale businesses, athletes break records, and leaders drive change.
                    </Text>
                  </Stack>
                </Group>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(250, 173, 24, 0.15)' }}>
                <Group gap="lg">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(250, 173, 24, 0.1)', color: '#FAAD18' }}>
                    <Heart size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text size="lg" fw={700}>Personal Growth Focus</Text>
                    <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                      We invest heavily in your development. Access to premium learning resources, mentorship
                      from industry leaders, and dedicated time for skill development and personal projects.
                    </Text>
                  </Stack>
                </Group>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(236, 72, 153, 0.15)' }}>
                <Group gap="lg">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899' }}>
                    <Globe size={32} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text size="lg" fw={700}>Global Remote Culture</Text>
                    <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                      Work from anywhere with a fully distributed team spanning multiple time zones.
                      Flexibility to design your optimal work environment and schedule.
                    </Text>
                  </Stack>
                </Group>
              </Card>
            </Stack>
          </Stack>

          {/* Current Status */}
          <Card padding="xl" radius={20} style={{ background: 'rgba(250, 173, 24, 0.05)', border: '2px solid rgba(250, 173, 24, 0.2)' }}>
            <Stack align="center" gap="lg">
              <Badge size="xl" color="yellow" variant="light">
                Pre-Launch Phase
              </Badge>
              <Title order={3} ta="center" style={{ fontSize: '24px', fontWeight: 700 }}>
                Building Our Core Team
              </Title>
              <Text ta="center" maw={700} style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
                We're currently in our pre-launch phase, carefully building our core team of exceptional
                individuals. While we don't have open positions right now, we're always looking for
                extraordinary talent to join our mission.
              </Text>
            </Stack>
          </Card>

          {/* What We Look For */}
          <Stack gap="xl">
            <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
              What We Look For
            </Title>

            <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <Stack gap="lg">
                <Title order={3} style={{ fontSize: '20px', fontWeight: 600, color: '#3143B6' }}>
                  Core Traits
                </Title>
                <Stack gap="md">
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    • <strong>Excellence Mindset:</strong> You're not satisfied with "good enough" - you strive for mastery in everything you do
                  </Text>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    • <strong>Growth Orientation:</strong> You see challenges as opportunities and are constantly learning and evolving
                  </Text>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    • <strong>Impact Focus:</strong> You want your work to matter and make a meaningful difference in people's lives
                  </Text>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    • <strong>Collaborative Spirit:</strong> You thrive in team environments and lift others up while pursuing excellence
                  </Text>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    • <strong>User-Centric Thinking:</strong> You deeply understand and empathize with our ambitious user base
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Stack>

          {/* Future Roles */}
          <Stack gap="xl">
            <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
              Future Opportunities
            </Title>

            <Text ta="center" maw={600} mx="auto" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
              As we grow, we'll be looking for exceptional talent in these areas:
            </Text>

            <Stack gap="md">
              <Card padding="lg" radius={16} style={{ background: 'rgba(49, 67, 182, 0.03)', border: '1px solid rgba(49, 67, 182, 0.1)' }}>
                <Group justify="space-between">
                  <Text fw={600}>Senior Full-Stack Engineers</Text>
                  <Badge size="sm" color="blue" variant="light">Engineering</Badge>
                </Group>
              </Card>

              <Card padding="lg" radius={16} style={{ background: 'rgba(168, 85, 247, 0.03)', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
                <Group justify="space-between">
                  <Text fw={600}>Product Designers (UX/UI)</Text>
                  <Badge size="sm" color="grape" variant="light">Design</Badge>
                </Group>
              </Card>

              <Card padding="lg" radius={16} style={{ background: 'rgba(47, 178, 100, 0.03)', border: '1px solid rgba(47, 178, 100, 0.1)' }}>
                <Group justify="space-between">
                  <Text fw={600}>Performance Psychology Specialists</Text>
                  <Badge size="sm" color="green" variant="light">Research</Badge>
                </Group>
              </Card>

              <Card padding="lg" radius={16} style={{ background: 'rgba(250, 173, 24, 0.03)', border: '1px solid rgba(250, 173, 24, 0.1)' }}>
                <Group justify="space-between">
                  <Text fw={600}>AI/ML Engineers</Text>
                  <Badge size="sm" color="yellow" variant="light">AI/ML</Badge>
                </Group>
              </Card>

              <Card padding="lg" radius={16} style={{ background: 'rgba(236, 72, 153, 0.03)', border: '1px solid rgba(236, 72, 153, 0.1)' }}>
                <Group justify="space-between">
                  <Text fw={600}>Growth & Marketing Leads</Text>
                  <Badge size="sm" color="pink" variant="light">Marketing</Badge>
                </Group>
              </Card>
            </Stack>
          </Stack>

          {/* Get in Touch */}
          <Card padding="xl" radius={20} style={{ background: 'rgba(49, 67, 182, 0.05)', border: '2px solid rgba(49, 67, 182, 0.2)' }}>
            <Stack align="center" gap="lg">
              <Title order={3} ta="center">Ready to Shape the Future?</Title>
              <Text ta="center" maw={700} style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.7 }}>
                Even if we don't have open positions right now, we'd love to hear from exceptional
                individuals who share our vision. Send us your story, and let's explore how we
                can build something extraordinary together.
              </Text>
              <Group gap="md">
                <Button
                  component="a"
                  href="mailto:chutzpahcode@gmail.com"
                  size="lg"
                  radius={12}
                  rightSection={<ArrowRight size={18} />}
                  style={{
                    background: '#3143B6',
                    border: 'none',
                    fontWeight: 600,
                  }}
                >
                  Get in Touch
                </Button>
                <Button
                  component={Link}
                  href="/contact"
                  size="lg"
                  radius={12}
                  variant="outline"
                  style={{
                    borderColor: '#3143B6',
                    color: '#3143B6',
                    fontWeight: 600,
                  }}
                >
                  Contact Us
                </Button>
              </Group>
            </Stack>
          </Card>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}