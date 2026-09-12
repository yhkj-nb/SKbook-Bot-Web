import { ref } from 'vue'

const darkMode = ref(false)

function applyTheme(dark) {
  darkMode.value = dark
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  localStorage.setItem('skbook_theme', dark ? 'dark' : 'light')
}

function toggleDark() {
  applyTheme(!darkMode.value)
}

function initTheme() {
  const stored = localStorage.getItem('skbook_theme')
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored === 'dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyTheme(prefersDark)
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('skbook_theme')) {
      applyTheme(e.matches)
    }
  })
}

export function useThemeStore() {
  return { darkMode, toggleDark, initTheme }
}