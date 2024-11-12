import { Spinner } from '@/components/ui/spinner';
import { useInfiniteComments } from '../api/get-comments';
import { ArchiveX } from 'lucide-react';
import { Comment } from './comment';
import { Button } from '@/components/ui/button';

interface Props {
  imageId: string;
}

export const ImageComments = ({ imageId }: Props) => {
  const commentsQuery = useInfiniteComments({ imageId });

  if (commentsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const comments = commentsQuery.data?.pages.flatMap((page) => {
    return page.data || [];
  });

  if (!comments || !comments.length) {
    return (
      <div
        role="list"
        aria-label="comments"
        className="flex h-40 flex-col items-center justify-center bg-white text-gray-500"
      >
        <ArchiveX size={24} />
        <h4>No Comments Found</h4>
      </div>
    );
  }

  const limit = commentsQuery.data?.pages[0]?.limit || 0;

  const displayShowMore = comments.length >= limit && commentsQuery.hasNextPage;

  const showMore = () => {
    commentsQuery.fetchNextPage();
  };

  return (
    <div className="flex flex-col gap-2">
      {comments.map((comment) => {
        return <Comment imageId={imageId} comment={comment} key={comment.id} />;
      })}
      {displayShowMore && (
        <Button variant="ghost" className="w-32 self-center" onClick={showMore}>
          {commentsQuery.isFetchingNextPage ? (
            <Spinner size="sm" />
          ) : (
            'Show More'
          )}
        </Button>
      )}
    </div>
  );
};
