
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MetricsProps {
  history: Array<{ step: number; loss: number; expectation: number }>;
  currentLoss: number;
  currentExpectation: number;
  target: number;
}

export const Metrics: React.FC<MetricsProps> = ({ history, currentLoss, currentExpectation, target }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Loss Metric */}
      <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] text-zinc-500 uppercase mono font-bold">Alignment Loss L(θ)</span>
          <span className={`text-xs px-2 py-0.5 rounded border ${currentLoss < 0.01 ? 'border-emerald-500/30 text-emerald-500' : 'border-amber-500/30 text-amber-500'}`}>
            {currentLoss < 0.001 ? 'STABILIZED' : 'OPTIMIZING'}
          </span>
        </div>
        <div className="text-3xl font-light mono mb-4 tracking-tighter">
          {currentLoss.toFixed(8)}
        </div>
        <div className="flex-grow min-h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history.slice(-50)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#111" />
              <XAxis dataKey="step" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px' }}
                itemStyle={{ color: '#06b6d4' }}
              />
              <Line type="monotone" dataKey="loss" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expectation vs Target */}
      <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] text-zinc-500 uppercase mono font-bold">Expectation ⟨Ô⟩ vs Φ</span>
          <span className="text-xs text-purple-400 mono">Target: {target.toFixed(2)}</span>
        </div>
        <div className="text-3xl font-light mono mb-4 tracking-tighter">
          {currentExpectation.toFixed(4)}
        </div>
        <div className="flex-grow min-h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history.slice(-50)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#111" />
              <XAxis dataKey="step" hide />
              <YAxis hide domain={[-1.1, 1.1]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px' }}
                itemStyle={{ color: '#a855f7' }}
              />
              <Line type="monotone" dataKey="expectation" stroke="#a855f7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
