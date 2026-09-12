import React from 'react';
import {interpolate, Easing, Img, staticFile} from 'remotion';
import {C} from './theme';
import {SERIF} from './fonts';

const IN_START = 206;
const IN_END = 220;
const OUT_START = 230;
const OUT_END = 238; // fully clear by 238, so frame 239 matches frame 0

export const Lockup: React.FC<{frame: number}> = ({frame}) => {
  const o =
    interpolate(frame, [IN_START, IN_END], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }) *
    interpolate(frame, [OUT_START, OUT_END], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.quad),
    });
  if (o <= 0.001) return null;

  const rise = interpolate(frame, [IN_START, IN_END + 6], [0.955, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: o,
        transform: `scale(${rise})`,
      }}
    >
      <Img
        src={staticFile('baton-logo-reversed.png')}
        style={{height: 318, width: 'auto'}}
      />
      <div
        style={{
          marginTop: 22,
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontWeight: 600,
          fontSize: 29,
          letterSpacing: 0.2,
          color: C.cream,
        }}
      >
        Never drop the baton.
      </div>
    </div>
  );
};
