import { acceptHMRUpdate, defineStore } from 'pinia';

export const usePageStore = defineStore('page', {
  state: () => ({
    editPage: false,
    collection: null as string | null,
    title: null as string | null
  }),
  actions: {
    loadPage (collection: string, title:string) {
      this.collection = collection;
      this.title = title;
      this.editPage = true;
    },
    setEditPage (edit: boolean) {
      this.editPage = edit;
    }
  }
});

if (import.meta.hot) { import.meta.hot.accept(acceptHMRUpdate(usePageStore, import.meta.hot)); }
