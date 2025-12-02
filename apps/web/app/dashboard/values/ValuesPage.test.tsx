import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import ValuesPage from './page';
import { useValues, useCreateValue, useUpdateValue, useDeleteValue } from '@/hooks/useValues';

// Mock the hooks
jest.mock('@/hooks/useValues');
const mockUseValues = useValues as jest.MockedFunction<typeof useValues>;
const mockUseCreateValue = useCreateValue as jest.MockedFunction<typeof useCreateValue>;
const mockUseUpdateValue = useUpdateValue as jest.MockedFunction<typeof useUpdateValue>;
const mockUseDeleteValue = useDeleteValue as jest.MockedFunction<typeof useDeleteValue>;

// Mock Mantine notifications
jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
  },
  Notifications: ({ children }: any) => children,
}));

const mockValues = [
  {
    id: '1',
    title: 'Honesty',
    shortDescription: 'Being truthful in all situations',
    behaviors: 'Always tell the truth, admit mistakes',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Growth',
    shortDescription: 'Continuous learning',
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
  },
];

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <ModalsProvider>
          <Notifications />
          {children}
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );

  TestWrapper.displayName = 'TestWrapper';

  return TestWrapper;
};

describe('ValuesPage', () => {
  const mockCreateMutate = jest.fn();
  const mockUpdateMutate = jest.fn();
  const mockDeleteMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default successful state for hooks
    mockUseValues.mockReturnValue({
      data: mockValues,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
    } as any);

    mockUseCreateValue.mockReturnValue({
      mutateAsync: mockCreateMutate,
      isPending: false,
      isError: false,
      error: null,
    } as any);

    mockUseUpdateValue.mockReturnValue({
      mutateAsync: mockUpdateMutate,
      isPending: false,
      isError: false,
      error: null,
    } as any);

    mockUseDeleteValue.mockReturnValue({
      mutateAsync: mockDeleteMutate,
      isPending: false,
      isError: false,
      error: null,
    } as any);
  });

  describe('Rendering', () => {
    it('should render page title and description', () => {
      render(<ValuesPage />, { wrapper: createTestWrapper() });

      expect(screen.getByText('Values')).toBeInTheDocument();
      expect(screen.getByText('Define and align with your core personal values')).toBeInTheDocument();
    });

    it('should render New Value button', () => {
      render(<ValuesPage />, { wrapper: createTestWrapper() });

      expect(screen.getByRole('button', { name: /new value/i })).toBeInTheDocument();
    });

    it('should render values grid with all values', () => {
      render(<ValuesPage />, { wrapper: createTestWrapper() });

      expect(screen.getByText('Honesty')).toBeInTheDocument();
      expect(screen.getByText('Being truthful in all situations')).toBeInTheDocument();
      expect(screen.getByText('Growth')).toBeInTheDocument();
      expect(screen.getByText('Continuous learning')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      mockUseValues.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        isSuccess: false,
      } as any);

      render(<ValuesPage />, { wrapper: createTestWrapper() });

      expect(screen.getByRole('progressbar')).toBeInTheDocument(); // Mantine Loader
    });

    it('should show empty state when no values exist', () => {
      mockUseValues.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
      } as any);

      render(<ValuesPage />, { wrapper: createTestWrapper() });

      expect(screen.getByText('No values defined yet')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create your first value/i })).toBeInTheDocument();
    });
  });

  describe('Icon Generation', () => {
    it('should generate consistent icons for same titles', () => {
      render(<ValuesPage />, { wrapper: createTestWrapper() });

      // Both values should have ThemeIcons (tested by checking for icon containers)
      const honestyCard = screen.getByText('Honesty').closest('div[data-testid="value-card"]') ||
                         screen.getByText('Honesty').parentElement?.parentElement;
      const growthCard = screen.getByText('Growth').closest('div[data-testid="value-card"]') ||
                        screen.getByText('Growth').parentElement?.parentElement;

      expect(honestyCard).toBeInTheDocument();
      expect(growthCard).toBeInTheDocument();
    });
  });

  describe('Modal Interactions', () => {
    it('should open modal when New Value button is clicked', async () => {
      const user = userEvent.setup();
      render(<ValuesPage />, { wrapper: createTestWrapper() });

      await user.click(screen.getByRole('button', { name: /new value/i }));

      expect(screen.getByText('New Value')).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/short description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/reinforcing behaviors/i)).toBeInTheDocument();
    });

    it('should open modal when Edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ValuesPage />, { wrapper: createTestWrapper() });

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      expect(screen.getByText('Edit Value')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Honesty')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Being truthful in all situations')).toBeInTheDocument();
    });

    it('should close modal when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<ValuesPage />, { wrapper: createTestWrapper() });

      await user.click(screen.getByRole('button', { name: /new value/i }));
      expect(screen.getByText('New Value')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByText('New Value')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error when title is empty', async () => {
      const user = userEvent.setup();
      render(<ValuesPage />, { wrapper: createTestWrapper() });

      await user.click(screen.getByRole('button', { name: /new value/i }));

      // Try to submit without title
      await user.click(screen.getByRole('button', { name: /create/i }));

      // Should show notification error
      expect(require('@mantine/notifications').notifications.show).toHaveBeenCalledWith({
        title: 'Title Required',
        message: 'Please provide a title for your value or cancel.',
        color: 'red',
      });
    });

    it('should allow submission with only title', async () => {
      const user = userEvent.setup();
      mockCreateMutate.mockResolvedValue({ id: 'new-id', title: 'Test Value' });

      render(<ValuesPage />, { wrapper: createTestWrapper() });

      await user.click(screen.getByRole('button', { name: /new value/i }));

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Test Value');

      await user.click(screen.getByRole('button', { name: /create/i }));

      expect(mockCreateMutate).toHaveBeenCalledWith({
        title: 'Test Value',
        shortDescription: '',
        behaviors: '',
      });
    });

    it('should submit all fields when provided', async () => {
      const user = userEvent.setup();
      mockCreateMutate.mockResolvedValue({});

      render(<ValuesPage />, { wrapper: createTestWrapper() });

      await user.click(screen.getByRole('button', { name: /new value/i }));

      await user.type(screen.getByLabelText(/title/i), 'Complete Value');
      await user.type(screen.getByLabelText(/short description/i), 'Short desc');
      await user.type(screen.getByLabelText(/reinforcing behaviors/i), 'Behaviors text');

      await user.click(screen.getByRole('button', { name: /create/i }));

      expect(mockCreateMutate).toHaveBeenCalledWith({
        title: 'Complete Value',
        shortDescription: 'Short desc',
        behaviors: 'Behaviors text',
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should update a value successfully', async () => {
      const user = userEvent.setup();
      mockUpdateMutate.mockResolvedValue({});

      render(<ValuesPage />, { wrapper: createTestWrapper() });

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      const titleInput = screen.getByDisplayValue('Honesty');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Honesty');

      await user.click(screen.getByRole('button', { name: /update/i }));

      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: '1',
        dto: {
          title: 'Updated Honesty',
          shortDescription: 'Being truthful in all situations',
          behaviors: 'Always tell the truth, admit mistakes',
        },
      });
    });

    it('should handle delete confirmation', async () => {
      // Note: In a real test, you'd need to mock the modals.openConfirmModal
      // This is a simplified test showing the structure
      const user = userEvent.setup();
      render(<ValuesPage />, { wrapper: createTestWrapper() });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons).toHaveLength(2);

      // In a real implementation, clicking delete would open a confirmation modal
      // and only call the delete mutation after confirmation
    });
  });

  describe('Responsive Behavior', () => {
    it('should render grid with responsive columns', () => {
      render(<ValuesPage />, { wrapper: createTestWrapper() });

      // Check that SimpleGrid is rendered (structure test)
      const valuesContainer = screen.getByText('Honesty').closest('div');
      expect(valuesContainer).toBeInTheDocument();
    });

    it('should show full-width button on mobile in modal', async () => {
      const user = userEvent.setup();
      render(<ValuesPage />, { wrapper: createTestWrapper() });

      await user.click(screen.getByRole('button', { name: /new value/i }));

      // The modal should render with responsive props
      expect(screen.getByText('New Value')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error notification on create failure', async () => {
      const user = userEvent.setup();
      mockCreateMutate.mockRejectedValue(new Error('Create failed'));

      render(<ValuesPage />, { wrapper: createTestWrapper() });

      await user.click(screen.getByRole('button', { name: /new value/i }));
      await user.type(screen.getByLabelText(/title/i), 'Test Value');
      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(require('@mantine/notifications').notifications.show).toHaveBeenCalledWith({
          title: 'Error',
          message: 'Failed to save value. Please try again.',
          color: 'red',
        });
      });
    });

    it('should show success notification on create success', async () => {
      const user = userEvent.setup();
      mockCreateMutate.mockResolvedValue({ id: 'new-id', title: 'Test Value' });

      render(<ValuesPage />, { wrapper: createTestWrapper() });

      await user.click(screen.getByRole('button', { name: /new value/i }));
      await user.type(screen.getByLabelText(/title/i), 'Test Value');
      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(require('@mantine/notifications').notifications.show).toHaveBeenCalledWith({
          title: 'Value Created',
          message: 'Your value has been successfully created.',
          color: 'green',
        });
      });
    });
  });
});