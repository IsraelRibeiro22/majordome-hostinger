import React from 'react';

const ButlerIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
    <path d="M12 15l-1.5 4.5" />
    <path d="M12 15l1.5 4.5" />
    <path d="M9 12l-6 2" />
    <path d="M15 12l6 2" />
    <path d="M9 10c-1.667 .667 -2.5 2.167 -2.5 4" />
    <path d="M15 10c1.667 .667 2.5 2.167 2.5 4" />
    <path d="M10.5 10.5c.333 -.667 .833 -1.167 1.5 -1.5c.667 .333 1.167 .833 1.5 1.5" />
  </svg>
);

export default ButlerIcon;