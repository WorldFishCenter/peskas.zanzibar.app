import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  iconOnly?: boolean;
}

export default function Logo({ iconOnly = false, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox={`0 0 ${iconOnly ? '48 26' : '100 28'}`}
      {...props}
    >
      {!iconOnly ? (
        <>
          <text
            x="0"
            y="20"
            fill="#3c748b"
            fontFamily="Arial, sans-serif"
            fontSize="21"
            fontWeight="bold"
          >
            PESKAS
          </text>
          <text
            x="86"
            y="12"
            fill="#3c748b"
            fontFamily="Arial, sans-serif"
            fontSize="10"
            fontWeight="bold"
          >
            TM
          </text>
        </>
      ) : (
        <>
          <text
            x="0"
            y="20"
            fill="#0c526e"
            fontFamily="Arial, sans-serif"
            fontSize="20"
            fontWeight="bold"
          >
            PSK
          </text>
        </>
      )}
    </svg>
  );
}
