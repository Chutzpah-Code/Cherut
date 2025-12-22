'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, X } from 'lucide-react';
import {
  Title,
  Text,
  Button,
  Stack,
  TextInput,
  Loader,
  Center,
  Box,
  Group,
  Alert,
  Grid,
  ActionIcon,
  Popover,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useJournalEntries, useAllJournalEntries, useArchivedJournalEntries, useCreateJournalEntry, useToggleJournalArchive, useJournalCounts } from '@/hooks/useJournal';
import { JournalEntryForm } from './components/JournalEntryForm';
import { EntryCard } from './components/EntryCard';
import { EntryModal } from './components/EntryModal';
import { JournalFilter, JournalFilterType } from './components/JournalFilter';
import { ArchivedJournalGrid } from './components/ArchivedJournalGrid';
import { JournalEntry } from '@/lib/api/services/journal';

export default function JournalPage() {
  const [currentFilter, setCurrentFilter] = useState<JournalFilterType>('active');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);

  const { data: activeEntries, isLoading: activeLoading } = useJournalEntries(searchTerm, false);
  const { data: allEntries, isLoading: allLoading } = useAllJournalEntries(searchTerm);
  const { data: archivedEntries, isLoading: archivedLoading } = useArchivedJournalEntries(searchTerm);
  const { data: journalCounts } = useJournalCounts();
  const createMutation = useCreateJournalEntry();
  const archiveMutation = useToggleJournalArchive();

  const entries = currentFilter === 'all' ? allEntries : currentFilter === 'archived' ? archivedEntries : activeEntries;
  const isLoading = currentFilter === 'all' ? allLoading : currentFilter === 'archived' ? archivedLoading : activeLoading;

  // Filter entries by date range
  useEffect(() => {
    if (!entries) {
      setFilteredEntries([]);
      return;
    }

    if (!dateRange[0] && !dateRange[1]) {
      setFilteredEntries(entries);
      return;
    }

    const filtered = entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      // Remove time component for date comparison
      const entryDateOnly = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());

      const startDate = dateRange[0] ? new Date(dateRange[0].getFullYear(), dateRange[0].getMonth(), dateRange[0].getDate()) : null;
      const endDate = dateRange[1] ? new Date(dateRange[1].getFullYear(), dateRange[1].getMonth(), dateRange[1].getDate()) : null;

      if (startDate && endDate) {
        return entryDateOnly >= startDate && entryDateOnly <= endDate;
      } else if (startDate) {
        return entryDateOnly >= startDate;
      } else if (endDate) {
        return entryDateOnly <= endDate;
      }

      return true;
    });

    setFilteredEntries(filtered);
  }, [entries, dateRange]);

  const handleCreateSuccess = () => {
    setIsCreateFormOpen(false);
  };

  const clearFilters = () => {
    setDateRange([null, null]);
  };

  const handleSearch = () => {
    setSearchTerm(searchInput.trim());
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
  };

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEntry(null);
  };

  const handleUnarchive = (entry: JournalEntry) => {
    archiveMutation.mutate(entry.id);
  };

  const handleDeleteFromGrid = (entryId: string) => {
    // This will be handled by the grid component
  };

  const handleViewFromGrid = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <Center h={300}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <Box>
        <Title order={1} size="h2" mb="xs">
          Journal
        </Title>
        <Text c="dimmed" size="sm">
          Personal space for daily reflections and thoughts. Write freely without limits.
        </Text>
      </Box>

      {/* Filter Bar */}
      <JournalFilter
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        journalCounts={journalCounts}
      />

      {/* Actions Bar - Only show for active and all filters */}
      {currentFilter !== 'archived' && (
        <Stack gap="md">
          <Stack gap="sm">
            <Group gap="xs" wrap="wrap">
              <TextInput
                placeholder="Search by title... (press Enter to search)"
                leftSection={<Search size={16} />}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                style={{ flex: 1, minWidth: 200 }}
              />
              <Button
                size="compact-sm"
                onClick={handleSearch}
                disabled={!searchInput.trim()}
              >
                Search
              </Button>
              {searchTerm && (
                <ActionIcon
                  variant="light"
                  color="gray"
                  onClick={clearSearch}
                  title="Clear search"
                >
                  <X size={16} />
                </ActionIcon>
              )}
            </Group>

            <Group gap="xs" wrap="wrap">
              <DatePickerInput
                type="range"
                placeholder="Filter by date range"
                leftSection={<Calendar size={16} />}
                value={dateRange}
                onChange={setDateRange}
                style={{ flex: 1, minWidth: 180 }}
                clearable
              />

              {(dateRange[0] || dateRange[1]) && (
                <ActionIcon
                  variant="light"
                  color="gray"
                  onClick={clearFilters}
                  title="Clear date filter"
                >
                  <X size={16} />
                </ActionIcon>
              )}
            </Group>
          </Stack>

          <Button
            leftSection={<Plus size={20} />}
            onClick={() => setIsCreateFormOpen(true)}
            color="blue"
            fullWidth
          >
            New Entry
          </Button>
        </Stack>
      )}

      {/* Create Form */}
      {isCreateFormOpen && (
        <Box>
          <JournalEntryForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateFormOpen(false)}
            isLoading={createMutation.isPending}
          />
        </Box>
      )}

      {/* Conditional Content Based on Filter */}
      {currentFilter === 'archived' ? (
        <ArchivedJournalGrid
          entries={archivedEntries || []}
          onUnarchive={handleUnarchive}
          onDelete={handleDeleteFromGrid}
          onView={handleViewFromGrid}
        />
      ) : (
        <>
          {/* Entries List */}
          {filteredEntries && filteredEntries.length > 0 ? (
            <Grid>
              {filteredEntries.map((entry) => (
                <Grid.Col key={entry.id} span={{ base: 12, md: 6, lg: 4 }}>
                  <EntryCard
                    entry={entry}
                    onClick={() => handleEntryClick(entry)}
                  />
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Alert variant="light" color="gray" title="No entries found">
              {searchTerm || dateRange[0] || dateRange[1]
                ? `No entries found matching your filters${searchTerm ? ` for "${searchTerm}"` : ''}. Try adjusting your search criteria.`
                : "You haven't written any journal entries yet. Click 'New Entry' to start writing!"
              }
            </Alert>
          )}
        </>
      )}

      {/* Entry Modal */}
      {selectedEntry && (
        <EntryModal
          entry={selectedEntry}
          opened={modalOpen}
          onClose={handleCloseModal}
        />
      )}
    </Stack>
  );
}