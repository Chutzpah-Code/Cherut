'use client';

import { Container, Title, Text, Stack, Card, Group, SimpleGrid, ThemeIcon, Box, Button } from '@mantine/core';
import { Target, Heart, Zap, Users, Award, Globe, CheckCircle2, ArrowRight } from 'lucide-react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function About() {
  return (
    <Box style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <Header />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <Container size="lg" py={80} style={{ marginTop: '100px' }}>
        <Stack gap={80}>
          {/* Hero Section */}
          <Stack align="center" gap="lg">
            <Title
              order={1}
              ta="center"
              style={{
                fontFamily: 'Inter Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'clamp(36px, 6vw, 48px)',
                lineHeight: 1.2,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#000000',
              }}
            >
              About <span style={{ color: '#4686FE' }}>Cherut</span>
            </Title>
            <Text
              ta="center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '24px',
                lineHeight: '32px',
                color: '#666666',
                fontWeight: 400,
                maxWidth: '700px',
                margin: '0 auto',
              }}
            >
              We're building the world's most comprehensive personal excellence platform,
              designed for ambitious individuals who refuse to settle for ordinary.
            </Text>
          </Stack>

          {/* Mission Statement */}
          <Card
            padding="xl"
            radius={16}
            style={{
              background: '#F5F5F5',
              border: '1px solid #CCCCCC',
              boxShadow: 'none',
            }}
          >
            <Stack align="center" gap="lg">
              <ThemeIcon
                size={64}
                radius={16}
                style={{
                  background: '#4686FE',
                  color: 'white',
                  border: 'none',
                }}
              >
                <Target size={32} />
              </ThemeIcon>
              <Title
                order={2}
                ta="center"
                style={{
                  fontFamily: 'Inter Display, sans-serif',
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#000000',
                }}
              >
                Our Mission
              </Title>
              <Text
                ta="center"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '20px',
                  lineHeight: '28px',
                  color: '#666666',
                  fontWeight: 400,
                  maxWidth: '800px',
                }}
              >
                To empower elite performers with the tools, insights, and systems they need to achieve
                extraordinary results across all areas of life. We believe that with the right framework,
                anyone can transform their potential into reality.
              </Text>
            </Stack>
          </Card>

          {/* Core Values */}
          <Stack gap="xl">
            <Title
              order={2}
              ta="center"
              style={{
                fontFamily: 'Inter Display, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                color: '#000000',
              }}
            >
              What Drives Us
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={32}>
              {[
                {
                  icon: Zap,
                  title: 'Excellence First',
                  description: "We're obsessed with creating tools that don't just work, but work exceptionally well. Every feature is designed with elite performance in mind.",
                },
                {
                  icon: Heart,
                  title: 'Human-Centered',
                  description: 'Technology serves humans, not the other way around. Our platform adapts to your life, values, and goals, creating a truly personal experience.',
                },
                {
                  icon: Globe,
                  title: 'Global Impact',
                  description: "By empowering individuals to reach their full potential, we're contributing to a world where excellence becomes the norm, not the exception.",
                },
              ].map((value, index) => (
                <Card
                  key={index}
                  padding="xl"
                  radius={16}
                  style={{
                    background: 'white',
                    border: '1px solid #CCCCCC',
                    boxShadow: 'none',
                    height: '100%',
                  }}
                >
                  <Stack gap="lg" h="100%">
                    <ThemeIcon
                      size={48}
                      radius={12}
                      style={{
                        background: '#F5F5F5',
                        color: '#4686FE',
                        border: 'none',
                      }}
                    >
                      <value.icon size={24} />
                    </ThemeIcon>
                    <Text
                      style={{
                        fontFamily: 'Inter Display, sans-serif',
                        fontSize: '20px',
                        fontWeight: 600,
                        color: '#000000',
                      }}
                    >
                      {value.title}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        color: '#666666',
                        lineHeight: '24px',
                      }}
                    >
                      {value.description}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>

          {/* The Story */}
          <Stack gap="xl">
            <Title
              order={2}
              ta="center"
              style={{
                fontFamily: 'Inter Display, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                color: '#000000',
              }}
            >
              Our Story
            </Title>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
              <Stack gap="lg">
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#4686FE',
                  }}
                >
                  Born from Frustration
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    color: '#666666',
                    lineHeight: '24px',
                  }}
                >
                  Cherut was born from the frustration of using disconnected productivity tools that promised
                  everything but delivered mediocrity. We were tired of jumping between apps, losing track
                  of goals, and feeling like our potential was being wasted on ineffective systems.
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    color: '#666666',
                    lineHeight: '24px',
                  }}
                >
                  We realized that high achievers needed more than just another task manager or habit tracker.
                  They needed a comprehensive system that could handle the complexity of an ambitious life
                  while remaining elegant and intuitive.
                </Text>
              </Stack>

              <Stack gap="lg">
                <Text
                  style={{
                    fontFamily: 'Inter Display, sans-serif',
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#4686FE',
                  }}
                >
                  Built for Elite Performance
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    color: '#666666',
                    lineHeight: '24px',
                  }}
                >
                  Every aspect of Cherut is designed with one question in mind: "How would the world's top
                  performers approach this?" From our OKR framework inspired by Google and Intel, to our
                  values-based decision making system, we study excellence to create excellence.
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    color: '#666666',
                    lineHeight: '24px',
                  }}
                >
                  We're not building another productivity app. We're crafting a performance operating system
                  for the next generation of leaders, entrepreneurs, athletes, and change-makers.
                </Text>
              </Stack>
            </SimpleGrid>
          </Stack>

          {/* Why Cherut */}
          <Card
            padding="xl"
            radius={16}
            style={{
              background: '#F5F5F5',
              border: '1px solid #CCCCCC',
              boxShadow: 'none',
            }}
          >
            <Stack gap="lg">
              <Title
                order={3}
                ta="center"
                style={{
                  fontFamily: 'Inter Display, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#000000',
                }}
              >
                Why "Cherut"?
              </Title>
              <Text
                ta="center"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#666666',
                  lineHeight: '24px',
                  maxWidth: '700px',
                  margin: '0 auto',
                }}
              >
                "Cherut" (חרות) is a Hebrew word meaning "freedom" or "liberty" - not just political freedom,
                but the deeper freedom that comes from self-mastery and the ability to shape your own destiny.
                It represents the liberation you feel when you're operating at your highest potential.
              </Text>
              <Text
                ta="center"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#666666',
                  lineHeight: '24px',
                  maxWidth: '700px',
                  margin: '0 auto',
                }}
              >
                This is the freedom we want to give you - the freedom to pursue your biggest dreams with
                confidence, clarity, and the right tools to make them reality.
              </Text>
            </Stack>
          </Card>

          {/* What Makes Us Different */}
          <Stack gap="xl">
            <Title
              order={2}
              ta="center"
              style={{
                fontFamily: 'Inter Display, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                color: '#000000',
              }}
            >
              What Makes Us Different
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={32}>
              {[
                {
                  icon: Award,
                  title: 'No Compromises',
                  description: "We don't build for the masses. We build for people who demand excellence and are willing to invest in their growth. Every feature is crafted for peak performance.",
                },
                {
                  icon: Users,
                  title: 'Community Driven',
                  description: 'Our beta community shapes every decision. We listen, iterate, and improve based on real feedback from real high achievers using Cherut daily.',
                },
                {
                  icon: CheckCircle2,
                  title: 'Holistic Approach',
                  description: "We understand that peak performance isn't just about productivity. It's about aligning your actions with your values and creating sustainable excellence.",
                },
                {
                  icon: Zap,
                  title: 'Future-Ready',
                  description: "We're building for tomorrow's challenges today. Our platform evolves with you and incorporates cutting-edge insights from performance science.",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  padding="xl"
                  radius={16}
                  style={{
                    background: 'white',
                    border: '1px solid #CCCCCC',
                    boxShadow: 'none',
                  }}
                >
                  <Stack gap="md">
                    <Group gap="md">
                      <ThemeIcon
                        size={40}
                        radius={12}
                        style={{
                          background: '#F5F5F5',
                          color: '#4686FE',
                          border: 'none',
                        }}
                      >
                        <feature.icon size={20} />
                      </ThemeIcon>
                      <Text
                        style={{
                          fontFamily: 'Inter Display, sans-serif',
                          fontSize: '20px',
                          fontWeight: 600,
                          color: '#000000',
                        }}
                      >
                        {feature.title}
                      </Text>
                    </Group>
                    <Text
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        color: '#666666',
                        lineHeight: '24px',
                      }}
                    >
                      {feature.description}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>

          {/* CTA */}
          <Card
            padding="xl"
            radius={16}
            style={{
              background: '#F5F5F5',
              border: '1px solid #CCCCCC',
              boxShadow: 'none',
            }}
          >
            <Stack align="center" gap="lg">
              <Title
                order={3}
                ta="center"
                style={{
                  fontFamily: 'Inter Display, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#000000',
                }}
              >
                Join the Elite Performance Revolution
              </Title>
              <Text
                ta="center"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '18px',
                  lineHeight: '26px',
                  color: '#666666',
                  fontWeight: 400,
                  maxWidth: '600px',
                }}
              >
                Ready to unlock your full potential? Join our beta community and start building
                your elite performance system today.
              </Text>
              <Button
                component="a"
                href="/auth/register"
                size="lg"
                rightSection={<ArrowRight size={20} />}
                style={{
                  background: '#4686FE',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  height: '56px',
                  padding: '0 32px',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Inter, sans-serif',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      background: '#3366E5',
                    },
                  },
                }}
              >
                Start Your Journey
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}