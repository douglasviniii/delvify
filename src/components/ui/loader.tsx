
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
          @keyframes bounce {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(-10px); }
          }
          .wheel {
            animation: spin 1s linear infinite;
            transform-origin: center;
          }
          .ghost-body {
            animation: bounce 2s ease-in-out infinite;
          }
        `}
      </style>
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="ghost-body"
      >
        {/* Ghost Body */}
        <path
          d="M20 90 C20 40, 80 40, 80 90 L65 80 L50 90 L35 80 Z"
          fill="#F0F4F9"
          stroke="#E0E6EB"
          strokeWidth="2"
        />
        {/* Eyes */}
        <circle cx="40" cy="60" r="5" fill="#2c3e50" />
        <circle cx="60" cy="60" r="5" fill="#2c3e50" />
        
        {/* Arms */}
        <path d="M25 75 Q15 70 10 60" stroke="#E0E6EB" strokeWidth="2" fill="none" />
        <path d="M75 75 Q85 70 90 60" stroke="#E0E6EB" strokeWidth="2" fill="none" />
        
        {/* Wheels */}
        <g className="wheel">
          <circle cx="10" cy="60" r="8" fill="#9466FF" />
          <circle cx="10" cy="60" r="3" fill="#F0F4F9" />
        </g>
        <g className="wheel">
           <circle cx="90" cy="60" r="8" fill="#9466FF" />
           <circle cx="90" cy="60" r="3" fill="#F0F4F9" />
        </g>
      </svg>
      <p className="text-sm text-muted-foreground animate-pulse">Carregando...</p>
    </div>
  );
}
