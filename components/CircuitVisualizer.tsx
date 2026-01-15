
import React from 'react';

interface CircuitVisualizerProps {
  numQubits: number;
  theta: number[];
}

export const CircuitVisualizer: React.FC<CircuitVisualizerProps> = ({ numQubits, theta }) => {
  const padding = 40;
  const lineSpacing = 40;
  const gateWidth = 50;
  const width = 450;
  const height = numQubits * lineSpacing + padding * 2;

  return (
    <div className="bg-black/40 rounded-xl border border-white/5 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 text-[10px] uppercase text-cyan-500/50 mono font-bold">ψ(θ) Architecture</div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
        {/* Horizontal Lines (Qubit Rails) */}
        {Array.from({ length: numQubits }).map((_, i) => (
          <React.Fragment key={`rail-${i}`}>
            <text x="10" y={padding + i * lineSpacing + 5} fill="#666" className="text-[10px] mono">q[{i}]</text>
            <line 
              x1="40" 
              y1={padding + i * lineSpacing} 
              x2={width - 40} 
              y2={padding + i * lineSpacing} 
              stroke="#333" 
              strokeWidth="1" 
            />
          </React.Fragment>
        ))}

        {/* Parametric Rotation Gates (Rx) */}
        {theta.map((val, i) => (
          <rect
            key={`gate-rx-${i}`}
            x={60}
            y={padding + i * lineSpacing - 15}
            width={gateWidth}
            height={30}
            fill="#083344"
            stroke="#06b6d4"
            strokeWidth="1"
            rx="4"
          />
        ))}
        {theta.map((val, i) => (
          <text
            key={`text-rx-${i}`}
            x={85}
            y={padding + i * lineSpacing + 4}
            fill="#06b6d4"
            textAnchor="middle"
            className="text-[10px] font-bold mono"
          >
            Rx(θ{i})
          </text>
        ))}

        {/* CNOT Entanglement Gates */}
        {Array.from({ length: numQubits - 1 }).map((_, i) => (
          <React.Fragment key={`cnot-${i}`}>
            {/* Control dot */}
            <circle
              cx={150 + i * 40}
              cy={padding + i * lineSpacing}
              r="4"
              fill="#a855f7"
            />
            {/* Vertical Line */}
            <line
              x1={150 + i * 40}
              y1={padding + i * lineSpacing}
              x2={150 + i * 40}
              y2={padding + (i + 1) * lineSpacing}
              stroke="#a855f7"
              strokeWidth="1"
            />
            {/* Target Cross */}
            <circle
              cx={150 + i * 40}
              cy={padding + (i + 1) * lineSpacing}
              r="6"
              fill="none"
              stroke="#a855f7"
              strokeWidth="1"
            />
            <line
              x1={150 + i * 40 - 4}
              y1={padding + (i + 1) * lineSpacing}
              x2={150 + i * 40 + 4}
              y2={padding + (i + 1) * lineSpacing}
              stroke="#a855f7"
              strokeWidth="1"
            />
            <line
              x1={150 + i * 40}
              y1={padding + (i + 1) * lineSpacing - 4}
              x2={150 + i * 40}
              y2={padding + (i + 1) * lineSpacing + 4}
              stroke="#a855f7"
              strokeWidth="1"
            />
          </React.Fragment>
        ))}

        {/* Measurement/Observable Zone */}
        <rect
          x={width - 100}
          y={padding - 20}
          width={60}
          height={height - padding}
          fill="rgba(6, 182, 212, 0.05)"
          strokeDasharray="4 4"
          stroke="#06b6d4"
          strokeWidth="1"
        />
        <text x={width - 70} y={padding + 5} fill="#06b6d4" textAnchor="middle" className="text-[10px] uppercase font-black mono">⟨Ô⟩</text>
      </svg>
    </div>
  );
};
