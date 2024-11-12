import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { getInfiniteGalleryQueryOptions } from './get-gallery';

export const deleteImage = ({ imageId }: { imageId: string }) => {
  return api.delete(`/gallery/${imageId}`);
};

type UseDeleteImageOptions = {
  mutationConfig?: MutationConfig<typeof deleteImage>;
};

export const useDeleteImage = ({
  mutationConfig
}: UseDeleteImageOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getInfiniteGalleryQueryOptions().queryKey
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteImage
  });
};
