'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/firebase/auth';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { getRegistrationErrorMessage, createRateLimitError } from '@/lib/utils/auth-errors';
import { useRateLimit } from '@/hooks/useRateLimit';
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
} from '@mantine/core';
import { ArrowRight, AlertCircle } from 'lucide-react';
import CherutLogo from '@/components/ui/CherutLogo';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Rate limiting
  const registerRateLimit = useRateLimit({ action: 'register' });

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check rate limit before proceeding
    if (!registerRateLimit.canSubmit) {
      setError(registerRateLimit.warningMessage);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Register with Firebase
      const firebaseUser = await registerUser(email, password);

      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();

      // Register with backend API
      await apiClient.post('/auth/register', {
        email,
        password,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Record successful registration
      registerRateLimit.recordSuccess();
      router.push('/dashboard');
    } catch (err: any) {
      // Record failed registration attempt
      registerRateLimit.recordFailure();
      setError(getRegistrationErrorMessage(err));
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
        background: '#FFFFFF',
        padding: '20px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <Container size="xs" style={{ width: '100%' }}>
        <Stack gap="xl">
          {/* Logo/Brand */}
          <Stack gap="xs" align="center">
            <CherutLogo size={120} />
            <Title
              order={1}
              ta="center"
              style={{
                fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'clamp(28px, 5vw, 40px)',
                fontWeight: 700,
                color: '#000000',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              Create Account
            </Title>
            <Text
              ta="center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
                color: '#666666',
                lineHeight: '24px',
              }}
            >
              Start your journey to elite performance
            </Text>
          </Stack>

          {/* Form Card */}
          <Paper
            radius={16}
            p="xl"
            style={{
              background: 'white',
              border: '1px solid #CCCCCC',
              boxShadow: 'none',
            }}
          >
            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                {/* Rate limit display */}
                <RateLimitDisplay
                  result={registerRateLimit.result}
                  message={registerRateLimit.warningMessage}
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
                  radius={8}
                  styles={{
                    label: {
                      fontFamily: 'Inter, sans-serif',
                      color: '#000000',
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: '14px',
                    },
                    input: {
                      fontFamily: 'Inter, sans-serif',
                      backgroundColor: 'white',
                      border: '1px solid #CCCCCC',
                      color: '#000000',
                      height: '48px',
                      fontSize: '16px',
                      '&::placeholder': {
                        color: '#999999',
                      },
                      '&:focus': {
                        borderColor: '#4686FE',
                        boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
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
                  radius={8}
                  styles={{
                    label: {
                      fontFamily: 'Inter, sans-serif',
                      color: '#000000',
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: '14px',
                    },
                    input: {
                      fontFamily: 'Inter, sans-serif',
                      backgroundColor: 'white',
                      border: '1px solid #CCCCCC',
                      color: '#000000',
                      height: '48px',
                      fontSize: '16px',
                      '&::placeholder': {
                        color: '#999999',
                      },
                      '&:focus': {
                        borderColor: '#4686FE',
                        boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
                      },
                    },
                    innerInput: {
                      fontFamily: 'Inter, sans-serif',
                      color: '#000000',
                    },
                  }}
                />

                <PasswordInput
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  size="md"
                  radius={8}
                  styles={{
                    label: {
                      fontFamily: 'Inter, sans-serif',
                      color: '#000000',
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: '14px',
                    },
                    input: {
                      fontFamily: 'Inter, sans-serif',
                      backgroundColor: 'white',
                      border: '1px solid #CCCCCC',
                      color: '#000000',
                      height: '48px',
                      fontSize: '16px',
                      '&::placeholder': {
                        color: '#999999',
                      },
                      '&:focus': {
                        borderColor: '#4686FE',
                        boxShadow: '0 0 0 4px rgba(70, 134, 254, 0.1)',
                      },
                    },
                    innerInput: {
                      fontFamily: 'Inter, sans-serif',
                      color: '#000000',
                    },
                  }}
                />

                <Button
                  type="submit"
                  size="lg"
                  radius={8}
                  fullWidth
                  loading={loading}
                  rightSection={<ArrowRight size={20} />}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    background: '#4686FE',
                    border: 'none',
                    height: '56px',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'white',
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        background: '#3366E5',
                      },
                    },
                  }}
                >
                  Create Account
                </Button>
              </Stack>
            </form>
          </Paper>

          {/* Footer Links */}
          <Stack gap="md" align="center">
            <Text
              ta="center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#666666',
              }}
            >
              Already have an account?{' '}
              <Anchor
                component="a"
                href="/auth/login"
                fw={600}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#4686FE',
                  textDecoration: 'none',
                }}
              >
                Sign in
              </Anchor>
            </Text>

            <Anchor
              component="a"
              href="/"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#666666',
                textDecoration: 'none',
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
