import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import {
  InfiniteData,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import { GalleryResponse } from './get-gallery';

export const toggleLike = async (imageId: string) => {
  await api.post(`/gallery/${imageId}/like`);
};

type UseToggleLikeOptions = {
  imageId: string;
  mutationConfig?: MutationConfig<() => Promise<void>>;
};

export const useToggleLike = ({
  imageId,
  mutationConfig
}: UseToggleLikeOptions) => {
  const queryClient = useQueryClient();

  const { onError, ...config } = mutationConfig || {};

  const toggleInQueryClient = () =>
    queryClient.setQueryData(
      ['gallery'],
      (data: InfiniteData<GalleryResponse>) => {
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            data: page.data.map((image) => {
              if (image.id === imageId) {
                return {
                  ...image,
                  isLiked: !image.isLiked,
                  likes: image.isLiked ? image.likes - 1 : image.likes + 1
                };
              }

              return image;
            })
          }))
        };
      }
    );

  return useMutation({
    onError: (...args) => {
      toggleInQueryClient();
      onError?.(...args);
    },
    ...config,
    mutationFn: async () => {
      toggleInQueryClient();

      await toggleLike(imageId);
    }
  });
};
