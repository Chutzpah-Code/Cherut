import React from 'react';
import {
  Container,
  Group,
  Button,
  Box,
} from '@mantine/core';
import Link from 'next/link';
import CherutLogo from '@/components/ui/CherutLogo';
import MobileMenuToggle from '@/components/ui/MobileMenuToggle';

export default function Header() {
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
            <Link href="/about" style={{ textDecoration: 'none' }}>
              <Button
                variant="subtle"
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
            </Link>
            <Link href="/#pricing" style={{ textDecoration: 'none' }}>
              <Button
                variant="subtle"
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
            </Link>
            <Link href="/#testimonials" style={{ textDecoration: 'none' }}>
              <Button
                variant="subtle"
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
            </Link>
            <a href="https://discord.com/invite/zJp9sWsUNp" target="_blank" style={{ textDecoration: 'none' }}>
              <Button
                variant="subtle"
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
            </a>
          </Group>

          {/* Desktop Auth Buttons */}
          <Group gap="md" visibleFrom="md">
            <Link href="/auth/login" style={{ textDecoration: 'none' }}>
              <Button
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
            </Link>
            <Link href="/auth/register" style={{ textDecoration: 'none' }}>
              <Button
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
            </Link>
          </Group>

          {/* Mobile Menu Toggle */}
          <MobileMenuToggle />
        </Group>
      </Container>
    </Box>
  );
}