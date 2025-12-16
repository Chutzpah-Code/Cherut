'use client';

import { Container, Title, Text, Stack, Card, Group, Button, SimpleGrid, ThemeIcon, Box, Badge } from '@mantine/core';
import { Mail, MessageSquare, Clock, Users, HelpCircle } from 'lucide-react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function Contact() {
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
              Contact Us
            </Title>
            <Text size="xl" ta="center" maw={700} style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
              Have questions, feedback, or need support? We&apos;d love to hear from you.
              Our team is here to help you achieve extraordinary results.
            </Text>
          </Stack>

          {/* Contact Methods */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
            <Card padding="xl" radius={20} style={{ background: 'rgba(49, 67, 182, 0.05)', border: '1px solid rgba(49, 67, 182, 0.15)', textAlign: 'center' }}>
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius={16} style={{ background: 'rgba(49, 67, 182, 0.1)', color: '#3143B6' }}>
                  <Mail size={32} />
                </ThemeIcon>
                <Text fw={700}>Email</Text>
                <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                  chutzpahcode@gmail.com
                </Text>
              </Stack>
            </Card>

            <Card padding="xl" radius={20} style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.15)', textAlign: 'center' }}>
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius={16} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                  <Users size={32} />
                </ThemeIcon>
                <Text fw={700}>Community</Text>
                <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                  chutzpahcode@gmail.com
                </Text>
              </Stack>
            </Card>

            <Card padding="xl" radius={20} style={{ background: 'rgba(47, 178, 100, 0.05)', border: '1px solid rgba(47, 178, 100, 0.15)', textAlign: 'center' }}>
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius={16} style={{ background: 'rgba(47, 178, 100, 0.1)', color: '#2FB264' }}>
                  <HelpCircle size={32} />
                </ThemeIcon>
                <Text fw={700}>Support</Text>
                <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                  chutzpahcode@gmail.com
                </Text>
              </Stack>
            </Card>

            <Card padding="xl" radius={20} style={{ background: 'rgba(250, 173, 24, 0.05)', border: '1px solid rgba(250, 173, 24, 0.15)', textAlign: 'center' }}>
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius={16} style={{ background: 'rgba(250, 173, 24, 0.1)', color: '#FAAD18' }}>
                  <Clock size={32} />
                </ThemeIcon>
                <Text fw={700}>Response Time</Text>
                <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                  Within 24 hours
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>

          {/* Contact Info */}
          <Stack gap="lg">
            <Card padding="xl" radius={20} style={{ background: 'rgba(49, 67, 182, 0.05)', border: '2px solid rgba(49, 67, 182, 0.15)' }}>
                <Stack gap="lg">
                  <Group gap="md">
                    <ThemeIcon size={50} radius={16} style={{ background: 'rgba(49, 67, 182, 0.1)', color: '#3143B6' }}>
                      <MessageSquare size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Text fw={700} size="lg">General Inquiries</Text>
                      <Text style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                        For general questions about Cherut, pricing, or features.
                      </Text>
                      <Text fw={600} style={{ color: '#3143B6' }}>
                        chutzpahcode@gmail.com
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'rgba(168, 85, 247, 0.05)', border: '2px solid rgba(168, 85, 247, 0.15)' }}>
                <Stack gap="lg">
                  <Group gap="md">
                    <ThemeIcon size={50} radius={16} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                      <HelpCircle size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Text fw={700} size="lg">Technical Support</Text>
                      <Text style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                        Need help with your account, bugs, or technical issues?
                      </Text>
                      <Text fw={600} style={{ color: '#A855F7' }}>
                        chutzpahcode@gmail.com
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'rgba(47, 178, 100, 0.05)', border: '2px solid rgba(47, 178, 100, 0.15)' }}>
                <Stack gap="lg">
                  <Group gap="md">
                    <ThemeIcon size={50} radius={16} style={{ background: 'rgba(47, 178, 100, 0.1)', color: '#2FB264' }}>
                      <Users size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Text fw={700} size="lg">Partnership & Media</Text>
                      <Text style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                        Interested in partnerships, press inquiries, or media coverage?
                      </Text>
                      <Text fw={600} style={{ color: '#2FB264' }}>
                        chutzpahcode@gmail.com
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'rgba(168, 85, 247, 0.05)', border: '2px solid rgba(168, 85, 247, 0.15)' }}>
                <Stack gap="lg">
                  <Group gap="md">
                    <ThemeIcon size={50} radius={16} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                      <HelpCircle size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Text fw={700} size="lg">Technical Support</Text>
                      <Text style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                        Need help with your account, bugs, or technical issues?
                      </Text>
                      <Text fw={600} style={{ color: '#A855F7' }}>
                        chutzpahcode@gmail.com
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'rgba(47, 178, 100, 0.05)', border: '2px solid rgba(47, 178, 100, 0.15)' }}>
                <Stack gap="lg">
                  <Group gap="md">
                    <ThemeIcon size={50} radius={16} style={{ background: 'rgba(47, 178, 100, 0.1)', color: '#2FB264' }}>
                      <Users size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Text fw={700} size="lg">Partnership & Media</Text>
                      <Text style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                        Interested in partnerships, press inquiries, or media coverage?
                      </Text>
                      <Text fw={600} style={{ color: '#2FB264' }}>
                        chutzpahcode@gmail.com
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
              </Card>
            </Stack>

          {/* Quick Links */}
          <Stack gap="xl">
            <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
              Looking for Something Specific?
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
              <Card
                component="a"
                href="/help-center"
                padding="xl"
                radius={20}
                style={{
                  background: 'white',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                    }
                  }
                }}
              >
                <Stack align="center" gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(49, 67, 182, 0.1)', color: '#3143B6' }}>
                    <HelpCircle size={32} />
                  </ThemeIcon>
                  <Text fw={700} ta="center">Help Center</Text>
                  <Text size="sm" ta="center" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                    Browse FAQs, guides, and tutorials
                  </Text>
                </Stack>
              </Card>

              <Card
                component="a"
                href="/careers"
                padding="xl"
                radius={20}
                style={{
                  background: 'white',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                    }
                  }
                }}
              >
                <Stack align="center" gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                    <Users size={32} />
                  </ThemeIcon>
                  <Text fw={700} ta="center">Careers</Text>
                  <Text size="sm" ta="center" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                    Join our team and build the future
                  </Text>
                </Stack>
              </Card>

              <Card
                component="a"
                href="mailto:chutzpahcode@gmail.com"
                padding="xl"
                radius={20}
                style={{
                  background: 'white',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                    }
                  }
                }}
              >
                <Stack align="center" gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(47, 178, 100, 0.1)', color: '#2FB264' }}>
                    <MessageSquare size={32} />
                  </ThemeIcon>
                  <Text fw={700} ta="center">Send Feedback</Text>
                  <Text size="sm" ta="center" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                    Help us improve Cherut
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>

          {/* Beta Notice */}
          <Card padding="xl" radius={20} style={{ background: 'rgba(250, 173, 24, 0.05)', border: '2px solid rgba(250, 173, 24, 0.2)' }}>
            <Stack align="center" gap="md">
              <Badge size="lg" color="yellow" variant="light">
                Beta Testing Period
              </Badge>
              <Title order={3} ta="center">Your Feedback Shapes Our Future</Title>
              <Text ta="center" maw={700} style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.7 }}>
                During our beta phase, your input is incredibly valuable. Whether you&apos;ve found a bug,
                have a feature request, or just want to share your experience, we want to hear from you.
                Every piece of feedback helps us build a better Cherut.
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}