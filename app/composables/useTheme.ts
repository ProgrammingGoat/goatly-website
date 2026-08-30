// Light/dark theme state, persisted in localStorage.
// The initial class is set pre-paint by an inline script in nuxt.config.ts;
// this composable keeps Vue in sync and handles toggling.
export const useTheme = () => {
  const isDark = useState<boolean>('theme-is-dark', () => false)

  const apply = (dark: boolean) => {
    isDark.value = dark
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', dark)
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    }
  }

  // Sync reactive state with the class the inline script already applied.
  onMounted(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })

  const toggle = () => apply(!isDark.value)

  return { isDark, toggle }
}
