# Reference Architecture

## Purpose
This document maps the three source materials into concrete implementation guidance for the frontend simulation. It highlights how each source informs features, visuals, and interaction patterns so the PRD can be traced back to scientific intent.

## Source-to-Feature Mapping

### Reddit Explanation → User-Facing Narrative and Core Loop
- **Paradox framing**: The UI should introduce the demon as a fast, precise controller that sorts particles by speed and appears to violate the second law.
- **Temperature gradient**: A core outcome is a visible temperature difference between chambers that can be used as an explanatory hook.
- **Information vs entropy**: The interface should communicate that the demon's information handling is part of the entropy budget.

### Wikipedia Article → Scientific Grounding and Constraints
- **Two-way sorting requirement**: To produce only a temperature difference (and not just pressure), the gate must allow particles in both directions.
- **Non-violation resolution**: The simulation must include information storage/erasure as a counterbalance to entropy reduction.
- **Measurement and memory cost**: Landauer's principle and Bennett's information erasure explain why the paradox resolves; these should appear as a visible mechanism (e.g., memory register filling + reset event).
- **Modern framing**: The demon is a feedback controller; measurement creates mutual information and modifies thermodynamic accounting.

### Simulation Summary → Implementation Patterns
- **Particle modeling**: Use stochastic or molecular-dynamics-inspired motion with a Maxwell-Boltzmann distribution.
- **Gate logic**: Event-based gate opens for single particles based on threshold speed.
- **Memory tape**: Visualized as a register or tape that fills with bits and is periodically erased, emitting a heat/entropy indicator.
- **Plotting**: Real-time charting of temperature difference and entropy proxy is expected.

## Frontend Architecture Implications
- **Simulation loop**: Single animation loop combining particle updates, gate decisions, and UI updates.
- **State management**: Separate particle state, gate state, demon memory state, and visualization state.
- **Performance**: Use canvas/WebGL for particle rendering; limit UI updates (charts/labels) to fixed intervals to prevent jank.
- **Explainability**: Each state change (gate open, memory erase) should be narratively tied to the physics via tooltips or callouts.

## Non-Negotiable Scientific Constraints
- The system must represent **statistical temperature** (via velocity distribution), not arbitrary per-particle temperature labels.
- The demon's action is **information-driven** and must be shown as an active, non-free process.
- The simulation should explicitly demonstrate **local entropy reduction vs global entropy accounting**.

## Optional Extensions (If Time Permits)
- Add a "noise" parameter to demon measurement to illustrate imperfect observation.
- Add a toggle for "autonomous demon" vs "manual demon" to reflect modern experiment analogs.
- Provide a short historical timeline in the UI footer to tie to Maxwell/Kelvin/Szilárd/Bennett.
