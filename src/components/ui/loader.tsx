
'use client';

import { cn } from '@/lib/utils';

export function MascotLoader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)} {...props}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .wheel {
            animation: spin 1.5s linear infinite;
            transform-origin: center;
          }
        `}
      </style>
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Central Body */}
        <circle cx="50" cy="50" r="25" fill="#BFADFF" />
        
        {/* Smile */}
        <path d="M43 58 C45 63, 55 63, 57 58" stroke="#6833FF" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Left Wheel (Ring) */}
        <g className="wheel">
            <circle cx="25" cy="50" r="15" fill="none" stroke="#6833FF" strokeWidth="8" />
        </g>
        
        {/* Right Wheel (Ring) */}
        <g className="wheel">
            <circle cx="75" cy="50" r="15" fill="none" stroke="#6833FF" strokeWidth="8" />
        </g>
      </svg>
      <p className="text-sm text-muted-foreground animate-pulse">Carregando...</p>
    </div>
  );
}
