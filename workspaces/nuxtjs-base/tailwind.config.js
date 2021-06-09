const color = require('tinycolor2')

//
function lighten(col, amount = 5) {
  return color(col).lighten(amount).toString()
}

function darken(col, amount = 5) {
  return color(col).darken(amount).toString()
}

//
const theme = {
  night: {
    light: '#4C566A', // UI elements like indent- and wrap guide marker
    DEFAULT: '#434C5E', // selection- and text highlighting color
    dark: '#3B4252', // elevated, more prominent or focused UI elements
    darker: '#2E3440' // elements background
  },

  snow: {
    darker: darken('#b2b2b2', 20),
    dark: darken('#b2b2b2', 10),
    DEFAULT: '#b2b2b2',
    light: lighten('#b2b2b2', 10),
    lighter: lighten('#b2b2b2', 20)
  },

  frost: {
    green: '#8FBCBB', // stand out and get more visual attention
    cyan: '#88C0D0', // primary UI elements with main usage purposes
    gray: '#81A1C1', // secondary UI elements that also require more visual attention than other elements
    blue: '#5E81AC' // tertiary UI elements that require more visual attention
  },

  aurora: {
    red: '#BF616A', // errors
    orange: '#D08770', // rarely used for UI elements
    yellow: '#EBCB8B', // warnings
    green: '#A3BE8C', // success
    pink: '#B48EAD' // rarely used for UI elements
  }
}

module.exports = {
  mode: 'jit',
  important: true,
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Arial',
          'sans-serif'
        ]
      },

      // https://www.crispedge.com/color-shades-generator
      // https://maketintsandshades.com/#1e202b
      colors: {
        night: theme.night,
        snow: theme.snow,
        frost: theme.frost,
        aurora: theme.aurora,

        background: darken(theme.night.darker),

        primary: {
          light: '#a1abe8',
          DEFAULT: '#7887de',
          dark: '#4f63d4'
        },
        menus: {
          light: lighten(theme.night.darker, 3),
          DEFAULT: theme.night.darker,
          dark: darken(theme.night.darker, 3)
        },
        input: {
          light: lighten(theme.night.dark),
          DEFAULT: theme.night.dark,
          dark: darken(theme.night.dark)
        },
        button: {
          light: lighten(theme.night.dark),
          DEFAULT: theme.night.dark,
          dark: darken(theme.night.dark)
        },
        danger: {
          light: lighten(theme.aurora.red),
          DEFAULT: theme.aurora.red,
          dark: darken(theme.aurora.red)
        },
        success: {
          light: lighten(theme.aurora.green),
          DEFAULT: theme.aurora.green,
          dark: darken(theme.aurora.green)
        },
        warning: {
          light: lighten(theme.aurora.yellow),
          DEFAULT: theme.aurora.yellow,
          dark: darken(theme.aurora.yellow)
        },
        blue: {
          light: lighten(theme.frost.blue),
          DEFAULT: theme.frost.blue,
          dark: darken(theme.frost.blue)
        }
      }
    }
  },
  variants: {},
  plugins: [],
  purge: {
    // https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css
    content: [
      './components/**/*.{vue,js}',
      './layouts/**/*.vue',
      './pages/**/*.vue',
      './plugins/**/*.{js,ts}',
      './nuxt.config.{js,ts}'
    ]
  }
}