import { TypographyH2 } from '@/components/ui/typography';
import { useInfiniteGallery } from '../api/get-gallery';
import { Spinner } from '@/components/ui/spinner';
import { ArchiveX } from 'lucide-react';
import { GalleryItem } from './gallery-item';
import { Button } from '@/components/ui/button';

export const Gallery = () => {
  const galleryQuery = useInfiniteGallery();

  if (galleryQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const images = galleryQuery.data?.pages.flatMap((page) => {
    return page.data || [];
  });

  if (!images || !images.length) {
    return (
      <div
        role="list"
        aria-label="comments"
        className="flex h-40 flex-col items-center justify-center bg-white text-gray-500"
      >
        <ArchiveX className="size-10" />
        <h4>No Images Found</h4>
      </div>
    );
  }

  const limit = galleryQuery.data?.pages[0]?.limit || 0;

  const displayLoadMore = images.length >= limit && galleryQuery.hasNextPage;

  const loadMore = () => {
    galleryQuery.fetchNextPage();
  };

  return (
    <div className="flex flex-col gap-4">
      <TypographyH2>Gallery</TypographyH2>
      <div className="w-full columns-1 gap-4 sm:columns-2 lg:columns-3">
        {images.map((image) => {
          return <GalleryItem key={image.id} image={image} />;
        })}
      </div>
      {displayLoadMore && (
        <Button onClick={loadMore} size="lg" className="w-64 self-center">
          {galleryQuery.isFetchingNextPage ? (
            <Spinner size="sm" />
          ) : (
            'Load more'
          )}
        </Button>
      )}
    </div>
  );
};
