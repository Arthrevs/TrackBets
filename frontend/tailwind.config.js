/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'lando-bg': '#050505',
                'lando-neon': '#CCFF00',
                'lando-alert': '#FF3B30',
                'lando-panel': 'rgba(255, 255, 255, 0.05)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
                condensed: ['Roboto Condensed', 'sans-serif'],
            },
            boxShadow: {
                'neon': '0 0 15px #CCFF00',
                'neon-faint': '0 0 20px rgba(204, 255, 0, 0.1)',
            }
        },
    },
    plugins: [],
}
