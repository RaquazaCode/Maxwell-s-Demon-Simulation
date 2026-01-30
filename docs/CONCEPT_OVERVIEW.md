# Concept Overview: Maxwell's Demon

## Purpose and Relevance
Maxwell's demon is a canonical thought experiment used to stress-test the second law of thermodynamics by imagining a microscopic agent that can sort gas molecules without expending work. The scenario forces a direct link between **information** (what the demon knows), **entropy** (statistical disorder), and **energy** (work extraction). The simulation should present this relationship as a concrete, observable system rather than a purely abstract paradox. This matters because modern physics resolves the paradox by accounting for the thermodynamic cost of measurement, memory storage, and information erasure. 

## Core Narrative for Developers
The simulation depicts a gas divided into two chambers with a narrow, single-particle gate. A demon monitors individual particles and selectively opens the gate: fast particles are allowed to move to one side and slow particles to the other. Over time, this produces a temperature difference between chambers that could, in principle, be used to do work. 

However, the key principle to preserve is that the demon's knowledge and control are not free. When the full system—including the demon's memory and the act of erasing it—is modeled, total entropy does not decrease. Landauer's principle states that erasing information has a minimum energetic cost, which restores the second law. The simulation must therefore show both **local entropy reduction** in the gas and **global entropy accounting** when the demon's information handling is included.

## Concepts to Anchor in the UI and Narrative
- **Molecular chaos and equilibrium:** Particles move randomly in both chambers when the system is not being sorted.
- **Selective sorting:** The gate behavior (fast-to-right, slow-to-left) drives a temperature gradient.
- **Temperature from velocities:** Temperature is the statistical distribution of particle speeds, not a per-particle label.
- **Information cost:** The demon's memory and erasure cycle are part of the thermodynamic balance.
- **Non-violation of the second law:** The system appears to lower entropy locally but remains consistent when information is included.

## What "Scientific Accuracy" Means in This Context
- The simulation must distinguish **local** entropy changes (gas chambers) from **global** entropy changes (gas + demon).
- A **two-way gate** is required to create a temperature difference without a purely pressure-driven imbalance.
- Fast and slow thresholds should be based on the **mean or median** of the distribution, not arbitrary per-particle flags.
- The demon is a **feedback controller** that performs measurements and writes/erases state.

## Developer-Oriented Mapping of Sources
- **Reddit explanation:** Clear narrative on how sorting creates temperature differences and why it seems to violate the second law; perfect for user-facing framing of the paradox.
- **Wikipedia context:** Reinforces that the paradox is resolved by including the demon's information processing, plus the historical framing and modern interpretations.
- **Simulation summary:** Provides implementation patterns (event-based gates, molecular dynamics, memory tape, and Landauer cost) that can be mapped to UI systems and state machines.
