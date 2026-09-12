import React from 'react';
import {Composition} from 'remotion';
import {Hero} from './Hero';
import {FPS, DURATION} from './theme';
import {WhyNotChatbox, CHATBOX_DURATION} from './cutaway/WhyNotChatbox';
import {TheSplit, SPLIT_DURATION} from './cutaway/TheSplit';

// ReadmeHero is the README animation: absolute 1280x720 pixels, with the GIF
// produced by downscaling the render rather than by a second size. Leave it
// exactly as it is. The cutaways beside it are silent 1080p B-roll for the demo
// film, and share its tokens, fonts and workspace data.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="ReadmeHero"
      component={Hero}
      durationInFrames={DURATION}
      fps={FPS}
      width={1280}
      height={720}
    />
    <Composition
      id="WhyNotAChatbox"
      component={WhyNotChatbox}
      durationInFrames={CHATBOX_DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="TheSplit"
      component={TheSplit}
      durationInFrames={SPLIT_DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
