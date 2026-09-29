import { ConfusionMatrixData, ModelMetrics } from '../types';
import { MOCK_CONFUSION_MATRICES, MOCK_MODEL_METRICS } from '../data/mockData';
import { apiClient } from './apiClient';

export class ModelService {
  /**
   * Fetches model performance comparison table
   */
  public async getModelComparisons(): Promise<ModelMetrics[]> {
    const preferLive = apiClient.getPreferLive();
    const baseUrl = apiClient.getBaseUrl();

    if (preferLive && baseUrl) {
      try {
        const response = await fetch(`${baseUrl}/models`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            return data;
          }
        }
      } catch (err) {
        console.info('[ModelService] Backend /models unavailable, using baseline data.');
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_MODEL_METRICS), 50);
    });
  }

  /**
   * Fetches confusion matrix data for a specific model
   */
  public async getConfusionMatrix(modelName: string = 'Random Forest'): Promise<ConfusionMatrixData> {
    const preferLive = apiClient.getPreferLive();
    const baseUrl = apiClient.getBaseUrl();

    if (preferLive && baseUrl) {
      try {
        const response = await fetch(`${baseUrl}/model-info`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          const info = await response.json();
          if (info.models_evaluated) {
            // Find model by name
            const found = info.models_evaluated.find(
              (m: any) => m.model_name.toLowerCase() === modelName.toLowerCase()
            );
            if (found && found.confusion_matrix) {
              return {
                labels: ['LOW', 'MEDIUM', 'HIGH'],
                matrix: found.confusion_matrix,
                total_samples: 2400,
              };
            }
          }
        }
      } catch (e) {
        // Fall back gracefully
      }
    }

    const matrix = MOCK_CONFUSION_MATRICES[modelName] || MOCK_CONFUSION_MATRICES['Random Forest'];
    return new Promise((resolve) => {
      setTimeout(() => resolve(matrix), 50);
    });
  }
}

export const modelService = new ModelService();
