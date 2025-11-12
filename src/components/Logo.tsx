interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const dimensions = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-2xl' },
    lg: { icon: 40, text: 'text-3xl' },
  };

  const { icon, text } = dimensions[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="flowpost-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="90" fill="url(#flowpost-gradient)" opacity="0.1" />

        <path
          d="M60 80 L140 80 L140 90 L60 90 Z"
          fill="url(#flowpost-gradient)"
          opacity="0.8"
        />
        <path
          d="M60 95 L120 95 L120 105 L60 105 Z"
          fill="url(#flowpost-gradient)"
          opacity="0.9"
        />
        <path
          d="M60 110 L130 110 L130 120 L60 120 Z"
          fill="url(#flowpost-gradient)"
        />

        <path
          d="M150 60 L170 80 L150 100 L130 80 Z"
          fill="url(#flowpost-gradient)"
        />
        <path
          d="M150 80 L190 80 L180 90 L160 90 Z"
          fill="url(#flowpost-gradient)"
          opacity="0.7"
        />

        <circle cx="45" cy="90" r="6" fill="#3B82F6" />
        <circle cx="45" cy="105" r="6" fill="#6366F1" />
        <circle cx="45" cy="120" r="6" fill="#8B5CF6" />
      </svg>

      {showText && (
        <span className={`font-bold bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent ${text}`}>
          FlowPost
        </span>
      )}
    </div>
  );
}
