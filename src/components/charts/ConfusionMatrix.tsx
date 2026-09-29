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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">Confusion Matrix</h3>
            <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">[{modelName}]</span>
          </div>
          <p className="text-xs text-slate-500">
            Actual vs Predicted class distribution ({data.total_samples.toLocaleString()} test evaluations)
          </p>
        </div>

        {/* Toggle Normalized vs Count */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setShowNormalized(false)}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              !showNormalized
                ? 'bg-white text-cyan-700 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Raw Counts
          </button>
          <button
            onClick={() => setShowNormalized(true)}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              showNormalized
                ? 'bg-white text-cyan-700 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
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
          <div className="text-center text-xs font-mono font-bold text-cyan-700 uppercase tracking-wider mb-2">
            Predicted Class
          </div>

          <div className="flex">
            {/* Left Axis Label: Actual Class */}
            <div className="flex items-center justify-center -rotate-90 text-xs font-mono font-bold text-purple-700 uppercase tracking-wider w-8">
              Actual Class
            </div>

            {/* Matrix Grid */}
            <div className="flex-1">
              {/* Column Header */}
              <div className="grid grid-cols-4 gap-2 mb-2 text-center text-xs font-mono text-slate-500">
                <div /> {/* blank corner */}
                {labels.map((colLabel) => (
                  <div key={colLabel} className="font-bold text-slate-700">
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
                    <div className="text-right text-xs font-mono font-bold text-slate-700 pr-2">
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
                          className={`relative flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all duration-150 shadow-2xs ${
                            isDiagonal
                              ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100'
                              : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                          }`}
                          style={{
                            backgroundColor: isDiagonal
                              ? `rgba(16, 185, 129, ${0.1 + intensity * 0.25})`
                              : `rgba(244, 63, 94, ${intensity * 0.12})`,
                          }}
                        >
                          <span
                            className={`text-sm font-bold font-mono tabular-nums ${
                              isDiagonal ? 'text-emerald-800' : 'text-slate-800'
                            }`}
                          >
                            {showNormalized ? `${pctOfRow}%` : count.toLocaleString()}
                          </span>

                          <span className="text-[10px] text-slate-500 font-mono mt-0.5 font-medium">
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
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <div className="text-slate-600">
          {hoveredCell ? (
            <span className="font-mono text-cyan-800 font-medium">
              Actual <strong className="text-purple-800">{hoveredCell.actual}</strong> → Predicted{' '}
              <strong className="text-cyan-800">{hoveredCell.predicted}</strong>:{' '}
              {hoveredCell.count.toLocaleString()} cases ({hoveredCell.pct}% of actual class)
              {hoveredCell.actual === hoveredCell.predicted ? ' (Correct TP)' : ' (Misclassified)'}
            </span>
          ) : (
            <span>Hover any cell to inspect true positives and misclassification margins</span>
          )}
        </div>

        <div className="font-mono text-emerald-700 font-bold mt-1 sm:mt-0">
          Accuracy: {matrixAccuracy}%
        </div>
      </div>
    </div>
  );
};

