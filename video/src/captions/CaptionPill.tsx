import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../theme';
import {SANS, MONO} from '../fonts';

/*
  Branded inset caption pills for the Baton demo film.

  Each pill is ONE <Composition> at the full 1920x1080 footage resolution, with a
  transparent frame and a single pill anchored bottom-centre. That is the skill's
  rule and it is load-bearing: in iMovie you drop the MOV above the footage,
  choose Picture-in-Picture, and size the box to FILL the frame, at which point
  the pill lands at the position baked here. A pill cropped to its own size would
  be stretched to full frame instead. The PILL is sized to its text (inline-flex,
  ~80px tall); only the transparent canvas around it is 1920x1080.

  Render each as alpha ProRes 4444. All four flags matter or the ground comes out
  opaque black:

    npx remotion render src/captions/root.tsx <id> out.mov \
      --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png
*/

export const CAPTION_FRAMES = 150; // 5s at 30fps; Faith trims in the edit

// A caption is a run of segments so a single word can carry colour without
// breaking the line. Colour discipline, which is the thing not to get wrong:
// red is only ever STATE, orange is only ever ACTION or emphasis, purple is
// only ever BATON DID THIS. Grey is de-emphasis, not a semantic, so it is the
// only other colour allowed and it only ever dims a separator.
type Seg = {t: string; color?: string};

const cream = C.cream;

// ── the pill ────────────────────────────────────────────────────────────────
// navy ground at high but not full opacity, so a hint of the footage reads
// through and the pill sits IN the recording rather than on top of it.
const NAVY_GROUND = 'rgba(15, 34, 56, 0.92)'; // C.navy #0F2238 at 92%

const Pill: React.FC<{segs: Seg[]; mono?: boolean}> = ({segs, mono = false}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	// A gentle fade and slide in over 8 frames, a long hold, then a fade out.
	// No spring: these sit under a voice-over and must not draw the eye twice.
	const enter = interpolate(frame, [0, 8], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});
	const exit = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.in(Easing.quad),
	});

	return (
		<AbsoluteFill
			style={{
				// NO backgroundColor anywhere in this tree. Transparency is the point.
				justifyContent: 'flex-end',
				alignItems: 'center',
				paddingBottom: 96,
				opacity: enter * exit,
			}}
		>
			<div
				style={{
					transform: `translateY(${(1 - enter) * 14}px)`,
					display: 'inline-flex',
					alignItems: 'center',
					gap: 22,
					background: NAVY_GROUND,
					border: `1px solid rgba(243, 238, 228, 0.30)`, // cream hairline
					borderRadius: 999, // fully rounded ends
					padding: mono ? '21px 46px' : '19px 46px', // generous horizontal padding
					boxShadow: '0 14px 40px rgba(6, 14, 24, 0.44), 0 2px 6px rgba(6, 14, 24, 0.30)',
					whiteSpace: 'nowrap',
				}}
			>
				{/* The signature move: the baton rule. A 3px orange bar with round
				    caps at the left end of every pill, gradient accent -> lift, the
				    same as .baton-rule in web/src/index.css. */}
				<span
					style={{
						display: 'block',
						flexShrink: 0,
						width: 3,
						height: mono ? 26 : 30,
						borderRadius: 999,
						background: `linear-gradient(180deg, ${C.orange} 0%, ${C.orangeBright} 100%)`,
					}}
				/>
				<span
					style={{
						fontFamily: mono ? MONO : SANS,
						fontSize: mono ? 26 : 30,
						fontWeight: 500,
						lineHeight: mono ? '34px' : '38px',
						letterSpacing: mono ? 0 : -0.2,
						color: cream,
					}}
				>
					{segs.map((s, i) => (
						<span key={i} style={s.color ? {color: s.color} : undefined}>
							{s.t}
						</span>
					))}
				</span>
			</div>
		</AbsoluteFill>
	);
};

// ── the five captions, verbatim from demo/demo-script-baton.md ──────────────

/** 1. Scope guardrail. Sentence, so Inter. No colour: nothing here is state,
 *  action or Baton. */
export const Cap1Invented: React.FC = () => (
	<Pill segs={[{t: 'Aldermere Bio is invented. The workspace and its records are real.'}]} />
);

/** 2. The fired rule. An identifier and numbers, so mono. `spof` is the risk
 *  STATE, so it is the one red thing; the separators grey down. */
export const Cap2Rule: React.FC = () => (
	<Pill
		mono
		segs={[
			{t: 'spof', color: C.red},
			{t: ' · ', color: C.grey},
			{t: '4 sole-owned critical items > 3'},
			{t: ' · ', color: C.grey},
			{t: 'betweenness 1.00 > 0.90'},
		]}
	/>
);

/** 3. The governance line. Sentence, so Inter. `approved` is purple because
 *  purple is the colour of the acting agent's trail. */
export const Cap3Approved: React.FC = () => (
	<Pill
		segs={[
			{t: 'Nothing auto-sends. This happened because a person '},
			{t: 'approved', color: C.purple},
			{t: ' it.'},
		]}
	/>
);

/** 4. The refusal. Sentence, so Inter. `Approve` is the ACTION, so orange, in
 *  the brighter cut because this ground is dark. */
export const Cap4Declines: React.FC = () => (
	<Pill
		segs={[
			{t: 'It declines. The only route to an action is '},
			{t: 'Approve', color: C.orangeBright},
			{t: '.'},
		]}
	/>
);

/** 5. The repo. An identifier, so mono. No colour. */
export const Cap5Repo: React.FC = () => <Pill mono segs={[{t: 'github.com/faith-ogun/baton'}]} />;
