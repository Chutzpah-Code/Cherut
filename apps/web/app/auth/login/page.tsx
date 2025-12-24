'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser, resetPassword } from '@/lib/firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { getLoginErrorMessage, getAuthErrorMessage, createRateLimitError } from '@/lib/utils/auth-errors';
import { useLoginRateLimit } from '@/hooks/useRateLimit';
import { RateLimitDisplay } from '@/components/auth/RateLimitDisplay';
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
  Modal,
  Group,
} from '@mantine/core';
import { ArrowRight, AlertCircle } from 'lucide-react';
import CherutLogo from '@/components/ui/CherutLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetModalOpened, setResetModalOpened] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  // Rate limiting
  const loginRateLimit = useLoginRateLimit();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check rate limit before proceeding
    if (!loginRateLimit.canSubmit) {
      setError(loginRateLimit.warningMessage);
      return;
    }

    setLoading(true);

    try {
      await loginRateLimit.handleLoginAttempt(async () => {
        await loginUser(email, password);
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);

    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(getAuthErrorMessage(err));
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetModalClose = () => {
    setResetModalOpened(false);
    setResetEmail('');
    setResetError('');
    setResetSuccess(false);
    setResetLoading(false);
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        padding: '20px',
      }}
    >
      <Container size="xs" style={{ width: '100%' }}>
        <Stack gap="xl">
          {/* Logo/Brand */}
          <Stack gap="xs" align="center">
            <CherutLogo size={120} />
            <Title
              order={1}
              ta="center"
              style={{
                fontSize: 'clamp(28px, 5vw, 40px)',
                fontWeight: 800,
                color: 'hsl(0 0% 0% / 0.87)',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              Welcome Back
            </Title>
            <Text
              size="md"
              ta="center"
              fw={500}
              style={{ color: 'hsl(0 0% 0% / 0.6)' }}
            >
              Sign in to continue your journey
            </Text>
          </Stack>

          {/* Form Card */}
          <Paper
            radius={20}
            p="xl"
            style={{
              background: 'white',
              border: '1px solid hsl(0 0% 0% / 0.08)',
              boxShadow: 'none',
            }}
          >
            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                {/* Rate limit display */}
                <RateLimitDisplay
                  result={loginRateLimit.result}
                  message={loginRateLimit.warningMessage}
                  showProgress={true}
                />

                {error && (
                  <Alert
                    icon={<AlertCircle size={20} />}
                    title="Error"
                    color="red"
                    radius={16}
                    styles={{
                      root: {
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                      },
                      title: { color: '#dc2626', fontWeight: 600 },
                      message: { color: '#dc2626' },
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
                  radius={48}
                  styles={{
                    label: {
                      color: 'hsl(0 0% 0% / 0.87)',
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: '14px',
                    },
                    input: {
                      backgroundColor: 'white',
                      border: '1px solid hsl(0 0% 0% / 0.15)',
                      color: 'hsl(0 0% 0% / 0.87)',
                      height: '48px',
                      fontSize: '16px',
                      '&::placeholder': {
                        color: 'hsl(0 0% 0% / 0.38)',
                      },
                      '&:focus': {
                        borderColor: '#3143B6',
                        boxShadow: '0 0 0 4px rgba(49, 67, 182, 0.1)',
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
                  radius={48}
                  styles={{
                    label: {
                      color: 'hsl(0 0% 0% / 0.87)',
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: '14px',
                    },
                    input: {
                      backgroundColor: 'white',
                      border: '1px solid hsl(0 0% 0% / 0.15)',
                      color: 'hsl(0 0% 0% / 0.87)',
                      height: '48px',
                      fontSize: '16px',
                      '&::placeholder': {
                        color: 'hsl(0 0% 0% / 0.38)',
                      },
                      '&:focus': {
                        borderColor: '#3143B6',
                        boxShadow: '0 0 0 4px rgba(49, 67, 182, 0.1)',
                      },
                    },
                    innerInput: {
                      color: 'hsl(0 0% 0% / 0.87)',
                    },
                  }}
                />

                <Button
                  type="submit"
                  size="lg"
                  radius={48}
                  fullWidth
                  loading={loading}
                  rightSection={<ArrowRight size={20} />}
                  style={{
                    background: '#3143B6',
                    border: 'none',
                    height: '56px',
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        background: '#2535a0',
                      },
                    },
                  }}
                >
                  Sign In
                </Button>

                <Anchor
                  ta="center"
                  size="sm"
                  fw={500}
                  style={{ color: '#3143B6', cursor: 'pointer' }}
                  onClick={() => setResetModalOpened(true)}
                >
                  Forgot your password?
                </Anchor>
              </Stack>
            </form>
          </Paper>

          {/* Footer Links */}
          <Stack gap="md" align="center">
            <Text
              size="sm"
              ta="center"
              style={{ color: 'hsl(0 0% 0% / 0.6)' }}
            >
              Don&apos;t have an account?{' '}
              <Anchor
                component="a"
                href="/auth/register"
                fw={600}
                style={{
                  color: '#3143B6',
                  textDecoration: 'none',
                }}
              >
                Sign up
              </Anchor>
            </Text>

            <Anchor
              component="a"
              href="/"
              size="sm"
              style={{
                color: 'hsl(0 0% 0% / 0.6)',
                textDecoration: 'none',
              }}
            >
              ← Back to home
            </Anchor>
          </Stack>
        </Stack>

        {/* Forgot Password Modal */}
        <Modal
          opened={resetModalOpened}
          onClose={handleResetModalClose}
          title="Reset Password"
          centered
          radius={20}
        >
          {resetSuccess ? (
            <Stack gap="lg" ta="center">
              <Text size="md" c="green" fw={600}>
                Reset email sent!
              </Text>
              <Text size="sm" c="dimmed">
                If the email is registered in our system, check your inbox (and spam folder) for password reset instructions.
              </Text>
              <Button
                onClick={handleResetModalClose}
                variant="outline"
                radius={48}
                style={{
                  borderColor: '#3143B6',
                  color: '#3143B6',
                }}
              >
                Got it
              </Button>
            </Stack>
          ) : (
            <form onSubmit={handleResetPassword}>
              <Stack gap="lg">
                {resetError && (
                  <Alert
                    icon={<AlertCircle size={20} />}
                    title="Error"
                    color="red"
                    radius={16}
                    styles={{
                      root: {
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                      },
                      title: { color: '#dc2626', fontWeight: 600 },
                      message: { color: '#dc2626' },
                    }}
                  >
                    {resetError}
                  </Alert>
                )}

                <Text size="sm" c="dimmed">
                  Enter your email address. If it's registered in our system, we'll send you a link to reset your password.
                </Text>

                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  size="md"
                  radius={48}
                  styles={{
                    label: {
                      color: 'hsl(0 0% 0% / 0.87)',
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: '14px',
                    },
                    input: {
                      backgroundColor: 'white',
                      border: '1px solid hsl(0 0% 0% / 0.15)',
                      color: 'hsl(0 0% 0% / 0.87)',
                      height: '48px',
                      fontSize: '16px',
                      '&::placeholder': {
                        color: 'hsl(0 0% 0% / 0.38)',
                      },
                      '&:focus': {
                        borderColor: '#3143B6',
                        boxShadow: '0 0 0 4px rgba(49, 67, 182, 0.1)',
                      },
                    },
                  }}
                />

                <Group justify="flex-end" gap="sm">
                  <Button
                    variant="outline"
                    onClick={handleResetModalClose}
                    radius={48}
                    style={{
                      borderColor: '#3143B6',
                      color: '#3143B6',
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={resetLoading}
                    radius={48}
                    style={{
                      background: '#3143B6',
                      border: 'none',
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          background: '#2535a0',
                        },
                      },
                    }}
                  >
                    Send Reset Email
                  </Button>
                </Group>
              </Stack>
            </form>
          )}
        </Modal>
      </Container>
    </Box>
  );
}
