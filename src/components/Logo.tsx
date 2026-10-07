import { useId } from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = 'w-10 h-10' }: LogoProps) {
  const uid = useId();
  const pinGradId = `logo-pin-${uid}`;
  const capGradId = `logo-cap-${uid}`;

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={pinGradId} x1="20" y1="5" x2="75" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={capGradId} x1="7" y1="2" x2="93" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>

      {/* Pin body with a true cut-out hole (shows background, not a solid dot) */}
      <path
        d="M50 92C50 92 17 54 17 36A33 33 0 1 1 83 36C83 54 50 92 50 92Z
           M50 46m-13 0a13 13 0 1 0 26 0a13 13 0 1 0 -26 0Z"
        fill={`url(#${pinGradId})`}
        fillRule="evenodd"
      />

      {/* Rounded puff where the cap meets the head */}
      <ellipse cx="50" cy="33" rx="17" ry="11" fill={`url(#${capGradId})`} />

      {/* Mortarboard top */}
      <path d="M50 2 93 20 50 38 7 20Z" fill={`url(#${capGradId})`} />
      <path d="M18 17Q50 28 82 17" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* Tassel */}
      <path d="M93 20 97 38" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <rect x="93.5" y="36" width="7" height="7" rx="1.5" fill="white" transform="rotate(20 97 39.5)" />
    </svg>
  );
}
