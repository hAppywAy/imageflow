import { cn } from '@/lib/utils';
import { Link as RouterLink, LinkProps } from 'react-router-dom';

export const Link = ({ className, children, ...props }: LinkProps) => {
  return (
    <RouterLink className={cn('text-primary underline', className)} {...props}>
      {children}
    </RouterLink>
  );
};
