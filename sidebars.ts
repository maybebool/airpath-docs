import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      link: {
        type: 'generated-index',
        description: 'Get up and running with AirPath in minutes.',
      },
      collapsed: false,
      items: [
        'getting-started/requirements',
        'getting-started/installation',
        'getting-started/quick-start',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      link: {
        type: 'generated-index',
        description: 'Understand how AirPath works under the hood.',
      },
      items: [
        'core-concepts/architecture-overview',
        'core-concepts/grid-system',
        'core-concepts/pathfinding-algorithm',
        'core-concepts/configuration-system',
      ],
    },
    {
      type: 'category',
      label: 'Setup Guide',
      link: {
        type: 'generated-index',
        description: 'Step-by-step guides for configuring AirPath.',
      },
      items: [
        'setup-guide/terrain-setup',
        'setup-guide/pathfinding-manager',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      link: {
        type: 'generated-index',
        description: 'Complete API documentation for AirPath.',
      },
      items: [
        'api-reference/pathfinding-service',
        'api-reference/height-provider-interface',
        'api-reference/events',
        'api-reference/grid-utilities',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      link: {
        type: 'generated-index',
        description: 'Advanced topics and customization.',
      },
      items: [
        'advanced/performance-tuning',
        'advanced/pathfinding-modes',
        'advanced/swarm-integration',
        'advanced/extending-airpath',
      ],
    },
    'troubleshooting',
  ],
};

export default sidebars;
