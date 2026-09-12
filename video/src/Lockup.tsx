import React from 'react';
import {interpolate, Easing, Img, staticFile} from 'remotion';
import {C, B, DURATION} from './theme';
import {SERIF} from './fonts';

// Beat 5 keeps its original 42-frame shape, hung off the beat boundary.
const IN_START = B.lockup + 8;
const IN_END = B.lockup + 22;
const OUT_START = B.lockup + 32;
// Fully clear two frames early, so the last frame matches frame 0 exactly.
const OUT_END = DURATION - 2;

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
