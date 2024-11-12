import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AddCommentInput,
  addCommentInputSchema,
  useAddComment
} from '../api/add-comment';
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  Form
} from '@/components/ui/form';

interface Props {
  imageId: string;
}

export const AddComment = ({ imageId }: Props) => {
  const addComment = useAddComment({ imageId });

  const form = useForm<AddCommentInput>({
    resolver: zodResolver(addCommentInputSchema),
    defaultValues: {
      content: ''
    }
  });

  const onSubmit = (data: AddCommentInput) => {
    addComment.mutate({ imageId, data });

    form.reset({
      content: ''
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col items-end gap-4"
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Textarea placeholder="Add a comment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button>Add comment</Button>
      </form>
    </Form>
  );
};
