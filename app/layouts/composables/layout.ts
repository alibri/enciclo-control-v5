const layoutConfig = reactive({
  darkTheme: false,
  menuMode: 'static',
  activeMenuItem: null,
})

const layoutState = reactive({
  staticMenuDesktopInactive: false,
  overlayMenuActive: false,
  profileSidebarVisible: false,
  configSidebarVisible: false,
  staticMenuMobileActive: false,
  menuHoverActive: false,
  activeMenuItem: '',
})

export function useLayout() {
  // Inicializar el tema desde localStorage o usar el valor por defecto
  const initializeTheme = () => {
    if (process.client) {
      const savedTheme = localStorage.getItem('darkTheme')
      const isDark = savedTheme ? JSON.parse(savedTheme) : false
      layoutConfig.darkTheme = isDark
      
      // Aplicar la clase al documento
      if (isDark) {
        document.documentElement.classList.add('p-dark')
      } else {
        document.documentElement.classList.remove('p-dark')
      }
    }
  }

  // Inicializar el tema al cargar
  if (process.client) {
    initializeTheme()
  }

  const changeThemeSettings = (theme: string, darkTheme: boolean) => {
    layoutConfig.darkTheme = darkTheme
    if (process.client) {
      localStorage.setItem('darkTheme', JSON.stringify(darkTheme))
    }
  }

  const toggleDarkMode = () => {
    if (!document.startViewTransition) {
      executeDarkModeToggle()
      return
    }

    document.startViewTransition(() => executeDarkModeToggle())
  }

  const executeDarkModeToggle = () => {
    layoutConfig.darkTheme = !layoutConfig.darkTheme
    
    // Guardar en localStorage
    if (process.client) {
      localStorage.setItem('darkTheme', JSON.stringify(layoutConfig.darkTheme))
    }
    
    // Aplicar/remover la clase del documento
    if (layoutConfig.darkTheme) {
      document.documentElement.classList.add('p-dark')
    } else {
      document.documentElement.classList.remove('p-dark')
    }
  }

  const setActiveMenuItem = (item: any) => {
    layoutConfig.activeMenuItem = item.value || item
  }

  const onMenuToggle = () => {
    if (layoutConfig.menuMode === 'overlay')
      layoutState.overlayMenuActive = !layoutState.overlayMenuActive

    if (window.innerWidth > 991)
      layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive
    else
      layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive
  }

  const isSidebarActive = computed(() => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive)

  const isDarkTheme = computed(() => layoutConfig.darkTheme)

  return {
    layoutConfig: toRefs(layoutConfig),
    layoutState: toRefs(layoutState),
    changeThemeSettings,
    toggleDarkMode,
    onMenuToggle,
    isSidebarActive,
    isDarkTheme,
    setActiveMenuItem,
  }
}
