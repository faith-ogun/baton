import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C} from '../theme';
import {SERIF, SANS, MONO} from '../fonts';

/*
  The demo film's opening title card. One still, 1920x1080, rendered to JPEG.

  It is a title card, not a poster: four elements, centred, on the product's own
  dark ground. The ground is the exact wash used by Hero.tsx and the cutaways,
  so the first frame a judge sees is already the app's room.

  Orange appears once as ornament, the baton rule, sitting between the lockup
  and the slogan. The lockup carries its own orange (the baton, the sun disc);
  nothing else in the frame is allowed any.
*/

export const OpenScreen: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: C.navy}}>
		{/* the product's ground wash, verbatim from Hero.tsx */}
		<AbsoluteFill
			style={{
				background:
					'radial-gradient(120% 90% at 26% 26%, rgba(45,82,115,0.30) 0%, rgba(15,34,56,0) 62%)',
			}}
		/>
		{/* a floor shadow, so the stack sits in the room rather than on it */}
		<AbsoluteFill
			style={{
				background:
					'radial-gradient(100% 70% at 50% 108%, rgba(6,14,24,0.55) 0%, rgba(6,14,24,0) 60%)',
			}}
		/>

		{/* the centred stack. Nudged up by 26px so the quiet event line at the
		    bottom does not drag the optical centre down. */}
		<AbsoluteFill
			style={{
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				transform: 'translateY(-26px)',
			}}
		>
			<Img
				src={staticFile('baton-logo-reversed.png')}
				style={{height: 396, width: 'auto'}}
			/>

			{/* the baton rule: a 3px orange bar with round caps, the one piece of
			    ornament the system allows. Horizontal here, so the gradient runs
			    left to right like .baton-rule in web/src/index.css. */}
			<span
				style={{
					display: 'block',
					width: 96,
					height: 3,
					borderRadius: 999,
					marginTop: 46,
					background: `linear-gradient(90deg, ${C.orange} 0%, ${C.orangeBright} 100%)`,
				}}
			/>

			<div
				style={{
					marginTop: 42,
					fontFamily: SERIF,
					fontStyle: 'italic',
					fontWeight: 600,
					fontSize: 54,
					lineHeight: '64px',
					letterSpacing: 0.2,
					color: C.cream,
				}}
			>
				Never drop the baton.
			</div>

			<div
				style={{
					marginTop: 26,
					fontFamily: SANS,
					fontWeight: 400,
					fontSize: 27,
					lineHeight: '36px',
					letterSpacing: -0.1,
					color: 'rgba(243, 238, 228, 0.62)', // cream, dimmed
				}}
			>
				An AI coworker that catches the work about to fall through the cracks.
			</div>
		</AbsoluteFill>

		{/* the event line, small and quiet, pinned to the bottom */}
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 66}}>
			<div
				style={{
					fontFamily: MONO,
					fontWeight: 400,
					fontSize: 18,
					letterSpacing: 1.6,
					color: 'rgba(138, 150, 163, 0.85)', // C.grey, dimmed
				}}
			>
				Agents, Everywhere · AI Tinkerers x OpenAI · Paris 2026
			</div>
		</AbsoluteFill>
	</AbsoluteFill>
);
