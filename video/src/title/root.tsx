import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {FPS} from '../theme';
import {OpenScreen} from './OpenScreen';
import {EndCard} from './EndCard';

/*
  A SEPARATE Remotion entry point, the same reasoning as src/captions/root.tsx:
  nothing in this deliverable can disturb ReadmeHero, assets/readme/ or the two
  clips in demo/clips/, which other deliverables depend on byte-for-byte.

  Render the opening still:

    npx remotion still src/title/root.tsx open-screen \
      ../demo/open-screen.jpg --image-format=jpeg --jpeg-quality=100 --overwrite

  One frame is all this composition is for; the duration exists only because a
  Composition requires one.
*/

export const TitleRoot: React.FC = () => (
	<>
		<Composition
			id="open-screen"
			component={OpenScreen}
			durationInFrames={1}
			fps={FPS}
			width={1920}
			height={1080}
		/>
		{/* Part 6. Stills for iMovie, plus a 3s clip so it can be dropped
		    straight onto the timeline without setting a hold duration. */}
		<Composition
			id="end-card"
			component={EndCard}
			durationInFrames={FPS * 3}
			fps={FPS}
			width={1920}
			height={1080}
		/>
	</>
);

registerRoot(TitleRoot);
