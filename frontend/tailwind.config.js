/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Light mode colors
                primary: {
                    50: '#F0F9FF',
                    100: '#E0F2FE',
                    200: '#BAE6FD',
                    300: '#7DD3FC',
                    400: '#38BDF8',
                    500: '#0EA5E9',
                    600: '#0284C7',
                    700: '#0369A1',
                    800: '#075985',
                    900: '#0C4A6E',
                },
                secondary: {
                    50: '#F0FDF4',
                    100: '#DCFCE7',
                    200: '#BBF7D0',
                    300: '#86EFAC',
                    400: '#4ADE80',
                    500: '#22C55E',
                    600: '#16A34A',
                    700: '#15803D',
                    800: '#166534',
                    900: '#145231',
                },
                accent: {
                    50: '#FAF5FF',
                    100: '#F3E8FF',
                    200: '#E9D5FF',
                    300: '#D8B4FE',
                    400: '#C084FC',
                    500: '#A855F7',
                    600: '#9333EA',
                    700: '#7E22CE',
                    800: '#6B21A8',
                    900: '#581C87',
                },
            },
            backgroundColor: {
                light: {
                    primary: '#FFFFFF',           // White
                    secondary: '#F8FAFC',         // Subtle gray
                    tertiary: '#F1F5F9',          // Light gray
                },
                'dark-primary': '#0F172A',       // Very dark blue
                'dark-secondary': '#1E293B',     // Dark slate
                'dark-tertiary': '#334155',      // Medium slate
            },
            textColor: {
                light: {
                    primary: '#0F172A',           // Very dark blue
                    secondary: '#475569',         // Slate gray
                    tertiary: '#64748B',          // Light slate
                },
                'dark-primary': '#F1F5F9',       // Almost white
                'dark-secondary': '#CBD5E1',     // Light slate
                'dark-tertiary': '#94A3B8',      // Medium slate
            },
            borderColor: {
                light: {
                    primary: '#E2E8F0',           // Light border
                    secondary: '#CBD5E1',         // Medium border
                },
                'dark-primary': '#334155',       // Dark border
                'dark-secondary': '#475569',     // Medium dark border
            },
            animation: {
                fadeIn: 'fadeIn 0.5s ease-in-out',
                slideUp: 'slideUp 0.5s ease-out',
                slideDown: 'slideDown 0.5s ease-out',
                slideLeft: 'slideLeft 0.5s ease-out',
                slideRight: 'slideRight 0.5s ease-out',
                pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                shimmer: 'shimmer 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideLeft: {
                    '0%': { transform: 'translateX(20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideRight: {
                    '0%': { transform: 'translateX(-20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
            },
            transitionDuration: {
                '250': '250ms',
                '350': '350ms',
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
