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
  Group,
  Select,
  NumberInput,
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
          background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
        }}
      >
        <Container size="sm">
          <Paper
            p="xl"
            radius="md"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
            }}
          >
            <CheckCircle size={64} color="#40c057" style={{ margin: '0 auto 20px' }} />
            <Title order={2} c="white" mb="md">
              Obrigado pelo interesse!
            </Title>
            <Text c="dimmed" size="lg">
              Recebemos sua solicitação e entraremos em contato em breve.
            </Text>
            <Text c="dimmed" size="sm" mt="md">
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
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
        paddingTop: '60px',
        paddingBottom: '60px',
      }}
    >
      <Container size="md">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<ArrowLeft size={18} />}
          onClick={() => router.push('/')}
          mb="xl"
        >
          Voltar
        </Button>

        <Paper
          p="xl"
          radius="md"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Group mb="xl">
            <Box
              style={{
                width: 48,
                height: 48,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={24} color="white" />
            </Box>
            <div>
              <Title order={2} c="white">
                Enterprise Waitlist
              </Title>
              <Text c="dimmed" size="sm">
                Preencha o formulário para receber mais informações
              </Text>
            </div>
          </Group>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Nome do Contato"
                placeholder="João Silva"
                required
                value={formData.contactName}
                onChange={(e) => handleChange('contactName', e.currentTarget.value)}
                styles={{
                  label: { color: 'white', marginBottom: 8 },
                  input: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                  },
                }}
              />

              <TextInput
                label="Número de Telefone"
                placeholder="+55 (11) 99999-9999"
                required
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.currentTarget.value)}
                styles={{
                  label: { color: 'white', marginBottom: 8 },
                  input: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                  },
                }}
              />

              <TextInput
                label="Nome da Empresa"
                placeholder="Minha Empresa LTDA"
                required
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.currentTarget.value)}
                styles={{
                  label: { color: 'white', marginBottom: 8 },
                  input: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
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
                styles={{
                  label: { color: 'white', marginBottom: 8 },
                  input: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
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
                styles={{
                  label: { color: 'white', marginBottom: 8 },
                  input: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                  },
                }}
              />

              <Textarea
                label="Qual a finalidade desejada?"
                placeholder="Como você planeja usar o Cherut na sua empresa?"
                minRows={3}
                value={formData.intendedUse}
                onChange={(e) => handleChange('intendedUse', e.currentTarget.value)}
                styles={{
                  label: { color: 'white', marginBottom: 8 },
                  input: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                  },
                }}
              />

              <Textarea
                label="Quais features você acha que seriam importantes?"
                placeholder="Descreva funcionalidades que você gostaria de ver no produto..."
                minRows={3}
                value={formData.desiredFeatures}
                onChange={(e) => handleChange('desiredFeatures', e.currentTarget.value)}
                styles={{
                  label: { color: 'white', marginBottom: 8 },
                  input: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                  },
                }}
              />

              {error && (
                <Text c="red" size="sm">
                  {error}
                </Text>
              )}

              <Button
                type="submit"
                size="lg"
                loading={loading}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  border: 'none',
                  marginTop: '16px',
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
