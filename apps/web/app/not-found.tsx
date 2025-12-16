'use client';

import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Box,
  Paper,
  ThemeIcon,
} from '@mantine/core';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NotFound() {
  const pathname = usePathname();

  // Sanitize the pathname by removing any potentially harmful characters
  const sanitizedPath = pathname
    ?.replace(/[<>"/\\&]/g, '') // Remove potentially harmful characters
    ?.replace(/%3C/gi, '') // Remove URL encoded <
    ?.replace(/%3E/gi, '') // Remove URL encoded >
    ?.replace(/%22/gi, '') // Remove URL encoded "
    ?.replace(/%27/gi, '') // Remove URL encoded '
    ?.slice(0, 100) || '/unknown'; // Limit length and provide fallback

  return (
    <Box
      style={{
        background: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container size="sm">
        <Paper
          p={{ base: 40, sm: 60, md: 80 }}
          radius={20}
          style={{
            background: '#ffffff',
            border: '1px solid hsl(0 0% 0% / 0.08)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            textAlign: 'center',
          }}
        >
          <Stack align="center" gap={32}>
            <ThemeIcon
              size={80}
              radius={20}
              style={{
                background: 'rgba(252, 113, 36, 0.1)',
                color: '#FC7124',
              }}
            >
              <AlertTriangle size={40} />
            </ThemeIcon>

            <Stack align="center" gap={16}>
              <Title
                order={1}
                style={{
                  fontSize: 'clamp(36px, 6vw, 64px)',
                  fontWeight: 800,
                  color: '#1a1a1a',
                  lineHeight: 1.1,
                }}
              >
                404
              </Title>

              <Title
                order={2}
                style={{
                  fontSize: 'clamp(24px, 4vw, 32px)',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  lineHeight: 1.3,
                }}
              >
                Page Not Found
              </Title>

              <Text
                size="lg"
                style={{
                  color: 'hsl(0 0% 0% / 0.6)',
                  lineHeight: 1.6,
                  maxWidth: '400px',
                }}
              >
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </Text>

              {sanitizedPath !== '/unknown' && (
                <Paper
                  p="sm"
                  radius="md"
                  style={{
                    background: 'hsl(0 0% 96%)',
                    border: '1px solid hsl(0 0% 0% / 0.1)',
                    marginTop: '8px',
                  }}
                >
                  <Text
                    size="sm"
                    style={{
                      fontFamily: 'monospace',
                      color: 'hsl(0 0% 0% / 0.7)',
                      wordBreak: 'break-all',
                    }}
                  >
                    Requested path: <strong>{sanitizedPath}</strong>
                  </Text>
                </Paper>
              )}
            </Stack>

            <Group gap="md" mt={16}>
              <Button
                component="a"
                href="/"
                size="lg"
                radius={48}
                leftSection={<Home size={18} />}
                style={{
                  background: '#3143B6',
                  border: 'none',
                  padding: '12px 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  height: '48px',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      background: '#2535a0',
                      transform: 'translateY(-1px)',
                    },
                  },
                }}
              >
                Go Home
              </Button>

              <Button
                onClick={() => window.history.back()}
                size="lg"
                radius={48}
                variant="outline"
                leftSection={<ArrowLeft size={18} />}
                style={{
                  color: 'hsl(0 0% 0% / 0.87)',
                  borderColor: 'hsl(0 0% 0% / 0.2)',
                  background: 'transparent',
                  padding: '12px 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  height: '48px',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      background: 'hsl(0 0% 0% / 0.04)',
                      transform: 'translateY(-1px)',
                    },
                  },
                }}
              >
                Go Back
              </Button>
            </Group>

            <Text
              size="sm"
              style={{
                color: 'hsl(0 0% 0% / 0.5)',
                marginTop: '16px',
              }}
            >
              Need help? Contact our{' '}
              <Text
                component="a"
                href="mailto:support@cherut.com"
                style={{
                  color: '#3143B6',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
                styles={{
                  root: {
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  },
                }}
              >
                support team
              </Text>
            </Text>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}