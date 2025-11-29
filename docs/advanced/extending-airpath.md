---
sidebar_position: 4
---

# Extending AirPath

AirPath is designed to be extensible. This guide covers common extension points and patterns for customizing the system to your needs.

## Extension Points Overview

| Extension Point | Interface/Base Class | Use Case |
|-----------------|---------------------|----------|
| Height Provider | `IHeightProvider` | Custom terrain sources |
| Pathfinding Mode | Component pattern | Custom start/end selection |
| Agent | Component pattern | Custom movement behavior |
| Configuration | `ConfigurationBase` | Custom settings assets |
| Event Listener | `Subscribe<T>()` | Custom reactions to events |

## Custom Height Providers

The most common extension is creating custom height providers for non-Unity-Terrain scenarios.

### Interface Definition

```csharp
public interface IHeightProvider
{
    float CellSize { get; }
    Vector3 Origin { get; }
    int GridWidth { get; }
    int GridHeight { get; }
    
    float GetHeightAt(int x, int y);
    float[] SampleHeights(int samplesPerDimension);
}
```

### Example: Perlin Noise Terrain

```csharp
using UnityEngine;
using PlatypusIdeas.AirPath.Runtime.Core.Height;

public class PerlinHeightProvider : MonoBehaviour, IHeightProvider
{
    [Header("Grid Settings")]
    [SerializeField] private float worldSize = 500f;
    [SerializeField] private int resolution = 64;
    
    [Header("Noise Settings")]
    [SerializeField] private float noiseScale = 0.02f;
    [SerializeField] private float heightMultiplier = 50f;
    [SerializeField] private Vector2 noiseOffset;
    
    private float[] _cachedHeights;
    
    public float CellSize => worldSize / resolution;
    public Vector3 Origin => transform.position;
    public int GridWidth => resolution;
    public int GridHeight => resolution;
    
    public float GetHeightAt(int x, int y)
    {
        if (x < 0 || x >= resolution || y < 0 || y >= resolution)
            return 0f;
        
        float worldX = Origin.x + x * CellSize;
        float worldZ = Origin.z + y * CellSize;
        
        float noise = Mathf.PerlinNoise(
            (worldX + noiseOffset.x) * noiseScale,
            (worldZ + noiseOffset.y) * noiseScale
        );
        
        return noise * heightMultiplier;
    }
    
    public float[] SampleHeights(int samplesPerDimension)
    {
        var heights = new float[samplesPerDimension * samplesPerDimension];
        
        for (int y = 0; y < samplesPerDimension; y++)
        {
            for (int x = 0; x < samplesPerDimension; x++)
            {
                int index = y * samplesPerDimension + x;
                heights[index] = GetHeightAt(x, y);
            }
        }
        
        _cachedHeights = heights;
        return heights;
    }
}
```

### Example: Mesh-Based Height Provider

```csharp
using UnityEngine;
using PlatypusIdeas.AirPath.Runtime.Core.Height;

public class MeshHeightProvider : MonoBehaviour, IHeightProvider
{
    [SerializeField] private MeshCollider meshCollider;
    [SerializeField] private float worldSize = 100f;
    [SerializeField] private int resolution = 64;
    [SerializeField] private float raycastHeight = 100f;
    
    public float CellSize => worldSize / resolution;
    public Vector3 Origin => transform.position;
    public int GridWidth => resolution;
    public int GridHeight => resolution;
    
    public float GetHeightAt(int x, int y)
    {
        float worldX = Origin.x + x * CellSize + CellSize * 0.5f;
        float worldZ = Origin.z + y * CellSize + CellSize * 0.5f;
        
        var rayOrigin = new Vector3(worldX, raycastHeight, worldZ);
        
        if (Physics.Raycast(rayOrigin, Vector3.down, out RaycastHit hit, raycastHeight * 2f))
        {
            return hit.point.y;
        }
        
        return 0f;
    }
    
    public float[] SampleHeights(int samplesPerDimension)
    {
        var heights = new float[samplesPerDimension * samplesPerDimension];
        
        for (int y = 0; y < samplesPerDimension; y++)
        {
            for (int x = 0; x < samplesPerDimension; x++)
            {
                heights[y * samplesPerDimension + x] = GetHeightAt(x, y);
            }
        }
        
        return heights;
    }
}
```

### Example: Flat Plane Provider

```csharp
public class FlatHeightProvider : MonoBehaviour, IHeightProvider
{
    [SerializeField] private float worldSize = 100f;
    [SerializeField] private int resolution = 64;
    [SerializeField] private float constantHeight = 0f;
    
    public float CellSize => worldSize / resolution;
    public Vector3 Origin => transform.position;
    public int GridWidth => resolution;
    public int GridHeight => resolution;
    
    public float GetHeightAt(int x, int y) => constantHeight;
    
    public float[] SampleHeights(int samplesPerDimension)
    {
        var heights = new float[samplesPerDimension * samplesPerDimension];
        
        for (int i = 0; i < heights.Length; i++)
        {
            heights[i] = constantHeight;
        }
        
        return heights;
    }
}
```

### Height Provider Guidelines

- **Cache heights** when possible — `SampleHeights()` is called during initialization
- **Handle out-of-bounds** gracefully — return 0 or clamp to valid range
- **Thread safety** — `GetHeightAt()` may be called from jobs (avoid Unity API)
- **Origin alignment** — Ensure `Origin` matches your world setup

## Custom Pathfinding Modes

Create modes for specific gameplay needs.

### Pattern

```csharp
public class CustomPathfindingMode : MonoBehaviour
{
    private PathfindingManager _manager;
    
    public void Initialize(PathfindingManager manager)
    {
        _manager = manager;
    }
    
    public void UpdateMode()
    {
        // Your logic to determine start/end positions
        // Call _manager.RequestPath(start, end) when appropriate
    }
    
    public void Cleanup()
    {
        // Clean up resources
    }
}
```

### Example: Waypoint Patrol Mode

```csharp
using System.Collections.Generic;
using UnityEngine;
using PlatypusIdeas.AirPath.Runtime.Core.Pathfinding;
using PlatypusIdeas.AirPath.Runtime.Events;

public class PatrolMode : MonoBehaviour
{
    [SerializeField] private List<Transform> waypoints;
    [SerializeField] private float arrivalDistance = 3f;
    [SerializeField] private bool loop = true;
    
    private PathfindingManager _manager;
    private int _currentWaypointIndex;
    private Vector3 _lastPosition;
    
    public void Initialize(PathfindingManager manager)
    {
        _manager = manager;
        _currentWaypointIndex = 0;
        
        this.Subscribe<PathCalculatedEvent>(OnPathCalculated);
        
        RequestPathToCurrentWaypoint();
    }
    
    public void UpdateMode()
    {
        if (waypoints == null || waypoints.Count == 0)
            return;
        
        // Check if reached current waypoint
        var currentWaypoint = waypoints[_currentWaypointIndex];
        var distance = Vector3.Distance(_lastPosition, currentWaypoint.position);
        
        if (distance < arrivalDistance)
        {
            AdvanceToNextWaypoint();
        }
    }
    
    private void AdvanceToNextWaypoint()
    {
        _currentWaypointIndex++;
        
        if (_currentWaypointIndex >= waypoints.Count)
        {
            if (loop)
            {
                _currentWaypointIndex = 0;
            }
            else
            {
                Debug.Log("Patrol complete");
                return;
            }
        }
        
        RequestPathToCurrentWaypoint();
    }
    
    private void RequestPathToCurrentWaypoint()
    {
        if (waypoints == null || waypoints.Count == 0)
            return;
        
        var start = _manager.transform.position;
        var end = waypoints[_currentWaypointIndex].position;
        
        // Use PathfindingService directly or trigger via manager
        Debug.Log($"Requesting path to waypoint {_currentWaypointIndex}");
    }
    
    private void OnPathCalculated(PathCalculatedEvent evt)
    {
        if (evt.Success && evt.WorldPath.Count > 0)
        {
            _lastPosition = evt.WorldPath[evt.WorldPath.Count - 1];
        }
    }
    
    public void Cleanup()
    {
        EventBusExtensions.Unsubscribe<PathCalculatedEvent>(OnPathCalculated);
    }
}
```

### Example: Click-to-Move Mode (RTS Style)

```csharp
using UnityEngine;
using PlatypusIdeas.AirPath.Runtime.Core.Pathfinding;

public class ClickToMoveMode : MonoBehaviour
{
    [SerializeField] private Camera gameCamera;
    [SerializeField] private LayerMask groundLayer;
    [SerializeField] private KeyCode moveKey = KeyCode.Mouse1;
    
    private PathfindingManager _manager;
    private PathfindingService _pathfindingService;
    
    public void Initialize(PathfindingManager manager, PathfindingService service)
    {
        _manager = manager;
        _pathfindingService = service;
        
        if (gameCamera == null)
            gameCamera = Camera.main;
    }
    
    public void UpdateMode()
    {
        if (Input.GetKeyDown(moveKey))
        {
            TryMoveToMousePosition();
        }
    }
    
    private void TryMoveToMousePosition()
    {
        var ray = gameCamera.ScreenPointToRay(Input.mousePosition);
        
        if (Physics.Raycast(ray, out RaycastHit hit, 1000f, groundLayer))
        {
            var start = _manager.transform.position;
            var end = hit.point;
            
            var result = _pathfindingService.CalculatePath(start, end, 10f);
            
            if (result.Success)
            {
                Debug.Log($"Path found with {result.Path.Count} waypoints");
                // Dispatch path to your movement system
            }
        }
    }
}
```

## Custom Agents

Build agents with specific movement behaviors.

### Minimal Agent Template

```csharp
using System.Collections.Generic;
using UnityEngine;

public abstract class BaseAgent : MonoBehaviour
{
    public abstract Vector3 CurrentPosition { get; }
    public abstract void SetPath(List<Vector3> path, bool teleportToStart = true);
    public abstract void StopMovement();
}
```

### Example: Vehicle Agent (Ground-Based)

```csharp
using System.Collections.Generic;
using UnityEngine;

public class VehicleAgent : BaseAgent
{
    [SerializeField] private float maxSpeed = 15f;
    [SerializeField] private float acceleration = 5f;
    [SerializeField] private float turnSpeed = 90f;
    [SerializeField] private float waypointRadius = 3f;
    
    private List<Vector3> _path;
    private int _currentIndex;
    private float _currentSpeed;
    private bool _isMoving;
    
    public override Vector3 CurrentPosition => transform.position;
    
    public override void SetPath(List<Vector3> path, bool teleportToStart = true)
    {
        _path = new List<Vector3>(path);
        _currentIndex = 0;
        _currentSpeed = 0f;
        _isMoving = true;
        
        if (teleportToStart && _path.Count > 0)
        {
            transform.position = _path[0];
            _currentIndex = 1;
        }
    }
    
    public override void StopMovement()
    {
        _isMoving = false;
        _currentSpeed = 0f;
    }
    
    private void Update()
    {
        if (!_isMoving || _path == null || _currentIndex >= _path.Count)
            return;
        
        var target = _path[_currentIndex];
        target.y = transform.position.y; // Keep on ground
        
        var direction = (target - transform.position).normalized;
        
        // Rotate toward target
        if (direction != Vector3.zero)
        {
            var targetRotation = Quaternion.LookRotation(direction);
            transform.rotation = Quaternion.RotateTowards(
                transform.rotation,
                targetRotation,
                turnSpeed * Time.deltaTime
            );
        }
        
        // Accelerate/decelerate based on angle to target
        var angleToTarget = Vector3.Angle(transform.forward, direction);
        var speedMultiplier = Mathf.Clamp01(1f - angleToTarget / 90f);
        
        var targetSpeed = maxSpeed * speedMultiplier;
        _currentSpeed = Mathf.MoveTowards(_currentSpeed, targetSpeed, acceleration * Time.deltaTime);
        
        // Move forward
        transform.position += transform.forward * _currentSpeed * Time.deltaTime;
        
        // Check waypoint arrival
        if (Vector3.Distance(transform.position, target) < waypointRadius)
        {
            _currentIndex++;
            
            if (_currentIndex >= _path.Count)
            {
                StopMovement();
            }
        }
    }
}
```

### Example: Flying Agent with Banking

```csharp
using System.Collections.Generic;
using UnityEngine;

public class BankingFlyerAgent : BaseAgent
{
    [SerializeField] private float moveSpeed = 20f;
    [SerializeField] private float turnSpeed = 3f;
    [SerializeField] private float maxBankAngle = 45f;
    [SerializeField] private float bankSpeed = 2f;
    [SerializeField] private float waypointRadius = 5f;
    
    [SerializeField] private Transform modelTransform; // Child with visual
    
    private List<Vector3> _path;
    private int _currentIndex;
    private bool _isMoving;
    private float _currentBank;
    
    public override Vector3 CurrentPosition => transform.position;
    
    public override void SetPath(List<Vector3> path, bool teleportToStart = true)
    {
        _path = new List<Vector3>(path);
        _currentIndex = 0;
        _isMoving = true;
        
        if (teleportToStart && _path.Count > 0)
        {
            transform.position = _path[0];
            if (_path.Count > 1)
            {
                transform.LookAt(_path[1]);
            }
        }
    }
    
    public override void StopMovement()
    {
        _isMoving = false;
    }
    
    private void Update()
    {
        if (!_isMoving || _path == null || _currentIndex >= _path.Count)
            return;
        
        var target = _path[_currentIndex];
        var direction = (target - transform.position).normalized;
        
        // Calculate turn direction for banking
        var turnDirection = Vector3.Cross(transform.forward, direction).y;
        var targetBank = -turnDirection * maxBankAngle;
        _currentBank = Mathf.Lerp(_currentBank, targetBank, bankSpeed * Time.deltaTime);
        
        // Apply banking to model
        if (modelTransform != null)
        {
            modelTransform.localRotation = Quaternion.Euler(0, 0, _currentBank);
        }
        
        // Rotate toward target
        var targetRotation = Quaternion.LookRotation(direction);
        transform.rotation = Quaternion.Slerp(
            transform.rotation,
            targetRotation,
            turnSpeed * Time.deltaTime
        );
        
        // Move forward
        transform.position += transform.forward * moveSpeed * Time.deltaTime;
        
        // Check waypoint arrival
        if (Vector3.Distance(transform.position, target) < waypointRadius)
        {
            _currentIndex++;
            
            if (_currentIndex >= _path.Count)
            {
                StopMovement();
            }
        }
    }
}
```

## Custom Configurations

Extend `ConfigurationBase` for your own settings.

### Pattern

```csharp
using UnityEngine;
using PlatypusIdeas.AirPath.Runtime.Configuration;

[CreateAssetMenu(menuName = "Pathfinding/Configurations/My Custom Config")]
public class MyCustomConfiguration : ConfigurationBase
{
    [Header("My Settings")]
    [SerializeField] private float myValue = 10f;
    [SerializeField] private bool myFlag = true;
    
    public float MyValue => myValue;
    public bool MyFlag => myFlag;
    
    public override bool Validate()
    {
        bool valid = true;
        
        if (myValue < 0)
        {
            Debug.LogWarning($"[{ConfigurationName}] MyValue cannot be negative");
            myValue = 0;
            valid = false;
        }
        
        return valid;
    }
    
    public override void ResetToDefaults()
    {
        myValue = 10f;
        myFlag = true;
    }
}
```

### Example: Difficulty Configuration

```csharp
[CreateAssetMenu(menuName = "Pathfinding/Configurations/Difficulty Config")]
public class DifficultyConfiguration : ConfigurationBase
{
    [Header("AI Settings")]
    [SerializeField, Range(0.5f, 2f)] private float aiSpeedMultiplier = 1f;
    [SerializeField, Range(0.1f, 1f)] private float pathUpdateFrequency = 0.5f;
    [SerializeField] private bool aiUsesShortcuts = false;
    
    [Header("Player Assistance")]
    [SerializeField] private bool showPathPreview = true;
    [SerializeField] private float pathPreviewDistance = 50f;
    
    public float AISpeedMultiplier => aiSpeedMultiplier;
    public float PathUpdateFrequency => pathUpdateFrequency;
    public bool AIUsesShortcuts => aiUsesShortcuts;
    public bool ShowPathPreview => showPathPreview;
    public float PathPreviewDistance => pathPreviewDistance;
    
    public override bool Validate()
    {
        return true;
    }
    
    public override void ResetToDefaults()
    {
        aiSpeedMultiplier = 1f;
        pathUpdateFrequency = 0.5f;
        aiUsesShortcuts = false;
        showPathPreview = true;
        pathPreviewDistance = 50f;
    }
}
```

## Event System Integration

Build reactive systems using the event bus.

### Subscribing to Events

```csharp
using PlatypusIdeas.AirPath.Runtime.Events;

public class PathfindingAnalytics : MonoBehaviour
{
    private int _totalPathsCalculated;
    private float _totalCalculationTime;
    private int _failedPaths;
    
    private void Start()
    {
        this.Subscribe<PathCalculatedEvent>(OnPathCalculated);
        this.Subscribe<PathfindingErrorEvent>(OnError);
        this.Subscribe<BoundaryViolationEvent>(OnBoundaryViolation);
    }
    
    private void OnDestroy()
    {
        EventBusExtensions.Unsubscribe<PathCalculatedEvent>(OnPathCalculated);
        EventBusExtensions.Unsubscribe<PathfindingErrorEvent>(OnError);
        EventBusExtensions.Unsubscribe<BoundaryViolationEvent>(OnBoundaryViolation);
    }
    
    private void OnPathCalculated(PathCalculatedEvent evt)
    {
        _totalPathsCalculated++;
        _totalCalculationTime += evt.CalculationTime;
        
        if (!evt.Success)
            _failedPaths++;
        
        Debug.Log($"Paths: {_totalPathsCalculated}, " +
                  $"Avg Time: {_totalCalculationTime / _totalPathsCalculated:F2}ms, " +
                  $"Failed: {_failedPaths}");
    }
    
    private void OnError(PathfindingErrorEvent evt)
    {
        Debug.LogError($"Pathfinding error: {evt.ErrorMessage}");
        
        if (evt.IsCritical)
        {
            // Handle critical errors
        }
    }
    
    private void OnBoundaryViolation(BoundaryViolationEvent evt)
    {
        Debug.LogWarning($"Boundary violation at {evt.OriginalPosition}, " +
                        $"clamped to {evt.ClampedPosition}");
    }
}
```

### Publishing Custom Events

```csharp
// Define custom event
public class CustomPathEvent
{
    public Vector3 Position { get; }
    public string Message { get; }
    
    public CustomPathEvent(Vector3 position, string message)
    {
        Position = position;
        Message = message;
    }
}

// Publish
EventBusExtensions.Publish(new CustomPathEvent(
    transform.position,
    "Agent reached checkpoint"
));

// Subscribe
this.Subscribe<CustomPathEvent>(evt =>
{
    Debug.Log($"{evt.Message} at {evt.Position}");
});
```

## Integration Patterns

### With Animation System

```csharp
public class AnimatedAgent : MonoBehaviour
{
    [SerializeField] private Animator animator;
    [SerializeField] private float moveSpeed = 5f;
    
    private static readonly int SpeedHash = Animator.StringToHash("Speed");
    private static readonly int FlyingHash = Animator.StringToHash("IsFlying");
    
    private List<Vector3> _path;
    private int _currentIndex;
    private float _currentSpeed;
    
    public void SetPath(List<Vector3> path)
    {
        _path = path;
        _currentIndex = 0;
        animator.SetBool(FlyingHash, true);
    }
    
    private void Update()
    {
        if (_path == null || _currentIndex >= _path.Count)
        {
            _currentSpeed = Mathf.Lerp(_currentSpeed, 0f, Time.deltaTime * 5f);
            animator.SetFloat(SpeedHash, _currentSpeed);
            return;
        }
        
        // Movement logic...
        _currentSpeed = Mathf.Lerp(_currentSpeed, moveSpeed, Time.deltaTime * 3f);
        animator.SetFloat(SpeedHash, _currentSpeed);
    }
    
    private void OnPathComplete()
    {
        animator.SetBool(FlyingHash, false);
    }
}
```

### With Behavior Tree / FSM

```csharp
// Example integration point for behavior trees
public class PathfindingBTNode
{
    private PathfindingService _pathfindingService;
    private List<Vector3> _currentPath;
    
    public bool HasPath => _currentPath != null && _currentPath.Count > 0;
    public List<Vector3> CurrentPath => _currentPath;
    
    public bool RequestPath(Vector3 start, Vector3 end, float heightOffset)
    {
        var result = _pathfindingService.CalculatePath(start, end, heightOffset);
        
        if (result.Success)
        {
            _currentPath = result.Path;
            return true;
        }
        
        _currentPath = null;
        return false;
    }
    
    public void ClearPath()
    {
        _currentPath = null;
    }
}
```

### With Object Pooling

```csharp
public class PooledAgentManager : MonoBehaviour
{
    [SerializeField] private GameObject agentPrefab;
    [SerializeField] private int poolSize = 20;
    
    private Queue<GameObject> _pool = new();
    private List<GameObject> _activeAgents = new();
    
    private void Start()
    {
        // Pre-populate pool
        for (int i = 0; i < poolSize; i++)
        {
            var agent = Instantiate(agentPrefab, transform);
            agent.SetActive(false);
            _pool.Enqueue(agent);
        }
        
        this.Subscribe<PathCalculatedEvent>(OnPathCalculated);
    }
    
    public GameObject SpawnAgent(Vector3 position)
    {
        GameObject agent;
        
        if (_pool.Count > 0)
        {
            agent = _pool.Dequeue();
        }
        else
        {
            agent = Instantiate(agentPrefab, transform);
        }
        
        agent.transform.position = position;
        agent.SetActive(true);
        _activeAgents.Add(agent);
        
        return agent;
    }
    
    public void ReturnAgent(GameObject agent)
    {
        agent.SetActive(false);
        _activeAgents.Remove(agent);
        _pool.Enqueue(agent);
    }
    
    private void OnPathCalculated(PathCalculatedEvent evt)
    {
        // Assign path to active agents
        foreach (var agent in _activeAgents)
        {
            var agentComponent = agent.GetComponent<BaseAgent>();
            agentComponent?.SetPath(evt.WorldPath, teleportToStart: false);
        }
    }
}
```

## Best Practices

### Keep Extensions Loosely Coupled

- Use events instead of direct references where possible
- Implement interfaces rather than inheriting from concrete classes
- Use ScriptableObjects for configuration

### Test Extensions Thoroughly

- Verify height providers return sensible values at boundaries
- Test pathfinding modes with edge cases (no path found, target out of bounds)
- Profile custom agents for performance

### Document Your Extensions

- Add XML documentation to public methods
- Include usage examples in comments
- Create configuration tooltips with `[Tooltip("...")]`

### Follow AirPath Patterns

- Use the event bus for cross-system communication
- Extend `ConfigurationBase` for settings
- Implement `Validate()` for configuration validation

## See Also

- [Height Provider Interface](../api-reference/height-provider-interface) — Interface details
- [Pathfinding Modes](./pathfinding-modes) — Built-in mode reference
- [Swarm Integration](./swarm-integration) — Agent implementation examples
- [Events](../api-reference/events) — Complete event reference