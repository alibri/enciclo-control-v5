import type { StatsData } from './StatsData';

export interface UserPageStats {
  [year: string]: {
    [month: string]: StatsData;
  };
}

