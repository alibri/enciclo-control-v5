export default defineNuxtPlugin(() => {
  // Inicializar el tema al cargar la aplicación
  if (process.client) {
    const savedTheme = localStorage.getItem('darkTheme')
    const isDark = savedTheme ? JSON.parse(savedTheme) : false
    
    // Aplicar la clase al documento
    if (isDark) {
      document.documentElement.classList.add('p-dark')
    } else {
      document.documentElement.classList.remove('p-dark')
    }
  }
})
