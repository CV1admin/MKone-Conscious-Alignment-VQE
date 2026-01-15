
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { VQESimulator } from './services/vqeSimulator';
import { SimulationState, MKoneConfig } from './types';
import { CircuitVisualizer } from './components/CircuitVisualizer';
import { QuantumField } from './components/QuantumField';
import { Metrics } from './components/Metrics';

// Initialize Simulator Constants
const INITIAL_CONFIG: MKoneConfig = {
  numQubits: 3,
  learningRate: 0.1,
  targetConsciousness: 1.0,
  maxSteps: 200,
};

const App: React.FC = () => {
  const [config, setConfig] = useState<MKoneConfig>(INITIAL_CONFIG);
  const [state, setState] = useState<SimulationState>({
    step: 0,
    theta: Array(INITIAL_CONFIG.numQubits).fill(0),
    loss: 1.0,
    expectation: 0,
    isTraining: false,
    history: [],
  });
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const simulatorRef = useRef<VQESimulator | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize or re-initialize simulator when config changes
  const resetSimulation = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    simulatorRef.current = new VQESimulator(config.numQubits, config.learningRate, config.targetConsciousness);
    setState({
      step: 0,
      theta: simulatorRef.current.getParameters().theta,
      loss: 1.0,
      expectation: 0,
      isTraining: false,
      history: [],
    });
  }, [config]);

  useEffect(() => {
    resetSimulation();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetSimulation]);

  const toggleSimulation = () => {
    if (state.isTraining) {
      if (timerRef.current) clearInterval(timerRef.current);
      setState(prev => ({ ...prev, isTraining: false }));
    } else {
      setState(prev => ({ ...prev, isTraining: true }));
      timerRef.current = window.setInterval(() => {
        if (!simulatorRef.current) return;
        
        const update = simulatorRef.current.stepOptimization();
        setState(prev => {
          if (update.step >= config.maxSteps || update.loss < 1e-10) {
            if (timerRef.current) clearInterval(timerRef.current);
            return {
              ...prev,
              ...update,
              isTraining: false,
              history: [...prev.history, { step: update.step, loss: update.loss, expectation: update.expectation }]
            };
          }
          return {
            ...prev,
            ...update,
            history: [...prev.history, { step: update.step, loss: update.loss, expectation: update.expectation }]
          };
        });
      }, 50);
    }
  };

  const getAiInterpretation = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this MKone Quantum Consciousness Alignment result:
          - Steps Taken: ${state.step}
          - Final Loss: ${state.loss}
          - Target Phi: ${config.targetConsciousness}
          - Parameter stabilization (theta): ${state.theta.join(', ')}
          Explain the significance of this ψ(θ) stabilization in the context of lattice coherence and vireax detection in 3 short, punchy, scientific paragraphs.`,
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      setAiInsight(response.text || "No insights available.");
    } catch (e) {
      setAiInsight("Failed to connect to the MKone Neural Overlay. Ensure API configuration is valid.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-quantum flex flex-col p-4 md:p-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <span className="bg-cyan-500 w-8 h-8 rounded flex items-center justify-center text-black text-xs">MK</span>
            MKone <span className="text-zinc-500 font-light">Conscious Alignment</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1 mono uppercase tracking-widest flex items-center gap-2">
            Variational Quantum Eigensolver <span className="w-1 h-1 bg-zinc-600 rounded-full"></span> Simulation Layer 2.5
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={resetSimulation}
            className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors text-xs mono uppercase font-bold"
          >
            Reset Field
          </button>
          <button
            onClick={toggleSimulation}
            className={`px-6 py-2 rounded-lg transition-all text-xs mono uppercase font-black shadow-lg shadow-cyan-500/10 ${
              state.isTraining 
                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40' 
                : 'bg-cyan-500 text-black border border-cyan-400 hover:scale-105'
            }`}
          >
            {state.isTraining ? 'Halt Process' : 'Engage VQE'}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        
        {/* Left Column: Controls and Code-like Status */}
        <div className="lg:col-span-3 space-y-6">
          <section className="bg-black/40 border border-white/5 p-5 rounded-xl">
            <h2 className="text-[10px] uppercase text-zinc-500 font-bold mb-4 mono tracking-tighter">System Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block mono">Dimensionality (Qubits)</label>
                <select 
                  value={config.numQubits}
                  onChange={(e) => setConfig({ ...config, numQubits: parseInt(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm mono outline-none focus:border-cyan-500"
                >
                  {[3, 4, 5, 8].map(n => <option key={n} value={n}>{n} Qubits</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block mono">Learning Rate (η)</label>
                <input 
                  type="range" min="0.01" max="0.5" step="0.01"
                  value={config.learningRate}
                  onChange={(e) => setConfig({ ...config, learningRate: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] mono text-zinc-600">
                  <span>Precision</span>
                  <span>{config.learningRate}</span>
                  <span>Speed</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block mono">Target Φ</label>
                <input 
                  type="number" step="0.1" max="1" min="-1"
                  value={config.targetConsciousness}
                  onChange={(e) => setConfig({ ...config, targetConsciousness: parseFloat(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm mono outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </section>

          <section className="bg-black/40 border border-white/5 p-5 rounded-xl overflow-hidden">
            <h2 className="text-[10px] uppercase text-zinc-500 font-bold mb-4 mono tracking-tighter">ψ(θ) Parameter Space</h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {state.theta.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 text-[10px] text-zinc-600 mono shrink-0">θ[{i}]</div>
                  <div className="flex-grow h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500/50 transition-all duration-300"
                      style={{ width: `${((t % (Math.PI * 2)) / (Math.PI * 2)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-[10px] text-cyan-500 mono text-right">{t.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Middle Column: Visualizations */}
        <div className="lg:col-span-5 space-y-6">
          <QuantumField theta={state.theta} loss={state.loss} />
          <CircuitVisualizer numQubits={config.numQubits} theta={state.theta} />
        </div>

        {/* Right Column: Analytics and AI Insights */}
        <div className="lg:col-span-4 space-y-6">
          <Metrics 
            history={state.history} 
            currentLoss={state.loss} 
            currentExpectation={state.expectation}
            target={config.targetConsciousness}
          />
          
          <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-xl flex flex-col h-full min-h-[300px] relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 mono">Lattice Interpretation</h3>
              <button 
                onClick={getAiInterpretation}
                disabled={isAiLoading || state.history.length < 10}
                className="text-[10px] mono bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded hover:bg-purple-600 hover:text-white transition-all disabled:opacity-30"
              >
                {isAiLoading ? 'Synthesizing...' : 'Request Insight'}
              </button>
            </div>
            
            <div className="flex-grow text-sm leading-relaxed text-zinc-400 overflow-y-auto pr-2 custom-scroll">
              {aiInsight ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  {aiInsight.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-800 rounded-lg">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full mb-4 flex items-center justify-center animate-pulse">
                    <span className="text-zinc-600 text-xl font-black">?</span>
                  </div>
                  <p className="text-xs text-zinc-600 mono">Awaiting sufficient data packets from the alignment process to initialize neural interpretation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 flex items-center justify-between px-4 bg-zinc-900 border border-zinc-800 rounded text-[10px] mono text-zinc-500">
        <div className="flex gap-6">
          <span className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${state.isTraining ? 'bg-cyan-500 animate-pulse' : 'bg-zinc-700'}`}></span>
            ENGINE: {state.isTraining ? 'ACTIVE' : 'IDLE'}
          </span>
          <span className="flex items-center gap-2">
            ITERATION: <span className="text-zinc-300">{state.step}</span>
          </span>
          <span className="flex items-center gap-2">
            CONVERGENCE: <span className="text-zinc-300">{(100 * (1 - state.loss)).toFixed(2)}%</span>
          </span>
        </div>
        <div className="hidden md:block">
          MKONE LATTICE COHERENCE // VQE SIMULATOR 2025 // STABILIZED: {state.loss < 0.001 ? 'TRUE' : 'FALSE'}
        </div>
      </footer>
    </div>
  );
};

export default App;
