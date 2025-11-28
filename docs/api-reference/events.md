---
sidebar_position: 4
---

# Events

AirPath uses an event-driven architecture for communication between components. This allows loose coupling — components don't need direct references to each other.

## Namespace

```csharp
PlatypusIdeas.AirPath.Runtime.Events
```

## Event Bus Overview

The event system consists of three parts:

1. **PathfindingEventBus** — A ScriptableObject asset that manages subscriptions and event delivery
2. **EventBusUpdateHandler** — A MonoBehaviour that processes the event queue each frame
3. **Event Classes** — Data objects representing different events

### Setup

The event bus must be set up before use:

1. Create the asset: **Create → EventSystem → PathfindingEventBus**
2. Add `EventBusUpdateHandler` to your scene
3. Assign the asset to the handler's **Event Bus Asset** field

See [Custom Minimal Setup](../setup-guide/terrain-setup) for detailed instructions.

## Subscribing to Events

### Using Extension Methods (Recommended)

```csharp
using PlatypusIdeas.AirPath.Runtime.Events;
using UnityEngine;

public class PathListener : MonoBehaviour
{
    private void Start()
    {
        // Subscribe using extension method
        this.Subscribe<PathCalculatedEvent>(OnPathCalculated);
    }
    
    private void OnDestroy()
    {
        // Always unsubscribe when destroyed
        EventBusExtensions.Unsubscribe<PathCalculatedEvent>(OnPathCalculated);
    }
    
    private void OnPathCalculated(PathCalculatedEvent evt)
    {
        if (evt.Success)
        {
            Debug.Log($"Path calculated with {evt.WorldPath.Count} waypoints");
        }
    }
}
```

### Using the Event Bus Directly

```csharp
private void Start()
{
    if (PathfindingEventBus.HasInstance)
    {
        PathfindingEventBus.Instance.Subscribe<PathCalculatedEvent>(OnPathCalculated, this);
    }
}

private void OnDestroy()
{
    if (PathfindingEventBus.HasInstance)
    {
        PathfindingEventBus.Instance.Unsubscribe<PathCalculatedEvent>(OnPathCalculated);
    }
}
```

### Priority Subscriptions

Higher priority handlers are called first:

```csharp
// Called first (priority 10)
this.Subscribe<PathCalculatedEvent>(OnPathCalculatedHighPriority, priority: 10);

// Called second (priority 0, default)
this.Subscribe<PathCalculatedEvent>(OnPathCalculatedNormal);
```

## Publishing Events

```csharp
using PlatypusIdeas.AirPath.Runtime.Events;

// Using extension method
EventBusExtensions.Publish(new PathCalculatedEvent(result, worldPath, this));

// Using instance directly
if (PathfindingEventBus.HasInstance)
{
    PathfindingEventBus.Instance.Publish(new PathCalculatedEvent(result, worldPath, this));
}
```

## Event Reference

All events inherit from `PathfindingEventBase`:

```csharp
public abstract class PathfindingEventBase
{
    public float Timestamp { get; }    // Time.time when event was created
    public object Sender { get; }      // Object that published the event
}
```

---

### PathRequestedEvent

Fired when a path calculation is requested.

```csharp
public class PathRequestedEvent : PathfindingEventBase
{
    public PathRequest Request { get; }
    public PathfindingModeType RequestingMode { get; }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `Request` | `PathRequest` | Contains start/end positions, height offset, request ID |
| `RequestingMode` | `PathfindingModeType` | `MouseClick` or `TargetFollow` |

**Example:**

```csharp
this.Subscribe<PathRequestedEvent>(evt =>
{
    Debug.Log($"Path requested from {evt.RequestingMode} mode");
});
```

---

### PathCalculatedEvent

Fired when a path calculation completes (success or failure).

```csharp
public class PathCalculatedEvent : PathfindingEventBase
{
    public PathResult Result { get; }
    public List<Vector3> WorldPath { get; }
    public float CalculationTime { get; }
    public bool Success { get; }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `Result` | `PathResult` | Full result object with metadata |
| `WorldPath` | `List<Vector3>` | Path waypoints in world space (null if failed) |
| `CalculationTime` | `float` | Time taken to calculate in milliseconds |
| `Success` | `bool` | Whether a valid path was found |

**Example:**

```csharp
this.Subscribe<PathCalculatedEvent>(evt =>
{
    if (evt.Success)
    {
        Debug.Log($"Path found: {evt.WorldPath.Count} waypoints in {evt.CalculationTime}ms");
        
        // Use the path
        foreach (var waypoint in evt.WorldPath)
        {
            // Process waypoints...
        }
    }
    else
    {
        Debug.LogWarning("No path found!");
    }
});
```

---

### PathfindingModeChangedEvent

Fired when switching between pathfinding modes.

```csharp
public class PathfindingModeChangedEvent : PathfindingEventBase
{
    public PathfindingModeType PreviousMode { get; }
    public PathfindingModeType NewMode { get; }
    public IPathfindingMode ModeInstance { get; }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `PreviousMode` | `PathfindingModeType` | Mode before the change |
| `NewMode` | `PathfindingModeType` | Mode after the change |
| `ModeInstance` | `IPathfindingMode` | Instance of the new mode |

**Example:**

```csharp
this.Subscribe<PathfindingModeChangedEvent>(evt =>
{
    Debug.Log($"Mode changed: {evt.PreviousMode} → {evt.NewMode}");
    
    // Update UI based on new mode
    UpdateModeUI(evt.NewMode);
});
```

---

### BoundaryViolationEvent

Fired when a position is outside the pathfinding grid bounds.

```csharp
public class BoundaryViolationEvent : PathfindingEventBase
{
    public Vector2Int OriginalPosition { get; }
    public Vector2Int ClampedPosition { get; }
    public string ViolationType { get; }
    public bool WasAutoClamped { get; }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `OriginalPosition` | `Vector2Int` | The out-of-bounds position |
| `ClampedPosition` | `Vector2Int` | Position after clamping to valid bounds |
| `ViolationType` | `string` | Description of the violation |
| `WasAutoClamped` | `bool` | Whether auto-clamping was applied |

**Example:**

```csharp
this.Subscribe<BoundaryViolationEvent>(evt =>
{
    if (!evt.WasAutoClamped)
    {
        Debug.LogError($"Position {evt.OriginalPosition} is out of bounds!");
    }
});
```

---

### SwarmUpdateEvent

Fired for swarm-related updates.

```csharp
public class SwarmUpdateEvent : PathfindingEventBase
{
    public UpdateType Type { get; }
    public Vector3 Position { get; }
    public int BirdCount { get; }
    public object AdditionalData { get; }
    
    public enum UpdateType
    {
        BirdsSpawned,
        BirdsStartedPath,
        BirdReachedTarget,
        AllBirdsReachedTarget,
        SwarmPositionUpdated
    }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `Type` | `UpdateType` | Type of swarm update |
| `Position` | `Vector3` | Relevant position (e.g., swarm center) |
| `BirdCount` | `int` | Number of agents involved |
| `AdditionalData` | `object` | Optional extra data |

**Example:**

```csharp
this.Subscribe<SwarmUpdateEvent>(evt =>
{
    switch (evt.Type)
    {
        case SwarmUpdateEvent.UpdateType.AllBirdsReachedTarget:
            Debug.Log("All agents reached destination!");
            break;
            
        case SwarmUpdateEvent.UpdateType.SwarmPositionUpdated:
            UpdateSwarmUI(evt.Position);
            break;
    }
});
```

---

### VisualizationUpdateEvent

Fired when visualization state changes.

```csharp
public class VisualizationUpdateEvent : PathfindingEventBase
{
    public UpdateType Type { get; }
    public object Data { get; }
    
    public enum UpdateType
    {
        PathLineUpdated,
        MarkersUpdated,
        GridCellsUpdated,
        DebugVisualizationToggled,
        VisualizationCleared
    }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `Type` | `UpdateType` | Type of visualization update |
| `Data` | `object` | Optional data related to the update |

---

### ConfigurationChangedEvent

Fired when a configuration ScriptableObject changes.

```csharp
public class ConfigurationChangedEvent : PathfindingEventBase
{
    public ConfigurationBase Configuration { get; }
    public string ConfigurationType { get; }
    public bool RequiresRecalculation { get; }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `Configuration` | `ConfigurationBase` | The changed configuration asset |
| `ConfigurationType` | `string` | Type name (e.g., "PathfindingConfiguration") |
| `RequiresRecalculation` | `bool` | Whether pathfinding grid needs rebuild |

**Example:**

```csharp
this.Subscribe<ConfigurationChangedEvent>(evt =>
{
    if (evt.RequiresRecalculation)
    {
        Debug.Log($"{evt.ConfigurationType} changed - recalculating...");
    }
});
```

---

### PathfindingErrorEvent

Base class for error events.

```csharp
public abstract class PathfindingErrorEvent : PathfindingEventBase
{
    public string ErrorMessage { get; }
    public Exception Exception { get; }
    public bool IsCritical { get; }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `ErrorMessage` | `string` | Human-readable error description |
| `Exception` | `Exception` | The exception if one occurred |
| `IsCritical` | `bool` | Whether this error is critical |

## Event Bus Configuration

The `PathfindingEventBus` asset has these settings:

| Setting | Default | Description |
|---------|---------|-------------|
| **Enable Event Logging** | false | Log all subscribe/publish operations |
| **Process Events Immediately** | true | Process events immediately vs. queued |
| **Max Events Per Frame** | 10 | Max queued events processed per frame |

## Best Practices

### Always Unsubscribe

```csharp
private void OnDestroy()
{
    // Prevents memory leaks and errors
    EventBusExtensions.Unsubscribe<PathCalculatedEvent>(OnPathCalculated);
}
```

### Check HasInstance

```csharp
// Safe for scene transitions
if (PathfindingEventBus.HasInstance)
{
    EventBusExtensions.Publish(myEvent);
}
```

### Use Sender for Filtering

```csharp
this.Subscribe<PathCalculatedEvent>(evt =>
{
    // Only handle events from a specific source
    if (evt.Sender == myPathfindingManager)
    {
        ProcessPath(evt.WorldPath);
    }
});
```

### Debug with Event Logging

Enable **Event Logging** on the `PathfindingEventBus` asset to see all event activity in the console.

## See Also

- [Custom Minimal Setup](../setup-guide/terrain-setup) — Event bus setup
- [PathfindingManager](../setup-guide/pathfinding-manager) — Main event publisher
- [Swarm Integration](../advanced/swarm-integration) — Using swarm events