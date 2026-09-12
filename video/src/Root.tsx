import React from 'react';
import {Composition} from 'remotion';
import {Hero} from './Hero';
import {FPS, DURATION} from './theme';

// One composition only. The layout is in absolute 1280x720 pixels, so the GIF
// is produced by downscaling the render rather than by a second size.
export const RemotionRoot: React.FC = () => (
  <Composition
    id="ReadmeHero"
    component={Hero}
    durationInFrames={DURATION}
    fps={FPS}
    width={1280}
    height={720}
  />
);
