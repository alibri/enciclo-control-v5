/** @type {import('tailwindcss').Config} */
// Nota: En Tailwind CSS v4, la configuración de darkMode se hace en el CSS con @custom-variant
// El plugin tailwindcss-primeui se importa en tailwind.css con @import
export default {
    // darkMode se configura en tailwind.css con @custom-variant para Tailwind v4
    content: [
      './app/**/*.{vue,js,ts,jsx,tsx}',
      './components/**/*.{vue,js,ts,jsx,tsx}',
      './layouts/**/*.{vue,js,ts,jsx,tsx}',
      './pages/**/*.{vue,js,ts,jsx,tsx}',
      './plugins/**/*.{js,ts}',
      './nuxt.config.{js,ts}',
      './app.vue'
    ],
    // plugins se configura en tailwind.css con @import para Tailwind v4
    theme: {
        screens: {
            sm: '576px',
            md: '768px',
            lg: '992px',
            xl: '1200px',
            '2xl': '1920px'
        }
    }
};
