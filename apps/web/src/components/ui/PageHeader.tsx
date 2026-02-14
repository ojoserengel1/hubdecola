import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string | ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-black text-dark">{title}</h1>
        {subtitle && (
          <div className="text-gray-600 mt-1">
            {typeof subtitle === 'string' ? <p>{subtitle}</p> : subtitle}
          </div>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

