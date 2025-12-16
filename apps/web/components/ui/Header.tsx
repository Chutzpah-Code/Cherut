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
import Link from 'next/link';
import CherutLogo from '@/components/ui/CherutLogo';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      }}
    >
      <Container size="lg">
        <Group justify="space-between" h={100}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Group style={{ cursor: 'pointer' }}>
              <CherutLogo size={100} />
            </Group>
          </Link>

          {/* Desktop Navigation Links */}
          <Group gap="xl" visibleFrom="md">
            <Button
              variant="subtle"
              component={Link}
              href="/about"
              style={{ color: '#374151', fontWeight: 500 }}
              styles={{
                root: {
                  '&:hover': {
                    background: 'rgba(49, 67, 182, 0.1)',
                    color: '#3143B6',
                  },
                },
              }}
            >
              About
            </Button>
            <Button
              variant="subtle"
              component="a"
              href="/#pricing"
              style={{ color: '#374151', fontWeight: 500 }}
              styles={{
                root: {
                  '&:hover': {
                    background: 'rgba(49, 67, 182, 0.1)',
                    color: '#3143B6',
                  },
                },
              }}
            >
              Pricing
            </Button>
            <Button
              variant="subtle"
              component="a"
              href="/#testimonials"
              style={{ color: '#374151', fontWeight: 500 }}
              styles={{
                root: {
                  '&:hover': {
                    background: 'rgba(49, 67, 182, 0.1)',
                    color: '#3143B6',
                  },
                },
              }}
            >
              Testimonials
            </Button>
            <Button
              variant="subtle"
              component="a"
              href="https://discord.com/invite/zJp9sWsUNp"
              target="_blank"
              style={{ color: '#374151', fontWeight: 500 }}
              styles={{
                root: {
                  '&:hover': {
                    background: 'rgba(49, 67, 182, 0.1)',
                    color: '#3143B6',
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
              component={Link}
              href="/auth/login"
              variant="subtle"
              style={{ color: '#374151', fontWeight: 600 }}
              styles={{
                root: {
                  '&:hover': {
                    background: 'rgba(49, 67, 182, 0.1)',
                    color: '#3143B6',
                  },
                },
              }}
            >
              Login
            </Button>
            <Button
              component={Link}
              href="/auth/register"
              radius={8}
              style={{
                background: '#3143B6',
                color: 'white',
                fontWeight: 600,
                padding: '8px 20px',
                transition: 'all 0.2s ease',
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
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            padding: '20px 0',
          }}
        >
          <Container size="lg">
            <Stack gap="md">
              {/* Mobile Navigation Links */}
              <Button
                variant="subtle"
                component={Link}
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#374151',
                  fontWeight: 500,
                  justifyContent: 'flex-start',
                  height: '48px',
                }}
                fullWidth
              >
                About
              </Button>
              <Button
                variant="subtle"
                component="a"
                href="/#pricing"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#374151',
                  fontWeight: 500,
                  justifyContent: 'flex-start',
                  height: '48px',
                }}
                fullWidth
              >
                Pricing
              </Button>
              <Button
                variant="subtle"
                component="a"
                href="/#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#374151',
                  fontWeight: 500,
                  justifyContent: 'flex-start',
                  height: '48px',
                }}
                fullWidth
              >
                Testimonials
              </Button>
              <Button
                variant="subtle"
                component="a"
                href="https://discord.com/invite/zJp9sWsUNp"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#374151',
                  fontWeight: 500,
                  justifyContent: 'flex-start',
                  height: '48px',
                }}
                fullWidth
              >
                Community
              </Button>

              <Divider my="md" />

              {/* Mobile Auth Buttons */}
              <Button
                component={Link}
                href="/auth/login"
                variant="outline"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  borderColor: '#3143B6',
                  color: '#3143B6',
                  fontWeight: 600,
                  height: '48px',
                }}
                fullWidth
              >
                Login
              </Button>
              <Button
                component={Link}
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                radius={8}
                style={{
                  background: '#3143B6',
                  color: 'white',
                  fontWeight: 600,
                  height: '48px',
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