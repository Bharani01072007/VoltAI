import { AnalyticsSummary, FeatureImportanceItem } from '../types';
import { MOCK_ANALYTICS, MOCK_FEATURE_IMPORTANCE } from '../data/mockData';
import { apiClient } from './apiClient';

export class AnalyticsService {
  /**
   * Retrieves analytics summary.
   * If live backend has GET /analytics endpoint, calls it; otherwise returns high-fidelity mock data.
   */
  public async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const preferLive = apiClient.getPreferLive();
    const baseUrl = apiClient.getBaseUrl();

    if (preferLive && baseUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${baseUrl}/analytics`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && data.trends && data.hourly_distribution) {
            return data;
          }
        }
      } catch (e) {
        console.info('Backend analytics endpoint not available; utilizing structured mock data.');
      }
    }

    // Default mock response
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_ANALYTICS), 80);
    });
  }

  public async getFeatureImportance(): Promise<FeatureImportanceItem[]> {
    return MOCK_FEATURE_IMPORTANCE;
  }
}

export const analyticsService = new AnalyticsService();
