'use client';

import { useAdminRedirect } from '@/hooks/useAdminRedirect';
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Card,
  SimpleGrid,
  Badge,
  ThemeIcon,
  Box,
  Divider,
  Paper,
  Avatar,
  Rating,
} from '@mantine/core';
import {
  Target,
  TrendingUp,
  Zap,
  Shield,
  Users,
  Brain,
  CheckCircle2,
  ArrowRight,
  Star,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/ui/Footer';
import Header from '@/components/ui/Header';

export default function Home() {
  // Redirecionar automaticamente usuários logados para área apropriada
  useAdminRedirect();

  return (
    <Box
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 50%, #ffffff 100%)',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Header />
      {/* Animated Background Elements */}
      <Box
        style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'linear-gradient(135deg, rgba(49, 67, 182, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 6s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '75%',
          left: '5%',
          width: '200px',
          height: '200px',
          background: 'linear-gradient(135deg, rgba(47, 178, 100, 0.1) 0%, rgba(250, 173, 24, 0.1) 100%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'float 8s ease-in-out infinite reverse',
          zIndex: 0,
        }}
      />
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          right: '5%',
          width: '250px',
          height: '250px',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)',
          borderRadius: '50%',
          filter: 'blur(70px)',
          animation: 'float 10s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      <Box
        style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          width: '180px',
          height: '180px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(239, 68, 68, 0.08) 100%)',
          borderRadius: '50%',
          filter: 'blur(55px)',
          animation: 'float 12s ease-in-out infinite reverse',
          zIndex: 0,
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '40%',
          left: '80%',
          width: '220px',
          height: '220px',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
          borderRadius: '50%',
          filter: 'blur(65px)',
          animation: 'float 9s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '15%',
          width: '160px',
          height: '160px',
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(79, 70, 229, 0.08) 100%)',
          borderRadius: '50%',
          filter: 'blur(45px)',
          animation: 'float 7s ease-in-out infinite reverse',
          zIndex: 0,
        }}
      />
      {/* Hero Section */}
      <Container
        size="lg"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '100px 2rem 0 2rem',
        }}
      >
        <style jsx global>{`
          html {
            scroll-behavior: smooth;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px) scale(1);
            }
            50% {
              transform: translateY(-20px) scale(1.05);
            }
          }

          @keyframes floatSlow {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-15px) rotate(5deg);
            }
          }

          @keyframes glow {
            0%, 100% {
              box-shadow: 0 0 20px rgba(49, 67, 182, 0.3);
            }
            50% {
              box-shadow: 0 0 40px rgba(49, 67, 182, 0.6);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.8;
            }
          }

          @keyframes gradient {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          @keyframes typewriter {
            0% {
              max-width: 0;
            }
            100% {
              max-width: 100%;
            }
          }

          @keyframes blink {
            0%, 100% {
              border-right-color: #3143B6;
            }
            50% {
              border-right-color: transparent;
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }

          .hero-badge {
            animation: fadeInUp 0.6s ease-out 0.1s both, float 3s ease-in-out infinite;
          }

          .hero-title {
            animation: fadeInUp 0.6s ease-out 0.2s both;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #3143B6 50%, #1a1a1a 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: fadeInUp 0.6s ease-out 0.2s both, shimmer 3s linear 1s infinite;
            font-weight: 800;
          }

          .hero-subtitle {
            display: inline-block;
            overflow: hidden;
            white-space: nowrap;
            border-right: 4px solid #3143B6;
            padding-right: 2px;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
            font-weight: 700;
            background: linear-gradient(
              90deg,
              #3143B6 0%,
              #FC7124 25%,
              #FAAD18 50%,
              #2FB264 75%,
              #3143B6 100%
            );
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            max-width: 0;
            animation:
              typewriter 2.5s steps(22, end) 0.5s forwards,
              blink 0.75s step-end infinite,
              shimmer 4s linear 2s infinite;
          }

          .hero-subtitle-wrapper {
            display: flex;
            justify-content: center;
            min-height: 24px;
          }

          .hero-description {
            animation: fadeInUp 0.8s ease-out 3s both;
          }

          .description-word {
            display: inline-block;
            opacity: 0;
            animation: fadeInUp 0.5s ease-out forwards;
          }

          .description-word:nth-child(1) { animation-delay: 3.0s; }
          .description-word:nth-child(2) { animation-delay: 3.1s; }
          .description-word:nth-child(3) { animation-delay: 3.2s; }
          .description-word:nth-child(4) { animation-delay: 3.3s; }
          .description-word:nth-child(5) { animation-delay: 3.4s; }
          .description-word:nth-child(6) { animation-delay: 3.5s; }
          .description-word:nth-child(7) { animation-delay: 3.6s; }
          .description-word:nth-child(8) { animation-delay: 3.7s; }
          .description-word:nth-child(9) { animation-delay: 3.8s; }
          .description-word:nth-child(10) { animation-delay: 3.9s; }

          .description-highlight {
            background: linear-gradient(
              135deg,
              #3143B6 0%,
              #a855f7 100%
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 600;
            position: relative;
          }

          .description-highlight::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(135deg, #3143B6 0%, #a855f7 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .description-highlight:hover::after {
            opacity: 1;
          }

          .hero-buttons {
            animation: fadeInUp 0.6s ease-out 0.5s both;
          }

          .btn-primary {
            position: relative;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #3143B6 0%, #5B73E8 50%, #A855F7 100%);
            background-size: 200% auto;
          }

          .btn-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .btn-primary:hover::before {
            left: 100%;
          }

          .btn-primary:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 20px 40px rgba(49, 67, 182, 0.4);
            background-position: right center;
          }

          .btn-secondary {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border: 2px solid transparent;
            background-image: linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), linear-gradient(135deg, #3143B6 0%, #A855F7 100%);
            background-origin: border-box;
            background-clip: content-box, border-box;
          }

          .btn-secondary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(49, 67, 182, 0.1), transparent);
            transition: left 0.5s;
          }

          .btn-secondary:hover::before {
            left: 100%;
          }

          .btn-secondary:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 12px 30px rgba(49, 67, 182, 0.2);
            background: rgba(255, 255, 255, 0.95);
          }

          .feature-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            position: relative;
            overflow: hidden;
          }

          .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(49, 67, 182, 0.02) 0%, rgba(168, 85, 247, 0.02) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 0;
          }

          .feature-card:hover::before {
            opacity: 1;
          }

          .feature-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 50px rgba(49, 67, 182, 0.15);
            border-color: rgba(49, 67, 182, 0.2);
          }

          .feature-icon {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            z-index: 1;
          }

          .feature-card:hover .feature-icon {
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 8px 25px rgba(49, 67, 182, 0.2);
          }

          .feature-content {
            position: relative;
            z-index: 1;
            transition: transform 0.3s ease;
          }

          .feature-card:hover .feature-content {
            transform: translateY(-2px);
          }

          @keyframes iconBounce {
            0%, 100% {
              transform: scale(1) rotate(0deg);
            }
            50% {
              transform: scale(1.05) rotate(2deg);
            }
          }

          .feature-icon:hover {
            animation: iconBounce 0.6s ease-in-out;
          }

          .testimonial-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            background: white;
          }

          .testimonial-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(49, 67, 182, 0.02) 0%, rgba(168, 85, 247, 0.02) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 0;
          }

          .testimonial-card:hover::before {
            opacity: 1;
          }

          .testimonial-card:hover {
            transform: translateY(-12px) scale(1.03);
            box-shadow: 0 25px 60px rgba(49, 67, 182, 0.15);
            border-color: rgba(49, 67, 182, 0.2);
          }

          .testimonial-avatar {
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
          }

          .testimonial-card:hover .testimonial-avatar {
            transform: scale(1.1);
            box-shadow: 0 8px 25px rgba(49, 67, 182, 0.2);
          }

          .testimonial-content {
            position: relative;
            z-index: 1;
          }

          .testimonial-quote {
            position: relative;
            font-style: italic;
            transition: all 0.3s ease;
          }

          .testimonial-quote::before {
            content: '"';
            position: absolute;
            top: -10px;
            left: -20px;
            font-size: 60px;
            color: rgba(49, 67, 182, 0.1);
            font-family: serif;
            line-height: 1;
            z-index: 0;
          }

          .testimonial-card:hover .testimonial-quote {
            transform: translateY(-2px);
          }

          .testimonial-rating {
            transition: transform 0.3s ease;
          }

          .testimonial-card:hover .testimonial-rating {
            transform: scale(1.1);
          }

          .cta-button {
            position: relative;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .cta-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1;
          }

          .cta-button:hover::before {
            left: 100%;
          }

          .cta-button:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 20px 60px rgba(49, 67, 182, 0.4);
          }

          .cta-button:active {
            transform: translateY(-2px) scale(1.02);
            transition: all 0.1s ease;
          }

          .enterprise-cta {
            position: relative;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .enterprise-cta::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(49, 67, 182, 0.3), transparent);
            transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1;
          }

          .enterprise-cta:hover::before {
            left: 100%;
          }

          .enterprise-cta:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 15px 50px rgba(49, 67, 182, 0.3);
            background: linear-gradient(135deg, #3143B6 0%, #5B73E8 100%) !important;
            color: white !important;
            border-color: #5B73E8 !important;
          }

          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: 0 0 20px rgba(49, 67, 182, 0.3);
            }
            50% {
              box-shadow: 0 0 30px rgba(49, 67, 182, 0.6), 0 0 40px rgba(168, 85, 247, 0.3);
            }
          }

          .cta-button:hover {
            animation: pulse-glow 2s ease-in-out infinite;
          }

          .pain-card-1:hover {
            transform: translateY(-8px) !important;
            box-shadow: 0 20px 40px rgba(252, 113, 36, 0.15) !important;
            border-color: rgba(252, 113, 36, 0.3) !important;
          }

          .pain-card-2:hover {
            transform: translateY(-8px) !important;
            box-shadow: 0 20px 40px rgba(250, 173, 24, 0.15) !important;
            border-color: rgba(250, 173, 24, 0.3) !important;
          }

          .pain-card-3:hover {
            transform: translateY(-8px) !important;
            box-shadow: 0 20px 40px rgba(47, 178, 100, 0.15) !important;
            border-color: rgba(47, 178, 100, 0.3) !important;
          }
        `}</style>

        <Stack align="center" gap={48} style={{ position: 'relative', zIndex: 1 }}>

          <Title
            order={1}
            ta="center"
            className="hero-title"
            style={{
              lineHeight: 1.05,
              fontSize: 'clamp(32px, 6vw, 80px)',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              maxWidth: '1000px',
              textShadow: '0 4px 20px rgba(49, 67, 182, 0.1)',
            }}
          >
            Your Elite{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3143B6 0%, #A855F7 50%, #EC4899 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 3s linear infinite',
              fontWeight: 900,
              position: 'relative',
            }}>
              Performance
            </span>
            {' '}System
          </Title>


          <Text
            className="hero-description"
            size="xl"
            ta="center"
            maw={700}
            style={{
              lineHeight: 1.7,
              fontSize: 'clamp(18px, 3vw, 24px)',
              color: 'hsl(0 0% 0% / 0.8)',
              fontWeight: 500,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              padding: '0 1rem',
            }}
          >
            Turn Dreams Into{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3143B6 0%, #A855F7 50%, #EC4899 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              textShadow: 'none',
              position: 'relative',
            }}>
              Reality
            </span>
            . Built for ambitious individuals who refuse to settle for{' '}
            <span style={{
              color: 'hsl(0 0% 0% / 0.4)',
              textDecoration: 'line-through',
              fontWeight: 400,
            }}>
              ordinary
            </span>
            .
          </Text>

          <Stack gap="md" mt={40} align="center" style={{ width: '100%', padding: '0 1rem' }}>
            <Group gap="md" justify="center" wrap="wrap" style={{ width: '100%' }}>
              <Button
                component="a"
                href="/auth/register"
                size="lg"
                radius={12}
                rightSection={<ArrowRight size={18} />}
                style={{
                  background: '#3143B6',
                  border: 'none',
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  height: '52px',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  minWidth: '200px',
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
                Get Started
              </Button>
              <Button
                component="a"
                href="#features"
                size="lg"
                radius={12}
                variant="light"
                style={{
                  background: 'rgba(49, 67, 182, 0.08)',
                  color: '#3143B6',
                  border: '1px solid rgba(49, 67, 182, 0.2)',
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  height: '52px',
                  transition: 'all 0.2s ease',
                  minWidth: '200px',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      background: 'rgba(49, 67, 182, 0.12)',
                      borderColor: 'rgba(49, 67, 182, 0.3)',
                      transform: 'translateY(-1px)',
                    },
                  },
                }}
              >
                Learn More
              </Button>
            </Group>
          </Stack>
        </Stack>
      </Container>

      {/* Pain Points Section */}
      <Box
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 50%, #ffffff 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '80px 0',
        }}
      >
        <Container size="lg">
          <Stack align="center" gap={60}>
            <Title
              order={2}
              ta="center"
              style={{
                fontSize: '42px',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                maxWidth: '800px',
              }}
            >
              Stop Letting Your{' '}
              <span style={{
                background: 'linear-gradient(135deg, #3143B6 0%, #A855F7 50%, #EC4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
              }}>
                Potential
              </span>
              {' '}Go to{' '}
              <span style={{
                color: 'hsl(0 0% 0% / 0.4)',
                textDecoration: 'line-through',
                fontWeight: 600,
              }}>
                Waste
              </span>
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={32} w="100%">
              <Card
                padding="xl"
                radius={20}
                className="pain-card-1"
                style={{
                  background: 'white',
                  border: '1px solid hsl(0 0% 0% / 0.08)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                }}
              >
                <Stack gap="md">
                  <ThemeIcon
                    size={60}
                    radius={16}
                    style={{
                      background: 'rgba(252, 113, 36, 0.1)',
                      color: '#FC7124',
                    }}
                  >
                    <Target size={28} />
                  </ThemeIcon>
                  <Text
                    size="lg"
                    fw={700}
                    style={{
                      color: 'hsl(0 0% 0% / 0.87)',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    Lost in Overwhelm
                  </Text>
                  <Text
                    size="md"
                    style={{
                      color: 'hsl(0 0% 0% / 0.6)',
                      lineHeight: 1.6,
                    }}
                  >
                    Big dreams but no clear path forward. You know what you want but struggle to
                    break it down into actionable steps.
                  </Text>
                </Stack>
              </Card>

              <Card
                padding="xl"
                radius={20}
                className="pain-card-2"
                style={{
                  background: 'white',
                  border: '1px solid hsl(0 0% 0% / 0.08)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                }}
              >
                <Stack gap="md">
                  <ThemeIcon
                    size={60}
                    radius={16}
                    style={{
                      background: 'rgba(250, 173, 24, 0.1)',
                      color: '#FAAD18',
                    }}
                  >
                    <TrendingUp size={28} />
                  </ThemeIcon>
                  <Text
                    size="lg"
                    fw={700}
                    style={{
                      color: 'hsl(0 0% 0% / 0.87)',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    Inconsistent Progress
                  </Text>
                  <Text
                    size="md"
                    style={{
                      color: 'hsl(0 0% 0% / 0.6)',
                      lineHeight: 1.6,
                    }}
                  >
                    Bursts of motivation followed by plateaus. You start strong but struggle to
                    maintain momentum toward your goals.
                  </Text>
                </Stack>
              </Card>

              <Card
                padding="xl"
                radius={20}
                className="pain-card-3"
                style={{
                  background: 'white',
                  border: '1px solid hsl(0 0% 0% / 0.08)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                }}
              >
                <Stack gap="md">
                  <ThemeIcon
                    size={60}
                    radius={16}
                    style={{
                      background: 'rgba(47, 178, 100, 0.1)',
                      color: '#2FB264',
                    }}
                  >
                    <Zap size={28} />
                  </ThemeIcon>
                  <Text
                    size="lg"
                    fw={700}
                    style={{
                      color: 'hsl(0 0% 0% / 0.87)',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    Missing the Edge
                  </Text>
                  <Text
                    size="md"
                    style={{
                      color: 'hsl(0 0% 0% / 0.6)',
                      lineHeight: 1.6,
                    }}
                  >
                    You&apos;re good, but not elite. You know there&apos;s another level you haven&apos;t
                    reached, but don&apos;t have the system to get there.
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        id="features"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 50%, #ffffff 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '100px 0',
        }}
      >
        <Container size="lg">
        <Stack align="center" gap={60}>
          <Stack align="center" gap="md">
            <Title
              order={2}
              ta="center"
              style={{
                fontSize: '42px',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                maxWidth: '800px',
              }}
            >
              Everything You Need to{' '}
              <span style={{
                background: 'linear-gradient(135deg, #3143B6 0%, #A855F7 50%, #EC4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
              }}>
                Perform at Your Peak
              </span>
            </Title>
            <Text
              size="lg"
              ta="center"
              maw={600}
              style={{
                color: 'hsl(0 0% 0% / 0.6)',
                lineHeight: 1.7,
              }}
            >
              A complete system designed for those who refuse to settle for average
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={40} w="100%">
            <Card
              padding="xl"
              radius={24}
              className="feature-card"
              style={{
                background: 'white',
                border: '1px solid hsl(0 0% 0% / 0.08)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Stack gap="lg">
                <ThemeIcon
                  size={72}
                  radius={20}
                  className="feature-icon"
                  style={{
                    background: 'linear-gradient(135deg, rgba(49, 67, 182, 0.15) 0%, rgba(49, 67, 182, 0.1) 100%)',
                    color: '#3143B6',
                    border: '2px solid rgba(49, 67, 182, 0.1)',
                  }}
                >
                  <Target size={36} />
                </ThemeIcon>
                <div className="feature-content">
                  <Text
                    size="24px"
                    fw={700}
                    style={{
                      color: 'hsl(0 0% 0% / 0.87)',
                      marginBottom: '12px',
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #3143B6 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    OKR Framework
                  </Text>
                  <Text
                    size="md"
                    style={{
                      color: 'hsl(0 0% 0% / 0.6)',
                      lineHeight: 1.7,
                    }}
                  >
                    Set objectives and key results like the world&apos;s top performers. Break down
                    ambitious goals into measurable milestones.
                  </Text>
                </div>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius={24}
              className="feature-card"
              style={{
                background: 'white',
                border: '1px solid hsl(0 0% 0% / 0.08)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Stack gap="lg">
                <ThemeIcon
                  size={72}
                  radius={20}
                  className="feature-icon"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
                    color: '#A855F7',
                    border: '2px solid rgba(168, 85, 247, 0.1)',
                  }}
                >
                  <Star size={36} />
                </ThemeIcon>
                <div className="feature-content">
                  <Text
                    size="24px"
                    fw={700}
                    style={{
                      color: 'hsl(0 0% 0% / 0.87)',
                      marginBottom: '12px',
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #A855F7 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Core Values
                  </Text>
                  <Text
                    size="md"
                    style={{
                      color: 'hsl(0 0% 0% / 0.6)',
                      lineHeight: 1.7,
                    }}
                  >
                    Define and align with your personal values. Create reinforcing behaviors
                    that keep you authentic to what matters most.
                  </Text>
                </div>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius={24}
              className="feature-card"
              style={{
                background: 'white',
                border: '1px solid hsl(0 0% 0% / 0.08)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Stack gap="lg">
                <ThemeIcon
                  size={72}
                  radius={20}
                  className="feature-icon"
                  style={{
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)',
                    color: '#EC4899',
                    border: '2px solid rgba(236, 72, 153, 0.1)',
                  }}
                >
                  <Users size={36} />
                </ThemeIcon>
                <div className="feature-content">
                  <Text
                    size="24px"
                    fw={700}
                    style={{
                      color: 'hsl(0 0% 0% / 0.87)',
                      marginBottom: '12px',
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #EC4899 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Vision Board
                  </Text>
                  <Text
                    size="md"
                    style={{
                      color: 'hsl(0 0% 0% / 0.6)',
                      lineHeight: 1.7,
                    }}
                  >
                    Visualize your dreams with powerful imagery. Create inspiring boards
                    that keep your aspirations front and center daily.
                  </Text>
                </div>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius={24}
              className="feature-card"
              style={{
                background: 'white',
                border: '1px solid hsl(0 0% 0% / 0.08)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Stack gap="lg">
                <ThemeIcon
                  size={72}
                  radius={20}
                  className="feature-icon"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                    color: '#06b6d4',
                    border: '2px solid rgba(6, 182, 212, 0.1)',
                  }}
                >
                  <BookOpen size={36} />
                </ThemeIcon>
                <div className="feature-content">
                  <Text
                    size="24px"
                    fw={700}
                    style={{
                      color: 'hsl(0 0% 0% / 0.87)',
                      marginBottom: '12px',
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #06b6d4 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Daily Journal
                  </Text>
                  <Text
                    size="md"
                    style={{
                      color: 'hsl(0 0% 0% / 0.6)',
                      lineHeight: 1.7,
                    }}
                  >
                    Reflect, plan, and grow through guided journaling. Track thoughts,
                    insights, and breakthroughs on your journey to excellence.
                  </Text>
                </div>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius={24}
              className="feature-card"
              style={{
                background: 'white',
                border: '1px solid hsl(0 0% 0% / 0.08)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Stack gap="lg">
                <ThemeIcon
                  size={72}
                  radius={20}
                  className="feature-icon"
                  style={{
                    background: 'linear-gradient(135deg, rgba(47, 178, 100, 0.15) 0%, rgba(47, 178, 100, 0.1) 100%)',
                    color: '#2FB264',
                    border: '2px solid rgba(47, 178, 100, 0.1)',
                  }}
                >
                  <TrendingUp size={36} />
                </ThemeIcon>
                <div className="feature-content">
                  <Text
                    size="24px"
                    fw={700}
                    style={{
                      color: 'hsl(0 0% 0% / 0.87)',
                      marginBottom: '12px',
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #2FB264 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Habit Tracking
                  </Text>
                  <Text
                    size="md"
                    style={{
                      color: 'hsl(0 0% 0% / 0.6)',
                      lineHeight: 1.7,
                    }}
                  >
                    Build the daily routines that compound into extraordinary results. Track
                    streaks, monitor consistency, and develop elite habits.
                  </Text>
                </div>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius={24}
              className="feature-card"
              style={{
                background: 'white',
                border: '1px solid hsl(0 0% 0% / 0.08)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Stack gap="lg">
                <ThemeIcon
                  size={72}
                  radius={20}
                  className="feature-icon"
                  style={{
                    background: 'linear-gradient(135deg, rgba(250, 173, 24, 0.15) 0%, rgba(250, 173, 24, 0.1) 100%)',
                    color: '#FAAD18',
                    border: '2px solid rgba(250, 173, 24, 0.1)',
                  }}
                >
                  <Shield size={36} />
                </ThemeIcon>
                <div className="feature-content">
                  <Text
                    size="24px"
                    fw={700}
                    style={{
                      color: 'hsl(0 0% 0% / 0.87)',
                      marginBottom: '12px',
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #FAAD18 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Strategic Focus Areas
                  </Text>
                  <Text
                    size="md"
                    style={{
                      color: 'hsl(0 0% 0% / 0.6)',
                      lineHeight: 1.7,
                    }}
                  >
                    Achieve holistic excellence. Organize goals across health, career,
                    relationships, and personal growth for balanced peak performance.
                  </Text>
                </div>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box
        id="pricing"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 50%, #ffffff 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '100px 0',
        }}
      >
        <Container size="lg">
          <Stack align="center" gap={60}>
            <Stack align="center" gap="md">
              <Title
                order={2}
                ta="center"
                style={{
                  fontSize: '42px',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  maxWidth: '800px',
                }}
              >
                Choose Your{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #3143B6 0%, #A855F7 50%, #EC4899 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900,
                }}>
                  Performance Level
                </span>
              </Title>
              <Text
                size="lg"
                ta="center"
                maw={700}
                style={{
                  color: 'hsl(0 0% 0% / 0.6)',
                  lineHeight: 1.7,
                }}
              >
                All plans are free during our beta testing period. Your data will be preserved
                when we launch. Start building your elite performance system today.
              </Text>
              <Badge
                size="lg"
                radius="xl"
                style={{
                  background: 'rgba(47, 178, 100, 0.1)',
                  color: '#2FB264',
                  border: 'none',
                  padding: '6px 16px',
                }}
                leftSection={<Star size={14} />}
              >
                Beta Launch: Q4 2025
              </Badge>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl" w="100%">
              {/* Free Beta */}
              <Card
                padding="xl"
                radius={20}
                style={{
                  background: 'white',
                  border: '1px solid hsl(0 0% 0% / 0.08)',
                  boxShadow: 'none',
                  minHeight: '450px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack gap="lg" style={{ flex: 1 }}>
                  <Stack gap="xs">
                    <Text
                      size="xl"
                      fw={700}
                      style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                    >
                      Test Drive
                    </Text>
                    <Group align="baseline" gap={4}>
                      <Text
                        size="48px"
                        fw={800}
                        style={{
                          lineHeight: 1,
                          color: 'hsl(0 0% 0% / 0.87)',
                        }}
                      >
                        Free
                      </Text>
                    </Group>
                    <Text
                      size="sm"
                      fw={500}
                      style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                    >
                      During Beta Testing
                    </Text>
                  </Stack>
                  <Divider />
                  <Stack gap="xs">
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#2FB264' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                      >
                        All core features
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#2FB264' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                      >
                        Basic limitations
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#2FB264' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                      >
                        Community support
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#2FB264' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                      >
                        Data preserved in beta
                      </Text>
                    </Group>
                  </Stack>
                  <Button
                    component="a"
                    href="/auth/register"
                    variant="outline"
                    radius={48}
                    fullWidth
                    mt="auto"
                    style={{
                      color: 'hsl(0 0% 0% / 0.87)',
                      borderColor: 'hsl(0 0% 0% / 0.2)',
                      background: 'transparent',
                      height: '48px',
                      fontWeight: 600,
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          background: 'hsl(0 0% 0% / 0.04)',
                        },
                      },
                    }}
                  >
                    Start Free
                  </Button>
                </Stack>
              </Card>

              {/* Core */}
              <Card
                padding="xl"
                radius={20}
                style={{
                  background: 'white',
                  border: '2px solid #3143B6',
                  boxShadow: '0 4px 20px rgba(49, 67, 182, 0.12)',
                  minHeight: '450px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack gap="lg" style={{ flex: 1 }}>
                  <Stack gap="xs">
                    <Text
                      size="xl"
                      fw={700}
                      style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                    >
                      Core
                    </Text>
                    <Group align="baseline" gap={4}>
                      <Text
                        size="48px"
                        fw={800}
                        style={{
                          lineHeight: 1,
                          color: 'hsl(0 0% 0% / 0.87)',
                        }}
                      >
                        $10
                      </Text>
                      <Text
                        size="md"
                        fw={500}
                        style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                      >
                        /mo
                      </Text>
                    </Group>
                    <Text
                      size="sm"
                      fw={500}
                      style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                    >
                      Unlock Your Potential
                    </Text>
                  </Stack>
                  <Divider />
                  <Stack gap="xs">
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#3143B6' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        All features unlocked
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#3143B6' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        No limitations
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#3143B6' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Priority support
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#3143B6' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Unlimited goals & tasks
                      </Text>
                    </Group>
                  </Stack>
                  <Button
                    component="a"
                    href="/auth/register"
                    radius={48}
                    fullWidth
                    mt="auto"
                    style={{
                      background: '#3143B6',
                      border: 'none',
                      height: '48px',
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
                    Get Started
                  </Button>
                </Stack>
              </Card>

              {/* Pro */}
              <Card
                padding="xl"
                radius={20}
                style={{
                  background: 'white',
                  border: '1px solid hsl(0 0% 0% / 0.08)',
                  boxShadow: 'none',
                  minHeight: '450px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack gap="lg" style={{ flex: 1 }}>
                  <Stack gap="xs">
                    <Group justify="space-between" align="flex-start">
                      <Text
                        size="xl"
                        fw={700}
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Pro
                      </Text>
                      <Badge
                        size="sm"
                        radius="xl"
                        style={{
                          background: 'rgba(168, 85, 247, 0.1)',
                          color: '#a855f7',
                          border: 'none',
                        }}
                      >
                        Popular
                      </Badge>
                    </Group>
                    <Group align="baseline" gap={4}>
                      <Text
                        size="48px"
                        fw={800}
                        style={{
                          lineHeight: 1,
                          color: 'hsl(0 0% 0% / 0.87)',
                        }}
                      >
                        $20
                      </Text>
                      <Text
                        size="md"
                        fw={500}
                        style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                      >
                        /mo
                      </Text>
                    </Group>
                    <Text
                      size="sm"
                      fw={500}
                      style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                    >
                      Connect Everything
                    </Text>
                  </Stack>
                  <Divider />
                  <Stack gap="xs">
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Everything in Core
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Calendar integrations
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Third-party apps
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Advanced analytics
                      </Text>
                    </Group>
                  </Stack>
                  <Button
                    component="a"
                    href="/auth/register"
                    radius={48}
                    fullWidth
                    mt="auto"
                    style={{
                      background: '#a855f7',
                      border: 'none',
                      height: '48px',
                      fontWeight: 600,
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          background: '#9333ea',
                        },
                      },
                    }}
                  >
                    Go Pro
                  </Button>
                </Stack>
              </Card>

              {/* Elite */}
              <Card
                padding="xl"
                radius={20}
                style={{
                  background: 'white',
                  border: '1px solid hsl(0 0% 0% / 0.08)',
                  boxShadow: 'none',
                  minHeight: '450px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack gap="lg" style={{ flex: 1 }}>
                  <Stack gap="xs">
                    <Group justify="space-between" align="flex-start">
                      <Text
                        size="xl"
                        fw={700}
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Elite
                      </Text>
                      <Badge
                        size="sm"
                        radius="xl"
                        style={{
                          background: 'rgba(250, 173, 24, 0.1)',
                          color: '#FAAD18',
                          border: 'none',
                        }}
                      >
                        Premium
                      </Badge>
                    </Group>
                    <Group align="baseline" gap={4}>
                      <Text
                        size="48px"
                        fw={800}
                        style={{
                          lineHeight: 1,
                          color: 'hsl(0 0% 0% / 0.87)',
                        }}
                      >
                        $30
                      </Text>
                      <Text
                        size="md"
                        fw={500}
                        style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                      >
                        /mo
                      </Text>
                    </Group>
                    <Text
                      size="sm"
                      fw={500}
                      style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                    >
                      AI-Powered Excellence
                    </Text>
                  </Stack>
                  <Divider />
                  <Stack gap="xs">
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#FAAD18' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Everything in Pro
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#FAAD18' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        AI goal recommendations
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#FAAD18' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Smart insights & patterns
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <CheckCircle2 size={16} style={{ color: '#FAAD18' }} />
                      <Text
                        size="sm"
                        style={{ color: 'hsl(0 0% 0% / 0.87)' }}
                      >
                        Personalized coaching
                      </Text>
                    </Group>
                  </Stack>
                  <Button
                    component="a"
                    href="/auth/register"
                    radius={48}
                    fullWidth
                    mt="auto"
                    style={{
                      background: '#FAAD18',
                      border: 'none',
                      height: '48px',
                      fontWeight: 600,
                      color: 'hsl(0 0% 0% / 0.87)',
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          background: '#e09b00',
                        },
                      },
                    }}
                  >
                    Go Elite
                  </Button>
                </Stack>
              </Card>
            </SimpleGrid>

            <Text
              size="sm"
              ta="center"
              maw={600}
              style={{ color: 'hsl(0 0% 0% / 0.6)' }}
            >
              Note: After the beta period ends, free tier users will have limited data retention.
              Upgrade to any paid plan to maintain full access to your performance history.
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* Social Proof Section */}
      <Container id="testimonials" size="lg" py={100}>
        <Stack align="center" gap={60}>
          <Stack align="center" gap={40}>
            <Title
              order={2}
              ta="center"
              style={{
                fontSize: '42px',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                maxWidth: '800px',
              }}
            >
              Join{' '}
              <span style={{
                background: 'linear-gradient(135deg, #3143B6 0%, #A855F7 50%, #EC4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
              }}>
                Elite Performers
              </span>
              {' '}Worldwide
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={60} w="100%">
              <Stack align="center" gap="xs">
                <Text
                  size="60px"
                  fw={800}
                  style={{
                    lineHeight: 1,
                    color: 'hsl(0 0% 0% / 0.87)',
                  }}
                >
                  10+
                </Text>
                <Text
                  size="md"
                  fw={500}
                  style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                >
                  Beta Testers
                </Text>
              </Stack>
              <Stack align="center" gap="xs">
                <Text
                  size="60px"
                  fw={800}
                  style={{
                    lineHeight: 1,
                    color: 'hsl(0 0% 0% / 0.87)',
                  }}
                >
                  100+
                </Text>
                <Text
                  size="md"
                  fw={500}
                  style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                >
                  Goals Set
                </Text>
              </Stack>
              <Stack align="center" gap="xs">
                <Text
                  size="60px"
                  fw={800}
                  style={{
                    lineHeight: 1,
                    color: 'hsl(0 0% 0% / 0.87)',
                  }}
                >
                  1K+
                </Text>
                <Text
                  size="md"
                  fw={500}
                  style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                >
                  Tasks Completed
                </Text>
              </Stack>
            </SimpleGrid>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={32} w="100%">
            <Card
              padding="xl"
              radius={24}
              className="testimonial-card"
              style={{
                border: '2px solid hsl(0 0% 0% / 0.08)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Stack gap="lg" className="testimonial-content">
                <Group>
                  <Avatar
                    size={60}
                    radius="xl"
                    className="testimonial-avatar"
                    style={{
                      background: 'linear-gradient(135deg, #3143B6 0%, #06b6d4 100%)',
                      border: '3px solid white',
                      boxShadow: '0 4px 20px rgba(49, 67, 182, 0.2)',
                    }}
                  >
                    SC
                  </Avatar>
                  <Stack gap={4}>
                    <Text
                      size="md"
                      fw={700}
                      style={{
                        color: 'hsl(0 0% 0% / 0.87)',
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #3143B6 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Sarah Chen
                    </Text>
                    <Text
                      size="sm"
                      fw={500}
                      style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                    >
                      Professional Athlete
                    </Text>
                  </Stack>
                </Group>
                <Rating
                  value={5}
                  readOnly
                  size="md"
                  color="#FAAD18"
                  className="testimonial-rating"
                />
                <Text
                  size="md"
                  className="testimonial-quote"
                  style={{
                    color: 'hsl(0 0% 0% / 0.7)',
                    lineHeight: 1.6,
                    fontSize: '16px',
                    fontWeight: 500,
                  }}
                >
                  This system transformed how I approach my training goals. I&apos;ve achieved more
                  in 3 months than I did in the past year. The OKR framework is a game-changer.
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius={24}
              className="testimonial-card"
              style={{
                border: '2px solid hsl(0 0% 0% / 0.08)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Stack gap="lg" className="testimonial-content">
                <Group>
                  <Avatar
                    size={60}
                    radius="xl"
                    className="testimonial-avatar"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                      border: '3px solid white',
                      boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)',
                    }}
                  >
                    MR
                  </Avatar>
                  <Stack gap={4}>
                    <Text
                      size="md"
                      fw={700}
                      style={{
                        color: 'hsl(0 0% 0% / 0.87)',
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #a855f7 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Marcus Rodriguez
                    </Text>
                    <Text
                      size="sm"
                      fw={500}
                      style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                    >
                      Tech Entrepreneur
                    </Text>
                  </Stack>
                </Group>
                <Rating
                  value={5}
                  readOnly
                  size="md"
                  color="#FAAD18"
                  className="testimonial-rating"
                />
                <Text
                  size="md"
                  className="testimonial-quote"
                  style={{
                    color: 'hsl(0 0% 0% / 0.7)',
                    lineHeight: 1.6,
                    fontSize: '16px',
                    fontWeight: 500,
                  }}
                >
                  Finally, a tool that matches the intensity of my ambitions. The structure it
                  provides has helped me scale two companies while maintaining work-life balance.
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius={24}
              className="testimonial-card"
              style={{
                border: '2px solid hsl(0 0% 0% / 0.08)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Stack gap="lg" className="testimonial-content">
                <Group>
                  <Avatar
                    size={60}
                    radius="xl"
                    className="testimonial-avatar"
                    style={{
                      background: 'linear-gradient(135deg, #2FB264 0%, #22c55e 100%)',
                      border: '3px solid white',
                      boxShadow: '0 4px 20px rgba(47, 178, 100, 0.2)',
                    }}
                  >
                    EJ
                  </Avatar>
                  <Stack gap={4}>
                    <Text
                      size="md"
                      fw={700}
                      style={{
                        color: 'hsl(0 0% 0% / 0.87)',
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #2FB264 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Emily Johnson
                    </Text>
                    <Text
                      size="sm"
                      fw={500}
                      style={{ color: 'hsl(0 0% 0% / 0.6)' }}
                    >
                      Medical Student
                    </Text>
                  </Stack>
                </Group>
                <Rating
                  value={5}
                  readOnly
                  size="md"
                  color="#FAAD18"
                  className="testimonial-rating"
                />
                <Text
                  size="md"
                  className="testimonial-quote"
                  style={{
                    color: 'hsl(0 0% 0% / 0.7)',
                    lineHeight: 1.6,
                    fontSize: '16px',
                    fontWeight: 500,
                  }}
                >
                  I went from feeling overwhelmed to being in complete control. The habit tracking
                  keeps me consistent, and I can see my progress across all areas of my life.
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>

      {/* Enterprise Section */}
      <Box style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 50%, #ffffff 100%)', paddingTop: 80, paddingBottom: 80 }}>
        <Container size="lg">
          <Paper
            p={{ base: 40, sm: 50, md: 60 }}
            radius={24}
            style={{
              background: 'rgba(49, 67, 182, 0.03)',
              border: '2px solid rgba(49, 67, 182, 0.12)',
              boxShadow: '0 8px 32px rgba(49, 67, 182, 0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #3143B6 0%, #5B73E8 100%)',
              }}
            />
            <Stack align="center" gap={32}>
              <ThemeIcon
                size={88}
                radius={22}
                style={{
                  background: 'linear-gradient(135deg, rgba(49, 67, 182, 0.15) 0%, rgba(91, 115, 232, 0.15) 100%)',
                  color: '#3143B6',
                  border: '2px solid rgba(49, 67, 182, 0.2)',
                }}
              >
                <Users size={42} />
              </ThemeIcon>
              <Title
                order={2}
                ta="center"
                fw={700}
                style={{
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  color: 'hsl(0 0% 0% / 0.87)',
                  letterSpacing: '-0.01em',
                }}
              >
                Enterprise Solutions Coming Soon
              </Title>
              <Text
                size="lg"
                ta="center"
                maw={700}
                style={{
                  color: 'hsl(0 0% 0% / 0.6)',
                  lineHeight: 1.7,
                }}
              >
                We&apos;re developing powerful team collaboration features and enterprise-grade security
                for organizations that want to scale elite performance across their entire workforce.
              </Text>
              <Button
                component="a"
                href="/enterprise-waitlist"
                size="xl"
                radius={48}
                leftSection={<Brain size={22} />}
                variant="outline"
                className="enterprise-cta"
                style={{
                  borderColor: '#3143B6',
                  color: '#3143B6',
                  background: 'rgba(49, 67, 182, 0.08)',
                  border: '3px solid #3143B6',
                  padding: '18px 36px',
                  fontSize: '18px',
                  fontWeight: 700,
                  height: '64px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                Join Enterprise Waitlist
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>


      <Footer />
    </Box>
  );
}
