import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C} from '../theme';
import {SERIF, SANS, MONO} from '../fonts';

/* Part 6. The last frame: centred lockup, the slogan, the repo. Hold 2s. */

export const EndCard: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: C.navy}}>
		<AbsoluteFill
			style={{
				background:
					'radial-gradient(120% 90% at 50% 30%, rgba(45,82,115,0.32) 0%, rgba(15,34,56,0) 64%)',
			}}
		/>
		<AbsoluteFill
			style={{
				background:
					'radial-gradient(100% 70% at 50% 108%, rgba(6,14,24,0.55) 0%, rgba(6,14,24,0) 60%)',
			}}
		/>
		<AbsoluteFill
			style={{
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				transform: 'translateY(-18px)',
			}}
		>
			<Img
				src={staticFile('baton-logo-reversed.png')}
				style={{height: 340, width: 'auto', flex: '0 0 auto'}}
			/>
			<span
				style={{
					display: 'block',
					width: 96,
					height: 3,
					borderRadius: 999,
					marginTop: 44,
					background: `linear-gradient(90deg, ${C.orange} 0%, ${C.orangeBright} 100%)`,
				}}
			/>
			<div
				style={{
					marginTop: 40,
					fontFamily: SERIF,
					fontStyle: 'italic',
					fontWeight: 600,
					fontSize: 56,
					lineHeight: '66px',
					color: C.cream,
				}}
			>
				Never drop the baton.
			</div>
			<div
				style={{
					marginTop: 30,
					fontFamily: MONO,
					fontWeight: 400,
					fontSize: 24,
					letterSpacing: 1.2,
					color: 'rgba(243, 238, 228, 0.70)',
				}}
			>
				github.com/faith-ogun/baton
			</div>
			<div
				style={{
					marginTop: 14,
					fontFamily: SANS,
					fontSize: 21,
					color: 'rgba(138, 150, 163, 0.85)',
				}}
			>
				baton-hack-2026.web.app
			</div>
		</AbsoluteFill>
	</AbsoluteFill>
);
