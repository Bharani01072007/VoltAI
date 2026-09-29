/**
 * Type definitions for AI-Based Electricity Consumption Prediction System
 */

export type ConsumptionLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PredictionInput {
  temperature: number;          // Ambient temperature in Celsius (-10 to 50)
  humidity: number;             // Relative humidity percentage (10 to 100)
  hour: number;                 // Hour of day (0 to 23)
  day: number;                  // Day of month (1 to 31)
  month: number;                // Month of year (1 to 12)
  is_weekend: boolean;          // Whether the day is a weekend
  occupancy: number;            // Number of people present (1 to 20)
  previous_consumption: number; // Previous hour/day consumption in kWh (0.1 to 30.0)
  appliance_usage: number;      // Number of high-draw appliances running (0 to 15)
}

export interface PredictionProbabilities {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
}

export interface PredictionResponse {
  prediction: ConsumptionLevel;
  confidence: number;           // Value between 0 and 1 (e.g. 0.914)
  probabilities: PredictionProbabilities;
  model: string;                // e.g. "Random Forest Classifier"
  timestamp?: string;           // ISO string
  inference_time_ms?: number;   // Latency in milliseconds
}

export interface PredictionHistoryItem extends PredictionResponse {
  id: string;
  input: PredictionInput;
  timestamp: string;
}

export interface ModelMetrics {
  id: string;
  model_name: string;
  algorithm_family: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  latency_ms: number;
  training_time_sec: number;
  is_best: boolean;
  hyperparameters: Record<string, string | number>;
  notes: string;
}

export interface ConfusionMatrixData {
  labels: ConsumptionLevel[];
  matrix: number[][]; // [Actual][Predicted] - 3x3 rows
  total_samples: number;
}

export interface TrendDataPoint {
  timestamp: string;
  time_label: string;
  actual_kwh: number;
  predicted_kwh: number;
  level: ConsumptionLevel;
}

export interface HourlyDistributionPoint {
  hour: number;
  label: string;
  avg_kwh: number;
  level: ConsumptionLevel;
}

export interface DailyDistributionPoint {
  day_index: number;
  day_name: string;
  avg_kwh: number;
  is_weekend: boolean;
}

export interface MonthlyDistributionPoint {
  month_index: number;
  month_name: string;
  avg_kwh: number;
  season: 'Winter' | 'Spring' | 'Summer' | 'Autumn';
}

export interface FeatureImportanceItem {
  feature: string;
  label: string;
  importance: number; // 0 to 1 (sums to 1)
  description: string;
  category: 'Environmental' | 'Temporal' | 'Behavioral';
}

export interface AnalyticsSummary {
  trends: TrendDataPoint[];
  hourly_distribution: HourlyDistributionPoint[];
  daily_distribution: DailyDistributionPoint[];
  monthly_distribution: MonthlyDistributionPoint[];
  category_distribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    total: number;
    low_pct: number;
    medium_pct: number;
    high_pct: number;
  };
  feature_importance: FeatureImportanceItem[];
}

export interface PipelineStage {
  id: string;
  step_number: number;
  name: string;
  description: string;
  tools: string[];
  key_details: string[];
}

export type ActiveTab = 'dashboard' | 'predict' | 'analytics' | 'models' | 'about';
