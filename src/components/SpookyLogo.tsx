import React from 'react';

interface SpookyLogoProps {
    className?: string;
}

export default function SpookyLogo({ className }: SpookyLogoProps) {
    return (
        <svg
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <circle cx="39.5818" cy="40.1065" r="11.5" transform="rotate(112 39.5818 40.1065)" stroke="currentColor" strokeWidth="4" />
            <path d="M40.175 40.6993L34.1749 59.6994" stroke="currentColor" strokeWidth="4" />
            <path d="M33.1749 20.1992L40.6749 40.1992" stroke="currentColor" strokeWidth="4" />
            <path d="M31.6059 22.0018C34.5374 20.73 37.7366 20.1982 40.922 20.4531C44.1073 20.708 47.1812 21.7418 49.8732 23.4636C52.5653 25.1854 54.7929 27.5424 56.3601 30.3272C57.9274 33.112 58.7862 36.2393 58.8611 39.434C58.936 42.6286 58.2247 45.7927 56.7896 48.6479C55.3546 51.5031 53.2399 53.9619 50.6315 55.8079C48.0231 57.654 45.001 58.8307 41.8311 59.2346C38.6612 59.6385 35.4406 59.2571 32.4527 58.1241" stroke="currentColor" strokeWidth="4" />
            <line x1="29.1749" y1="40.1995" x2="49.1749" y2="40.1995" stroke="currentColor" strokeWidth="3" />
        </svg>
    );
}
