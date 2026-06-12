module.exports = {
  darkMode: 'class',
  content: [
    "./*.html",
    "./public/**/*.html",
    "./script.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D5A27',
        'primary-dark': '#1e3d1a',
        'accent-green': '#79a37d',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
      },
      fontFamily: {
        heading: ['Readex Pro', 'sans-serif'],
        body: ['Readex Pro', 'sans-serif'],
        serif: ['Readex Pro', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
      }
    }
  },
  plugins: [],
}
