import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, ArrowLeft, Settings, Cpu, Clock, Activity, List } from 'lucide-react';

const App = () => {
  // --- State Management ---
  const [view, setView] = useState('INPUT'); // INPUT, MENU, SIMULATION
  const [numFrames, setNumFrames] = useState(3);
  // Default string from Silberschatz Operating System Concepts
  const [refStrInput, setRefStrInput] = useState("7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1");
  const [refString, setRefString] = useState([]);
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  
  // Simulation Results
  const [simulationSteps, setSimulationSteps] = useState([]);
  const [metrics, setMetrics] = useState({ hits: 0, faults: 0, hitRatio: 0, faultRatio: 0 });

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  // --- Logic / Algorithms (Ported directly from C source) ---

  const parseInput = () => {
    // Regex splits by spaces, newlines, or tabs
    const arr = refStrInput.trim().split(/\s+/).map(Number).filter(n => !isNaN(n));
    if (arr.length === 0) return false;
    setRefString(arr);
    return true;
  };

  // 1. FIFO Algorithm
  const simulateFIFO = () => {
    const frames = numFrames;
    const ref = refString;
    const refLen = ref.length;
    
    let frameArr = Array(frames).fill(-1);
    let head = 0; // Points to the oldest page
    let faults = 0;
    let hits = 0;
    const steps = [];

    for (let i = 0; i < refLen; i++) {
      const page = ref[i];
      let found = false;
      
      // Check if page exists in frames
      for (let j = 0; j < frames; j++) {
        if (frameArr[j] === page) {
          found = true;
          break;
        }
      }

      let result = "";
      if (found) {
        hits++;
        result = "HIT";
      } else {
        faults++;
        result = "FAULT";
        // Replace at head
        frameArr[head] = page;
        head = (head + 1) % frames;
      }
      
      steps.push({ page, frames: [...frameArr], result });
    }
    return { steps, faults, hits, refLen };
  };

  // 2. LRU Algorithm
  const simulateLRU = () => {
    const frames = numFrames;
    const ref = refString;
    const refLen = ref.length;

    let frameArr = Array(frames).fill(-1);
    let lastUsed = Array(frames).fill(-1);
    let time = 0;
    let faults = 0;
    let hits = 0;
    const steps = [];

    for (let i = 0; i < refLen; i++) {
      const page = ref[i];
      let found = false;
      time++;

      for (let j = 0; j < frames; j++) {
        if (frameArr[j] === page) {
          found = true;
          lastUsed[j] = time; // Update time on hit
          break;
        }
      }

      let result = "";
      if (found) {
        hits++;
        result = "HIT";
      } else {
        faults++;
        result = "FAULT";
        
        let replacedIndex = -1;
        // 1. Look for empty slot
        for (let j = 0; j < frames; j++) {
          if (frameArr[j] === -1) {
            replacedIndex = j;
            break;
          }
        }

        // 2. If no empty slot, find Least Recently Used
        if (replacedIndex === -1) {
          let minTime = Number.MAX_SAFE_INTEGER;
          for (let j = 0; j < frames; j++) {
            if (lastUsed[j] < minTime) {
              minTime = lastUsed[j];
              replacedIndex = j;
            }
          }
        }

        frameArr[replacedIndex] = page;
        lastUsed[replacedIndex] = time;
      }
      steps.push({ page, frames: [...frameArr], result });
    }
    return { steps, faults, hits, refLen };
  };

  // 3. Optimal Algorithm
  const simulateOptimal = () => {
    const frames = numFrames;
    const ref = refString;
    const refLen = ref.length;

    let frameArr = Array(frames).fill(-1);
    let faults = 0;
    let hits = 0;
    const steps = [];

    for (let i = 0; i < refLen; i++) {
      const page = ref[i];
      let found = false;

      for (let j = 0; j < frames; j++) {
        if (frameArr[j] === page) {
          found = true;
          break;
        }
      }

      let result = "";
      if (found) {
        hits++;
        result = "HIT";
      } else {
        faults++;
        result = "FAULT";

        let replaceIndex = -1;
        // 1. Check for empty slot
        for (let j = 0; j < frames; j++) {
          if (frameArr[j] === -1) {
            replaceIndex = j;
            break;
          }
        }

        // 2. Look ahead to find the page used furthest in future
        if (replaceIndex === -1) {
          let farthestNext = -1;
          let farIndex = 0;

          for (let j = 0; j < frames; j++) {
            let nextPos = Number.MAX_SAFE_INTEGER;
            // Search future
            for (let k = i + 1; k < refLen; k++) {
              if (ref[k] === frameArr[j]) {
                nextPos = k;
                break;
              }
            }

            // If never used again, this is the best candidate
            if (nextPos === Number.MAX_SAFE_INTEGER) {
              farIndex = j;
              farthestNext = nextPos;
              break; 
            } else if (nextPos > farthestNext) {
              farthestNext = nextPos;
              farIndex = j;
            }
          }
          replaceIndex = farIndex;
        }

        frameArr[replaceIndex] = page;
      }
      steps.push({ page, frames: [...frameArr], result });
    }
    return { steps, faults, hits, refLen };
  };

  // 4. Clock (Second Chance) Algorithm
  const simulateClock = () => {
    const frames = numFrames;
    const ref = refString;
    const refLen = ref.length;

    let frameArr = Array(frames).fill(-1);
    let refBit = Array(frames).fill(0); // 0 or 1
    let pointer = 0; // Circular pointer
    let faults = 0;
    let hits = 0;
    const steps = [];

    for (let i = 0; i < refLen; i++) {
      const page = ref[i];
      let found = false;

      // Check existence
      for (let j = 0; j < frames; j++) {
        if (frameArr[j] === page) {
          found = true;
          refBit[j] = 1; // Give second chance
          break;
        }
      }

      let result = "";
      if (found) {
        hits++;
        result = "HIT";
      } else {
        faults++;
        result = "FAULT";

        let placed = false;
        // 1. Fill empty slots first (common optimization, matches C code)
        for (let j = 0; j < frames; j++) {
          if (frameArr[j] === -1) {
            frameArr[j] = page;
            refBit[j] = 1;
            placed = true;
            break;
          }
        }

        // 2. If no empty slots, use Clock logic
        if (!placed) {
          while (true) {
            if (refBit[pointer] === 0) {
              // Replace victim
              frameArr[pointer] = page;
              refBit[pointer] = 1;
              pointer = (pointer + 1) % frames;
              break;
            } else {
              // Consume second chance
              refBit[pointer] = 0;
              pointer = (pointer + 1) % frames;
            }
          }
        }
      }
      steps.push({ page, frames: [...frameArr], result });
    }
    return { steps, faults, hits, refLen };
  };

  // --- UI Handlers ---

  const handleInputSubmit = (e) => {
    e.preventDefault();

    // Validate numFrames
    if (numFrames === '' || isNaN(numFrames) || numFrames < 1 || numFrames > 100) {
      alert("Please enter a valid number of frames (1-100).");
      return;
    }

    if (parseInput()) {
      setView('MENU');
    } else {
      // Basic alert fallback, though input type=number prevents most bad inputs
      alert("Please enter a valid reference string.");
    }
  };

  const runSimulation = (algo) => {
    setSelectedAlgo(algo);
    let res;
    switch(algo) {
      case 'FIFO': res = simulateFIFO(); break;
      case 'LRU': res = simulateLRU(); break;
      case 'OPTIMAL': res = simulateOptimal(); break;
      case 'CLOCK': res = simulateClock(); break;
      default: return;
    }
    
    setSimulationSteps(res.steps);
    setMetrics({
      hits: res.hits,
      faults: res.faults,
      hitRatio: (res.hits / res.refLen) * 100,
      faultRatio: (res.faults / res.refLen) * 100
    });
    setView('SIMULATION');
  };

  const reset = () => {
    setView('INPUT');
    // Note: We keep refStrInput (the text) but clear refString (the array)
    setRefString([]);
    setSelectedAlgo(null);
  };

  const goBackToMenu = () => {
    setView('MENU');
    setSelectedAlgo(null);
  };

  // --- Render Components ---

  const renderInputScreen = () => (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5" /> Configuration
        </h2>
      </div>
      <div className="p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Frames (1-100)</label>
          <input 
            type="number" 
            min="1" 
            max="100"
            value={numFrames}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                setNumFrames('');
              } else {
                const parsed = parseInt(val);
                if (!isNaN(parsed)) setNumFrames(parsed);
              }
            }}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Reference String (Space separated integers)</label>
          <textarea 
            value={refStrInput}
            onChange={(e) => setRefStrInput(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition h-32 font-mono text-sm"
            placeholder="e.g. 7 0 1 2 0 3 0 4 2 3"
          />
          <p className="text-xs text-slate-500 mt-2">Enter numbers separated by spaces.</p>
        </div>

        <button 
          onClick={handleInputSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          Initialize Simulator <Play className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderMenuScreen = () => (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 mb-6">
        <div className="bg-slate-900 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5" /> Select Algorithm
          </h2>
          <button onClick={reset} className="text-xs text-slate-300 hover:text-white underline">Change Inputs</button>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => runSimulation('FIFO')} className="p-6 border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition text-left group">
            <div className="font-bold text-lg text-slate-800 group-hover:text-blue-700 flex items-center gap-2">
              <List className="w-5 h-5" /> FIFO
            </div>
            <p className="text-sm text-slate-500 mt-1">First-In First-Out replacement.</p>
          </button>

          <button onClick={() => runSimulation('LRU')} className="p-6 border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition text-left group">
            <div className="font-bold text-lg text-slate-800 group-hover:text-blue-700 flex items-center gap-2">
              <Clock className="w-5 h-5" /> LRU
            </div>
            <p className="text-sm text-slate-500 mt-1">Least Recently Used replacement.</p>
          </button>

          <button onClick={() => runSimulation('OPTIMAL')} className="p-6 border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition text-left group">
            <div className="font-bold text-lg text-slate-800 group-hover:text-blue-700 flex items-center gap-2">
              <Activity className="w-5 h-5" /> Optimal
            </div>
            <p className="text-sm text-slate-500 mt-1">Belady's Algorithm (Look ahead).</p>
          </button>

          <button onClick={() => runSimulation('CLOCK')} className="p-6 border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition text-left group">
            <div className="font-bold text-lg text-slate-800 group-hover:text-blue-700 flex items-center gap-2">
              <RotateCcw className="w-5 h-5" /> Clock
            </div>
            <p className="text-sm text-slate-500 mt-1">Second-Chance Algorithm.</p>
          </button>
        </div>
      </div>
      
      <div className="bg-slate-100 p-4 rounded-lg text-sm text-slate-600 font-mono border border-slate-200">
        <span className="font-bold">Current Config:</span> {numFrames} Frames | Length: {refString.length}
      </div>
    </div>
  );

  const renderSimulationScreen = () => (
    <div className="w-full max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={goBackToMenu}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </button>
        <div className="text-xl font-bold text-slate-800 flex items-center gap-2">
          Algorithm: <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{selectedAlgo}</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Total Hits</div>
          <div className="text-4xl font-extrabold text-green-600">{metrics.hits}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Total Faults</div>
          <div className="text-4xl font-extrabold text-red-600">{metrics.faults}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Hit Ratio</div>
          <div className="text-4xl font-extrabold text-green-600">{metrics.hitRatio.toFixed(1)}%</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Fault Ratio</div>
          <div className="text-4xl font-extrabold text-red-600">{metrics.faultRatio.toFixed(1)}%</div>
        </div>
      </div>

      {/* Visualization Table */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-6 py-4 font-mono font-semibold">Step</th>
                <th className="px-6 py-4 font-mono font-semibold">Page Req</th>
                {Array.from({length: numFrames}).map((_, i) => (
                  <th key={i} className="px-6 py-4 font-mono font-semibold">Frame {i + 1}</th>
                ))}
                <th className="px-6 py-4 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {simulationSteps.map((step, idx) => (
                <tr key={idx} className={`transition-colors hover:bg-opacity-80 ${step.result === 'FAULT' ? 'bg-red-50' : 'bg-green-50'}`}>
                  <td className="px-6 py-3 text-slate-500 font-mono">{idx + 1}</td>
                  <td className="px-6 py-3 font-bold font-mono text-slate-800">{step.page}</td>
                  {step.frames.map((val, fIdx) => (
                    <td key={fIdx} className="px-6 py-3 font-mono text-slate-700">
                      {val === -1 ? (
                        <span className="text-slate-300">-</span>
                      ) : (
                        <span className={val === step.page ? "font-bold text-slate-900" : ""}>{val}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-3 text-right font-bold">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs tracking-wide ${
                      step.result === 'HIT' 
                        ? 'bg-green-200 text-green-900' 
                        : 'bg-red-200 text-red-900'
                    }`}>
                      {step.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans text-slate-900">
      <div className="mb-10 text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Page Replacement <span className="text-blue-600">Simulator</span>
        </h1>
        <p className="text-lg text-slate-500">
          Visualize and compare FIFO, LRU, Optimal, and Clock algorithms efficiently.
        </p>
      </div>

      {view === 'INPUT' && renderInputScreen()}
      {view === 'MENU' && renderMenuScreen()}
      {view === 'SIMULATION' && renderSimulationScreen()}
    </div>
  );
};

export default App;