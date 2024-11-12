import React from 'react';

export const AppLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="p-4 sm:p-6 md:p-10 lg:p-12">
      <main>{children}</main>
    </div>
  );
};
