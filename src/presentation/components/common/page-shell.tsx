import type { ReactNode } from 'react';
import { PageTitle } from './page-title';

export interface PageShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Component bọc nội dung cho các trang chính
 * Bao gồm PageTitle và phần nội dung children
 */
export const PageShell = ({ title, description, actions, children }: PageShellProps) => {
  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageTitle 
        title={title} 
        subtitle={description} 
        actions={actions} 
      />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};
