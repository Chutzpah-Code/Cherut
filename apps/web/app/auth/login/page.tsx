'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Anchor,
  Box,
} from '@mantine/core';
import { ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
        padding: '20px',
      }}
    >
      <Container size="xs" style={{ width: '100%' }}>
        <Stack gap="xl">
          {/* Logo/Brand */}
          <Stack gap="xs" align="center">
            <Box
              style={{
                width: 60,
                height: 60,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.35)',
              }}
            >
              <Sparkles size={32} color="white" />
            </Box>
            <Title
              order={1}
              ta="center"
              style={{
                fontSize: 'clamp(28px, 5vw, 36px)',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.2,
              }}
            >
              Welcome Back
            </Title>
            <Text size="md" c="dimmed" ta="center" fw={500}>
              Sign in to continue your journey
            </Text>
          </Stack>

          {/* Form Card */}
          <Paper
            radius="lg"
            p="xl"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                {error && (
                  <Alert
                    icon={<AlertCircle size={20} />}
                    title="Error"
                    color="red"
                    radius="md"
                    styles={{
                      root: {
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      },
                      title: { color: '#fca5a5' },
                      message: { color: '#fca5a5' },
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  size="md"
                  styles={{
                    label: {
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 500,
                      marginBottom: 8,
                    },
                    input: {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.4)',
                      },
                      '&:focus': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                      },
                    },
                  }}
                />

                <PasswordInput
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  size="md"
                  styles={{
                    label: {
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 500,
                      marginBottom: 8,
                    },
                    input: {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.4)',
                      },
                      '&:focus': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                      },
                    },
                    innerInput: {
                      color: 'white',
                    },
                  }}
                />

                <Button
                  type="submit"
                  size="lg"
                  radius="md"
                  fullWidth
                  loading={loading}
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                  rightSection={<ArrowRight size={20} />}
                  style={{
                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.35)',
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </form>
          </Paper>

          {/* Footer Links */}
          <Stack gap="md" align="center">
            <Text size="sm" c="dimmed" ta="center">
              Don&apos;t have an account?{' '}
              <Anchor
                component={Link}
                href="/auth/register"
                c="blue"
                fw={600}
                style={{
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign up
              </Anchor>
            </Text>

            <Anchor
              component={Link}
              href="/"
              c="dimmed"
              size="sm"
              style={{
                textDecoration: 'none',
                '&:hover': {
                  color: 'white',
                },
              }}
            >
              ← Back to home
            </Anchor>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
