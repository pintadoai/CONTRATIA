import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg" {...props}>
        <text
            x="0"
            y="38"
            fontFamily="Montserrat, sans-serif"
            fontSize="40"
            fontWeight="900"
            fill="#000000"
            letterSpacing="-1.5"
        >
            D' SHOW
        </text>
        
        <rect x="2" y="46" width="50" height="6" fill="#119600" />
        
        <g transform="translate(60, 46)">
            {[0, 14, 28, 42, 56].map((offset, i) => (
                 <path 
                    key={i}
                    d="M6 0.5L7.5 5H12.5L8.5 8L10 12.5L6 10L2 12.5L3.5 8L-0.5 5H4.5L6 0.5Z" 
                    fill="#000000" 
                    transform={`translate(${offset}, 0) scale(0.8)`} 
                />
            ))}
        </g>

        <text
            x="130"
            y="55"
            fontFamily="Montserrat, sans-serif"
            fontSize="12"
            fontWeight="700"
            fill="#000000"
            letterSpacing="2"
        >
            EVENTS
        </text>
    </svg>
);

export default Logo;