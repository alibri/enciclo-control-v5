import { useApiClient } from '~/stores/api';

export default class MediaService {
  api: any;

  constructor () {
    this.api = useApiClient();
  }

  async uploadMedia (image: any) {
    return await this.api.get('setmedia', { image });
  }

  async getImages () {
    return await this.api.get('getlistmedia');
  }

  async getRepository () {
    return await this.api.get('getlistrepositories');
  }
};
