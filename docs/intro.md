---
sidebar_position: 1
slug: /
---

# Introduction

AirPath is a high-performance 3D aerial pathfinding solution for Unity, built on Unity's Data-Oriented Technology Stack (DOTS). It enables flying agents like drones, birds, aircraft, and other aerial units to navigate complex 3D environments while respecting terrain height and optimizing flight paths.

## What is AirPath?

Unlike traditional 2D pathfinding solutions, AirPath calculates paths in three dimensions, taking terrain elevation into account. The system uses a height-aware A* algorithm that considers not just horizontal distance, but also the cost of flying at different altitudes, climbing, and navigating slopes.

AirPath is designed for scenarios where you need:

- **Aerial navigation**         Drones, birds, helicopters, or any flying agents
- **Terrain-aware pathing**     Routes that consider mountains, valleys, and elevation changes
- **High performance**          Burst-compiled jobs that run on multiple threads
- **Swarm behavior**            Coordinated movement of multiple agents along calculated paths

## Key Features

**Performance-First Architecture**

AirPath leverages Unity's Job System and Burst compiler for maximum performance. The core A* algorithm runs as a Burst-compiled job, allowing pathfinding calculations to happen off the main thread without blocking your game.

**Height-Aware Pathfinding**

The pathfinding algorithm uses a multi-factor cost model that considers:

- Base movement distance
- Absolute altitude (higher = more costly)
- Climbing penalty (gaining altitude costs extra)
- Slope steepness (rapid height changes are penalized)

This produces natural-looking flight paths that prefer valleys and gradual climbs over direct mountain crossings.

**Flexible Height Provider System**

AirPath doesn't lock you into Unity Terrain. The `IHeightProvider` interface allows you to integrate any height data source — procedural terrain, mesh-based landscapes, voxel worlds, or custom data structures.

**ScriptableObject Configuration**

All settings are managed through ScriptableObject assets, making it easy to create presets, swap configurations at runtime, and keep your scenes clean.

**Event-Driven Architecture**

AirPath communicates through a robust event system, allowing loose coupling between components. Subscribe to path calculations, mode changes, and swarm updates without tight dependencies.

## How It Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Height         │────▶│  PathfindingGrid │────▶│  A* Job         │
│  Provider       │     │  (NativeArrays)  │     │  (Burst)        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                                                │
        │                                                ▼
        │                                        ┌─────────────────┐
        │                                        │  World Path     │
        │                                        │  (Vector3[])    │
        │                                        └─────────────────┘
        │                                                │
        ▼                                                ▼
┌─────────────────┐                              ┌─────────────────┐
│  Unity Terrain  │                              │  Agents/Swarm   │
│  (or custom)    │                              │  Follow Path    │
└─────────────────┘                              └─────────────────┘
```

1. **Height Provider** samples terrain elevation data into a grid
2. **PathfindingGrid** stores this data in Burst-compatible NativeArrays
3. **A* Job** calculates the optimal path considering height costs
4. **World Path** is returned as a list of 3D positions
5. **Agents** follow the calculated path with optional smoothing

## When to Use AirPath

AirPath is ideal for:

- Flight simulators with terrain following
- Drone simulation and visualization
- RTS games with air units
- Nature simulations with flocking birds
- Any game requiring intelligent aerial navigation

AirPath may not be the best fit if:

- You only need 2D ground-based pathfinding (use Unity NavMesh)
- Your agents don't need to consider terrain height
- You're targeting platforms without Burst support

## Next Steps

Ready to get started? Head to the [Requirements](./getting-started/requirements) page to check compatibility, then follow the [Installation](./getting-started/installation) guide to add AirPath to your project.

{/* 
IMAGE PLACEHOLDER: Hero image showing a swarm of drones navigating around a mountainous terrain with visible path lines. Should showcase the 3D nature of the pathfinding with paths going over and around terrain features.
*/}
