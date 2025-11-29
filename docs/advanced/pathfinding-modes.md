---
sidebar_position: 2
---

# Pathfinding Modes

AirPath supports different pathfinding modes that determine how start and end positions are selected. This page explains the built-in modes and how to create custom ones.

## Overview

Pathfinding modes control:

- How the **start position** is determined
- How the **end position** is determined
- When **recalculation** occurs
- What **visual feedback** is shown

## Built-in Modes

### MouseClick Mode

Click to set start and end positions manually. Ideal for testing and debugging.

**How it works:**

1. First click sets the **start position** (green cylinder marker)
2. Second click sets the **end position** (red cylinder marker)
3. Path is calculated immediately
4. Click again to set a new start position

**Visual indicators:**

- Green cylinder at start position
- Red cylinder at end position
- Path line connecting them (if visualization enabled)

**Use cases:**

- Testing pathfinding during development
- Debugging path quality
- Demos and presentations
- Player-controlled navigation

### TargetFollow Mode

Continuously tracks a moving target. Ideal for AI agents following players or waypoints.

**How it works:**

1. Assigns a **Target To Follow** transform
2. Uses swarm position (or PathfindingManager position) as start
3. Continuously recalculates path as target moves
4. Smart throttling prevents excessive recalculation

**Visual indicators:**

- Yellow sphere at current target position
- Boundary warning when target leaves grid

**Configuration options:**

| Setting | Description |
|---------|-------------|
| Target To Follow | The transform to track |
| Min Recalculation Interval | Minimum time between path updates |
| Target Move Threshold | Grid cells target must move to trigger recalc |
| Swarm Move Threshold | Grid cells swarm must move to trigger recalc |
| Use Distance Based Throttling | Reduce update frequency for distant targets |

**Use cases:**

- AI following the player
- Enemies tracking targets
- NPCs moving to waypoints
- Flocking/swarm behavior

## Switching Modes

### In the Inspector

1. Select the GameObject with `PathfindingManager`
2. Change **Starting Mode** dropdown
3. Configure mode-specific settings

### At Runtime

```csharp
// Get reference to PathfindingManager
PathfindingManager manager = GetComponent<PathfindingManager>();

// Switch to MouseClick mode
manager.SetMode(PathfindingModeType.MouseClick);

// Switch to TargetFollow mode
manager.SetMode(PathfindingModeType.TargetFollow);
```

### Mode Changed Event

Subscribe to know when modes change:

```csharp
this.Subscribe<PathfindingModeChangedEvent>(evt =>
{
    Debug.Log($"Mode changed from {evt.PreviousMode} to {evt.NewMode}");
    
    // Access the new mode instance if needed
    var modeInstance = evt.ModeInstance;
});
```

## Mode Comparison

| Feature | MouseClick | TargetFollow |
|---------|------------|--------------|
| Start Position | Click to set | Swarm/Manager position |
| End Position | Click to set | Target transform |
| Recalculation | Manual (on click) | Automatic (continuous) |
| Best For | Testing, manual control | AI, automatic tracking |
| Visual Markers | Green/Red cylinders | Yellow sphere |

## Creating Custom Modes

You can create custom pathfinding modes by implementing the mode interface pattern.

### Step 1: Create the Mode Class

```csharp
using UnityEngine;
using PlatypusIdeas.AirPath.Runtime.Core.Pathfinding;

public class WaypointPathfindingMode : MonoBehaviour
{
    [SerializeField] private Transform[] waypoints;
    [SerializeField] private float arrivalDistance = 2f;
    
    private PathfindingManager manager;
    private int currentWaypointIndex = 0;
    
    public void Initialize(PathfindingManager pathfindingManager)
    {
        manager = pathfindingManager;
        RequestPathToNextWaypoint();
    }
    
    public void UpdateMode()
    {
        // Check if we've reached the current waypoint
        if (HasReachedCurrentWaypoint())
        {
            currentWaypointIndex++;
            
            if (currentWaypointIndex < waypoints.Length)
            {
                RequestPathToNextWaypoint();
            }
        }
    }
    
    private void RequestPathToNextWaypoint()
    {
        if (waypoints == null || waypoints.Length == 0)
            return;
            
        var start = manager.transform.position;
        var end = waypoints[currentWaypointIndex].position;
        
        // Request path calculation
        manager.RequestPath(start, end);
    }
    
    private bool HasReachedCurrentWaypoint()
    {
        if (currentWaypointIndex >= waypoints.Length)
            return false;
            
        var distance = Vector3.Distance(
            manager.transform.position,
            waypoints[currentWaypointIndex].position
        );
        
        return distance < arrivalDistance;
    }
    
    public void Cleanup()
    {
        // Clean up any resources
    }
}
```

### Step 2: Integrate with PathfindingManager

```csharp
// Add your custom mode component
var waypointMode = gameObject.AddComponent<WaypointPathfindingMode>();

// Initialize it
waypointMode.Initialize(pathfindingManager);

// Call UpdateMode in your game loop
void Update()
{
    waypointMode.UpdateMode();
}
```

### Custom Mode Ideas

**Patrol Mode** — Cycle through waypoints continuously

```csharp
// When reaching last waypoint, loop back to first
if (currentWaypointIndex >= waypoints.Length)
{
    currentWaypointIndex = 0;
}
```

**Flee Mode** — Move away from a threat

```csharp
// Calculate position opposite to threat
var fleeDirection = (transform.position - threat.position).normalized;
var fleeTarget = transform.position + fleeDirection * fleeDistance;
manager.RequestPath(transform.position, fleeTarget);
```

**Random Wander Mode** — Pick random destinations

```csharp
// Pick random point within bounds
var randomPoint = new Vector3(
    Random.Range(minBounds.x, maxBounds.x),
    0,
    Random.Range(minBounds.z, maxBounds.z)
);
manager.RequestPath(transform.position, randomPoint);
```

**Formation Mode** — Maintain position relative to leader

```csharp
// Calculate offset position from leader
var formationTarget = leader.position + formationOffset;
manager.RequestPath(transform.position, formationTarget);
```

## Best Practices

### Choosing a Mode

- Use **MouseClick** during development for testing
- Use **TargetFollow** for production AI behavior
- Create **custom modes** for specific gameplay needs

### Performance Considerations

- **MouseClick** has minimal overhead (only calculates on click)
- **TargetFollow** needs throttling tuning for many agents
- Custom modes should implement smart recalculation logic

### Visual Debugging

Both built-in modes create visual markers. Disable these in production:

```csharp
// Markers are created as child objects
// Disable or destroy them when not needed
```

## See Also

- [Pathfinding Manager](../setup-guide/pathfinding-manager) — Manager setup and configuration
- [Events](../api-reference/events) — PathfindingModeChangedEvent details
- [Performance Tuning](./performance-tuning) — Throttling configuration