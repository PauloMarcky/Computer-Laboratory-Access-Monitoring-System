// components/ClamsFooter.tsx
import React from 'react';

const ClamsFooter = () => {
  return (
    <footer className="bg-[#1b325f] text-white px-6 py-3 flex items-center justify-between">
      <h5 className="text-sm font-semibold">MK.DEV</h5>
      <a
        href="https://myulsclms.online/"
        className="text-sm hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        @University of La Salette
      </a>
    </footer>
  );
};

export default ClamsFooter;