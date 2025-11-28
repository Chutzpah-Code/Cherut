'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import {
  Title,
  Table,
  Badge,
  Group,
  Text,
  Button,
  TextInput,
  Select,
  Card,
  Stack,
  Loader,
  Alert,
  Modal,
  Pagination,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconSearch,
  IconUserPlus,
  IconShieldCheck,
  IconEye,
  IconEdit,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// Utility function for secure API URL handling
const getSecureApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
  }
  return apiUrl;
};

/**
 * Página de gestão de usuários
 *
 * FUNCIONALIDADES:
 * - Lista todos os usuários
 * - Filtros por role, plano, status
 * - Busca por nome/email
 * - Promover usuário para admin
 * - Criar novo admin
 * - Paginação
 */

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  subscription: {
    plan: 'free' | 'core' | 'pro' | 'elite';
    status: 'active' | 'inactive' | 'cancelled';
  };
  createdAt: string;
  onboardingCompleted: boolean;
}

interface UserFilters {
  role?: string;
  plan?: string;
  status?: string;
  search?: string;
  limit: string;
  offset: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure();
  const [promoteModalOpened, { open: openPromoteModal, close: closePromoteModal }] = useDisclosure();
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure();
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure();

  // Estados para filtros e paginação
  const [filters, setFilters] = useState<UserFilters>({
    limit: '25',
    offset: '0',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para formulários
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [promoteEmail, setPromoteEmail] = useState('');

  // Estados para usuário selecionado
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUserData, setEditUserData] = useState({
    displayName: '',
    email: '',
    role: 'user' as 'user' | 'admin',
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  async function loadUsers() {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `${getSecureApiUrl()}/admin/users?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users);

      // Calcular paginação
      const limit = parseInt(filters.limit);
      setTotalPages(Math.ceil(data.total / limit));

    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error loading users');
    } finally {
      setLoading(false);
    }
  }

  async function createAdmin() {
    if (!user || !newAdminEmail || !newAdminPassword) return;

    try {
      const token = await user.getIdToken();

      const response = await fetch(`${getSecureApiUrl()}/admin/users/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newAdminEmail,
          password: newAdminPassword,
          displayName: newAdminName || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar admin');
      }

      // Reset form
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      closeCreateModal();

      // Recarregar lista
      await loadUsers();

    } catch (err) {
      console.error('Error creating admin:', err);
      setError(`Erro ao criar admin: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  }

  async function promoteUser() {
    if (!user || !promoteEmail) return;

    try {
      const token = await user.getIdToken();

      const response = await fetch(`${getSecureApiUrl()}/admin/users/promote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: promoteEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao promover usuário');
      }

      // Reset form
      setPromoteEmail('');
      closePromoteModal();

      // Recarregar lista
      await loadUsers();

    } catch (err) {
      console.error('Error promoting user:', err);
      setError(`Erro ao promover usuário: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    setFilters({
      ...filters,
      offset: ((page - 1) * parseInt(filters.limit)).toString(),
    });
  }

  function handleFilterChange(key: keyof UserFilters, value: string) {
    setCurrentPage(1); // Reset para primeira página
    setFilters({
      ...filters,
      [key]: value || undefined,
      offset: '0', // Reset offset
    });
  }

  function handleViewUser(user: User) {
    setSelectedUser(user);
    openViewModal();
  }

  function handleEditUser(user: User) {
    setSelectedUser(user);
    setEditUserData({
      displayName: user.displayName || '',
      email: user.email,
      role: user.role,
    });
    openEditModal();
  }

  async function handleSaveEdit() {
    if (!selectedUser || !user) return;

    try {
      const token = await user.getIdToken();

      const response = await fetch(`${getSecureApiUrl()}/admin/users/${selectedUser.uid}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editUserData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error updating user');
      }

      closeEditModal();
      await loadUsers(); // Reload users list

    } catch (err) {
      console.error('Error updating user:', err);
      setError(`Error updating user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  if (loading && users.length === 0) {
    return (
      <Stack align="center" mt="xl">
        <Loader size="lg" />
        <Text>Loading users...</Text>
      </Stack>
    );
  }

  return (
    <div>
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>User Management</Title>
          <Text c="dimmed">Manage users and administrative permissions</Text>
        </div>

        <Group>
          <Button leftSection={<IconUserPlus size={16} />} onClick={openPromoteModal}>
            Promote User
          </Button>
          <Button
            leftSection={<IconShieldCheck size={16} />}
            onClick={openCreateModal}
            color="blue"
          >
            Create Admin
          </Button>
        </Group>
      </Group>

      {error && (
        <Alert color="red" mb="lg" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
        <Group>
          <TextInput
            placeholder="Search by email or name..."
            leftSection={<IconSearch size={16} />}
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ flex: 1 }}
          />

          <Select
            placeholder="Role"
            data={[
              { value: '', label: 'All' },
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
            ]}
            value={filters.role || ''}
            onChange={(value) => handleFilterChange('role', value || '')}
            clearable
          />

          <Select
            placeholder="Plan"
            data={[
              { value: '', label: 'All' },
              { value: 'free', label: 'Free' },
              { value: 'core', label: 'Core' },
              { value: 'pro', label: 'Pro' },
              { value: 'elite', label: 'Elite' },
            ]}
            value={filters.plan || ''}
            onChange={(value) => handleFilterChange('plan', value || '')}
            clearable
          />

          <Select
            placeholder="Status"
            data={[
              { value: '', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            value={filters.status || ''}
            onChange={(value) => handleFilterChange('status', value || '')}
            clearable
          />
        </Group>
      </Card>

      {/* Tabela de usuários */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>User</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Plan</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Onboarding</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.uid}>
                <Table.Td>
                  <div>
                    <Text fw={500}>{user.displayName || user.email}</Text>
                    <Text size="sm" c="dimmed">{user.email}</Text>
                    <Text size="xs" c="dimmed">{user.uid.substring(0, 8)}...</Text>
                  </div>
                </Table.Td>
                <Table.Td>
                  <Badge color={user.role === 'admin' ? 'red' : 'blue'} variant="light">
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={
                      user.subscription.plan === 'elite' ? 'violet' :
                      user.subscription.plan === 'pro' ? 'blue' :
                      user.subscription.plan === 'core' ? 'green' : 'gray'
                    }
                    variant="outline"
                  >
                    {user.subscription.plan}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={
                      user.subscription.status === 'active' ? 'green' :
                      user.subscription.status === 'inactive' ? 'yellow' : 'red'
                    }
                    variant="dot"
                  >
                    {user.subscription.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={user.onboardingCompleted ? 'green' : 'orange'}
                    variant="dot"
                  >
                    {user.onboardingCompleted ? 'Complete' : 'Pending'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {new Date(user.createdAt).toLocaleDateString('en-US')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Tooltip label="View details">
                      <ActionIcon
                        variant="light"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Edit">
                      <ActionIcon
                        variant="light"
                        size="sm"
                        color="blue"
                        onClick={() => handleEditUser(user)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {/* Paginação */}
        {totalPages > 1 && (
          <Group justify="center" mt="lg">
            <Pagination
              total={totalPages}
              value={currentPage}
              onChange={handlePageChange}
            />
          </Group>
        )}

        {users.length === 0 && !loading && (
          <Text ta="center" c="dimmed" py="xl">
            Nenhum usuário encontrado
          </Text>
        )}
      </Card>

      {/* Modal para criar admin */}
      <Modal
        opened={createModalOpened}
        onClose={closeCreateModal}
        title="Criar Novo Administrador"
      >
        <Stack>
          <TextInput
            label="Email"
            placeholder="admin@example.com"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            required
          />
          <TextInput
            label="Password"
            type="password"
            placeholder="Secure password"
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
            required
          />
          <TextInput
            label="Name (optional)"
            placeholder="Administrator name"
            value={newAdminName}
            onChange={(e) => setNewAdminName(e.target.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button onClick={createAdmin} color="blue">
              Create Admin
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal para promover usuário */}
      <Modal
        opened={promoteModalOpened}
        onClose={closePromoteModal}
        title="Promote User to Admin"
      >
        <Stack>
          <TextInput
            label="User email"
            placeholder="user@example.com"
            value={promoteEmail}
            onChange={(e) => setPromoteEmail(e.target.value)}
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closePromoteModal}>
              Cancel
            </Button>
            <Button onClick={promoteUser} color="blue">
              Promote
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal para visualizar usuário */}
      <Modal
        opened={viewModalOpened}
        onClose={closeViewModal}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <Stack>
            <div>
              <Text size="sm" c="dimmed">User ID</Text>
              <Text fw={500}>{selectedUser.uid}</Text>
            </div>

            <div>
              <Text size="sm" c="dimmed">Email</Text>
              <Text fw={500}>{selectedUser.email}</Text>
            </div>

            <div>
              <Text size="sm" c="dimmed">Display Name</Text>
              <Text fw={500}>{selectedUser.displayName || 'Not set'}</Text>
            </div>

            <div>
              <Text size="sm" c="dimmed">Role</Text>
              <Badge color={selectedUser.role === 'admin' ? 'blue' : 'gray'} variant="light">
                {selectedUser.role === 'admin' ? 'Administrator' : 'User'}
              </Badge>
            </div>

            <div>
              <Text size="sm" c="dimmed">Subscription Plan</Text>
              <Badge
                color={
                  selectedUser.subscription.plan === 'elite' ? 'violet' :
                  selectedUser.subscription.plan === 'pro' ? 'blue' :
                  selectedUser.subscription.plan === 'core' ? 'green' : 'gray'
                }
                variant="outline"
              >
                {selectedUser.subscription.plan}
              </Badge>
            </div>

            <div>
              <Text size="sm" c="dimmed">Subscription Status</Text>
              <Badge
                color={
                  selectedUser.subscription.status === 'active' ? 'green' :
                  selectedUser.subscription.status === 'inactive' ? 'yellow' : 'red'
                }
                variant="dot"
              >
                {selectedUser.subscription.status}
              </Badge>
            </div>

            <div>
              <Text size="sm" c="dimmed">Onboarding Status</Text>
              <Badge
                color={selectedUser.onboardingCompleted ? 'green' : 'orange'}
                variant="dot"
              >
                {selectedUser.onboardingCompleted ? 'Complete' : 'Pending'}
              </Badge>
            </div>

            <div>
              <Text size="sm" c="dimmed">Created Date</Text>
              <Text fw={500}>{new Date(selectedUser.createdAt).toLocaleDateString('en-US')}</Text>
            </div>

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeViewModal}>
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Modal para editar usuário */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit User"
        size="md"
      >
        {selectedUser && (
          <Stack>
            <TextInput
              label="Display Name"
              placeholder="User display name"
              value={editUserData.displayName}
              onChange={(e) => setEditUserData({
                ...editUserData,
                displayName: e.target.value
              })}
            />

            <TextInput
              label="Email"
              placeholder="user@example.com"
              value={editUserData.email}
              onChange={(e) => setEditUserData({
                ...editUserData,
                email: e.target.value
              })}
            />

            <Select
              label="Role"
              placeholder="Select user role"
              value={editUserData.role}
              onChange={(value) => setEditUserData({
                ...editUserData,
                role: value as 'user' | 'admin'
              })}
              data={[
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Administrator' },
              ]}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} color="blue">
                Save Changes
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  );
}