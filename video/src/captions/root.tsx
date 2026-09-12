import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {FPS} from '../theme';
import {
	CAPTION_FRAMES,
	Cap1Invented,
	Cap2Rule,
	Cap3Approved,
	Cap4Declines,
	Cap5Repo,
} from './CaptionPill';

/*
  A SEPARATE Remotion entry point, deliberately.

  The caption pills are registered here rather than in src/Root.tsx so that
  nothing in this deliverable can disturb ReadmeHero, assets/readme/ or the two
  clips in demo/clips/, which other deliverables depend on byte-for-byte. Render
  against this file explicitly:

    npx remotion render src/captions/root.tsx cap-1-invented <out>.mov ...

  Every composition is at the footage resolution (1920x1080), because the pill's
  position is baked relative to the full frame and iMovie scales the whole canvas
  to fill. The pill itself is ~80px tall; the rest of the frame is transparent.
*/

const CAPS = [
	{id: 'cap-1-invented', component: Cap1Invented},
	{id: 'cap-2-rule', component: Cap2Rule},
	{id: 'cap-3-approved', component: Cap3Approved},
	{id: 'cap-4-declines', component: Cap4Declines},
	{id: 'cap-5-repo', component: Cap5Repo},
] as const;

export const CaptionsRoot: React.FC = () => (
	<>
		{CAPS.map((c) => (
			<Composition
				key={c.id}
				id={c.id}
				component={c.component}
				durationInFrames={CAPTION_FRAMES}
				fps={FPS}
				width={1920}
				height={1080}
			/>
		))}
	</>
);

registerRoot(CaptionsRoot);
