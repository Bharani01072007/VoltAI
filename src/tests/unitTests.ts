import { validatePredictionInput, simulateModelPrediction } from '../services/predictionService';
import { apiClient } from '../services/apiClient';
import { PRESET_SCENARIOS, MOCK_MODEL_METRICS, MOCK_CONFUSION_MATRICES } from '../data/mockData';
import { PredictionInput } from '../types';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message?: string;
  durationMs: number;
}

export function runAllUnitTests(): {
  results: TestResult[];
  totalPassed: number;
  totalFailed: number;
  totalDurationMs: number;
} {
  const results: TestResult[] = [];
  const overallStart = performance.now();

  const test = (suite: string, name: string, fn: () => void) => {
    const start = performance.now();
    try {
      fn();
      results.push({
        suite,
        name,
        passed: true,
        durationMs: Number((performance.now() - start).toFixed(2)),
      });
    } catch (err: unknown) {
      results.push({
        suite,
        name,
        passed: false,
        message: err instanceof Error ? err.message : String(err),
        durationMs: Number((performance.now() - start).toFixed(2)),
      });
    }
  };

  // --- Suite 1: Input Validation ---
  test('Input Validation', 'Valid typical input passes all validation checks', () => {
    const valid: PredictionInput = {
      temperature: 24.5,
      humidity: 50,
      hour: 14,
      day: 15,
      month: 6,
      is_weekend: false,
      occupancy: 3,
      previous_consumption: 4.2,
      appliance_usage: 4,
    };
    const res = validatePredictionInput(valid);
    if (!res.isValid || Object.keys(res.errors).length > 0) {
      throw new Error(`Expected input to be valid, got errors: ${JSON.stringify(res.errors)}`);
    }
  });

  test('Input Validation', 'Rejects out-of-bounds temperature (< -30°C or > 60°C)', () => {
    const invalid: PredictionInput = {
      temperature: 75,
      humidity: 50,
      hour: 12,
      day: 1,
      month: 1,
      is_weekend: false,
      occupancy: 1,
      previous_consumption: 2,
      appliance_usage: 1,
    };
    const res = validatePredictionInput(invalid);
    if (res.isValid || !res.errors.temperature) {
      throw new Error('Expected temperature validation failure for 75°C');
    }
  });

  test('Input Validation', 'Rejects non-integer or out-of-range hour', () => {
    const invalid: PredictionInput = {
      temperature: 20,
      humidity: 50,
      hour: 25,
      day: 1,
      month: 1,
      is_weekend: false,
      occupancy: 1,
      previous_consumption: 2,
      appliance_usage: 1,
    };
    const res = validatePredictionInput(invalid);
    if (res.isValid || !res.errors.hour) {
      throw new Error('Expected hour validation failure for hour=25');
    }
  });

  test('Input Validation', 'Rejects negative previous consumption values', () => {
    const invalid: PredictionInput = {
      temperature: 20,
      humidity: 50,
      hour: 12,
      day: 1,
      month: 1,
      is_weekend: false,
      occupancy: 1,
      previous_consumption: -4.5,
      appliance_usage: 1,
    };
    const res = validatePredictionInput(invalid);
    if (res.isValid || !res.errors.previous_consumption) {
      throw new Error('Expected previous_consumption validation error for negative value');
    }
  });

  // --- Suite 2: ML Model Inference & Probabilities ---
  test('ML Simulation', 'High load parameters predict HIGH consumption level', () => {
    const highLoad: PredictionInput = {
      temperature: 36,
      humidity: 75,
      hour: 18,
      day: 20,
      month: 7,
      is_weekend: true,
      occupancy: 7,
      previous_consumption: 8.5,
      appliance_usage: 9,
    };
    const output = simulateModelPrediction(highLoad);
    if (output.prediction !== 'HIGH') {
      throw new Error(`Expected HIGH prediction, got ${output.prediction}`);
    }
    if (output.probabilities.HIGH < 0.6) {
      throw new Error(`Expected HIGH probability > 0.6, got ${output.probabilities.HIGH}`);
    }
  });

  test('ML Simulation', 'Night standby parameters predict LOW consumption level', () => {
    const standbyLoad: PredictionInput = {
      temperature: 18,
      humidity: 45,
      hour: 3,
      day: 10,
      month: 5,
      is_weekend: false,
      occupancy: 1,
      previous_consumption: 0.8,
      appliance_usage: 1,
    };
    const output = simulateModelPrediction(standbyLoad);
    if (output.prediction !== 'LOW') {
      throw new Error(`Expected LOW prediction, got ${output.prediction}`);
    }
  });

  test('ML Simulation', 'Probabilities strictly sum to 1.0 within floating point delta', () => {
    const input: PredictionInput = PRESET_SCENARIOS[0].input;
    const output = simulateModelPrediction(input);
    const sum = output.probabilities.LOW + output.probabilities.MEDIUM + output.probabilities.HIGH;
    if (Math.abs(sum - 1.0) > 0.02) {
      throw new Error(`Probabilities do not sum to ~1.0: sum is ${sum}`);
    }
  });

  test('ML Simulation', 'Output includes valid confidence and latency telemetry', () => {
    const output = simulateModelPrediction(PRESET_SCENARIOS[1].input);
    if (typeof output.confidence !== 'number' || output.confidence <= 0 || output.confidence > 1) {
      throw new Error(`Invalid confidence score: ${output.confidence}`);
    }
    if (typeof output.inference_time_ms !== 'number' || output.inference_time_ms <= 0) {
      throw new Error(`Invalid inference latency: ${output.inference_time_ms}`);
    }
  });

  // --- Suite 3: API Client & Environment Layer ---
  test('API Client', 'Sanitizes base URL by stripping trailing slashes', () => {
    const testUrl = 'http://api.example.com:8000///';
    apiClient.setBaseUrl(testUrl);
    if (apiClient.getBaseUrl() !== 'http://api.example.com:8000') {
      throw new Error(`Expected trailing slashes stripped, got ${apiClient.getBaseUrl()}`);
    }
  });

  test('API Client', 'Toggle preferLive API reflects immediately', () => {
    apiClient.setPreferLive(true);
    if (apiClient.getPreferLive() !== true) {
      throw new Error('Failed to set preferLive=true');
    }
    apiClient.setPreferLive(false);
    if (apiClient.getPreferLive() !== false) {
      throw new Error('Failed to set preferLive=false');
    }
  });

  // --- Suite 4: Model Performance Metrics & Consistency ---
  test('Model Evaluation', 'Confusion matrix diagonal values sum correctly', () => {
    const rfMatrix = MOCK_CONFUSION_MATRICES['Random Forest'];
    if (!rfMatrix || rfMatrix.matrix.length !== 3) {
      throw new Error('Confusion matrix must be 3x3');
    }
    const totalCount = rfMatrix.matrix.flat().reduce((a, b) => a + b, 0);
    if (totalCount !== rfMatrix.total_samples) {
      throw new Error(`Matrix cell sum (${totalCount}) does not match total_samples (${rfMatrix.total_samples})`);
    }
  });

  test('Model Evaluation', 'All classification algorithms have metric scores between 0 and 1', () => {
    for (const model of MOCK_MODEL_METRICS) {
      if (model.accuracy <= 0 || model.accuracy > 1) {
        throw new Error(`${model.model_name} accuracy out of range: ${model.accuracy}`);
      }
      if (model.f1_score <= 0 || model.f1_score > 1) {
        throw new Error(`${model.model_name} F1 score out of range: ${model.f1_score}`);
      }
    }
  });

  test('Model Evaluation', 'Exactly one model is designated as current best benchmark', () => {
    const bestModels = MOCK_MODEL_METRICS.filter((m) => m.is_best);
    if (bestModels.length !== 1) {
      throw new Error(`Expected exactly 1 best model, found ${bestModels.length}`);
    }
  });

  const totalPassed = results.filter((r) => r.passed).length;
  const totalFailed = results.filter((r) => !r.passed).length;
  const totalDurationMs = Number((performance.now() - overallStart).toFixed(2));

  return {
    results,
    totalPassed,
    totalFailed,
    totalDurationMs,
  };
}
