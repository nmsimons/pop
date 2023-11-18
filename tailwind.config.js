/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
          animation: {
            bump: 'bump 1s',
          },
          keyframes: {
            bump: {
              '0%': {
                transform: 'translateY(-25%)',                
              },
              '50%': {
                transform: 'translateY(0)',                
              },              
            },
          },
        },
      },
    plugins: [],
};
