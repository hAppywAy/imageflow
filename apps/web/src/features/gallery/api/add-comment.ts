import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import { getInfiniteCommentsQueryOptions } from './get-comments';

export const addCommentInputSchema = z.object({
  content: z.string().min(1, 'Required')
});

export type AddCommentInput = z.infer<typeof addCommentInputSchema>;

export const addComment = ({
  imageId,
  data
}: {
  imageId: string;
  data: AddCommentInput;
}): Promise<Comment> => {
  return api.post(`/gallery/${imageId}/comments`, data);
};

type UseCreateCommentOptions = {
  imageId: string;
  mutationConfig?: MutationConfig<typeof addComment>;
};

export const useAddComment = ({
  mutationConfig,
  imageId
}: UseCreateCommentOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getInfiniteCommentsQueryOptions(imageId).queryKey
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: addComment
  });
};
