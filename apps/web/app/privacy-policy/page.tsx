'use client';

import { Container, Title, Text, Stack, Card, Group, ThemeIcon, Box, Badge, Divider } from '@mantine/core';
import { Shield, Eye, Lock, Database, Users, FileText } from 'lucide-react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function PrivacyPolicy() {
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
              Privacy <span style={{ color: '#4686FE' }}>Policy</span>
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
              Your privacy and data security are fundamental to everything we do at Cherut.
              Here's how we protect and handle your information.
            </Text>
            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#999999',
              }}
            >
              Last updated: December 15, 2025
            </Text>
          </Stack>

          {/* Privacy Principles */}
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
                <Shield size={40} />
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
                Our Privacy Principles
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
                We believe privacy is a fundamental right. Your personal data belongs to you, and we act as
                its guardian. We collect only what's necessary, protect it rigorously, and never sell it to anyone.
              </Text>
            </Stack>
          </Card>

          {/* Information We Collect */}
          <Stack gap="xl">
            <Title
              order={2}
              style={{
                fontFamily: 'Inter Display, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                color: '#000000',
              }}
            >
              Information We Collect
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
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#000000',
                      }}
                    >
                      Account Information
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
                      When you create an account, we collect your name, email address, and password.
                      This information is necessary to provide you access to your Cherut account and personalize your experience.
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
                    <FileText size={28} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: 'Inter Display, sans-serif',
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#000000',
                      }}
                    >
                      Performance Data
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
                      Your objectives, key results, tasks, habits, journal entries, and other performance-related
                      data you create within Cherut. This is the core of your personal excellence system and
                      remains completely private to you.
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
                    <Eye size={28} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: 'Inter Display, sans-serif',
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#000000',
                      }}
                    >
                      Usage Information
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
                      We collect anonymous usage analytics to improve our platform - things like which features
                      are used most, how users navigate the app, and performance metrics. This data is aggregated
                      and cannot be linked back to individual users.
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
                    <Database size={28} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: 'Inter Display, sans-serif',
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#000000',
                      }}
                    >
                      Technical Information
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
                      Standard technical information like your IP address, browser type, device information,
                      and operating system. This helps us ensure Cherut works optimally across all devices
                      and identify technical issues.
                    </Text>
                  </Stack>
                </Group>
              </Card>
            </Stack>
          </Stack>

          {/* How We Use Your Information */}
          <Stack gap="xl">
            <Title
              order={2}
              style={{
                fontFamily: 'Inter Display, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                color: '#000000',
              }}
            >
              How We Use Your Information
            </Title>

            <Stack gap="lg">
              <Text
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  color: '#666666',
                  lineHeight: '26px',
                }}
              >
                We use your information solely to provide and improve the Cherut service:
              </Text>

              <Stack gap="xs" pl="md">
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    color: '#666666',
                    lineHeight: '24px',
                  }}
                >
                  • <span style={{ fontWeight: 600, color: '#000000' }}>Service Delivery:</span> To provide you access to your account and all Cherut features
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
                  • <span style={{ fontWeight: 600, color: '#000000' }}>Personalization:</span> To customize your experience and provide relevant insights
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
                  • <span style={{ fontWeight: 600, color: '#000000' }}>Communication:</span> To send you important updates about your account or the service
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
                  • <span style={{ fontWeight: 600, color: '#000000' }}>Support:</span> To provide customer support and respond to your inquiries
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
                  • <span style={{ fontWeight: 600, color: '#000000' }}>Improvement:</span> To analyze usage patterns and improve our platform (using anonymized data)
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
                  • <span style={{ fontWeight: 600, color: '#000000' }}>Security:</span> To protect against fraud, abuse, and security threats
                </Text>
              </Stack>
            </Stack>
          </Stack>

          {/* Data Security */}
          <Stack gap="xl">
            <Title
              order={2}
              style={{
                fontFamily: 'Inter Display, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                color: '#000000',
              }}
            >
              Data Security
            </Title>

            <Card
              padding="xl"
              radius={16}
              style={{
                background: '#F5F5F5',
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
                      background: '#4686FE',
                      color: 'white',
                      border: 'none',
                      flexShrink: 0,
                    }}
                  >
                    <Lock size={32} />
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
                      Enterprise-Grade Security
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
                      Your data is protected with industry-leading security measures:
                    </Text>
                  </Stack>
                </Group>

                <Stack gap="xs" pl="md">
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#666666',
                      lineHeight: '24px',
                    }}
                  >
                    • <span style={{ fontWeight: 600, color: '#000000' }}>Encryption:</span> All data is encrypted at rest and in transit using AES-256 encryption
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
                    • <span style={{ fontWeight: 600, color: '#000000' }}>Secure Infrastructure:</span> We use leading cloud providers with SOC 2 compliance
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
                    • <span style={{ fontWeight: 600, color: '#000000' }}>Access Controls:</span> Strict access controls and authentication requirements for our team
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
                    • <span style={{ fontWeight: 600, color: '#000000' }}>Regular Audits:</span> Ongoing security audits and vulnerability assessments
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
                    • <span style={{ fontWeight: 600, color: '#000000' }}>Data Backups:</span> Regular, secure backups to prevent data loss
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Stack>

          {/* Data Sharing */}
          <Stack gap="xl">
            <Title
              order={2}
              style={{
                fontFamily: 'Inter Display, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                color: '#000000',
              }}
            >
              Data Sharing
            </Title>

            <Card
              padding="xl"
              radius={16}
              style={{
                background: '#F5F5F5',
                border: '1px solid #CCCCCC',
                boxShadow: 'none',
              }}
            >
              <Stack gap="lg">
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#4686FE',
                  }}
                >
                  We Never Sell Your Data
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
                  Your personal data is never sold, rented, or shared with third parties for their marketing purposes.
                  Period. We may only share limited information in these specific circumstances:
                </Text>
                <Stack gap="xs" pl="md">
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#666666',
                      lineHeight: '24px',
                    }}
                  >
                    • <span style={{ fontWeight: 600, color: '#000000' }}>Service Providers:</span> Trusted partners who help us operate the service (hosting, analytics) under strict confidentiality agreements
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
                    • <span style={{ fontWeight: 600, color: '#000000' }}>Legal Requirements:</span> If required by law or to protect our rights and safety
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
                    • <span style={{ fontWeight: 600, color: '#000000' }}>Business Transfer:</span> If Cherut is acquired, your data would transfer under the same privacy protections
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Stack>

          {/* Your Rights */}
          <Stack gap="xl">
            <Title
              order={2}
              style={{
                fontFamily: 'Inter Display, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                color: '#000000',
              }}
            >
              Your Rights and Control
            </Title>

            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '18px',
                fontWeight: 400,
                color: '#666666',
                lineHeight: '26px',
              }}
            >
              You have complete control over your data:
            </Text>

            <Stack gap="lg">
              <Card
                padding="lg"
                radius={16}
                style={{
                  background: 'white',
                  border: '1px solid #CCCCCC',
                  boxShadow: 'none',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#000000',
                  }}
                >
                  Access
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#666666',
                    lineHeight: '20px',
                  }}
                >
                  View and download all data we have about you
                </Text>
              </Card>

              <Card
                padding="lg"
                radius={16}
                style={{
                  background: 'white',
                  border: '1px solid #CCCCCC',
                  boxShadow: 'none',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#000000',
                  }}
                >
                  Correction
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#666666',
                    lineHeight: '20px',
                  }}
                >
                  Update or correct any inaccurate information
                </Text>
              </Card>

              <Card
                padding="lg"
                radius={16}
                style={{
                  background: 'white',
                  border: '1px solid #CCCCCC',
                  boxShadow: 'none',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#000000',
                  }}
                >
                  Export
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#666666',
                    lineHeight: '20px',
                  }}
                >
                  Export your data in a portable format
                </Text>
              </Card>

              <Card
                padding="lg"
                radius={16}
                style={{
                  background: 'white',
                  border: '1px solid #CCCCCC',
                  boxShadow: 'none',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#000000',
                  }}
                >
                  Deletion
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#666666',
                    lineHeight: '20px',
                  }}
                >
                  Permanently delete your account and all associated data
                </Text>
              </Card>
            </Stack>

            <Text
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                fontWeight: 400,
                color: '#666666',
                lineHeight: '24px',
              }}
            >
              To exercise any of these rights, contact us at{' '}
              <span style={{ fontWeight: 600, color: '#4686FE' }}>
                chutzpahcode@gmail.com
              </span>
            </Text>
          </Stack>

          {/* Remaining sections with consistent styling */}
          <Stack gap="xl">
            <Title
              order={2}
              style={{
                fontFamily: 'Inter Display, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                color: '#000000',
              }}
            >
              Cookies and Tracking
            </Title>

            <Stack gap="lg">
              <Text
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#666666',
                  lineHeight: '24px',
                }}
              >
                We use minimal, necessary cookies to provide the service:
              </Text>

              <Stack gap="xs" pl="md">
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    color: '#666666',
                    lineHeight: '24px',
                  }}
                >
                  • <span style={{ fontWeight: 600, color: '#000000' }}>Essential Cookies:</span> Required for the service to function (authentication, preferences)
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
                  • <span style={{ fontWeight: 600, color: '#000000' }}>Analytics Cookies:</span> Anonymous usage analytics to improve the platform
                </Text>
              </Stack>

              <Text
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#666666',
                  lineHeight: '24px',
                }}
              >
                We do not use cookies for advertising or tracking across other websites.
              </Text>
            </Stack>
          </Stack>

          {/* Contact */}
          <Stack gap="xl">
            <Title
              order={2}
              style={{
                fontFamily: 'Inter Display, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                color: '#000000',
              }}
            >
              Questions About Privacy?
            </Title>

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
                    fontWeight: 700,
                    color: '#000000',
                  }}
                >
                  Contact Our Privacy Team
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
                  If you have any questions about this privacy policy or how we handle your data,
                  we're here to help.
                </Text>
                <Group gap="lg">
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#4686FE',
                    }}
                  >
                    chutzpahcode@gmail.com
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: '#999999',
                    }}
                  >
                    |
                  </Text>
                  <a href="/contact" style={{ textDecoration: 'none' }}>
                    <Text
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#4686FE',
                      }}
                    >
                      Contact Form
                    </Text>
                  </a>
                </Group>
              </Stack>
            </Card>
          </Stack>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}