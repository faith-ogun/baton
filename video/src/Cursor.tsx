import React from 'react';
import {interpolate, Easing} from 'remotion';
import {C, B4} from './theme';
import {CLICK_POINT} from './Card';

export const CURSOR = {
  enter: B4.cursorIn,
  arrive: B4.click,
  pressIn: B4.click,
  pressOut: B4.release,
  gone: B4.cursorOut,
};

const START = {x: 1246, y: 686};

export const Cursor: React.FC<{frame: number}> = ({frame}) => {
  const t = interpolate(frame, [CURSOR.enter, CURSOR.arrive], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const opacity =
    interpolate(frame, [CURSOR.enter, CURSOR.enter + 6], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }) *
    interpolate(frame, [CURSOR.gone - 12, CURSOR.gone], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  if (opacity <= 0.001) return null;

  const x = interpolate(t, [0, 1], [START.x, CLICK_POINT.x]);
  const y = interpolate(t, [0, 1], [START.y, CLICK_POINT.y]);

  // The pointer dips 2px with the button it is pressing.
  const dip = interpolate(frame, [CURSOR.pressIn - 2, CURSOR.pressIn, CURSOR.pressOut, CURSOR.pressOut + 4], [0, 2, 2, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const ring = interpolate(frame, [CURSOR.pressIn, CURSOR.pressIn + 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  return (
    <svg
      width={1280}
      height={720}
      style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}
      opacity={opacity}
    >
      {ring > 0 && ring < 1 ? (
        <circle
          cx={x}
          cy={y + dip}
          r={6 + ring * 26}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={interpolate(ring, [0, 1], [2, 0.4])}
          opacity={(1 - ring) * 0.7}
        />
      ) : null}
      <g transform={`translate(${x} ${y + dip})`}>
        <path
          d="M0,0 L0,21.5 L5.3,16.4 L8.9,24.6 L12.6,23 L9,14.9 L16.2,14.4 Z"
          fill={C.cream}
          stroke={C.navy}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
