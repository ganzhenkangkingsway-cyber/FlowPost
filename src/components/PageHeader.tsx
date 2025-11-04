interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}

export function PageHeader({ title, description, action, icon: Icon, iconColor }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 animate-fade-in-up">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`w-14 h-14 bg-gradient-to-br ${iconColor || 'from-blue-500 to-blue-600'} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{title}</h1>
          {description && (
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
