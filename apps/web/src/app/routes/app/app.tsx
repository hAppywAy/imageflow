import { Head } from '@/components/seo/head';
import { Button } from '@/components/ui/button';
import { TypographyH1, TypographyP } from '@/components/ui/typography';
import { AddImage } from '@/features/gallery/components/add-image';
import { Gallery } from '@/features/gallery/components/gallery';
import { useAuth, useUser } from '@/lib/auth';
import { LogOut } from 'lucide-react';

export const AppRoute = () => {
  const user = useUser();
  const { logout } = useAuth();
  return (
    <>
      <Head title="Gallery" />
      <div className="container space-y-6 px-2">
        <div className="flex w-full flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex-1 space-y-2">
            <TypographyH1>Welcome {user.username}!</TypographyH1>
            <TypographyP>
              It's good to see you. Watch out for the newest images added to the
              gallery.
            </TypographyP>
          </div>
          <div className="flex w-full items-center justify-end sm:w-fit">
            <Button variant="outline" size="lg" onClick={logout}>
              <LogOut />
              Logout
            </Button>
          </div>
        </div>
        <AddImage />
        <Gallery />
      </div>
    </>
  );
};
