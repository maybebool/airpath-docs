import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'AirPath',
  tagline: 'High-Performance 3D Aerial Pathfinding for Unity',
  favicon: 'img/LogoAirPath.svg',
  

  future: {
    v4: true,
  },

  // GitHub Pages deployment
  url: 'https://maybebool.github.io',
  baseUrl: '/airpath-docs/',

  // GitHub pages deployment config
  organizationName: 'maybebool',
  projectName: 'airpath-docs',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/maybebool/airpath-docs/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/maybebool/airpath-docs/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/airpath-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'AirPath',
      logo: {
        alt: 'AirPath Logo',
        src: 'img/LogoAirPath.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/blog',
          label: 'Changelog',
          position: 'left'
        },
        {
          href: 'https://github.com/maybebool/airpath-docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/category/getting-started',
            },
            {
              label: 'API Reference',
              to: '/docs/category/api-reference',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Unity Asset Store',
              href: '#', // TODO: Add Asset Store link when published
            },
            {
              label: 'GitHub',
              href: 'https://github.com/maybebool/airpath-docs',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Changelog',
              to: '/blog',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Platypus Ideas. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['csharp', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
