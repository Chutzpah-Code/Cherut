'use client';

import { useTranslations } from 'next-intl';
import { Box, Stack, Group, Text, Button, Card } from '@mantine/core';
import { Check, X } from 'lucide-react';
import {
  usePendingInvitations,
  useAcceptInvitation,
  useDeclineInvitation,
} from '@/hooks/useBoards';

export function PendingInvitationsList() {
  const t = useTranslations('tasks.boardList.invitations');
  const tRole = useTranslations('tasks.manageBoard');
  const { data: invitations } = usePendingInvitations();
  const acceptInvitation = useAcceptInvitation();
  const declineInvitation = useDeclineInvitation();

  if (!invitations || invitations.length === 0) return null;

  const roleLabel = (role: 'owner' | 'editor' | 'collaborator') =>
    role === 'owner' ? tRole('roleOwner') : role === 'editor' ? tRole('roleEditor') : tRole('roleCollaborator');

  return (
    <Box>
      <Text fw={600} size="sm" mb="xs">{t('sectionTitle')}</Text>
      <Stack gap="xs">
        {invitations.map((invitation) => {
          return (
            <Card key={invitation.boardId} radius="md" padding="sm" withBorder>
              <Group justify="space-between" wrap="wrap" gap="xs">
                <Box style={{ minWidth: 0, flex: '1 1 200px' }}>
                  <Text fw={600} size="sm" truncate>{invitation.boardName}</Text>
                  <Text size="xs" c="dimmed" style={{ wordBreak: 'break-word' }}>
                    {t('invitedBy', { email: invitation.invitedByEmail, role: roleLabel(invitation.role) })}
                  </Text>
                </Box>
                <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
                  <Button
                    size="xs"
                    variant="outline"
                    color="gray"
                    leftSection={<X size={14} />}
                    onClick={() => declineInvitation.mutate(invitation.boardId)}
                    loading={declineInvitation.isPending}
                  >
                    {t('decline')}
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    color="gray"
                    leftSection={<Check size={14} />}
                    onClick={() => acceptInvitation.mutate(invitation.boardId)}
                    loading={acceptInvitation.isPending}
                  >
                    {t('accept')}
                  </Button>
                </Group>
              </Group>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
