'use client';

import { Container, Title, Text, Stack, Card, Group, Button, SimpleGrid, ThemeIcon, Box, Badge } from '@mantine/core';
import { Mail, MessageSquare, Clock, Users, HelpCircle } from 'lucide-react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function Contact() {
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
              Contact <span style={{ color: '#4686FE' }}>Us</span>
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
              Have questions, feedback, or need support? We'd love to hear from you.
              Our team is here to help you achieve extraordinary results.
            </Text>
          </Stack>

          {/* Contact Methods */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
            <Card
              padding="xl"
              radius={16}
              style={{
                background: 'white',
                border: '1px solid #CCCCCC',
                boxShadow: 'none',
                textAlign: 'center',
                height: '100%',
              }}
            >
              <Stack align="center" gap="lg" h="100%">
                <ThemeIcon
                  size={64}
                  radius={16}
                  style={{
                    background: '#F5F5F5',
                    color: '#4686FE',
                    border: 'none',
                  }}
                >
                  <Mail size={32} />
                </ThemeIcon>
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#000000',
                  }}
                >
                  Email
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
                  chutzpahcode@gmail.com
                </Text>
              </Stack>
            </Card>

            <Card
              component="a"
              href="https://discord.gg/AyjZ58KXGy"
              target="_blank"
              padding="xl"
              radius={16}
              style={{
                background: 'white',
                border: '1px solid #CCCCCC',
                boxShadow: 'none',
                textAlign: 'center',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                height: '100%',
              }}
              styles={{
                root: {
                  '&:hover': {
                    borderColor: '#4686FE',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }
                }
              }}
            >
              <Stack align="center" gap="lg" h="100%">
                <ThemeIcon
                  size={64}
                  radius={16}
                  style={{
                    background: '#F5F5F5',
                    color: '#4686FE',
                    border: 'none',
                  }}
                >
                  <Users size={32} />
                </ThemeIcon>
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#000000',
                  }}
                >
                  Community
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
                  Join Discord
                </Text>
              </Stack>
            </Card>

            <Card
              component="a"
              href="mailto:chutzpahcode@gmail.com"
              padding="xl"
              radius={16}
              style={{
                background: 'white',
                border: '1px solid #CCCCCC',
                boxShadow: 'none',
                textAlign: 'center',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                height: '100%',
              }}
              styles={{
                root: {
                  '&:hover': {
                    borderColor: '#4686FE',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }
                }
              }}
            >
              <Stack align="center" gap="lg" h="100%">
                <ThemeIcon
                  size={64}
                  radius={16}
                  style={{
                    background: '#F5F5F5',
                    color: '#4686FE',
                    border: 'none',
                  }}
                >
                  <HelpCircle size={32} />
                </ThemeIcon>
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#000000',
                  }}
                >
                  Support
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
                  Get help
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius={16}
              style={{
                background: 'white',
                border: '1px solid #CCCCCC',
                boxShadow: 'none',
                textAlign: 'center',
                height: '100%',
              }}
            >
              <Stack align="center" gap="lg" h="100%">
                <ThemeIcon
                  size={64}
                  radius={16}
                  style={{
                    background: '#F5F5F5',
                    color: '#4686FE',
                    border: 'none',
                  }}
                >
                  <Clock size={32} />
                </ThemeIcon>
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#000000',
                  }}
                >
                  Response Time
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
                  Within 24 hours
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>

          {/* Contact Info */}
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
                  size={60}
                  radius={16}
                  style={{
                    background: '#F5F5F5',
                    color: '#4686FE',
                    border: 'none',
                    flexShrink: 0,
                  }}
                >
                  <MessageSquare size={28} />
                </ThemeIcon>
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#000000',
                    }}
                  >
                    General Inquiries
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
                    For general questions about Cherut, pricing, or features.
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#4686FE',
                      lineHeight: '24px',
                    }}
                  >
                    chutzpahcode@gmail.com
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
                  size={60}
                  radius={16}
                  style={{
                    background: '#F5F5F5',
                    color: '#4686FE',
                    border: 'none',
                    flexShrink: 0,
                  }}
                >
                  <HelpCircle size={28} />
                </ThemeIcon>
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#000000',
                    }}
                  >
                    Technical Support
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
                    Need help with your account, bugs, or technical issues?
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#4686FE',
                      lineHeight: '24px',
                    }}
                  >
                    chutzpahcode@gmail.com
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
                  size={60}
                  radius={16}
                  style={{
                    background: '#F5F5F5',
                    color: '#4686FE',
                    border: 'none',
                    flexShrink: 0,
                  }}
                >
                  <Users size={28} />
                </ThemeIcon>
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#000000',
                    }}
                  >
                    Partnership & Media
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
                    Interested in partnerships, press inquiries, or media coverage?
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#4686FE',
                      lineHeight: '24px',
                    }}
                  >
                    chutzpahcode@gmail.com
                  </Text>
                </Stack>
              </Group>
            </Card>
          </Stack>

          {/* Quick Links */}
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
              Looking for Something Specific?
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
              <Card
                component="a"
                href="/help-center"
                padding="xl"
                radius={16}
                style={{
                  background: 'white',
                  border: '1px solid #CCCCCC',
                  boxShadow: 'none',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  height: '100%',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      borderColor: '#4686FE',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    }
                  }
                }}
              >
                <Stack align="center" gap="lg" h="100%">
                  <ThemeIcon
                    size={64}
                    radius={16}
                    style={{
                      background: '#F5F5F5',
                      color: '#4686FE',
                      border: 'none',
                    }}
                  >
                    <HelpCircle size={32} />
                  </ThemeIcon>
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#000000',
                      textAlign: 'center',
                    }}
                  >
                    Help Center
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#666666',
                      lineHeight: '24px',
                      textAlign: 'center',
                    }}
                  >
                    Browse FAQs, guides, and tutorials
                  </Text>
                </Stack>
              </Card>

              <Card
                component="a"
                href="/careers"
                padding="xl"
                radius={16}
                style={{
                  background: 'white',
                  border: '1px solid #CCCCCC',
                  boxShadow: 'none',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  height: '100%',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      borderColor: '#4686FE',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    }
                  }
                }}
              >
                <Stack align="center" gap="lg" h="100%">
                  <ThemeIcon
                    size={64}
                    radius={16}
                    style={{
                      background: '#F5F5F5',
                      color: '#4686FE',
                      border: 'none',
                    }}
                  >
                    <Users size={32} />
                  </ThemeIcon>
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#000000',
                      textAlign: 'center',
                    }}
                  >
                    Careers
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#666666',
                      lineHeight: '24px',
                      textAlign: 'center',
                    }}
                  >
                    Join our team and build the future
                  </Text>
                </Stack>
              </Card>

              <Card
                component="a"
                href="mailto:chutzpahcode@gmail.com"
                padding="xl"
                radius={16}
                style={{
                  background: 'white',
                  border: '1px solid #CCCCCC',
                  boxShadow: 'none',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  height: '100%',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      borderColor: '#4686FE',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    }
                  }
                }}
              >
                <Stack align="center" gap="lg" h="100%">
                  <ThemeIcon
                    size={64}
                    radius={16}
                    style={{
                      background: '#F5F5F5',
                      color: '#4686FE',
                      border: 'none',
                    }}
                  >
                    <MessageSquare size={32} />
                  </ThemeIcon>
                  <Text
                    style={{
                      fontFamily: 'Inter Display, sans-serif',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#000000',
                      textAlign: 'center',
                    }}
                  >
                    Send Feedback
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#666666',
                      lineHeight: '24px',
                      textAlign: 'center',
                    }}
                  >
                    Help us improve Cherut
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>

          {/* Beta Notice */}
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
                Beta Testing Period
              </Badge>
              <Text
                style={{
                  fontFamily: 'Inter Display, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#000000',
                  textAlign: 'center',
                }}
              >
                Your Feedback Shapes Our Future
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
                During our beta phase, your input is incredibly valuable. Whether you've found a bug,
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