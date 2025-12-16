import { Container, Title, Text, Stack, Card, Group, ThemeIcon, Box, Badge, Divider } from '@mantine/core';
import { Shield, Eye, Lock, Database, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function PrivacyPolicy() {
  return (
    <Box style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 50%, #ffffff 100%)' }}>
      <Header />

      <Container size="lg" py={80} style={{ marginTop: '100px' }}>
        <Stack gap={60}>
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
              Privacy Policy
            </Title>
            <Text size="xl" ta="center" maw={700} style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
              Your privacy and data security are fundamental to everything we do at Cherut.
              Here&apos;s how we protect and handle your information.
            </Text>
            <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.5)' }}>
              Last updated: December 15, 2025
            </Text>
          </Stack>

          {/* Privacy Principles */}
          <Card padding="xl" radius={24} style={{ background: 'rgba(49, 67, 182, 0.05)', border: '2px solid rgba(49, 67, 182, 0.15)' }}>
            <Stack align="center" gap="lg">
              <ThemeIcon size={80} radius={20} style={{ background: 'linear-gradient(135deg, #3143B6 0%, #A855F7 100%)', color: 'white' }}>
                <Shield size={40} />
              </ThemeIcon>
              <Title order={2} ta="center" style={{ fontSize: '32px', fontWeight: 700 }}>
                Our Privacy Principles
              </Title>
              <Text size="lg" ta="center" maw={800} style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
                We believe privacy is a fundamental right. Your personal data belongs to you, and we act as
                its guardian. We collect only what&apos;s necessary, protect it rigorously, and never sell it to anyone.
              </Text>
            </Stack>
          </Card>

          {/* Information We Collect */}
          <Stack gap="xl">
            <Title order={2} style={{ fontSize: '32px', fontWeight: 700 }}>
              Information We Collect
            </Title>

            <Stack gap="lg">
              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(49, 67, 182, 0.15)' }}>
                <Stack gap="md">
                  <Group gap="md">
                    <ThemeIcon size={50} radius={16} style={{ background: 'rgba(49, 67, 182, 0.1)', color: '#3143B6' }}>
                      <Users size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Text fw={700} size="lg">Account Information</Text>
                      <Text style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                        When you create an account, we collect your name, email address, and password.
                        This information is necessary to provide you access to your Cherut account and personalize your experience.
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(168, 85, 247, 0.15)' }}>
                <Stack gap="md">
                  <Group gap="md">
                    <ThemeIcon size={50} radius={16} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                      <FileText size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Text fw={700} size="lg">Performance Data</Text>
                      <Text style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                        Your objectives, key results, tasks, habits, journal entries, and other performance-related
                        data you create within Cherut. This is the core of your personal excellence system and
                        remains completely private to you.
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(47, 178, 100, 0.15)' }}>
                <Stack gap="md">
                  <Group gap="md">
                    <ThemeIcon size={50} radius={16} style={{ background: 'rgba(47, 178, 100, 0.1)', color: '#2FB264' }}>
                      <Eye size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Text fw={700} size="lg">Usage Information</Text>
                      <Text style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                        We collect anonymous usage analytics to improve our platform - things like which features
                        are used most, how users navigate the app, and performance metrics. This data is aggregated
                        and cannot be linked back to individual users.
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
              </Card>

              <Card padding="xl" radius={20} style={{ background: 'white', border: '1px solid rgba(250, 173, 24, 0.15)' }}>
                <Stack gap="md">
                  <Group gap="md">
                    <ThemeIcon size={50} radius={16} style={{ background: 'rgba(250, 173, 24, 0.1)', color: '#FAAD18' }}>
                      <Database size={28} />
                    </ThemeIcon>
                    <Stack gap="xs">
                      <Text fw={700} size="lg">Technical Information</Text>
                      <Text style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                        Standard technical information like your IP address, browser type, device information,
                        and operating system. This helps us ensure Cherut works optimally across all devices
                        and identify technical issues.
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Stack>

          {/* How We Use Your Information */}
          <Stack gap="xl">
            <Title order={2} style={{ fontSize: '32px', fontWeight: 700 }}>
              How We Use Your Information
            </Title>

            <Stack gap="md">
              <Text size="lg" style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
                We use your information solely to provide and improve the Cherut service:
              </Text>

              <Stack gap="xs" pl="md">
                <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                  • <strong>Service Delivery:</strong> To provide you access to your account and all Cherut features
                </Text>
                <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                  • <strong>Personalization:</strong> To customize your experience and provide relevant insights
                </Text>
                <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                  • <strong>Communication:</strong> To send you important updates about your account or the service
                </Text>
                <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                  • <strong>Support:</strong> To provide customer support and respond to your inquiries
                </Text>
                <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                  • <strong>Improvement:</strong> To analyze usage patterns and improve our platform (using anonymized data)
                </Text>
                <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                  • <strong>Security:</strong> To protect against fraud, abuse, and security threats
                </Text>
              </Stack>
            </Stack>
          </Stack>

          {/* Data Security */}
          <Stack gap="xl">
            <Title order={2} style={{ fontSize: '32px', fontWeight: 700 }}>
              Data Security
            </Title>

            <Card padding="xl" radius={20} style={{ background: 'rgba(47, 178, 100, 0.05)', border: '1px solid rgba(47, 178, 100, 0.2)' }}>
              <Stack gap="lg">
                <Group gap="md">
                  <ThemeIcon size={60} radius={16} style={{ background: 'rgba(47, 178, 100, 0.1)', color: '#2FB264' }}>
                    <Lock size={32} />
                  </ThemeIcon>
                  <Stack gap="xs">
                    <Text fw={700} size="lg">Enterprise-Grade Security</Text>
                    <Text style={{ color: 'hsl(0 0% 0% / 0.6)', lineHeight: 1.6 }}>
                      Your data is protected with industry-leading security measures:
                    </Text>
                  </Stack>
                </Group>

                <Stack gap="xs" pl="md">
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    • <strong>Encryption:</strong> All data is encrypted at rest and in transit using AES-256 encryption
                  </Text>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    • <strong>Secure Infrastructure:</strong> We use leading cloud providers with SOC 2 compliance
                  </Text>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    • <strong>Access Controls:</strong> Strict access controls and authentication requirements for our team
                  </Text>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    • <strong>Regular Audits:</strong> Ongoing security audits and vulnerability assessments
                  </Text>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    • <strong>Data Backups:</strong> Regular, secure backups to prevent data loss
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Stack>

          {/* Data Sharing */}
          <Stack gap="xl">
            <Title order={2} style={{ fontSize: '32px', fontWeight: 700 }}>
              Data Sharing
            </Title>

            <Card padding="xl" radius={20} style={{ background: 'rgba(236, 72, 153, 0.05)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
              <Stack gap="md">
                <Text fw={700} size="lg" style={{ color: '#EC4899' }}>
                  We Never Sell Your Data
                </Text>
                <Text style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.6 }}>
                  Your personal data is never sold, rented, or shared with third parties for their marketing purposes.
                  Period. We may only share limited information in these specific circumstances:
                </Text>
                <Stack gap="xs" pl="md">
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    • <strong>Service Providers:</strong> Trusted partners who help us operate the service (hosting, analytics) under strict confidentiality agreements
                  </Text>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    • <strong>Legal Requirements:</strong> If required by law or to protect our rights and safety
                  </Text>
                  <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                    • <strong>Business Transfer:</strong> If Cherut is acquired, your data would transfer under the same privacy protections
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Stack>

          {/* Your Rights */}
          <Stack gap="xl">
            <Title order={2} style={{ fontSize: '32px', fontWeight: 700 }}>
              Your Rights and Control
            </Title>

            <Text size="lg" style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
              You have complete control over your data:
            </Text>

            <Stack gap="md">
              <Card padding="md" radius={12} style={{ background: 'rgba(49, 67, 182, 0.03)', border: '1px solid rgba(49, 67, 182, 0.1)' }}>
                <Text fw={600}>Access</Text>
                <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                  View and download all data we have about you
                </Text>
              </Card>

              <Card padding="md" radius={12} style={{ background: 'rgba(168, 85, 247, 0.03)', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
                <Text fw={600}>Correction</Text>
                <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                  Update or correct any inaccurate information
                </Text>
              </Card>

              <Card padding="md" radius={12} style={{ background: 'rgba(47, 178, 100, 0.03)', border: '1px solid rgba(47, 178, 100, 0.1)' }}>
                <Text fw={600}>Export</Text>
                <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                  Export your data in a portable format
                </Text>
              </Card>

              <Card padding="md" radius={12} style={{ background: 'rgba(250, 173, 24, 0.03)', border: '1px solid rgba(250, 173, 24, 0.1)' }}>
                <Text fw={600}>Deletion</Text>
                <Text size="sm" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                  Permanently delete your account and all associated data
                </Text>
              </Card>
            </Stack>

            <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
              To exercise any of these rights, contact us at{' '}
              <Text component="span" fw={600} style={{ color: '#3143B6' }}>
                chutzpahcode@gmail.com
              </Text>
            </Text>
          </Stack>

          {/* Cookies and Tracking */}
          <Stack gap="xl">
            <Title order={2} style={{ fontSize: '32px', fontWeight: 700 }}>
              Cookies and Tracking
            </Title>

            <Text style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
              We use minimal, necessary cookies to provide the service:
            </Text>

            <Stack gap="xs" pl="md">
              <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                • <strong>Essential Cookies:</strong> Required for the service to function (authentication, preferences)
              </Text>
              <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                • <strong>Analytics Cookies:</strong> Anonymous usage analytics to improve the platform
              </Text>
            </Stack>

            <Text style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
              We do not use cookies for advertising or tracking across other websites.
            </Text>
          </Stack>

          {/* Data Retention */}
          <Stack gap="xl">
            <Title order={2} style={{ fontSize: '32px', fontWeight: 700 }}>
              Data Retention
            </Title>

            <Text style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
              We retain your data only as long as necessary:
            </Text>

            <Stack gap="xs" pl="md">
              <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                • <strong>Active Accounts:</strong> Data is retained while your account is active
              </Text>
              <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                • <strong>Deleted Accounts:</strong> Data is permanently deleted within 30 days of account deletion
              </Text>
              <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                • <strong>Legal Requirements:</strong> Some data may be retained longer if required by law
              </Text>
              <Text size="md" style={{ color: 'hsl(0 0% 0% / 0.7)' }}>
                • <strong>Backup Data:</strong> Backup data is automatically purged within 90 days
              </Text>
            </Stack>
          </Stack>

          {/* Children's Privacy */}
          <Stack gap="xl">
            <Title order={2} style={{ fontSize: '32px', fontWeight: 700 }}>
              Children&apos;s Privacy
            </Title>

            <Text style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
              Cherut is not intended for children under 13. We do not knowingly collect personal information
              from children under 13. If you are a parent and believe your child has provided us with
              personal information, please contact us immediately.
            </Text>
          </Stack>

          {/* International Data Transfers */}
          <Stack gap="xl">
            <Title order={2} style={{ fontSize: '32px', fontWeight: 700 }}>
              International Data Transfers
            </Title>

            <Text style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
              Your data may be processed in countries other than your own. We ensure that all international
              transfers are protected by appropriate safeguards, including standard contractual clauses
              approved by regulatory authorities.
            </Text>
          </Stack>

          {/* Policy Updates */}
          <Stack gap="xl">
            <Title order={2} style={{ fontSize: '32px', fontWeight: 700 }}>
              Policy Updates
            </Title>

            <Text style={{ color: 'hsl(0 0% 0% / 0.7)', lineHeight: 1.7 }}>
              We may update this privacy policy from time to time. When we do, we&apos;ll notify you via email
              and update the &quot;Last updated&quot; date at the top of this policy. We encourage you to review
              this policy periodically to stay informed about how we protect your privacy.
            </Text>
          </Stack>

          <Divider style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }} />

          {/* Contact */}
          <Stack gap="xl">
            <Title order={2} style={{ fontSize: '32px', fontWeight: 700 }}>
              Questions About Privacy?
            </Title>

            <Card padding="xl" radius={20} style={{ background: 'rgba(49, 67, 182, 0.05)', border: '2px solid rgba(49, 67, 182, 0.2)' }}>
              <Stack align="center" gap="md">
                <Text fw={700} size="lg">Contact Our Privacy Team</Text>
                <Text ta="center" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                  If you have any questions about this privacy policy or how we handle your data,
                  we&apos;re here to help.
                </Text>
                <Group gap="md">
                  <Text fw={600} style={{ color: '#3143B6' }}>
                    chutzpahcode@gmail.com
                  </Text>
                  <Text>|</Text>
                  <Link href="/contact" style={{ textDecoration: 'none' }}>
                    <Text fw={600} style={{ color: '#3143B6' }}>
                      Contact Form
                    </Text>
                  </Link>
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