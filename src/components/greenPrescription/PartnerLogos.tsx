import React from 'react';

/**
 * 台灣家庭醫學醫學會 (Taiwan Association of Family Medicine) Official Seal SVG
 */
export const FamilyMedicineLogo: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="台灣家庭醫學醫學會標誌"
    >
      {/* Outer circular rings */}
      <circle cx="100" cy="100" r="95" stroke="#D32F2F" strokeWidth="6" fill="#FFFBFB" />
      <circle cx="100" cy="100" r="86" stroke="#D32F2F" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="100" cy="100" r="66" stroke="#D32F2F" strokeWidth="2" />

      {/* Decorative Greek Meander Ring Pattern */}
      <circle cx="100" cy="100" r="90" stroke="#D32F2F" strokeWidth="3" strokeDasharray="6 3 2 3" opacity="0.8" />

      {/* Curved Text Paths */}
      <path id="topArch" d="M 32 100 A 68 68 0 0 1 168 100" fill="none" />
      <path id="bottomArch" d="M 170 100 A 70 70 0 0 1 30 100" fill="none" />

      <text fill="#1A237E" fontSize="13" fontWeight="900" letterSpacing="2">
        <textPath href="#topArch" startOffset="50%" textAnchor="middle">
          台灣家庭醫學醫學會
        </textPath>
      </text>

      <text fill="#1A237E" fontSize="7.5" fontWeight="800" letterSpacing="0.8">
        <textPath href="#bottomArch" startOffset="50%" textAnchor="middle">
          TAIWAN ASSOCIATION OF FAMILY MEDICINE
        </textPath>
      </text>

      {/* Center Background Clinic House Icon */}
      <g transform="translate(68, 70)" stroke="#1A237E" strokeWidth="2" fill="none">
        <path d="M 32 0 L 0 24 L 64 24 Z" fill="#E8EAF6" opacity="0.6" />
        <rect x="6" y="24" width="52" height="34" rx="2" fill="#FFFFFF" />
        <path d="M 12 30 L 26 30 M 12 36 L 26 36 M 12 42 L 26 42" strokeWidth="1.5" />
        <path d="M 38 30 L 52 30 M 38 36 L 52 36 M 38 42 L 52 42" strokeWidth="1.5" />
      </g>

      {/* Center Caduceus / Rod of Asclepius with twin red snakes */}
      <g transform="translate(100, 102)">
        {/* Main Central Staff */}
        <line x1="0" y1="-50" x2="0" y2="45" stroke="#D32F2F" strokeWidth="4" strokeLinecap="round" />
        {/* Top cross bar & finial */}
        <circle cx="0" cy="-50" r="4.5" fill="#D32F2F" />
        <line x1="-12" y1="-42" x2="12" y2="-42" stroke="#D32F2F" strokeWidth="3" strokeLinecap="round" />

        {/* Snake 1 & Snake 2 entwined body curves */}
        <path
          d="M -22 -35 C -15 -42 0 -26 0 -16 C 0 -6 -20 0 -20 12 C -20 24 0 32 0 42"
          stroke="#D32F2F"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 22 -35 C 15 -42 0 -26 0 -16 C 0 -6 20 0 20 12 C 20 24 0 32 0 42"
          stroke="#D32F2F"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Snake heads at top */}
        <circle cx="-22" cy="-35" r="3" fill="#D32F2F" />
        <circle cx="22" cy="-35" r="3" fill="#D32F2F" />
      </g>

      {/* Date text at center bottom */}
      <text
        x="100"
        y="156"
        fill="#1A237E"
        fontSize="9"
        fontWeight="bold"
        textAnchor="middle"
        letterSpacing="1"
      >
        3. 1. 1986
      </text>
    </svg>
  );
};

/**
 * WaCare Logo (Horizontal Layout with smiling double-circle icon and WaCare text)
 * Reconstructed accurately from official WaCare horizontal logo assets
 */
export const WaCareLogo: React.FC<{ className?: string; iconOnly?: boolean }> = ({
  className = 'h-7',
  iconOnly = false,
}) => {
  const brandColor = '#F47920';

  if (iconOnly) {
    return (
      <svg
        viewBox="0 0 290 240"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        aria-label="WaCare 標誌圖標"
      >
        {/* Left Head/Eye */}
        <circle cx="72" cy="55" r="32" fill={brandColor} />
        {/* Right Head/Eye */}
        <circle cx="218" cy="55" r="32" fill={brandColor} />
        {/* Smiling W Ribbon Body */}
        <path
          d="M 42 128 C 42 200 110 200 145 142 C 180 200 248 200 248 128"
          fill="none"
          stroke={brandColor}
          strokeWidth="44"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 980 240"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-label="WaCare 標誌"
    >
      {/* Left Head/Eye */}
      <circle cx="72" cy="55" r="32" fill={brandColor} />
      {/* Right Head/Eye */}
      <circle cx="218" cy="55" r="32" fill={brandColor} />
      {/* Smiling W Ribbon Body */}
      <path
        d="M 42 128 C 42 200 110 200 145 142 C 180 200 248 200 248 128"
        fill="none"
        stroke={brandColor}
        strokeWidth="44"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* WaCare Wordmark */}
      <text
        x="315"
        y="172"
        fill={brandColor}
        fontSize="148"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        letterSpacing="-0.5px"
      >
        WaCare
      </text>
    </svg>
  );
};
