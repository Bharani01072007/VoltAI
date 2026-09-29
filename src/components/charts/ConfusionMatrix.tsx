import React, { useState } from 'react';
import { ConfusionMatrixData, ConsumptionLevel } from '../../types';

interface ConfusionMatrixProps {
  data: ConfusionMatrixData;
  modelName: string;
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ data, modelName }) => {
  const [showNormalized, setShowNormalized] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    actual: ConsumptionLevel;
    predicted: ConsumptionLevel;
    count: number;
    pct: number;
  } | null>(null);

  const labels: ConsumptionLevel[] = data.labels;
  const matrix = data.matrix;

  // Row sums (actual count per class)
  const rowSums = matrix.map((row) => row.reduce((a, b) => a + b, 0));

  // Max count for cell color scaling
  const maxCellCount = Math.max(...matrix.flat());

  // Overall true positives (sum of diagonal)
  const truePositives = matrix.reduce((acc, row, i) => acc + row[i], 0);
  const matrixAccuracy = ((truePositives / data.total_samples) * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-200">Confusion Matrix</h3>
            <span className="text-xs font-mono text-cyan-400">[{modelName}]</span>
          </div>
          <p className="text-xs text-slate-400">
            Actual vs Predicted class distribution ({data.total_samples.toLocaleString()} test evaluations)
          </p>
        </div>

        {/* Toggle Normalized vs Count */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setShowNormalized(false)}
            className={`px-2.5 py-1 rounded transition-colors ${
              !showNormalized
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw Counts
          </button>
          <button
            onClick={() => setShowNormalized(true)}
            className={`px-2.5 py-1 rounded transition-colors ${
              showNormalized
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Normalized (%)
          </button>
        </div>
      </div>

      {/* Matrix Layout */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[420px]">
          {/* Top Axis Label: Predicted Class */}
          <div className="text-center text-xs font-mono font-medium text-cyan-400 uppercase tracking-wider mb-2">
            Predicted Class
          </div>

          <div className="flex">
            {/* Left Axis Label: Actual Class */}
            <div className="flex items-center justify-center -rotate-90 text-xs font-mono font-medium text-purple-400 uppercase tracking-wider w-8">
              Actual Class
            </div>

            {/* Matrix Grid */}
            <div className="flex-1">
              {/* Column Header */}
              <div className="grid grid-cols-4 gap-2 mb-2 text-center text-xs font-mono text-slate-400">
                <div /> {/* blank corner */}
                {labels.map((colLabel) => (
                  <div key={colLabel} className="font-semibold text-slate-300">
                    {colLabel}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {matrix.map((row, actualIdx) => {
                const actualLabel = labels[actualIdx];
                const rowTotal = rowSums[actualIdx];

                return (
                  <div key={actualLabel} className="grid grid-cols-4 gap-2 mb-2 items-center">
                    {/* Row Label */}
                    <div className="text-right text-xs font-mono font-semibold text-slate-300 pr-2">
                      {actualLabel}
                    </div>

                    {/* 3 Cells */}
                    {row.map((count, predIdx) => {
                      const predLabel = labels[predIdx];
                      const isDiagonal = actualIdx === predIdx;
                      const pctOfRow = ((count / rowTotal) * 100).toFixed(1);
                      const intensity = count / maxCellCount;

                      return (
                        <div
                          key={`${actualLabel}-${predLabel}`}
                          onMouseEnter={() =>
                            setHoveredCell({
                              actual: actualLabel,
                              predicted: predLabel,
                              count,
                              pct: Number(pctOfRow),
                            })
                          }
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`relative flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                            isDiagonal
                              ? 'border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25'
                              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/40'
                          }`}
                          style={{
                            backgroundColor: isDiagonal
                              ? `rgba(16, 185, 129, ${0.12 + intensity * 0.28})`
                              : `rgba(244, 63, 94, ${intensity * 0.15})`,
                          }}
                        >
                          <span
                            className={`text-sm font-bold font-mono tabular-nums ${
                              isDiagonal ? 'text-emerald-300' : 'text-slate-300'
                            }`}
                          >
                            {showNormalized ? `${pctOfRow}%` : count.toLocaleString()}
                          </span>

                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {showNormalized ? `${count} samples` : `${pctOfRow}% row`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Hover inspection banner */}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-800/60 pt-3 text-xs">
        <div className="text-slate-400">
          {hoveredCell ? (
            <span className="font-mono text-cyan-300">
              Actual <strong className="text-purple-300">{hoveredCell.actual}</strong> → Predicted{' '}
              <strong className="text-cyan-300">{hoveredCell.predicted}</strong>:{' '}
              {hoveredCell.count.toLocaleString()} cases ({hoveredCell.pct}% of actual class)
              {hoveredCell.actual === hoveredCell.predicted ? ' (Correct TP)' : ' (Misclassified)'}
            </span>
          ) : (
            <span>Hover any cell to inspect true positives and misclassification margins</span>
          )}
        </div>

        <div className="font-mono text-emerald-400 font-semibold mt-1 sm:mt-0">
          Accuracy: {matrixAccuracy}%
        </div>
      </div>
    </div>
  );
};
