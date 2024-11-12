import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { useToggleLike } from '../api/toggle-like';
import { MouseEventHandler } from 'react';

interface Props {
  imageId: string;
  isLiked: boolean;
  totalLikes: number;
  className?: string;
}
export const LikeButton = ({
  className,
  imageId,
  isLiked,
  totalLikes
}: Props) => {
  const toggleLikeQuery = useToggleLike({
    imageId: imageId
  });

  const handleLike: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLikeQuery.mutate(undefined);
  };
  return (
    <Button
      variant="secondary"
      onClick={handleLike}
      size="sm"
      className={cn(
        'w-fit',
        {
          'bg-red-100 text-red-600 hover:bg-red-50': isLiked,
          'text-slate-500': !isLiked
        },
        className
      )}
    >
      <Heart />
      {totalLikes}
    </Button>
  );
};
