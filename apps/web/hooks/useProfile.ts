import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, CreateProfileDto, UpdateProfileDto } from '@/lib/api/services/profile';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        return await profileApi.get();
      } catch (error: any) {
        // Se o profile não existe (404), criar um vazio
        if (error?.response?.status === 404) {
          const newProfile = await profileApi.create({});
          return newProfile;
        }
        throw error;
      }
    },
  });
};

export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProfileDto) => profileApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => profileApi.update(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
