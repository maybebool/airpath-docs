import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const heroBackgroundUrl = useBaseUrl('/img/HeaderBackground.png');
  
  return (
    <header 
      className={clsx('hero hero--primary', styles.heroBanner)}
      style={{backgroundImage: `url(${heroBackgroundUrl})`}}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/">
            Get Started →
          </Link>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Height-Aware Pathfinding',
    description: (
      <>
        Calculate 3D paths that consider terrain elevation. Agents prefer valleys 
        and gradual climbs over direct mountain crossings, producing natural-looking 
        flight paths.
      </>
    ),
  },
  {
    title: 'Burst-Compiled Performance',
    description: (
      <>
        Built on Unity DOTS with Burst-compiled A* jobs. Pathfinding runs on 
        separate threads, keeping your game responsive even with complex terrain.
      </>
    ),
  },
  {
    title: 'Flexible Integration',
    description: (
      <>
        Works with Unity Terrain out of the box, or implement the IHeightProvider 
        interface for custom terrain systems, procedural generation, or voxel worlds.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const demoImageUrl = useBaseUrl('/img/DemoImage.jpg');
  
  return (
    <Layout
      title={`${siteConfig.title} - Unity Aerial Pathfinding`}
      description="High-performance 3D aerial pathfinding for Unity, built on DOTS with Burst-compiled A* pathfinding.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        
        <section className={styles.demoSection}>
          <div className="container">
            <div className="row">
              <div className="col col--10 col--offset-1 text--center">
                <Heading as="h2">
                  See It In Action
                </Heading>
                <p style={{marginBottom: '2rem'}}>
                  Watch agents navigate complex 3D terrain with smooth, natural flight paths.
                </p>
                <img 
                  src={demoImageUrl} 
                  alt="AirPath Demo - Agents navigating terrain"
                  className={styles.demoImage}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
