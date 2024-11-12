import { api } from '@/lib/api-client';
import { GalleryImage } from '@/types/api';
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';

export interface GalleryResponse {
  total: number;
  page: number;
  limit: number;
  data: GalleryImage[];
}

export const getGallery = ({
  page = 1
}: {
  page?: number;
} = {}): Promise<GalleryResponse> => {
  return api.get('/gallery', { params: { page } });
};

export const getInfiniteGalleryQueryOptions = () => {
  return infiniteQueryOptions({
    queryKey: ['gallery'],
    queryFn: ({ pageParam = 1 }) => getGallery({ page: pageParam }),
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      if (lastPage.page > totalPages) {
        return undefined;
      }

      return lastPage.page + 1;
    },
    initialPageParam: 1
  });
};

export const useInfiniteGallery = () => {
  return useInfiniteQuery({
    ...getInfiniteGalleryQueryOptions()
  });
};
