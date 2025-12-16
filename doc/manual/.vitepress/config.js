export default {
  title: 'Enciclo Control 5.0',
  description: 'Manual de usuario de Enciclo Control 5.0',
  lang: 'es',
  base: '/control/manual/',
  
  themeConfig: {
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Guía de Usuario', link: '/guia/' }
    ],
    
    sidebar: [
      {
        text: 'Introducción',
        items: [
          { text: 'Bienvenida', link: '/' },
          { text: 'Acceso a la aplicación', link: '/acceso' }
        ]
      },
      {
        text: 'Funcionalidades Principales',
        items: [
          { text: 'Dashboard', link: '/dashboard' },
          { text: 'Estadísticas', link: '/estadisticas' },
          { text: 'Usuarios', link: '/usuarios' },
          { text: 'Authoritas', link: '/authoritas' },
          { text: 'Utilidades', link: '/utilidades' }
        ]
      },
      {
        text: 'Estadísticas',
        items: [
          { text: 'Sesiones', link: '/estadisticas/sesiones' },
          { text: 'Páginas', link: '/estadisticas/paginas' },
          { text: 'Queries', link: '/estadisticas/queries' },
          { text: 'Impresiones', link: '/estadisticas/impresiones' }
        ]
      },
      {
        text: 'Authoritas',
        items: [
          { text: 'Pregúntame', link: '/authoritas/preguntame' },
          { text: 'Pregúntame (listado)', link: '/authoritas/preguntame-listado' },
          { text: 'Repositorio', link: '/authoritas/repositorio' },
          { text: 'Test RAG', link: '/authoritas/test-rag' }
        ]
      },
      {
        text: 'Utilidades',
        items: [
          { text: 'Portada', link: '/utilidades/portada' },
          { text: 'Metas', link: '/utilidades/metas' },
          { text: 'Búsqueda', link: '/utilidades/busqueda' },
          { text: 'Test IP', link: '/utilidades/test-ip' },
          { text: 'Test Referer', link: '/utilidades/test-referer' }
        ]
      }
    ],
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],
    
    footer: {
      message: 'Enciclo Control 5.0 - Manual de Usuario',
      copyright: 'Copyright © 2024'
    },
    
    search: {
      provider: 'local'
    }
  }
}
