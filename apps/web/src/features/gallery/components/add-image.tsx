import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Form
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import {
  AddImageInput,
  addImageInputSchema,
  useAddImage
} from '../api/add-image';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export const AddImage = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const form = useForm<AddImageInput>({
    resolver: zodResolver(addImageInputSchema)
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const addImage = useAddImage({
    mutationConfig: {
      onSuccess: () => {
        form.reset({
          caption: '',
          image: undefined
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        setPreviewUrl(null);
        setDialogOpen(false);
      }
    }
  });

  const onSubmit = (data: AddImageInput) => {
    addImage.mutate(data);
  };
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus /> Add your own image
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Add a new image</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 space-y-4 sm:flex-row">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-4"
            >
              <FormField
                control={form.control}
                name="caption"
                render={() => (
                  <FormItem>
                    <FormLabel>Caption</FormLabel>
                    <FormControl>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            form.setValue('image', file);
                            setPreviewUrl(URL.createObjectURL(file));
                          } else {
                            form.reset({ image: undefined });
                            setPreviewUrl(null);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      The image should be in JPG, PNG, or GIF format.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {previewUrl && (
                <div className="mt-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-64 w-auto rounded-lg shadow-md"
                  />
                </div>
              )}
              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caption</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Add image
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
