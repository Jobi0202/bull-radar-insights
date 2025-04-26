
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary p-1 rounded-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="M2 12c0-3.28 3.36-6 7.5-6 1.57 0 3.03.32 4.23.89" />
          <path d="M2 12v6c0 3.31 3.36 6 7.5 6s7.5-2.69 7.5-6v-1.5" />
          <path d="M22 8.5c0 1.1-.9 2-2 2a2 2 0 0 1-2-2c0-1.1.9-2 2-2s2 .9 2 2Z" />
          <path d="m18 9.5 4 2.5" />
          <path d="M18 11.5 14.5 11" />
        </svg>
      </div>
      <span className="text-lg font-bold text-primary">Bull Radar</span>
    </div>
  );
};

export default Logo;
