# Simulation Mechanics

## System Overview
The simulation models a closed container with two chambers (Left, Right) separated by a wall with a single-particle gate. A set of particles moves stochastically within each chamber. The demon observes approaching particles at the gate and decides whether to open it based on the particle's speed relative to a threshold derived from the current distribution.

## Entity Model
- **Particles**
  - Attributes: position, velocity vector, speed, chamber assignment.
  - Motion model: Brownian-like random motion with elastic wall collisions.
  - Distribution: initialized with a Maxwell-Boltzmann-like speed distribution.
- **Gate (Door)**
  - Allows one particle to pass at a time when open.
  - Opens only when a particle is within a proximity radius of the gate.
  - Directional rule: fast particles allowed from Left→Right, slow particles allowed from Right→Left.
- **Demon**
  - Observes particle speed (measurement event).
  - Records observation in a memory register.
  - Decides to open/close gate based on a configurable rule set.
  - Periodically erases memory (incurs entropy cost).

## State Machine
1. **Equilibrium Phase**: Particles move randomly; no sorting actions occur.
2. **Measurement Phase**: Demon samples a particle approaching the gate and records its speed.
3. **Gate Decision Phase**: Demon compares speed to the current threshold (mean/median) and direction rule.
4. **Gate Action Phase**: Gate opens for a limited time step if the condition is satisfied.
5. **Memory Cycle Phase**: Memory register stores observation; when full, a reset/erase cycle occurs (entropy cost).

## Rules of Sorting
- **Fast threshold**: Derived from the current mean speed in the whole system or per chamber (configurable).
- **Allowed transfer**:
  - Left→Right: only if speed ≥ threshold.
  - Right→Left: only if speed < threshold.
- **Gate timing**: open window is short; only one particle can pass per event.
- **Two-way sorting** is mandatory to create a temperature gradient rather than pure pressure imbalance.

## Thermodynamics Accounting
- **Chamber temperature**: computed from average kinetic energy of particles in each chamber.
- **Entropy proxy**: approximate using speed distribution spread and relative uniformity between chambers.
- **Global accounting**: includes a visual indicator for information cost during memory erasure (Landauer cost).

## Observable Outcomes
- **Without demon**: chambers converge to equal temperature; entropy remains stable.
- **With demon**: temperature divergence appears; local entropy decreases in one chamber.
- **With memory cost visualization**: global entropy remains constant or increases once erasure occurs.

## Tunable Parameters (Frontend Controls)
- Particle count (performance vs fidelity)
- Gate size and open duration
- Threshold selection strategy (mean vs median)
- Demon accuracy (perfect vs noisy measurement)
- Memory capacity and erase frequency

## Rendering Expectations
- Real-time rendering of particles as moving points with velocity-coded color.
- Visible gate state (open/closed) and chamber separation.
- Charts for temperature difference, entropy proxy, and memory erasure events.
