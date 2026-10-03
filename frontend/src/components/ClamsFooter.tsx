// components/ClamsFooter.tsx
import React from 'react';

const ClamsFooter = () => {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 flex w-full items-center justify-between bg-amber-600 px-4 py-1 text-white">
      <h5 className="text-xs font-semibold sm:text-sm">MK.DEV</h5>
      <a
        href="https://myulsclms.online/"
        className="text-xs hover:underline sm:text-sm"
        target="_blank"
        rel="noopener noreferrer"
      >
        @University of La Salette
      </a>
    </footer>
  );
};

export default ClamsFooter;