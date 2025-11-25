---
sidebar_position: 1
---

# Architecture Overview

:::info Coming Soon
Detailed architecture documentation is being written.
:::

## High-Level Overview

AirPath is built around several key systems that work together:

```
┌─────────────────────────────────────────────────────────────────┐
│                     PathfindingManager                          │
│  (Orchestrates modes, handles events, manages lifecycle)        │
└─────────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Pathfinding     │  │ Configuration   │  │ Event           │
│ Service         │  │ Manager         │  │ Bus             │
└─────────────────┘  └─────────────────┘  └─────────────────┘
           │                    │
           ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│ A* Job          │  │ ScriptableObject│
│ (Burst)         │  │ Configs         │
└─────────────────┘  └─────────────────┘
```

## Key Components

- **PathfindingManager** — Central orchestrator
- **PathfindingService** — Core path calculation
- **IHeightProvider** — Terrain data abstraction
- **PathfindingEventBus** — Event communication
- **Configuration System** — ScriptableObject settings
