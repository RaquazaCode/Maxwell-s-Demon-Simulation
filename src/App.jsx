import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_CONFIG = {
  particleCount: 260,
  gateOpenDuration: 0.18,
  thresholdMethod: "mean",
  demonAccuracy: 1,
  memorySize: 24,
  speedMultiplier: 1,
  demonEnabled: true,
};

const PRESETS = {
  Equilibrium: {
    demonEnabled: false,
    speedMultiplier: 1,
    gateOpenDuration: 0.18,
    thresholdMethod: "mean",
    demonAccuracy: 1,
    memorySize: 24,
  },
  "Maxwell Mode": {
    demonEnabled: true,
    speedMultiplier: 1,
    gateOpenDuration: 0.18,
    thresholdMethod: "mean",
    demonAccuracy: 1,
    memorySize: 24,
  },
  "Noisy Demon": {
    demonEnabled: true,
    speedMultiplier: 1,
    gateOpenDuration: 0.18,
    thresholdMethod: "median",
    demonAccuracy: 0.7,
    memorySize: 16,
  },
};

const LAYOUT = {
  padding: 22,
  wallThickness: 6,
  gateHeight: 72,
};

const sampleGaussian = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

const createParticles = (count, width, height) => {
  const mid = width / 2;
  const padding = LAYOUT.padding;
  const particles = [];

  for (let i = 0; i < count; i += 1) {
    const inLeft = i % 2 === 0;
    const xMin = inLeft ? padding : mid + LAYOUT.wallThickness / 2 + padding;
    const xMax = inLeft ? mid - LAYOUT.wallThickness / 2 - padding : width - padding;
    const yMin = padding;
    const yMax = height - padding;

    const speedScale = 38 + Math.random() * 18;
    const vx = sampleGaussian() * speedScale;
    const vy = sampleGaussian() * speedScale;

    particles.push({
      x: xMin + Math.random() * (xMax - xMin),
      y: yMin + Math.random() * (yMax - yMin),
      vx,
      vy,
    });
  }

  return particles;
};

const computeMedian = (values) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const midIndex = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[midIndex - 1] + sorted[midIndex]) / 2;
  }
  return sorted[midIndex];
};

const formatNumber = (value) => value.toFixed(2);

const Sparkline = ({ data, color }) => {
  const width = 160;
  const height = 44;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 0.0001);

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="sparkline">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
};

export default function App() {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const timeRef = useRef(0);
  const gateOpenRef = useRef(0);
  const memoryRef = useRef(0);
  const erasePulseRef = useRef(0);
  const lastSampleRef = useRef(0);

  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [running, setRunning] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [stats, setStats] = useState({
    leftTemp: 0,
    rightTemp: 0,
    threshold: 0,
    entropyProxy: 0,
    eraseCount: 0,
  });
  const [memoryLevel, setMemoryLevel] = useState(0);
  const [sparkData, setSparkData] = useState({
    tempDelta: Array(40).fill(0),
    entropy: Array(40).fill(0),
  });

  const simulationRef = useRef({
    particles: [],
    width: 900,
    height: 520,
  });

  const initSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;

    simulationRef.current.width = rect.width;
    simulationRef.current.height = rect.height;
    simulationRef.current.particles = createParticles(
      config.particleCount,
      rect.width,
      rect.height
    );

    memoryRef.current = 0;
    setMemoryLevel(0);
    erasePulseRef.current = 0;
    gateOpenRef.current = 0;
    timeRef.current = 0;
    lastSampleRef.current = 0;
    setStats((prev) => ({
      ...prev,
      leftTemp: 0,
      rightTemp: 0,
      threshold: 0,
      entropyProxy: 0,
      eraseCount: 0,
    }));
    setSparkData({
      tempDelta: Array(40).fill(0),
      entropy: Array(40).fill(0),
    });
  };

  useEffect(() => {
    initSimulation();
  }, [config.particleCount]);

  useEffect(() => {
    if (memoryRef.current >= config.memorySize) {
      memoryRef.current = 0;
      setMemoryLevel(0);
    }
  }, [config.memorySize]);

  useEffect(() => {
    const handleResize = () => {
      initSimulation();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");

    const update = (timestamp) => {
      if (!running) {
        frameRef.current = requestAnimationFrame(update);
        return;
      }

      const dt = Math.min((timestamp - timeRef.current) / 1000 || 0, 0.05);
      timeRef.current = timestamp;

      const { particles, width, height } = simulationRef.current;
      const mid = width / 2;
      const padding = LAYOUT.padding;
      const gateHeight = LAYOUT.gateHeight;
      const gateTop = height / 2 - gateHeight / 2;
      const gateBottom = height / 2 + gateHeight / 2;
      const wallLeft = mid - LAYOUT.wallThickness / 2;
      const wallRight = mid + LAYOUT.wallThickness / 2;

      const speeds = particles.map((particle) =>
        Math.hypot(particle.vx, particle.vy)
      );
      const meanSpeed = speeds.reduce((sum, value) => sum + value, 0) / speeds.length;
      const medianSpeed = computeMedian(speeds);
      const threshold =
        config.thresholdMethod === "median" ? medianSpeed : meanSpeed;

      let leftEnergy = 0;
      let rightEnergy = 0;
      let leftCount = 0;
      let rightCount = 0;

      for (const particle of particles) {
        particle.x += particle.vx * dt * config.speedMultiplier;
        particle.y += particle.vy * dt * config.speedMultiplier;

        const isLeft = particle.x < mid;
        const chamberLeft = isLeft ? padding : wallRight + padding;
        const chamberRight = isLeft ? wallLeft - padding : width - padding;

        if (particle.x <= chamberLeft) {
          particle.x = chamberLeft;
          particle.vx *= -1;
        }
        if (particle.x >= chamberRight) {
          particle.x = chamberRight;
          particle.vx *= -1;
        }
        if (particle.y <= padding) {
          particle.y = padding;
          particle.vy *= -1;
        }
        if (particle.y >= height - padding) {
          particle.y = height - padding;
          particle.vy *= -1;
        }

        const isInWall = particle.x > wallLeft && particle.x < wallRight;
        const inGateZone = particle.y > gateTop && particle.y < gateBottom;
        if (isInWall) {
          if (gateOpenRef.current > 0 && inGateZone) {
            particle.x = isLeft ? wallRight + 2 : wallLeft - 2;
          } else {
            particle.x = isLeft ? wallLeft - 1 : wallRight + 1;
            particle.vx *= -1;
          }
        }

        const speed = Math.hypot(particle.vx, particle.vy);
        if (particle.x < mid) {
          leftEnergy += speed * speed;
          leftCount += 1;
        } else {
          rightEnergy += speed * speed;
          rightCount += 1;
        }

        if (!config.demonEnabled) continue;
        if (gateOpenRef.current > 0) continue;

        const nearGate =
          particle.x > wallLeft - 8 &&
          particle.x < wallRight + 8 &&
          particle.y > gateTop &&
          particle.y < gateBottom;

        if (!nearGate) continue;

        const shouldOpen = isLeft ? speed >= threshold : speed < threshold;
        const isAccurate = Math.random() <= config.demonAccuracy;
        const finalDecision = isAccurate ? shouldOpen : !shouldOpen;

        if (finalDecision) {
          gateOpenRef.current = config.gateOpenDuration;
          memoryRef.current += 1;
          setMemoryLevel(memoryRef.current);
          if (memoryRef.current >= config.memorySize) {
            memoryRef.current = 0;
            setMemoryLevel(0);
            erasePulseRef.current = 1;
            setStats((prev) => ({
              ...prev,
              eraseCount: prev.eraseCount + 1,
            }));
          }
        }
      }

      gateOpenRef.current = Math.max(0, gateOpenRef.current - dt);
      erasePulseRef.current = Math.max(0, erasePulseRef.current - dt * 0.6);

      if (timestamp - lastSampleRef.current > 200) {
        lastSampleRef.current = timestamp;
        const leftTemp = leftCount ? leftEnergy / leftCount : 0;
        const rightTemp = rightCount ? rightEnergy / rightCount : 0;
        const entropyProxy = Math.abs(leftTemp - rightTemp) / (leftTemp + rightTemp + 1e-6);

        setStats((prev) => ({
          ...prev,
          leftTemp,
          rightTemp,
          threshold,
          entropyProxy,
        }));
        setSparkData((prev) => ({
          tempDelta: [...prev.tempDelta.slice(1), Math.abs(leftTemp - rightTemp)],
          entropy: [...prev.entropy.slice(1), entropyProxy],
        }));
      }

      context.save();
      context.scale(window.devicePixelRatio, window.devicePixelRatio);
      context.clearRect(0, 0, width, height);

      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0b1224");
      gradient.addColorStop(1, "#141b34");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.fillStyle = "rgba(255,255,255,0.08)";
      context.fillRect(wallLeft, 0, LAYOUT.wallThickness, height);

      context.clearRect(
        wallLeft,
        gateTop,
        LAYOUT.wallThickness,
        gateBottom - gateTop
      );

      context.fillStyle = gateOpenRef.current > 0 ? "#f9b34c" : "#3c4a76";
      context.fillRect(wallLeft - 3, gateTop, 12, gateBottom - gateTop);

      const pulseIntensity = erasePulseRef.current;
      if (pulseIntensity > 0) {
        context.fillStyle = `rgba(255, 116, 72, ${0.35 * pulseIntensity})`;
        context.fillRect(0, 0, width, height);
      }

      for (const particle of particles) {
        const speed = Math.hypot(particle.vx, particle.vy);
        const normalized = Math.min(speed / (meanSpeed * 1.8), 1);
        const hue = 210 - normalized * 180;
        context.fillStyle = `hsl(${hue}, 80%, 64%)`;
        context.beginPath();
        context.arc(particle.x, particle.y, 2.1, 0, Math.PI * 2);
        context.fill();
      }

      context.restore();

      frameRef.current = requestAnimationFrame(update);
    };

    frameRef.current = requestAnimationFrame(update);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [config, running]);

  const thresholdLabel =
    config.thresholdMethod === "median" ? "Median" : "Mean";

  const memorySlots = useMemo(() => {
    return Array.from({ length: config.memorySize }, (_, index) => index);
  }, [config.memorySize]);

  const applyPreset = (name) => {
    const preset = PRESETS[name];
    if (!preset) return;
    setConfig((prev) => ({
      ...prev,
      ...preset,
    }));
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Maxwell's Demon · Interactive Simulation</p>
          <h1>Information, entropy, and the smallest gate in the universe.</h1>
          <p className="lede">
            Watch a microscopic demon sort fast and slow particles to create a
            temperature gradient, then visualize how memory erasure restores the
            second law.
          </p>
        </div>
        <div className="hero-actions">
          <button className="primary" onClick={() => setRunning((prev) => !prev)}>
            {running ? "Pause" : "Play"}
          </button>
          <button className="ghost" onClick={initSimulation}>
            Reset
          </button>
          <button className="ghost" onClick={() => setShowInfo((prev) => !prev)}>
            {showInfo ? "Hide" : "Show"} overlay
          </button>
        </div>
      </header>

      <main className="content">
        <section className="canvas-card">
          <div className="canvas-header">
            <div>
              <h2>Chamber View</h2>
              <p>
                Gate status: <strong>{gateOpenRef.current > 0 ? "OPEN" : "CLOSED"}</strong>
              </p>
            </div>
            <div className="badge-row">
              <span className={`badge ${config.demonEnabled ? "active" : ""}`}>
                Demon {config.demonEnabled ? "active" : "offline"}
              </span>
              <span className="badge">Threshold: {thresholdLabel}</span>
            </div>
          </div>
          <div className="canvas-wrap">
            <canvas ref={canvasRef} className="sim-canvas" />
            {showInfo && (
              <div className="overlay">
                <div>
                  <h3>Sorting rule</h3>
                  <p>
                    Fast particles → Right · Slow particles → Left. Each decision
                    writes to memory.
                  </p>
                </div>
                <div>
                  <h3>Landauer cost</h3>
                  <p>
                    When memory fills, erasure releases heat (orange pulse).
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="side-panel">
          <section className="card">
            <h3>System Metrics</h3>
            <div className="metric-grid">
              <div>
                <p>Left Temp</p>
                <strong>{formatNumber(stats.leftTemp)}</strong>
              </div>
              <div>
                <p>Right Temp</p>
                <strong>{formatNumber(stats.rightTemp)}</strong>
              </div>
              <div>
                <p>Threshold</p>
                <strong>{formatNumber(stats.threshold)}</strong>
              </div>
              <div>
                <p>Erase Cycles</p>
                <strong>{stats.eraseCount}</strong>
              </div>
            </div>
            <div className="sparkline-row">
              <div>
                <p>Temperature Gap</p>
                <Sparkline data={sparkData.tempDelta} color="#f9b34c" />
              </div>
              <div>
                <p>Entropy Proxy</p>
                <Sparkline data={sparkData.entropy} color="#6ee7ff" />
              </div>
            </div>
          </section>

          <section className="card">
            <h3>Demon Memory</h3>
            <div className="memory-tape">
              {memorySlots.map((slot) => (
                <span
                  key={slot}
                  className={`bit ${slot < memoryLevel ? "filled" : ""}`}
                />
              ))}
            </div>
            <p className="helper">
              Each gate decision writes a bit. Erasure triggers the heat pulse.
            </p>
          </section>

          <section className="card">
            <h3>Controls</h3>
            <label className="toggle">
              <input
                type="checkbox"
                checked={config.demonEnabled}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    demonEnabled: event.target.checked,
                  }))
                }
              />
              Demon enabled
            </label>

            <div className="field">
              <label>Particle Count</label>
              <input
                type="range"
                min="120"
                max="480"
                value={config.particleCount}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    particleCount: Number(event.target.value),
                  }))
                }
              />
              <span>{config.particleCount}</span>
            </div>

            <div className="field">
              <label>Speed</label>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.5"
                value={config.speedMultiplier}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    speedMultiplier: Number(event.target.value),
                  }))
                }
              />
              <span>{config.speedMultiplier}x</span>
            </div>

            <div className="field">
              <label>Gate Open Duration</label>
              <input
                type="range"
                min="0.08"
                max="0.5"
                step="0.02"
                value={config.gateOpenDuration}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    gateOpenDuration: Number(event.target.value),
                  }))
                }
              />
              <span>{config.gateOpenDuration.toFixed(2)}s</span>
            </div>

            <div className="field">
              <label>Threshold Method</label>
              <select
                value={config.thresholdMethod}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    thresholdMethod: event.target.value,
                  }))
                }
              >
                <option value="mean">Mean</option>
                <option value="median">Median</option>
              </select>
            </div>

            <div className="field">
              <label>Demon Accuracy</label>
              <input
                type="range"
                min="0.4"
                max="1"
                step="0.05"
                value={config.demonAccuracy}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    demonAccuracy: Number(event.target.value),
                  }))
                }
              />
              <span>{Math.round(config.demonAccuracy * 100)}%</span>
            </div>

            <div className="field">
              <label>Memory Size</label>
              <input
                type="range"
                min="8"
                max="40"
                step="2"
                value={config.memorySize}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    memorySize: Number(event.target.value),
                  }))
                }
              />
              <span>{config.memorySize} bits</span>
            </div>

            <div className="preset-row">
              {Object.keys(PRESETS).map((preset) => (
                <button
                  key={preset}
                  className="ghost"
                  onClick={() => applyPreset(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
