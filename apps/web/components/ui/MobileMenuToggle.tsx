'use client';

import { useState } from 'react';
import {
  Button,
  Stack,
  Box,
  Divider,
  Container,
} from '@mantine/core';
import {
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';

export default function MobileMenuToggle() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <Box
          hiddenFrom="md"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            padding: '20px 0',
            zIndex: 999,
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
                component={Link}
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
                component={Link}
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
    </>
  );
}