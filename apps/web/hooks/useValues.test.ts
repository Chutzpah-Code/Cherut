import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useValues, useCreateValue, useUpdateValue, useDeleteValue } from './useValues';
import { valuesApi } from '@/lib/api/services/values';

// Mock the API service
jest.mock('@/lib/api/services/values');
const mockedValuesApi = valuesApi as jest.Mocked<typeof valuesApi>;

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockValues = [
  {
    id: '1',
    title: 'Honesty',
    shortDescription: 'Being truthful in all situations',
    behaviors: 'Always tell the truth, admit mistakes, be transparent',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Growth',
    shortDescription: 'Continuous learning and improvement',
    behaviors: 'Read daily, seek feedback, embrace challenges',
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
  },
];

describe('useValues', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useValues', () => {
    it('should fetch values successfully', async () => {
      mockedValuesApi.getAll.mockResolvedValue(mockValues);

      const { result } = renderHook(() => useValues(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockValues);
      expect(mockedValuesApi.getAll).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch error', async () => {
      const error = new Error('Failed to fetch values');
      mockedValuesApi.getAll.mockRejectedValue(error);

      const { result } = renderHook(() => useValues(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });

    it('should show loading state initially', () => {
      mockedValuesApi.getAll.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useValues(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useCreateValue', () => {
    it('should create a value successfully', async () => {
      const newValue = {
        title: 'New Value',
        shortDescription: 'A new value',
        behaviors: 'New behaviors',
      };

      const createdValue = {
        id: '3',
        ...newValue,
        createdAt: '2023-01-03T00:00:00.000Z',
        updatedAt: '2023-01-03T00:00:00.000Z',
      };

      mockedValuesApi.create.mockResolvedValue(createdValue);

      const { result } = renderHook(() => useCreateValue(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newValue);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(createdValue);
      expect(mockedValuesApi.create).toHaveBeenCalledWith(newValue);
    });

    it('should handle create error', async () => {
      const error = new Error('Failed to create value');
      mockedValuesApi.create.mockRejectedValue(error);

      const { result } = renderHook(() => useCreateValue(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        title: 'Test Value',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });

    it('should show loading state during mutation', async () => {
      mockedValuesApi.create.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useCreateValue(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        title: 'Test Value',
      });

      expect(result.current.isPending).toBe(true);
    });

    it('should create value with only required field', async () => {
      const minimalValue = { title: 'Minimal Value' };
      const createdValue = {
        id: '4',
        ...minimalValue,
        createdAt: '2023-01-04T00:00:00.000Z',
        updatedAt: '2023-01-04T00:00:00.000Z',
      };

      mockedValuesApi.create.mockResolvedValue(createdValue);

      const { result } = renderHook(() => useCreateValue(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(minimalValue);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedValuesApi.create).toHaveBeenCalledWith(minimalValue);
    });
  });

  describe('useUpdateValue', () => {
    it('should update a value successfully', async () => {
      const updateData = {
        title: 'Updated Value',
        behaviors: 'Updated behaviors',
      };

      const updatedValue = {
        ...mockValues[0],
        ...updateData,
        updatedAt: '2023-01-05T00:00:00.000Z',
      };

      mockedValuesApi.update.mockResolvedValue(updatedValue);

      const { result } = renderHook(() => useUpdateValue(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: '1', dto: updateData });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(updatedValue);
      expect(mockedValuesApi.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should handle update error', async () => {
      const error = new Error('Failed to update value');
      mockedValuesApi.update.mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateValue(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: '1',
        dto: { title: 'Updated' },
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });

    it('should update with partial data', async () => {
      const partialUpdate = { title: 'Only Title Updated' };
      const updatedValue = {
        ...mockValues[0],
        title: 'Only Title Updated',
        updatedAt: '2023-01-05T00:00:00.000Z',
      };

      mockedValuesApi.update.mockResolvedValue(updatedValue);

      const { result } = renderHook(() => useUpdateValue(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: '1', dto: partialUpdate });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedValuesApi.update).toHaveBeenCalledWith('1', partialUpdate);
    });
  });

  describe('useDeleteValue', () => {
    it('should delete a value successfully', async () => {
      mockedValuesApi.delete.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteValue(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedValuesApi.delete).toHaveBeenCalledWith('1');
    });

    it('should handle delete error', async () => {
      const error = new Error('Failed to delete value');
      mockedValuesApi.delete.mockRejectedValue(error);

      const { result } = renderHook(() => useDeleteValue(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('Query cache invalidation', () => {
    it('should invalidate values query after create', async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });

      // Spy on invalidateQueries
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const newValue = { title: 'Test Value' };
      const createdValue = { id: '3', ...newValue, createdAt: '', updatedAt: '' };

      mockedValuesApi.create.mockResolvedValue(createdValue);

      const { result } = renderHook(() => useCreateValue(), { wrapper });

      result.current.mutate(newValue);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['values'] });
    });

    it('should invalidate values query after update', async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const updateData = { title: 'Updated' };
      const updatedValue = { ...mockValues[0], ...updateData };

      mockedValuesApi.update.mockResolvedValue(updatedValue);

      const { result } = renderHook(() => useUpdateValue(), { wrapper });

      result.current.mutate({ id: '1', dto: updateData });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['values'] });
    });

    it('should invalidate values query after delete', async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      mockedValuesApi.delete.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteValue(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['values'] });
    });
  });
});