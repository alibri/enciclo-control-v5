import type { ModelInfo } from './ModelInfo';

export interface AgentsModels {
  [agent: string]: {
    [model: string]: ModelInfo;
  };
}

