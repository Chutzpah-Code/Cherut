'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  TextInput,
  Textarea,
  Button,
  Stack,
  Select,
  Box,
  Paper,
} from '@mantine/core';
import { Building2, ArrowLeft, CheckCircle } from 'lucide-react';
import { enterpriseWaitlistApi } from '@/lib/api/services/enterprise-waitlist';

export default function EnterpriseWaitlistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    contactName: '',
    phoneNumber: '',
    companyName: '',
    numberOfEmployees: '',
    companyRevenue: '',
    intendedUse: '',
    desiredFeatures: '',
  });

  const handleChange = (field: string, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validação básica
      if (!formData.contactName || !formData.phoneNumber || !formData.companyName) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }

      // Envia para o backend (mais seguro)
      await enterpriseWaitlistApi.create(formData);

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err: any) {
      console.error('Error submitting waitlist:', err);
      setError(err.response?.data?.message || 'Erro ao enviar formulário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
        }}
      >
        <Container size="sm">
          <Paper
            p="xl"
            radius={20}
            style={{
              background: 'white',
              border: '1px solid hsl(0 0% 0% / 0.08)',
              textAlign: 'center',
            }}
          >
            <CheckCircle size={64} color="#2FB264" style={{ margin: '0 auto 20px' }} />
            <Title
              order={2}
              mb="md"
              style={{
                color: 'hsl(0 0% 0% / 0.87)',
                fontWeight: 700,
              }}
            >
              Obrigado pelo interesse!
            </Title>
            <Text size="lg" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
              Recebemos sua solicitação e entraremos em contato em breve.
            </Text>
            <Text size="sm" mt="md" style={{ color: 'hsl(0 0% 0% / 0.38)' }}>
              Redirecionando para a página inicial...
            </Text>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        paddingTop: '60px',
        paddingBottom: '60px',
      }}
    >
      <Container size="md">
        <Button
          variant="subtle"
          leftSection={<ArrowLeft size={18} />}
          onClick={() => router.push('/')}
          mb="xl"
          style={{
            color: 'hsl(0 0% 0% / 0.6)',
          }}
        >
          Voltar
        </Button>

        <Paper
          p="xl"
          radius={20}
          style={{
            background: 'white',
            border: '1px solid hsl(0 0% 0% / 0.08)',
          }}
        >
          <Stack gap="lg" mb="xl">
            <Box
              style={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                background: '#3143B6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={28} color="white" />
            </Box>
            <div>
              <Title
                order={2}
                style={{
                  color: 'hsl(0 0% 0% / 0.87)',
                  fontWeight: 700,
                  fontSize: '32px',
                  letterSpacing: '-0.01em',
                }}
              >
                Enterprise Waitlist
              </Title>
              <Text size="md" mt="xs" style={{ color: 'hsl(0 0% 0% / 0.6)' }}>
                Preencha o formulário para receber mais informações
              </Text>
            </div>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Nome do Contato"
                placeholder="João Silva"
                required
                value={formData.contactName}
                onChange={(e) => handleChange('contactName', e.currentTarget.value)}
                radius={48}
                size="md"
                styles={{
                  label: {
                    color: 'hsl(0 0% 0% / 0.87)',
                    fontWeight: 600,
                    marginBottom: 8,
                    fontSize: '14px',
                  },
                  input: {
                    background: 'white',
                    border: '1px solid hsl(0 0% 0% / 0.15)',
                    color: 'hsl(0 0% 0% / 0.87)',
                    height: '48px',
                    fontSize: '16px',
                    '&:focus': {
                      borderColor: '#3143B6',
                      boxShadow: '0 0 0 4px rgba(49, 67, 182, 0.1)',
                    },
                  },
                }}
              />

              <TextInput
                label="Número de Telefone"
                placeholder="+55 (11) 99999-9999"
                required
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.currentTarget.value)}
                radius={48}
                size="md"
                styles={{
                  label: {
                    color: 'hsl(0 0% 0% / 0.87)',
                    fontWeight: 600,
                    marginBottom: 8,
                    fontSize: '14px',
                  },
                  input: {
                    background: 'white',
                    border: '1px solid hsl(0 0% 0% / 0.15)',
                    color: 'hsl(0 0% 0% / 0.87)',
                    height: '48px',
                    fontSize: '16px',
                    '&:focus': {
                      borderColor: '#3143B6',
                      boxShadow: '0 0 0 4px rgba(49, 67, 182, 0.1)',
                    },
                  },
                }}
              />

              <TextInput
                label="Nome da Empresa"
                placeholder="Minha Empresa LTDA"
                required
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.currentTarget.value)}
                radius={48}
                size="md"
                styles={{
                  label: {
                    color: 'hsl(0 0% 0% / 0.87)',
                    fontWeight: 600,
                    marginBottom: 8,
                    fontSize: '14px',
                  },
                  input: {
                    background: 'white',
                    border: '1px solid hsl(0 0% 0% / 0.15)',
                    color: 'hsl(0 0% 0% / 0.87)',
                    height: '48px',
                    fontSize: '16px',
                    '&:focus': {
                      borderColor: '#3143B6',
                      boxShadow: '0 0 0 4px rgba(49, 67, 182, 0.1)',
                    },
                  },
                }}
              />

              <Select
                label="Quantidade de Funcionários"
                placeholder="Selecione"
                value={formData.numberOfEmployees}
                onChange={(value) => handleChange('numberOfEmployees', value || '')}
                data={[
                  { value: '1-10', label: '1-10 funcionários' },
                  { value: '11-50', label: '11-50 funcionários' },
                  { value: '51-200', label: '51-200 funcionários' },
                  { value: '201-500', label: '201-500 funcionários' },
                  { value: '500+', label: '500+ funcionários' },
                ]}
                radius={48}
                size="md"
                styles={{
                  label: {
                    color: 'hsl(0 0% 0% / 0.87)',
                    fontWeight: 600,
                    marginBottom: 8,
                    fontSize: '14px',
                  },
                  input: {
                    background: 'white',
                    border: '1px solid hsl(0 0% 0% / 0.15)',
                    color: 'hsl(0 0% 0% / 0.87)',
                    height: '48px',
                    fontSize: '16px',
                    '&:focus': {
                      borderColor: '#3143B6',
                      boxShadow: '0 0 0 4px rgba(49, 67, 182, 0.1)',
                    },
                  },
                }}
              />

              <Select
                label="Renda Anual da Empresa"
                placeholder="Selecione"
                value={formData.companyRevenue}
                onChange={(value) => handleChange('companyRevenue', value || '')}
                data={[
                  { value: 'under-1m', label: 'Menos de R$ 1M' },
                  { value: '1m-5m', label: 'R$ 1M - R$ 5M' },
                  { value: '5m-10m', label: 'R$ 5M - R$ 10M' },
                  { value: '10m-50m', label: 'R$ 10M - R$ 50M' },
                  { value: '50m+', label: 'Mais de R$ 50M' },
                ]}
                radius={48}
                size="md"
                styles={{
                  label: {
                    color: 'hsl(0 0% 0% / 0.87)',
                    fontWeight: 600,
                    marginBottom: 8,
                    fontSize: '14px',
                  },
                  input: {
                    background: 'white',
                    border: '1px solid hsl(0 0% 0% / 0.15)',
                    color: 'hsl(0 0% 0% / 0.87)',
                    height: '48px',
                    fontSize: '16px',
                    '&:focus': {
                      borderColor: '#3143B6',
                      boxShadow: '0 0 0 4px rgba(49, 67, 182, 0.1)',
                    },
                  },
                }}
              />

              <Textarea
                label="Qual a finalidade desejada?"
                placeholder="Como você planeja usar o Cherut na sua empresa?"
                minRows={3}
                value={formData.intendedUse}
                onChange={(e) => handleChange('intendedUse', e.currentTarget.value)}
                radius={20}
                size="md"
                styles={{
                  label: {
                    color: 'hsl(0 0% 0% / 0.87)',
                    fontWeight: 600,
                    marginBottom: 8,
                    fontSize: '14px',
                  },
                  input: {
                    background: 'white',
                    border: '1px solid hsl(0 0% 0% / 0.15)',
                    color: 'hsl(0 0% 0% / 0.87)',
                    fontSize: '16px',
                    '&:focus': {
                      borderColor: '#3143B6',
                      boxShadow: '0 0 0 4px rgba(49, 67, 182, 0.1)',
                    },
                  },
                }}
              />

              <Textarea
                label="Quais features você acha que seriam importantes?"
                placeholder="Descreva funcionalidades que você gostaria de ver no produto..."
                minRows={3}
                value={formData.desiredFeatures}
                onChange={(e) => handleChange('desiredFeatures', e.currentTarget.value)}
                radius={20}
                size="md"
                styles={{
                  label: {
                    color: 'hsl(0 0% 0% / 0.87)',
                    fontWeight: 600,
                    marginBottom: 8,
                    fontSize: '14px',
                  },
                  input: {
                    background: 'white',
                    border: '1px solid hsl(0 0% 0% / 0.15)',
                    color: 'hsl(0 0% 0% / 0.87)',
                    fontSize: '16px',
                    '&:focus': {
                      borderColor: '#3143B6',
                      boxShadow: '0 0 0 4px rgba(49, 67, 182, 0.1)',
                    },
                  },
                }}
              />

              {error && (
                <Text size="sm" style={{ color: '#dc2626' }}>
                  {error}
                </Text>
              )}

              <Button
                type="submit"
                size="lg"
                radius={48}
                loading={loading}
                style={{
                  background: '#3143B6',
                  border: 'none',
                  marginTop: '16px',
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
                Enviar Solicitação
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
