'use client';

import { useState } from 'react';
import {
  Container,
  Group,
  Button,
  Stack,
  Box,
  Divider,
} from '@mantine/core';
import {
  Menu,
  X,
} from 'lucide-react';
import CherutLogo from '@/components/ui/CherutLogo';
import { useClientNavigation } from '@/hooks/useClientNavigation';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navigate } = useClientNavigation();
  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #CCCCCC',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Container size="lg">
        <Group justify="space-between" h={100}>
          {/* Logo */}
          <Group style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <CherutLogo size={100} />
          </Group>

          {/* Desktop Navigation Links */}
          <Group gap="xl" visibleFrom="md">
            <Button
              variant="subtle"
              onClick={() => navigate('/about')}
              style={{
                color: '#333333',
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
              }}
              styles={{
                root: {
                  '&:hover': {
                    background: 'rgba(70, 134, 254, 0.08)',
                    color: '#4686FE',
                  },
                },
              }}
            >
              About
            </Button>
            <Button
              variant="subtle"
              onClick={() => navigate('/#pricing')}
              style={{
                color: '#333333',
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
              }}
              styles={{
                root: {
                  '&:hover': {
                    background: 'rgba(70, 134, 254, 0.08)',
                    color: '#4686FE',
                  },
                },
              }}
            >
              Pricing
            </Button>
            <Button
              variant="subtle"
              onClick={() => navigate('/#testimonials')}
              style={{
                color: '#333333',
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
              }}
              styles={{
                root: {
                  '&:hover': {
                    background: 'rgba(70, 134, 254, 0.08)',
                    color: '#4686FE',
                  },
                },
              }}
            >
              Testimonials
            </Button>
            <Button
              variant="subtle"
              component="a"
              href="https://discord.gg/AyjZ58KXGy"
              target="_blank"
              style={{
                color: '#333333',
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
              }}
              styles={{
                root: {
                  '&:hover': {
                    background: 'rgba(70, 134, 254, 0.08)',
                    color: '#4686FE',
                  },
                },
              }}
            >
              Community
            </Button>
          </Group>

          {/* Desktop Auth Buttons */}
          <Group gap="md" visibleFrom="md">
            <Button
              variant="subtle"
              onClick={() => navigate('/auth/login')}
              style={{
                color: '#333333',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
              }}
              styles={{
                root: {
                  '&:hover': {
                    background: 'rgba(70, 134, 254, 0.08)',
                    color: '#4686FE',
                  },
                },
              }}
            >
              Login
            </Button>
            <Button
              radius={8}
              onClick={() => navigate('/auth/register')}
              style={{
                background: '#4686FE',
                color: 'white',
                fontWeight: 600,
                padding: '8px 20px',
                transition: 'all 0.2s ease',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                border: 'none',
              }}
              styles={{
                root: {
                  '&:hover': {
                    background: '#3366E5',
                  },
                },
              }}
            >
              Sign Up
            </Button>
          </Group>

          {/* Mobile Menu Button */}
          <Button
            variant="subtle"
            hiddenFrom="md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              color: '#374151',
              padding: '8px',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </Group>
      </Container>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <Box
          hiddenFrom="md"
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            borderTop: '1px solid #CCCCCC',
            padding: '20px 0',
          }}
        >
          <Container size="lg">
            <Stack gap="md">
              {/* Mobile Navigation Links */}
              <Button
                variant="subtle"
                onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}
                style={{
                  color: '#333333',
                  fontWeight: 500,
                  justifyContent: 'flex-start',
                  height: '48px',
                  fontFamily: 'Inter, sans-serif',
                }}
                fullWidth
              >
                About
              </Button>
              <Button
                variant="subtle"
                onClick={() => { navigate('/#pricing'); setMobileMenuOpen(false); }}
                style={{
                  color: '#333333',
                  fontWeight: 500,
                  justifyContent: 'flex-start',
                  height: '48px',
                  fontFamily: 'Inter, sans-serif',
                }}
                fullWidth
              >
                Pricing
              </Button>
              <Button
                variant="subtle"
                onClick={() => { navigate('/#testimonials'); setMobileMenuOpen(false); }}
                style={{
                  color: '#333333',
                  fontWeight: 500,
                  justifyContent: 'flex-start',
                  height: '48px',
                  fontFamily: 'Inter, sans-serif',
                }}
                fullWidth
              >
                Testimonials
              </Button>
              <Button
                variant="subtle"
                component="a"
                href="https://discord.gg/AyjZ58KXGy"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#333333',
                  fontWeight: 500,
                  justifyContent: 'flex-start',
                  height: '48px',
                  fontFamily: 'Inter, sans-serif',
                }}
                fullWidth
              >
                Community
              </Button>

              <Divider my="md" />

              {/* Mobile Auth Buttons */}
              <Button
                variant="outline"
                onClick={() => { navigate('/auth/login'); setMobileMenuOpen(false); }}
                style={{
                  borderColor: '#4686FE',
                  color: '#4686FE',
                  fontWeight: 600,
                  height: '48px',
                  fontFamily: 'Inter, sans-serif',
                }}
                fullWidth
              >
                Login
              </Button>
              <Button
                radius={8}
                onClick={() => { navigate('/auth/register'); setMobileMenuOpen(false); }}
                style={{
                  background: '#4686FE',
                  color: 'white',
                  fontWeight: 600,
                  height: '48px',
                  fontFamily: 'Inter, sans-serif',
                  border: 'none',
                }}
                fullWidth
              >
                Sign Up
              </Button>
            </Stack>
          </Container>
        </Box>
      )}
    </Box>
  );
}