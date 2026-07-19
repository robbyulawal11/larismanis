// Ikon SVG ringan buatan sendiri — tanpa library eksternal.
import React from 'react';

const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const ChatIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.38-4.1-1.05L3 20l1.1-5.2A8.5 8.5 0 1 1 21 11.5z" />
    <path d="M8 10h8M8 13.5h5" />
  </svg>
);

export const SparkIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3c.8 3.8 2.4 5.4 6.2 6.2-3.8.8-5.4 2.4-6.2 6.2-.8-3.8-2.4-5.4-6.2-6.2C9.6 8.4 11.2 6.8 12 3z" />
    <path d="M18.5 14.5c.4 1.9 1.2 2.7 3 3.1-1.8.4-2.6 1.2-3 3.1-.4-1.9-1.2-2.7-3-3.1 1.8-.4 2.6-1.2 3-3.1z" />
  </svg>
);

export const BookIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15z" />
    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5z" />
    <path d="M9 8h7M9 11.5h5" />
  </svg>
);

export const ReplyIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M9 10 4 15l5 5" />
    <path d="M4 15h9a7 7 0 0 0 7-7V6" />
  </svg>
);

export const MicIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);

export const SendIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4 20-7z" />
  </svg>
);

export const CameraIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13.5" r="3.5" />
  </svg>
);

export const CopyIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const TrashIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

export const PlusIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const DownloadIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3v12M7 10l5 5 5-5" />
    <path d="M4 19h16" />
  </svg>
);

export const ArrowUpIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export const ArrowDownIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

export const LogoMark = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <rect width="64" height="64" rx="16" fill="#0E4D2E" />
    <path d="M32 10c2 9 5 13 13 15-8 2-11 6-13 15-2-9-5-13-13-15 8-2 11-6 13-15z" fill="#FFC42E" />
    <path
      d="M46 38c1 4.5 2.5 6.5 6.5 7.5-4 1-5.5 3-6.5 7.5-1-4.5-2.5-6.5-6.5-7.5 4-1 5.5-3 6.5-7.5z"
      fill="#FFD666"
    />
    <rect x="14" y="44" width="20" height="4" rx="2" fill="#FFF9EE" opacity="0.9" />
  </svg>
);
