import { Button } from '@/components/ui/button';
import { GalleryImage } from '@/types/api';
import { Download } from 'lucide-react';

interface Props {
  image: GalleryImage;
}

export const DownloadButton = ({ image }: Props) => {
  return (
    <a href={image.url} download target="_blank">
      <Button>
        <Download /> Download
      </Button>
    </a>
  );
};
