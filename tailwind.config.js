/** @type {import('tailwindcss').Config} */
import defaultColors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'

delete defaultColors.trueGray
delete defaultColors.lightBlue
delete defaultColors.warmGray
delete defaultColors.coolGray
delete defaultColors.blueGray

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: 'true',
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    colors: {
      ...defaultColors,
      'destructive-accent': 'hsl(var(--destructive-accent))',
      success: 'hsl(var(--success))',
      'success-background': 'hsl(var(--success-background))',
    },
    extend: {
      gridTemplateColumns: {
        // Simple 16 column grid
        '16': 'repeat(16, minmax(0, 1fr))',
        '24': 'repeat(24, minmax(0, 1fr))',
        // Complex site-specific column configuration
        'footer': '200px minmax(900px, 1fr) 100px',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.8rem',
        base: '0.95rem',
        lg: '1.1rem',
        xl: '1.2rem',
        '2xl': '1.4rem',
        '3xl': '1.6rem',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
