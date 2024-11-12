import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { ImageComment } from '@/types/api';
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';

export interface CommentsResponse {
  total: number;
  page: number;
  limit: number;
  data: ImageComment[];
}

export const getComments = ({
  imageId,
  page = 1
}: {
  imageId: string;
  page?: number;
  limit?: number;
}): Promise<CommentsResponse> => {
  return api.get(`/gallery/${imageId}/comments`, { params: { page } });
};

export const getInfiniteCommentsQueryOptions = (imageId: string) => {
  return infiniteQueryOptions({
    queryKey: ['comments', { imageId }],
    queryFn: ({ pageParam = 1 }) =>
      getComments({
        imageId,
        page: pageParam
      }),
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

type UseGalleryOptions = {
  imageId: string;
  page?: number;
  queryConfig?: QueryConfig<typeof getComments>;
};

export const useInfiniteComments = ({ imageId }: UseGalleryOptions) => {
  return useInfiniteQuery({
    ...getInfiniteCommentsQueryOptions(imageId)
  });
};
