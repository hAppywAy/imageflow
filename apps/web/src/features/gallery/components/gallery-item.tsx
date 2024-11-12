import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import {
  TypographyH4,
  TypographyP,
  TypographySmall
} from '@/components/ui/typography';
import { GalleryImage } from '@/types/api';
import { Calendar, MessageCircle } from 'lucide-react';
import { LikeButton } from './like-button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ImageComments } from './image-comments';
import { AddComment } from './add-comment';
import { DownloadButton } from './download-button';
import { DeleteImageButton } from './delete-image-button';
import React from 'react';

export const GalleryItem = ({ image }: { image: GalleryImage }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div className="group relative mb-4 h-fit cursor-pointer break-inside-avoid overflow-hidden">
          <AspectRatio ratio={image.ratio} className="bg-muted">
            <img
              src={image.thumbnailUrl}
              alt={image.caption}
              className="h-auth w-full object-cover"
            />
            <div className="bg-foreground/60 text-background absolute inset-0 flex flex-col justify-between p-4 opacity-0 transition-all group-hover:opacity-100">
              <LikeButton
                imageId={image.id}
                isLiked={image.isLiked}
                totalLikes={image.likes}
              />
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <TypographyP className="font-bold">
                    {image.owner.username}
                  </TypographyP>
                  <TypographySmall className="line-clamp-3">
                    {image.caption}
                  </TypographySmall>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary">
                    <MessageCircle />
                    {image.comments}
                  </Button>
                </div>
              </div>
            </div>
          </AspectRatio>
        </div>
      </DialogTrigger>
      <DialogContent className="flex max-h-screen w-full max-w-6xl flex-col overflow-y-auto">
        <DialogClose />
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{image.owner.username}</DialogTitle>
          <div className="flex items-center gap-2">
            <LikeButton
              imageId={image.id}
              isLiked={image.isLiked}
              totalLikes={image.likes}
            />
            <DownloadButton image={image} />
            <DeleteImageButton
              image={image}
              onSuccess={() => setDialogOpen(false)}
            />
          </div>
        </DialogHeader>
        <div className="bg-muted flex h-fit w-full items-center justify-center">
          <img
            src={image.url}
            alt={image.caption}
            className="h-full max-h-[600px] w-auto object-cover"
          />
        </div>
        <TypographyP>{image.caption}</TypographyP>
        <div className="text-muted-foreground flex items-center gap-1">
          <Calendar size={16} />
          <TypographySmall>
            Posted on {format(image.createdAt, 'MMMM dd, yyyy')}
          </TypographySmall>
        </div>
        <div className="space-y-3">
          <TypographyH4>Comments</TypographyH4>
          <ImageComments imageId={image.id} />
          <AddComment imageId={image.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
