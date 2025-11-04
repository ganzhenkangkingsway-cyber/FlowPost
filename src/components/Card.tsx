interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-[#1F2937] rounded-2xl border border-[#374151] p-6 ${
        hover ? 'hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
