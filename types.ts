
export interface SimulationState {
  step: number;
  theta: number[];
  loss: number;
  expectation: number;
  isTraining: boolean;
  history: Array<{
    step: number;
    loss: number;
    expectation: number;
  }>;
}

export interface QubitState {
  id: number;
  angle: number;
  phase: number;
}

export interface MKoneConfig {
  numQubits: number;
  learningRate: number;
  targetConsciousness: number;
  maxSteps: number;
}
