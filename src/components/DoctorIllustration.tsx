const DoctorIllustration = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Head */}
      <circle cx="100" cy="60" r="25" fill="#FBBF77" />
      
      {/* Hair */}
      <path
        d="M75 55 Q75 35, 100 35 Q125 35, 125 55"
        fill="#3B3B3B"
      />
      
      {/* Stethoscope around neck */}
      <path
        d="M85 85 Q85 75, 90 75 L110 75 Q115 75, 115 85"
        stroke="#4A5568"
        strokeWidth="3"
        fill="none"
      />
      <circle cx="90" cy="85" r="3" fill="#4A5568" />
      <circle cx="110" cy="85" r="3" fill="#4A5568" />
      
      {/* White Coat Body */}
      <path
        d="M70 85 L70 160 Q70 170, 80 170 L120 170 Q130 170, 130 160 L130 85"
        fill="white"
        stroke="#E2E8F0"
        strokeWidth="2"
      />
      
      {/* Coat Collar */}
      <path
        d="M85 85 L85 95 L95 100 L100 95 L105 100 L115 95 L115 85"
        fill="white"
        stroke="#E2E8F0"
        strokeWidth="2"
      />
      
      {/* Arms */}
      <rect x="55" y="95" width="15" height="50" rx="7" fill="#FBBF77" />
      <rect x="130" y="95" width="15" height="50" rx="7" fill="#FBBF77" />
      
      {/* Coat sleeves */}
      <rect x="52" y="90" width="20" height="30" rx="5" fill="white" stroke="#E2E8F0" strokeWidth="2" />
      <rect x="128" y="90" width="20" height="30" rx="5" fill="white" stroke="#E2E8F0" strokeWidth="2" />
      
      {/* Blue Shirt underneath */}
      <rect x="85" y="95" width="30" height="20" fill="#3B82F6" />
      
      {/* Pocket */}
      <rect x="85" y="115" width="15" height="20" rx="2" fill="white" stroke="#3B82F6" strokeWidth="1.5" />
      
      {/* Pen in pocket */}
      <line x1="95" y1="115" x2="95" y2="125" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="95" cy="115" r="1.5" fill="#3B82F6" />
      
      {/* Face features */}
      {/* Eyes */}
      <circle cx="92" cy="58" r="2" fill="#2D3748" />
      <circle cx="108" cy="58" r="2" fill="#2D3748" />
      
      {/* Smile */}
      <path
        d="M90 68 Q100 73, 110 68"
        stroke="#2D3748"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Nose */}
      <line x1="100" y1="62" x2="100" y2="66" stroke="#FBBF77" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Medical cross badge */}
      <g transform="translate(107, 125)">
        <circle r="8" fill="#EF4444" />
        <path d="M-1 -5 L-1 -1 L-5 -1 L-5 1 L-1 1 L-1 5 L1 5 L1 1 L5 1 L5 -1 L1 -1 L1 -5 Z" fill="white" />
      </g>
    </svg>
  );
};

export default DoctorIllustration;
