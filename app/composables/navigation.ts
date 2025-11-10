export function useNavigationMenu () {
  const { t } = useI18n();

  const navigationMenu = () => {
    return [
      {
        label: t('Home'),
        to: '/',
        icon: 'pi pi-fw pi-home',
        items: [
          { label: t('Dashboard'), to: '/', icon: 'pi pi-fw pi-home' }
        ]
      },
      {
        label: t('Estadísticas'),
        items: [
          { label: t('Sesiones'), icon: 'pi pi-fw pi-sign-in', to: '/stats/sessions' },
          { label: t('Páginas'), icon: 'pi pi-fw pi-copy', to: '/stats/pages' },
          { label: t('Queries'), icon: 'pi pi-fw pi-question-circle', to: '/stats/queries' },
          { label: t('Impresiones'), icon: 'pi pi-fw pi-print', to: '/stats/prints' }
        ]
      },
      {
        label: t('Usuarios'),
        items: [
          { label: t('Usuarios'), icon: 'pi pi-fw pi-users', to: '/users' }
        ]
      },
      /* {
        label: t('CRM'),
        items: [
          { label: t('Consultas'), icon: 'pi pi-user', to: '/crm/leads' },
          { label: t('Mensajes'), icon: 'pi pi-envelope', to: '/crm/messages' }
        ]
      }, */
      {
        label: t('Authoritas'),
        items: [
          { label: t('Pregúntame'), icon: 'pi pi-comment', to: '/chat/' },
          { label: t('Repositorio'), icon: 'pi pi-file-pdf', to: '/repositorio/' }
          /* { label: t('Entidades'), icon: 'pi pi-id-card', to: '/chat/entidades' } */
        ]
      },
      {
        label: t('Utilidades'),
        items: [
          { label: t('Portada'), to: '/portada', icon: 'pi pi-fw pi-desktop' },
          { label: t('Metas'), to: '/metas', icon: 'pi pi-fw pi-building' },
          { label: t('Búsqueda'), icon: 'pi pi-fw pi-search', to: '/utils/search' },
          { label: t('Test IP'), icon: 'pi pi-fw pi-globe', to: '/utils/testip' },
          { label: t('Test Referer'), icon: 'pi pi-fw pi-link', to: '/utils/testreferer' },
          { label: t('Test RAG'), icon: 'pi pi-fw pi-code', to: '/utils/testrag' },
          { label: t('Test RAG A/B'), icon: 'pi pi-fw pi-code', to: '/utils/testragab' },
          /* { label: t('Mantenimiento'), icon: 'pi pi-fw pi-cog', to: '/utils/maintenance' } */
        ]
      }/* ,
      {
        label: t('Ayuda'),
        items: [
          { label: t('Uso Aplicación'), icon: 'pi pi-fw pi-question-circle', to: '/cms/help' }
        ]
      } */
    ];
  };

  return { navigationMenu };
}
