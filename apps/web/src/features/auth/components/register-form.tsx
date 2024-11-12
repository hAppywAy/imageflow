import { useSearchParams } from 'react-router-dom';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { RegisterInput, registerInputSchema, useAuth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { useToast } from '@/hooks/use-toast';

type RegisterFormProps = {
  onSuccess: () => void;
};

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const { register } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const form = useForm<RegisterInput>({
    defaultValues: {
      username: '',
      password: ''
    },
    resolver: zodResolver(registerInputSchema)
  });

  const onSubmit: SubmitHandler<RegisterInput> = async (data) => {
    const result = await register(data);

    if (!result.ok) {
      toast({
        description: result.error,
        variant: 'destructive'
      });
      return;
    }

    toast({
      description: 'Account created successfully'
    });

    onSuccess?.();
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
      </Form>
      <div className="mt-2 flex items-center justify-end">
        <div className="text-sm">
          <span>Already have an account?</span>
          <Link
            to={`${redirectTo ? `/?redirectTo=${encodeURIComponent(redirectTo)}` : '/'}`}
            className="ml-1"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
