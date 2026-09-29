import React from 'react';
import { MetricCard } from '../ui/MetricCard';
import { TrendLineChart } from '../charts/TrendLineChart';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { ConsumptionBadge } from '../ui/Badge';
import { INITIAL_SUMMARY_METRICS, MOCK_ANALYTICS, MOCK_RECENT_PREDICTIONS } from '../../data/mockData';
import { ActiveTab, PredictionResponse, PredictionInput } from '../../types';
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Gauge,
  Sparkles,
  Zap,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
  latestPrediction: (PredictionResponse & { input: PredictionInput }) | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  latestPrediction,
}) => {
  // Use real latest prediction if user has run one in this session, otherwise default mock metric
  const currentPredLevel = latestPrediction ? latestPrediction.prediction : INITIAL_SUMMARY_METRICS.currentPrediction.level;
  const currentConfidence = latestPrediction
    ? `${(latestPrediction.confidence * 100).toFixed(1)}%`
    : `${(INITIAL_SUMMARY_METRICS.currentPrediction.confidence * 100).toFixed(1)}%`;
  const currentTimestamp = latestPrediction?.timestamp
    ? new Date(latestPrediction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '21:00 UTC';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
            Electricity Consumption Prediction
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            AI-powered classification of electricity consumption levels
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('predict')}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-500 transition-all cursor-pointer"
          >
            <Zap className="h-4 w-4" />
            <span>New Prediction</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Prediction */}
        <MetricCard
          title="Current Prediction"
          value={currentPredLevel}
          badge={<ConsumptionBadge level={currentPredLevel} size="sm" />}
          subtitle={`Confidence: ${currentConfidence} · ${currentTimestamp}`}
          icon={Zap}
          accentColor={
            currentPredLevel === 'HIGH'
              ? 'amber'
              : currentPredLevel === 'LOW'
              ? 'emerald'
              : 'cyan'
          }
        />

        {/* Card 2: Model Accuracy */}
        <MetricCard
          title="Model Accuracy"
          value={`${(INITIAL_SUMMARY_METRICS.modelAccuracy.value * 100).toFixed(1)}%`}
          subtitle="Test Set Evaluation (Stratified Split)"
          trend={{
            value: '+1.8%',
            isPositive: true,
            label: 'vs baseline',
          }}
          icon={Gauge}
          accentColor="emerald"
        />

        {/* Card 3: Total Predictions */}
        <MetricCard
          title="Total Predictions"
          value={INITIAL_SUMMARY_METRICS.totalPredictions.count.toLocaleString()}
          subtitle="Inference events recorded"
          trend={{
            value: INITIAL_SUMMARY_METRICS.totalPredictions.growthLast30d,
            isPositive: true,
            label: '30d volume',
          }}
          icon={Activity}
          accentColor="blue"
        />

        {/* Card 4: Best Model */}
        <MetricCard
          title="Best Model"
          value="Random Forest"
          subtitle={`Top Macro F1: ${(INITIAL_SUMMARY_METRICS.bestModel.f1Score * 100).toFixed(1)}%`}
          badge={
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700 border border-emerald-200">
              Benchmark Winner
            </span>
          }
          icon={BrainCircuit}
          accentColor="purple"
        />
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Over Time (2 cols on large screen) */}
        <div className="lg:col-span-2">
          <TrendLineChart
            data={MOCK_ANALYTICS.trends}
            title="Electricity Consumption Trends (24-Hour Profile)"
            subtitle="Diurnal power load telemetry: Actual measured vs Machine Learning prediction (kWh)"
          />
        </div>

        {/* Category Breakdown (1 col on large screen) */}
        <div className="lg:col-span-1">
          <CategoryDonutChart
            distribution={MOCK_ANALYTICS.category_distribution}
            title="Consumption Level Distribution"
          />
        </div>
      </div>

      {/* Recent Predictions Ledger */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Recent Model Inferences</h3>
            <p className="text-xs text-slate-500">Recently evaluated scenario predictions and confidence metrics</p>
          </div>
          <button
            onClick={() => onNavigate('predict')}
            className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Run Custom Test</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                <th className="py-2.5 px-3 font-semibold">Inference ID</th>
                <th className="py-2.5 px-3 font-semibold">Class Level</th>
                <th className="py-2.5 px-3 font-semibold text-right">Confidence</th>
                <th className="py-2.5 px-3 font-semibold text-right">Ambient Temp</th>
                <th className="py-2.5 px-3 font-semibold text-right">Occupancy</th>
                <th className="py-2.5 px-3 font-semibold text-right">Appliance Units</th>
                <th className="py-2.5 px-3 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {MOCK_RECENT_PREDICTIONS.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-cyan-700 font-medium">{row.id}</td>
                  <td className="py-3 px-3">
                    <ConsumptionBadge level={row.prediction} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums font-semibold">
                    {(row.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-600">
                    {row.input.temperature}°C
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-600">
                    {row.input.occupancy}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-600">
                    {row.input.appliance_usage}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-400">
                    {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
