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
import { ArrowRight, AlertCircle } from 'lucide-react';
import CherutLogo from '@/components/ui/CherutLogo';

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
                component={Link}
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
              component={Link}
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
      </Container>
    </Box>
  );
}
