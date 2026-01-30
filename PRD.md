# Product Requirements Document (PRD)

## Problem Statement
Maxwell's demon is a foundational thought experiment that exposes the relationship between information and thermodynamics. It remains conceptually difficult to grasp because the paradox lives at the boundary between microscopic motion and macroscopic laws. This simulation must make the paradox **visually tangible**: show how a feedback controller can sort particles to create a temperature gradient, and why the apparent violation of the second law is resolved when information processing is included. The product exists to provide a **clear, interactive, scientifically accurate** demonstration of these ideas without relying on backends or complex instrumentation.

## User Experience Goals
- **Immediate clarity**: Users should quickly see how sorting fast/slow particles creates a temperature difference between chambers.
- **Interactive understanding**: Users should be able to tweak parameters and watch how the system responds in real time.
- **Conceptual closure**: Users should leave understanding that the demon's information handling restores the second law (Landauer's principle).
- **Aesthetic coherence**: The simulation should feel modern, precise, and scientific—clean visuals, smooth motion, and intelligible data overlays.

## Visual & Interaction Specifications

### Scene Layout
- **Primary canvas**: Full-width interactive simulation area.
- **Chambers**: Two rectangular regions separated by a wall with a visible gate.
- **Gate**: Animated open/close indicator; visually distinct (glow or color shift) when active.
- **Demon memory**: A visual register or tape, showing bits filling up and resetting with a heat pulse indicator.
- **Data overlays**: Inline charts (sparkline or mini graphs) for temperature difference, entropy proxy, and memory resets.

### Particle Rendering
- **Particles as dots**: Small points with velocity-coded color (e.g., blue = slow, red = fast).
- **Motion**: Smooth, constant-speed segments with random direction changes or elastic collisions.
- **Velocity scale**: Color mapping based on speed relative to system mean.
- **Density handling**: Use opacity or size adjustments to avoid visual clutter at high particle counts.

### Interaction Controls
- **Play/Pause/Reset**: Core transport controls.
- **Speed control**: Slider with discrete steps (e.g., 0.5x, 1x, 2x, 4x).
- **Parameter panel**:
  - Particle count
  - Gate open duration
  - Threshold method (mean vs median)
  - Demon accuracy (perfect vs noisy)
  - Memory size + erase interval
- **Information overlay**: Toggle for explanations/tooltips.

### Feedback Loops
- **Gate event flashes**: Brief glow on successful sorting.
- **Entropy/heat indicator**: On memory erase, show a brief pulse or heat wave icon.
- **Chamber temperature readouts**: Numeric or gauge-based indicators updated in real time.

## Frontend Features (Implementable)
- Real-time particle simulation using Canvas or WebGL.
- Gate logic with event-based state transitions (open/close per particle encounter).
- Demon memory register visualization with erasure animation.
- Temperature difference chart (Left vs Right) with live updates.
- Entropy proxy meter that reflects distribution divergence.
- Toggleable explanation layer (hover tooltips or modal callouts).
- Preset buttons (e.g., "Equilibrium", "Maxwell Mode", "Noisy Demon") to illustrate key scenarios.
- Accessibility support: keyboard controls for simulation transport, high-contrast mode toggle.

## Technical Constraints & Opportunities
- **Frontend-only**: No backend required; all computation runs in the browser.
- **Performance**: Use requestAnimationFrame for simulation updates; batch rendering.
- **Rendering strategy**: Canvas 2D for simplicity; WebGL optional for particle scaling.
- **Responsiveness**: Simulation should scale to desktop, tablet, and landscape mobile.
- **Browser support**: Target modern evergreen browsers (Chromium, Firefox, Safari).
- **Framework fit**: React or Next.js recommended for UI + state management; integrate with Vercel deployment.
- **State separation**: Keep physics state independent of UI state to prevent re-render bottlenecks.

## Success Metrics
- **Responsiveness**: Stable frame rate (≥ 50 FPS) with 200–500 particles on modern laptops.
- **Clarity**: Users can correctly answer (via internal QA or usability testing) that the demon's information processing accounts for the entropy cost.
- **Interaction quality**: <100ms latency between control changes and visible simulation response.
- **Aesthetic coherence**: Consistent visual language across particles, overlays, and charts.
- **Educational efficacy**: Users can visually distinguish local entropy reduction from global entropy accounting.
