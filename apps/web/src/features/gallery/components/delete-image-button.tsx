import { Button } from '@/components/ui/button';
import { GalleryImage } from '@/types/api';
import { Trash } from 'lucide-react';
import { useUser } from '@/lib/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useDeleteImage } from '../api/delete-image';
import { useToast } from '@/hooks/use-toast';

interface Props {
  image: GalleryImage;
  onSuccess?: () => void;
}

export const DeleteImageButton = ({ image, onSuccess }: Props) => {
  const user = useUser();

  const isMyImage = user?.id === image.owner.id;

  const { toast } = useToast();

  const deleteImage = useDeleteImage({
    mutationConfig: {
      onSuccess: () => {
        toast({
          title: 'Image deleted'
        });
        onSuccess?.();
      }
    }
  });

  if (!isMyImage) {
    return null;
  }

  const handleDelete = () => {
    deleteImage.mutate({ imageId: image.id });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="destructive">
          <Trash />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this image?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This image will be permanently removed
            from the gallery.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
