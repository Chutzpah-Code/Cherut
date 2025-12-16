import { Container, Group, Stack, Text, Divider, Box } from '@mantine/core';
import Link from 'next/link';
import CherutLogo from '@/components/ui/CherutLogo';

export default function Footer() {
  return (
    <Box style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 50%, #ffffff 100%)', paddingTop: 60, paddingBottom: 60 }}>
      <Container size="lg">
        <Divider mb={40} style={{ borderColor: 'hsl(0 0% 0% / 0.1)' }} />
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <Group gap="sm" align="center">
              <CherutLogo size={80} />
              <Stack gap={2}>
                <Text
                  size="lg"
                  fw={700}
                  style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                >
                  Cherut
                </Text>
                <Text
                  size="xs"
                  style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                >
                  All in, all the time
                </Text>
              </Stack>
            </Group>
            <Text
              size="xs"
              mt="md"
              style={{ color: 'hsl(0 0% 0% / 0.6)' }}
            >
              © 2025 Cherut. All rights reserved.
            </Text>
          </Stack>

          <Group gap={60} align="flex-start">
            <Stack gap="xs">
              <Text
                size="sm"
                fw={600}
                style={{ color: 'hsl(0 0% 0% / 0.87)' }}
              >
                Product
              </Text>
              <Text
                component="a"
                href="/#features"
                size="xs"
                style={{
                  color: 'hsl(0 0% 0% / 0.6)',
                  textDecoration: 'none',
                }}
              >
                Features
              </Text>
              <Text
                component="a"
                href="/#pricing"
                size="xs"
                style={{
                  color: 'hsl(0 0% 0% / 0.6)',
                  textDecoration: 'none',
                }}
              >
                Pricing
              </Text>
              <Text
                component="a"
                href="https://discord.gg/AyjZ58KXGy"
                target="_blank"
                size="xs"
                style={{
                  color: 'hsl(0 0% 0% / 0.6)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                Community
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text
                size="sm"
                fw={600}
                style={{ color: 'hsl(0 0% 0% / 0.87)' }}
              >
                Company
              </Text>
              <Text
                component={Link}
                href="/about"
                size="xs"
                style={{
                  color: 'hsl(0 0% 0% / 0.6)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                About
              </Text>
              <Text
                component={Link}
                href="/roadmap"
                size="xs"
                style={{
                  color: 'hsl(0 0% 0% / 0.6)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                Roadmap
              </Text>
              <Text
                component={Link}
                href="/careers"
                size="xs"
                style={{
                  color: 'hsl(0 0% 0% / 0.6)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                Careers
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text
                size="sm"
                fw={600}
                style={{ color: 'hsl(0 0% 0% / 0.87)' }}
              >
                Support
              </Text>
              <Text
                component={Link}
                href="/help-center"
                size="xs"
                style={{
                  color: 'hsl(0 0% 0% / 0.6)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                Help Center
              </Text>
              <Text
                component={Link}
                href="/contact"
                size="xs"
                style={{
                  color: 'hsl(0 0% 0% / 0.6)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                Contact
              </Text>
              <Text
                component={Link}
                href="/privacy-policy"
                size="xs"
                style={{
                  color: 'hsl(0 0% 0% / 0.6)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                Privacy Policy
              </Text>
            </Stack>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}