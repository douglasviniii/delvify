
'use client';

import { cn } from '@/lib/utils';

const MascotLoader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)} {...props}>
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes bounce {
            0%, 100% {
              transform: translateX(0);
            }
            50% {
              transform: translateX(10px);
            }
          }
          .wheel {
            animation: spin 1.5s linear infinite;
            transform-origin: center;
          }
          .mascot-body {
            animation: bounce 2s ease-in-out infinite;
          }
        `}
      </style>
      <div className="relative w-24 h-24 mascot-body">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Roda Esquerda */}
          <g className="wheel">
            <path d="M25,50 a20,20 0 1,1 0,-0.001Z" fill="#9466FF" />
            <circle cx="25" cy="50" r="10" fill="#E9D5FF" />
          </g>
          {/* Corpo do Mascote */}
          <path d="M40 70 C 20 70, 15 50, 40 40 C 65 25, 85 40, 80 65 C 90 85, 50 95, 40 70 Z" fill="#C4B5FD" />
          <path d="M45 62 A 5 5 0 0 1 55 62" stroke="#9466FF" strokeWidth="3" fill="none" strokeLinecap="round" />
           {/* Roda Direita */}
          <g className="wheel" style={{ animationDelay: '-0.5s' }}>
            <path d="M75,50 a20,20 0 1,1 0,-0.001Z" fill="#9466FF" />
             <circle cx="75" cy="50" r="10" fill="#E9D5FF" />
          </g>
        </svg>
      </div>
      <p className="text-muted-foreground font-medium animate-pulse">Carregando...</p>
    </div>
  );
};

export default MascotLoader;
