interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 animate-fade-in-up">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
        {description && (
          <p className="text-[#D1D5DB] text-lg">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
