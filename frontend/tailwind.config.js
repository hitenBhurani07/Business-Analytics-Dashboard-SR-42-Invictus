/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2563EB',      // Blue
                secondary: '#10B981',    // Green
                accent: '#7C3AED',       // Purple
                danger: '#EF4444',       // Red
                success: '#10B981',      // Green
                warning: '#F59E0B',      // Yellow/Orange
                info: '#3B82F6',         // Light Blue
                textMain: '#111827',     // Dark Gray
                textLight: '#6B7280',    // Medium Gray
                cardBg: '#F9FAFB',       // Light Gray Background
            }
        },
    },
    plugins: [],
}
