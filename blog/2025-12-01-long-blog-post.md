---
slug: airpath-1-0-0-release
title: AirPath 1.0.0 Release
authors: roman
tags: [release]
---

I'm excited to announce the official release of **AirPath 1.0.0** – a high-performance 3D aerial pathfinding solution for Unity.

<!-- truncate -->

## Highlights

AirPath brings efficient 3D pathfinding to Unity with full DOTS integration, enabling thousands of simultaneous path requests while maintaining excellent performance.

## Added

### Core Pathfinding
- A* pathfinding algorithm optimized for 3D aerial navigation
- Jump Point Search (JPS) optimization for open-space scenarios
- Configurable heuristics (Manhattan, Euclidean, Octile, Chebyshev)
- Multi-threaded path computation using Unity Job System
- Burst-compiled performance-critical code paths

### Grid System
- Flexible 3D grid generation with configurable resolution
- Runtime grid updates for dynamic environments
- Obstacle detection with layer-based filtering
- Support for variable cell sizes and grid dimensions

### Height Providers
- Terrain Height Provider for Unity Terrain integration
- Extensible `IHeightProvider` interface for custom implementations
- Automatic height sampling with configurable offsets

### Configuration
- ScriptableObject-based configuration system
- Runtime-adjustable pathfinding parameters
- Presets for common use cases (drones, aircraft, flying creatures)

### Visualization & Debugging
- Real-time grid visualization with Gizmos
- Path debugging with node inspection
- Performance metrics overlay
- Editor tools for setup and testing

### Render Pipeline Support
- Built-in Render Pipeline
- Universal Render Pipeline (URP)
- High Definition Render Pipeline (HDRP)

