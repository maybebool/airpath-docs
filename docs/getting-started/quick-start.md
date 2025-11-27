---
sidebar_position: 3
---

# Quick Start
Explore the Demo scenes and get familiar with the core setup of Air Path.

## Try the Demo Scene first
AirPath includes demo scenes to help you understand the system:

### Mouse Click Mode

1. Navigate to `Assets/PlatypusIdeas/AirPath/Samples/Demo/Scenes/`
2. Open the demo scene based on your render pipeline
3. Press **Play**
4. Click on the terrain to set a start point
5. Click again to set an end point and calculate a path
6. Every additional click on the terrain now will be set as the new end point, while the current average position of the birds will be set as the new start point.

<img src={require('@site/static/img/ClickVersion.jpg').default} alt="How AirPath Works - Architecture Overview" width="500" />


### Switch to Target Follow Mode

1. Navigate to the `PathfindingManager > PathfindingCore` gameobject in the scene hierarchy.
<a href={require('@site/static/img/TargetFollowInsp.jpg').default} target="_blank">
  <img src={require('@site/static/img/TargetFollowInsp.jpg').default} alt="Target Follow Inspector" width="500" />
</a>
2. Change Starting Mode to Target Follow
3. Press **Play**
4. Watch the Target moving around the terrain, while the pathfinding system is updating the optimal path. 


<img src={require('@site/static/img/TargetFollowDemo.jpg').default} alt="How AirPath Works - Architecture Overview" width="500" />

## What's Next?

Keep exploring the demo scenes for an even better understanding. Or, move on to the **[Setup Guide](../category/setup-guide/)** section where all the core components are explained for your own setup.


