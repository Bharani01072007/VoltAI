/**
 * API Client configuration and connectivity manager
 */

export interface ApiConfig {
  baseUrl: string;
  timeoutMs: number;
  isLiveMode: boolean;
}

const STORAGE_KEY_BASE_URL = 'voltai_api_base_url';
const STORAGE_KEY_PREFER_LIVE = 'voltai_prefer_live_api';

class ApiClient {
  private baseUrl: string;
  private preferLive: boolean;

  constructor() {
    // Default from Vite environment or common local Python dev server
    const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
    const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_BASE_URL) : null;
    const storedPreferLive = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_PREFER_LIVE) : null;

    this.baseUrl = storedUrl || envUrl || 'http://localhost:8000';
    this.preferLive = storedPreferLive === 'true';
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url.trim().replace(/\/+$/, '');
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_BASE_URL, this.baseUrl);
    }
  }

  public getPreferLive(): boolean {
    return this.preferLive;
  }

  public setPreferLive(enabled: boolean): void {
    this.preferLive = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PREFER_LIVE, String(enabled));
    }
  }

  /**
   * Health ping to test if a Python ML server (FastAPI/Flask) is accessible
   */
  public async checkHealth(): Promise<{ isOnline: boolean; latencyMs: number; message: string }> {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      // Attempt /health, /api/health, or fallback to root /
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }).catch(async () => {
        // Fallback check to root
        return await fetch(`${this.baseUrl}/`, {
          method: 'GET',
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
      });

      clearTimeout(timeoutId);
      const latency = Math.round(performance.now() - start);

      if (response && response.ok) {
        return {
          isOnline: true,
          latencyMs: latency,
          message: `Backend responsive (${response.status} OK)`,
        };
      }

      return {
        isOnline: false,
        latencyMs: latency,
        message: `HTTP ${response?.status || 'Unknown error'}`,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Connection refused';
      return {
        isOnline: false,
        latencyMs: Math.round(performance.now() - start),
        message: errorMsg.includes('aborted') ? 'Connection timed out (>3.5s)' : 'Host unreachable (Offline/CORS)',
      };
    }
  }
}

export const apiClient = new ApiClient();
