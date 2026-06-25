/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './docs/**/*.{vue,js,ts,jsx,tsx,md}',
    './docs/.vitepress/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // 中式水墨主题色系
      colors: {
        ink: {
          50: '#FDFBF7',   // 米宣纸
          100: '#F9F7F2',  // 淡宣
          200: '#F2F0EB',  // 素绢
          300: '#E5E0D8',  // 绢边
          400: '#C4BDB0',  // 旧纸
          500: '#8B8578',  // 淡墨
          600: '#666360',  // 中墨
          700: '#4A4845',  // 浓墨
          800: '#2C2C2C',  // 焦墨
          900: '#1A1A1A',  // 漆黑
        },
        vermilion: {
          50: '#FEF2F2',
          100: '#FDE8E8',
          200: '#FACACA',
          300: '#F5A3A3',
          400: '#E86B6B',
          500: '#B94047',  // 朱砂红（主色）
          600: '#9A3339',
          700: '#7A282D',
          800: '#5C1E22',
          900: '#3D1417',
        },
      },
      fontFamily: {
        kai: ['"Noto Serif SC"', '"Songti SC"', '"SimSun"', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'ink': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        'ink-hover': '0 12px 40px -8px rgba(0, 0, 0, 0.15)',
        'vermilion': '0 4px 20px -2px rgba(185, 64, 71, 0.2)',
      },
    },
  },
  plugins: [],
  // 禁用 preflight 避免与 VitePress 冲突
  corePlugins: {
    preflight: false,
  },
}
