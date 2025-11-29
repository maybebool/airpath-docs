---
sidebar_position: 1
---

# Architecture Overview

AirPath is designed around three core principles: **performance**, **flexibility**, and **loose coupling**. This page explains how the major systems work together.

## System Architecture

<img src={require('@site/static/img/Architecture.png').default} alt="How AirPath Works - Architecture Overview" width="700" />


## Data Flow

When you request a path, here's what happens:

### 1. Request

A pathfinding mode (MouseClick or TargetFollow) creates a `PathRequest` with start/end positions.

```
User clicks terrain → MouseClickMode → PathRequest created
```

### 2. Grid Conversion

World positions are converted to grid coordinates using `GridBoundaryHandler`. Out-of-bounds positions are clamped if configured.

```
World (150, 0, 200) → Grid (9, 12)
```

### 3. A* Calculation

The `PathfindingService` schedules a Burst-compiled A* job. The job runs on a worker thread using NativeArrays from `PathGridData`.

```
Start (9, 12) → A* Algorithm → Path [indices...]
```

### 4. Path Conversion

Grid indices are converted back to world positions with terrain height applied.

```
Grid path → World path with heights → List<Vector3>
```

### 5. Event Publication

Results are published via `PathfindingEventBus`. Any subscribed component receives the path.

```
PathCalculatedEvent → Your agent controller → Agent follows path
```

## Key Components

### PathfindingManager

The central orchestrator. It:
- Manages pathfinding modes (MouseClick, TargetFollow)
- Initializes the PathfindingService
- Handles mode switching
- Publishes events for path requests and results

You configure it in the Inspector and rarely interact with it from code.

→ [Setup Guide](../setup-guide/pathfinding-manager)

---

### PathfindingService

The core pathfinding engine. It:
- Maintains the pathfinding grid (NativeArrays)
- Executes Burst-compiled A* jobs
- Handles coordinate conversion
- Manages boundary clamping

For direct path calculation without modes, use this class.

→ [API Reference](../api-reference/pathfinding-service)

---

### IHeightProvider

An interface that abstracts terrain data. AirPath doesn't depend on Unity Terrain directly, it asks an `IHeightProvider` for height data.

Built-in: `TerrainHeightProvider` for Unity Terrain.

Custom: Implement `IHeightProvider` for procedural terrain, meshes, or voxels.

→ [API Reference](../api-reference/height-provider-interface)

---

### PathfindingEventBus

A ScriptableObject-based event system. Components communicate through events rather than direct references.

Key events:
- `PathRequestedEvent` — Path calculation started
- `PathCalculatedEvent` — Path calculation complete
- `PathfindingModeChangedEvent` — Mode switched

→ [API Reference](../api-reference/events)

---

### Configuration System

All settings are stored in ScriptableObject assets:

| Asset | Purpose |
|-------|---------|
| `PathfindingConfiguration` | Grid size, cost multipliers, boundary handling |
| `VisualizationConfiguration` | Path line, cell colors, debug display |
| `PathfindingEventBus` | Event system settings |

This allows hot-swapping configurations and keeping scenes clean.

→ [Visualization Setup](../setup-guide/visualization-setup)

## Design Principles

### Event-Driven Communication

Components don't hold direct references to each other. Instead, they:
- **Publish** events when something happens
- **Subscribe** to events they care about

This makes the system modular — you can remove visualization without breaking pathfinding.

### Interface Abstraction

AirPath uses `IHeightProvider` instead of depending on Unity Terrain directly. This means:
- You can use any height source
- Testing is easier (mock height providers)
- The core algorithm is terrain-agnostic

### DOTS for Performance

The A* algorithm is:
- **Burst-compiled** — Native code performance
- **Job System** — Runs on worker threads
- **NativeArrays** — No GC allocation during pathfinding

This keeps pathfinding off the main thread and avoids frame hitches.

### ScriptableObject Configuration

Settings live in assets, not scenes. Benefits:
- Share configurations across scenes
- Swap presets at runtime
- Version control friendly
- No scene modifications for setting changes

## Thread Safety

| Component | Thread | Notes |
|-----------|--------|-------|
| PathfindingManager | Main | Unity APIs require main thread |
| PathfindingService | Main | Schedules jobs, handles results |
| A* Job | Worker | Burst-compiled, no Unity API calls |
| Event Bus | Main | Events processed on main thread |
| Height Provider | Main | Called during initialization |

The A* calculation runs on a worker thread, but `CalculatePath()` blocks until complete. For truly async pathfinding, consider wrapping in a coroutine.

## Next Steps

- [Grid System](./grid-system) — How the pathfinding grid works
- [Height Providers](./height-providers) — Terrain data integration
- [Pathfinding Algorithm](./pathfinding-algorithm) — The A* implementation