import PageService from '~/services/pageService';
import ChatService from '~/services/chatService';
import WikiEditor from '~/components/WikiEditor.vue';
import ChatViewer from '~/components/ChatViewer.vue';
import type { Component } from 'vue';

interface DialogService {
  open: (component: Component, options?: { props?: any; data?: any }) => void;
}

export const editOnFly = async (dialog: DialogService, page: { collection: string, title: string }) => {
  const pageService = new PageService();
  const response = await pageService.getPageWiki(page.collection, page.title);
  if (checkLogged(response)) {
    const responseData = response?.data?.value as any;
    dialog.open(WikiEditor, {
      props: {
        header: responseData?.page?.title,
        style: {
          width: '75vw'
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
        },
        modal: true
      },
      data: {
        page: { collection: page.collection, title: page.title },
        wiki: responseData?.page?.wikitext
      }
    });
  }
};

export const showChat = async (dialog: DialogService, id: string | number) => {
  const chatService = new ChatService();
  const response = await chatService.getChat(id);
  if (checkLogged(response)) {
    const responseData = response?.data?.value as any;
    dialog.open(ChatViewer, {
      props: {
        header: responseData?.chat?.query ?? '',
        style: {
          width: '75vw'
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
        },
        modal: true
      },
      data: {
        chat: responseData?.chat ?? {},
      }
    });
  } else {
    const { showMessage } = useMessages();
    const { t } = useI18n();
    showMessage('error', t('Error'), t('No tienes permisos para ver este chat'));
  }
};

export const getChatLanguages = (chat: any) => {
  if (chat?.translations && !Array.isArray(chat?.translations)) {
    chat.translations = Object.entries(chat.translations).map(([key, value]) => ({
      key,
      value
    }));
    let translations: string[] = [];
    chat?.translations?.forEach((translation: any, index: number) => {
      if (!['sabias', 'titular'].includes(translation?.key)) {
        translations.push(translation.key);
      }
    });
    return translations;
  }
};