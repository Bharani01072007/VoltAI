/**
 * VoltAI - Electricity Consumption Prediction System
 * AI-powered classification of electricity consumption levels (LOW / MEDIUM / HIGH)
 */

import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/views/DashboardView';
import { PredictView } from './components/views/PredictView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ModelPerformanceView } from './components/views/ModelPerformanceView';
import { AboutProjectView } from './components/views/AboutProjectView';
import { BackendConfigModal } from './components/modals/BackendConfigModal';
import { TestRunnerModal } from './components/modals/TestRunnerModal';
import { apiClient } from './services/apiClient';
import { ActiveTab, PredictionInput, PredictionResponse } from './types';
import { Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [latestPrediction, setLatestPrediction] = useState<
    (PredictionResponse & { input: PredictionInput }) | null
  >(null);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(apiClient.getPreferLive());
  const [configModalOpen, setConfigModalOpen] = useState<boolean>(false);
  const [testRunnerModalOpen, setTestRunnerModalOpen] = useState<boolean>(false);

  const handlePredictionComplete = (result: PredictionResponse, input: PredictionInput) => {
    setLatestPrediction({ ...result, input });
  };

  const handleConfigChange = () => {
    setIsLiveApi(apiClient.getPreferLive());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-800">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isLiveApi={isLiveApi}
        onOpenConfig={() => setConfigModalOpen(true)}
        onOpenTestRunner={() => setTestRunnerModalOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            latestPrediction={latestPrediction}
          />
        )}

        {activeTab === 'predict' && (
          <PredictView onPredictionComplete={handlePredictionComplete} />
        )}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'models' && <ModelPerformanceView />}

        {activeTab === 'about' && <AboutProjectView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-cyan-100 text-cyan-700">
              <Zap className="h-3 w-3" />
            </div>
            <span className="font-medium text-slate-700">
              VoltAI · Electricity Consumption Classification Platform
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
            <span>Classification Tiers: LOW · MEDIUM · HIGH</span>
            <span aria-hidden="true">·</span>
            <span>REST API Ready: POST /predict</span>
          </div>
        </div>
      </footer>

      {/* Backend Settings Dialog */}
      <BackendConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onConfigChange={handleConfigChange}
      />

      {/* Comprehensive In-App Unit Test Verification Runner */}
      <TestRunnerModal
        isOpen={testRunnerModalOpen}
        onClose={() => setTestRunnerModalOpen(false)}
      />
    </div>
  );
}
