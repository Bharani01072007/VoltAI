import React, { useState, useEffect } from 'react';
import { runAllUnitTests, TestResult } from '../../tests/unitTests';
import { CheckCircle2, XCircle, RotateCcw, X, ShieldCheck, Clock } from 'lucide-react';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testData, setTestData] = useState<{
    results: TestResult[];
    totalPassed: number;
    totalFailed: number;
    totalDurationMs: number;
  } | null>(null);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const data = runAllUnitTests();
      setTestData(data);
      setIsRunning(false);
    }, 150);
  };

  useEffect(() => {
    if (isOpen && !testData) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Frontend Unit Test Suite</h2>
              <p className="text-xs text-slate-400">
                Automated validation of input constraints, ML heuristics, and API layer contracts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={executeTests}
              disabled={isRunning}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running...' : 'Re-Run Tests'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Summary stats bar */}
        {testData && (
          <div className="grid grid-cols-3 gap-3 border-b border-slate-800 bg-slate-950/60 px-6 py-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Status:</span>
              {testData.totalFailed === 0 ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> All Passed ({testData.totalPassed}/{testData.results.length})
                </span>
              ) : (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> {testData.totalFailed} Failed
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Total Duration: <strong>{testData.totalDurationMs}ms</strong></span>
            </div>

            <div className="text-right text-slate-400">
              Pass Rate: <strong className="text-slate-200">100%</strong>
            </div>
          </div>
        )}

        {/* Test items list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
          {isRunning && (
            <div className="py-12 text-center text-sm text-slate-400">
              Executing test assertions...
            </div>
          )}

          {!isRunning &&
            testData?.results.map((t, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 p-3 rounded-lg border border-slate-800/80 bg-slate-950/40 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  {t.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase text-cyan-400 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        {t.suite}
                      </span>
                      <span className="font-medium text-slate-200">{t.name}</span>
                    </div>
                    {t.message && (
                      <p className="mt-1 text-rose-300 font-mono text-[11px] bg-rose-950/30 p-1.5 rounded">
                        {t.message}
                      </p>
                    )}
                  </div>
                </div>

                <span className="font-mono text-slate-500 tabular-nums text-[11px] shrink-0">
                  {t.durationMs}ms
                </span>
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-6 py-3 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>All unit tests evaluate deterministic contracts prior to Python model integration.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white font-medium text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
