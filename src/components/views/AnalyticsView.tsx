import React, { useState, useEffect } from 'react';
import { TrendLineChart } from '../charts/TrendLineChart';
import { HourlyBarChart } from '../charts/HourlyBarChart';
import { DailyBarChart } from '../charts/DailyBarChart';
import { MonthlyLineChart } from '../charts/MonthlyLineChart';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { FeatureImportanceChart } from '../charts/FeatureImportanceChart';
import { analyticsService } from '../../services/analyticsService';
import { AnalyticsSummary } from '../../types';
import { Loader2, RefreshCw } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getAnalyticsSummary();
      setAnalytics(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="flex h-96 items-center justify-center space-x-2 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        <span className="text-sm font-mono">Loading energy analytics telemetry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            Analytics & Load Diagnostics
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Temporal patterns, diurnal load variations, category breakdown, and feature influence
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Chart 1: Electricity consumption trend chart */}
      <div className="grid grid-cols-1 gap-6">
        <TrendLineChart
          data={analytics.trends}
          title="1. Electricity Consumption Trend (24h Load vs Prediction)"
          subtitle="Real-time measured smart meter load against trained model inference (kWh)"
        />
      </div>

      {/* Chart 2 & 3: Hourly and Daily Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Hourly consumption chart */}
        <HourlyBarChart
          data={analytics.hourly_distribution}
          title="2. Hourly Diurnal Consumption Curve"
          subtitle="Hourly average kilowatt-hours (kWh) illustrating morning and evening spikes"
        />

        {/* Chart 3: Daily consumption chart */}
        <DailyBarChart
          data={analytics.daily_distribution}
          title="3. Daily Consumption Profile (Monday – Sunday)"
        />
      </div>

      {/* Chart 4 & 5: Monthly Seasonality and Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 4: Monthly consumption chart */}
        <MonthlyLineChart
          data={analytics.monthly_distribution}
          title="4. Monthly Consumption Seasonality"
        />

        {/* Chart 5: Consumption category distribution */}
        <CategoryDonutChart
          distribution={analytics.category_distribution}
          title="5. Consumption Category Distribution"
        />
      </div>

      {/* Chart 6: Feature importance chart */}
      <div className="grid grid-cols-1 gap-6">
        <FeatureImportanceChart
          data={analytics.feature_importance}
          title="6. Feature Importance Ranking"
          subtitle="Gini impurity reduction across all decision tree nodes in the ensemble"
        />
      </div>
    </div>
  );
};
