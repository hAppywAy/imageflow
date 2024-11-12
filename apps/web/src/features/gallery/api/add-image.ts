import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

export const addImageInputSchema = z.object({
  caption: z.string().min(1, 'Required').max(255, 'Too long'),
  image: z.instanceof(File)
});

export type AddImageInput = z.infer<typeof addImageInputSchema>;

export const addImage = (
  data: AddImageInput
): Promise<{ imageUrl: string }> => {
  const formData = new FormData();

  formData.append('image', data.image);
  formData.append('caption', data.caption);

  return api.post('/gallery/upload', formData);
};

type UseAddImageOptions = {
  mutationConfig?: MutationConfig<typeof addImage>;
};

export const useAddImage = ({ mutationConfig }: UseAddImageOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...config } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      onSuccess?.(...args);
    },
    ...config,
    mutationFn: addImage
  });
};
