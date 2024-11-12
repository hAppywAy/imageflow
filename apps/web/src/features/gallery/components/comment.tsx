import { TypographyMuted, TypographyP } from '@/components/ui/typography';
import { ImageComment } from '@/types/api';
import { formatDistanceToNow } from 'date-fns';
import { useDeleteComment } from '../api/delete-comment';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { useUser } from '@/lib/auth';

interface Props {
  imageId: string;
  comment: ImageComment;
}

export const Comment = ({ imageId, comment }: Props) => {
  const user = useUser();

  const isAuthor = user?.id === comment.author.id;

  const deleteComment = useDeleteComment({ imageId });

  const handleDelete = () => {
    deleteComment.mutate({ commentId: comment.id });
  };

  return (
    <div className="bg-muted group rounded border px-3 py-2">
      <div className="flex flex-row items-center justify-between">
        <TypographyP className="font-bold">
          {comment.author.username}
        </TypographyP>
        <TypographyMuted>
          {formatDistanceToNow(comment.createdAt)}
        </TypographyMuted>
      </div>
      <div className="flex gap-4">
        <TypographyP className="flex-1">{comment.content}</TypographyP>
        {isAuthor && (
          <Button
            onClick={handleDelete}
            size="icon"
            variant="destructive"
            className="hidden group-hover:flex"
          >
            <Trash />
          </Button>
        )}
      </div>
    </div>
  );
};
