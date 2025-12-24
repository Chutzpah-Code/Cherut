'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset } from '@/lib/firebase/auth';
import { getPasswordErrorMessage, createRateLimitError } from '@/lib/utils/auth-errors';
import { useRateLimit } from '@/hooks/useRateLimit';
import { RateLimitDisplay } from '@/components/auth/RateLimitDisplay';
import {
  Container,
  Paper,
  Title,
  Text,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Box,
  Group,
} from '@mantine/core';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import CherutLogo from '@/components/ui/CherutLogo';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validatingCode, setValidatingCode] = useState(true);
  const [isValidCode, setIsValidCode] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  // Rate limiting
  const passwordResetRateLimit = useRateLimit({ action: 'passwordReset' });

  useEffect(() => {
    if (!oobCode) {
      setError('Invalid or missing reset code');
      setValidatingCode(false);
      return;
    }

    // Validate the reset code
    setValidatingCode(false);
    setIsValidCode(true);
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check rate limit before proceeding
    if (!passwordResetRateLimit.canSubmit) {
      setError(passwordResetRateLimit.warningMessage);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!oobCode) {
      setError('Invalid reset code');
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(oobCode, password);
      // Record successful password reset
      passwordResetRateLimit.recordSuccess();
      setSuccess(true);
    } catch (err: any) {
      // Record failed password reset attempt
      passwordResetRateLimit.recordFailure();
      setError(getPasswordErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (validatingCode) {
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
          <Stack gap="xl" align="center">
            <CherutLogo size={120} />
            <Text size="lg" ta="center">
              Validating reset code...
            </Text>
          </Stack>
        </Container>
      </Box>
    );
  }

  if (!isValidCode) {
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
                Invalid Link
              </Title>
            </Stack>

            <Paper
              radius={20}
              p="xl"
              style={{
                background: 'white',
                border: '1px solid hsl(0 0% 0% / 0.08)',
                boxShadow: 'none',
              }}
            >
              <Stack gap="lg" ta="center">
                <Alert
                  icon={<AlertCircle size={20} />}
                  title="Invalid or Expired Link"
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
                  The password reset link is invalid or has expired. Please request a new one.
                </Alert>

                <Button
                  component={Link}
                  href="/auth/login"
                  variant="outline"
                  radius={48}
                  rightSection={<ArrowRight size={20} />}
                  style={{
                    borderColor: '#3143B6',
                    color: '#3143B6',
                  }}
                >
                  Back to Login
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>
    );
  }

  if (success) {
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
                Password Reset
              </Title>
            </Stack>

            <Paper
              radius={20}
              p="xl"
              style={{
                background: 'white',
                border: '1px solid hsl(0 0% 0% / 0.08)',
                boxShadow: 'none',
              }}
            >
              <Stack gap="lg" ta="center">
                <Alert
                  icon={<CheckCircle size={20} />}
                  title="Password Updated Successfully!"
                  color="green"
                  radius={16}
                  styles={{
                    root: {
                      backgroundColor: 'rgba(34, 197, 94, 0.08)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                    },
                    title: { color: '#16a34a', fontWeight: 600 },
                    message: { color: '#16a34a' },
                  }}
                >
                  Your password has been successfully updated. You can now sign in with your new password.
                </Alert>

                <Button
                  component={Link}
                  href="/auth/login"
                  size="lg"
                  radius={48}
                  fullWidth
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
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>
    );
  }

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
              Reset Password
            </Title>
            <Text
              size="md"
              ta="center"
              fw={500}
              style={{ color: 'hsl(0 0% 0% / 0.6)' }}
            >
              Enter your new password below
            </Text>
          </Stack>

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
                  result={passwordResetRateLimit.result}
                  message={passwordResetRateLimit.warningMessage}
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

                <PasswordInput
                  label="New Password"
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

                <PasswordInput
                  label="Confirm New Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

                <Group justify="space-between" gap="sm">
                  <Button
                    component={Link}
                    href="/auth/login"
                    variant="outline"
                    radius={48}
                    style={{
                      borderColor: '#3143B6',
                      color: '#3143B6',
                      flex: 1,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    radius={48}
                    rightSection={<ArrowRight size={20} />}
                    style={{
                      background: '#3143B6',
                      border: 'none',
                      flex: 2,
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          background: '#2535a0',
                        },
                      },
                    }}
                  >
                    Reset Password
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}