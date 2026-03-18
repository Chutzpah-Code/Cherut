'use client';

import { Container, Title, Text, Stack, Card, Group, Badge, ThemeIcon, Box, Button } from '@mantine/core';
import { Briefcase, Users, Zap, Heart, Trophy, Globe, ArrowRight, Mail } from 'lucide-react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function Careers() {
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
              Build the <span style={{ color: '#4686FE' }}>Future</span> with Us
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
              Join a team of exceptional individuals building the world's most comprehensive
              personal excellence platform. Shape the future of human performance.
            </Text>
          </Stack>

          {/* Mission Statement */}
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
                size={64}
                radius={16}
                style={{
                  background: '#4686FE',
                  color: 'white',
                  border: 'none',
                }}
              >
                <Briefcase size={32} />
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
                Our Mission
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
                We're building more than just software - we're creating a movement. Our mission is to empower
                every ambitious individual with the tools and insights they need to achieve extraordinary results
                and live their highest potential.
              </Text>
            </Stack>
          </Card>

          {/* Why Work With Us */}
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
              Why Work with Cherut?
            </Title>

            <Stack gap="lg">
              {[
                {
                  icon: Trophy,
                  title: 'Elite Performance Culture',
                  description: 'We practice what we preach. Our team uses Cherut daily and embodies the principles of high performance in everything we do. You\'ll work alongside passionate, driven individuals committed to excellence.',
                },
                {
                  icon: Zap,
                  title: 'Cutting-Edge Innovation',
                  description: 'Work with the latest technologies and methodologies. From AI-powered insights to revolutionary UX design, you\'ll be at the forefront of performance technology innovation.',
                },
                {
                  icon: Users,
                  title: 'Meaningful Impact',
                  description: 'Your work directly impacts thousands of high achievers worldwide. Build features that help entrepreneurs scale businesses, athletes break records, and leaders drive change.',
                },
                {
                  icon: Heart,
                  title: 'Personal Growth Focus',
                  description: 'We invest heavily in your development. Access to premium learning resources, mentorship from industry leaders, and dedicated time for skill development and personal projects.',
                },
                {
                  icon: Globe,
                  title: 'Global Remote Culture',
                  description: 'Work from anywhere with a fully distributed team spanning multiple time zones. Flexibility to design your optimal work environment and schedule.',
                },
              ].map((benefit, index) => (
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
                      <benefit.icon size={24} />
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
                        {benefit.title}
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
                        {benefit.description}
                      </Text>
                    </Stack>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Stack>

          {/* Current Status */}
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
              <Badge
                size="lg"
                style={{
                  background: 'rgba(250, 173, 24, 0.1)',
                  color: '#FAAD18',
                  border: 'none',
                  padding: '8px 16px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                Pre-Launch Phase
              </Badge>
              <Title
                order={3}
                ta="center"
                style={{
                  fontFamily: 'Inter Display, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#000000',
                }}
              >
                Building Our Core Team
              </Title>
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
                We're currently in our pre-launch phase, carefully building our core team of exceptional
                individuals. While we don't have open positions right now, we're always looking for
                extraordinary talent to join our mission.
              </Text>
            </Stack>
          </Card>

          {/* What We Look For */}
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
              What We Look For
            </Title>

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
                <Title
                  order={3}
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#4686FE',
                  }}
                >
                  Core Traits
                </Title>
                <Stack gap="md">
                  {[
                    { label: 'Excellence Mindset', description: 'You\'re not satisfied with "good enough" - you strive for mastery in everything you do' },
                    { label: 'Growth Orientation', description: 'You see challenges as opportunities and are constantly learning and evolving' },
                    { label: 'Impact Focus', description: 'You want your work to matter and make a meaningful difference in people\'s lives' },
                    { label: 'Collaborative Spirit', description: 'You thrive in team environments and lift others up while pursuing excellence' },
                    { label: 'User-Centric Thinking', description: 'You deeply understand and empathize with our ambitious user base' },
                  ].map((trait, index) => (
                    <Text
                      key={index}
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        color: '#666666',
                        lineHeight: '24px',
                      }}
                    >
                      • <span style={{ fontWeight: 600, color: '#000000' }}>{trait.label}:</span> {trait.description}
                    </Text>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Stack>

          {/* Future Roles */}
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
              Future Opportunities
            </Title>

            <Text
              ta="center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '18px',
                lineHeight: '26px',
                color: '#666666',
                fontWeight: 400,
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              As we grow, we'll be looking for exceptional talent in these areas:
            </Text>

            <Stack gap="md">
              {[
                { role: 'Senior Full-Stack Engineers', category: 'Engineering', color: '#4686FE' },
                { role: 'Product Designers (UX/UI)', category: 'Design', color: '#A855F7' },
                { role: 'Performance Psychology Specialists', category: 'Research', color: '#22C55E' },
                { role: 'AI/ML Engineers', category: 'AI/ML', color: '#FAAD18' },
                { role: 'Growth & Marketing Leads', category: 'Marketing', color: '#EC4899' },
              ].map((job, index) => (
                <Card
                  key={index}
                  padding="lg"
                  radius={16}
                  style={{
                    background: 'white',
                    border: '1px solid #CCCCCC',
                    boxShadow: 'none',
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Text
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#000000',
                      }}
                    >
                      {job.role}
                    </Text>
                    <Badge
                      size="sm"
                      style={{
                        background: `${job.color}20`,
                        color: job.color,
                        border: 'none',
                      }}
                    >
                      {job.category}
                    </Badge>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Stack>

          {/* Get in Touch */}
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
              <Title
                order={3}
                ta="center"
                style={{
                  fontFamily: 'Inter Display, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#000000',
                }}
              >
                Ready to Shape the Future?
              </Title>
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
                Even if we don't have open positions right now, we'd love to hear from exceptional
                individuals who share our vision. Send us your story, and let's explore how we
                can build something extraordinary together.
              </Text>
              <Group gap="lg" justify="center">
                <Button
                  component="a"
                  href="mailto:chutzpahcode@gmail.com"
                  size="lg"
                  rightSection={<Mail size={20} />}
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
                  Get in Touch
                </Button>
                <Button
                  component="a"
                  href="/contact"
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