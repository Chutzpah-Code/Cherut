'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, Stack, Group, Text, Box, TextInput, Select, Badge, Button, ActionIcon, Center, Loader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import {
  useFinanceCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
} from '@/hooks/useFinance';
import { CreateCategoryDto } from '@/lib/api/services/finance';
import { useUndoableDelete } from '../useUndoableDelete';

// No dedicated category page exists in the redesign — this modal fills that gap
// minimally, reached from Spending by category's "Manage categories" link.
export function ManageCategoriesModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const t = useTranslations('finance.manageCategories');
  const tc = useTranslations('finance.common');
  const { data: rawCategories = [], isLoading } = useFinanceCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const undoableDeleteCategory = useUndoableDelete((id: string) => deleteCategory.mutate(id), { label: tc('category') });
  const categories = (rawCategories as any[]).filter((c) => !undoableDeleteCategory.isPending(c.id));

  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure();
  const [catForm, setCatForm] = useState<Partial<CreateCategoryDto>>({ type: 'expense' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = () => {
    if (!catForm.name || !catForm.type) return;
    createCategory.mutate(catForm as CreateCategoryDto, {
      onSuccess: () => { closeForm(); setCatForm({ type: 'expense' }); },
    });
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const saveEdit = (id: string) => {
    if (!editingName.trim()) return;
    updateCategory.mutate({ id, dto: { name: editingName.trim() } }, { onSuccess: () => setEditingId(null) });
  };

  return (
    <Modal opened={opened} onClose={onClose} title={t('title')} centered size="md">
      <Group justify="space-between" mb="sm">
        <Text size="sm" c="dimmed">{t('subtitle')}</Text>
        <Button size="xs" leftSection={<Plus size={14} />} onClick={openForm} variant="subtle">
          {t('addCategory')}
        </Button>
      </Group>

      {isLoading ? (
        <Center py="lg"><Loader size="sm" color="#4686FE" /></Center>
      ) : categories.length === 0 ? (
        <Center py="lg"><Text c="dimmed" size="sm">{t('noCategories')}</Text></Center>
      ) : (
        <Stack gap="xs">
          {(categories as any[]).map((cat) => (
            <Group key={cat.id} justify="space-between" p="sm" style={{ borderRadius: 8, background: '#f8fafc', border: '1px solid #E2E8F0' }}>
              {editingId === cat.id ? (
                <TextInput
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  size="xs"
                  style={{ flex: 1 }}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                  autoFocus
                />
              ) : (
                <Group gap="sm" style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>{cat.name}</Text>
                  <Badge size="xs" variant="light" color={cat.type === 'income' ? 'green' : 'red'}>
                    {cat.type === 'income' ? t('income') : t('expense')}
                  </Badge>
                </Group>
              )}
              <Group gap={4}>
                {editingId === cat.id ? (
                  <>
                    <ActionIcon size="sm" color="green" onClick={() => saveEdit(cat.id)} loading={updateCategory.isPending}>
                      <Check size={12} />
                    </ActionIcon>
                    <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => setEditingId(null)}>
                      <X size={12} />
                    </ActionIcon>
                  </>
                ) : (
                  <>
                    <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => startEdit(cat)}>
                      <Pencil size={12} />
                    </ActionIcon>
                    <ActionIcon size="sm" variant="subtle" color="red" onClick={() => undoableDeleteCategory.remove(cat.id)}>
                      <Trash2 size={12} />
                    </ActionIcon>
                  </>
                )}
              </Group>
            </Group>
          ))}
        </Stack>
      )}

      <Modal opened={formOpened} onClose={closeForm} title={t('newCategory')} centered>
        <Stack gap="sm">
          <TextInput
            label={t('name')}
            placeholder={t('namePlaceholder')}
            value={catForm.name ?? ''}
            onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Select
            label={t('type')}
            data={[{ value: 'income', label: t('income') }, { value: 'expense', label: t('expense') }]}
            value={catForm.type}
            onChange={(v) => setCatForm((f) => ({ ...f, type: v as any }))}
          />
          <Button onClick={handleCreate} loading={createCategory.isPending} disabled={!catForm.name} style={{ backgroundColor: '#0052CC' }}>
            {t('createCategory')}
          </Button>
        </Stack>
      </Modal>
    </Modal>
  );
}
