import PageService from '~/services/pageService';
import ChatService from '~/services/chatService';
import WikiEditor from '~/components/WikiEditor.vue';
import ChatViewer from '~/components/ChatViewer.vue';


export const editOnFly = async (dialog: any, page: { collection: string, title: string }) => {
  const pageService = new PageService();
  const response = await pageService.getPageWiki(page.collection, page.title);
  if (checkLogged(response)) {
    dialog.open(WikiEditor, {
      props: {
        header: response?.data?.value?.page.title,
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
        wiki: response?.data?.value?.page.wikitext
      }
    });
  }
};

export const showChat = async (dialog: any, id: Object) => {
  const chatService = new ChatService();
  const response = await chatService.getChat(id);
  if (checkLogged(response)) {
    console.log('chat', response?.data?.value?.chat);
    dialog.open(ChatViewer, {
      props: {
        header: response?.data?.value?.chat?.query,
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
        chat: response?.data?.value?.chat,
      }
    });
  }
};

export const getChatLanguages = (chat: any) => {
  if (chat?.translations && !Array.isArray(chat.translations)) {
    chat.translations = Object.entries(chat.translations).map(([key, value]) => ({
      key,
      value
    }));
    let translations: string[] = [];
    chat?.translations.forEach((translation: any, index: number) => {
      if (!['sabias', 'titular'].includes(translation.key)) {
        translations.push(translation.key);
      }
    });
    return translations;
  }
};