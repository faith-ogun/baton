import React from 'react';
import {interpolate} from 'remotion';
import {C} from './theme';
import {MONO} from './fonts';

type Cap = {text: string; in: [number, number]; out: [number, number]};

const CAPS: Cap[] = [
  {text: 'THE WORKSPACE GRAPH', in: [8, 22], out: [42, 50]},
  {text: 'AN ASK GOES UNANSWERED', in: [50, 62], out: [146, 154]},
  {text: 'APPROVED. ACTED. LOGGED.', in: [154, 166], out: [198, 207]},
];

export const Caption: React.FC<{frame: number}> = ({frame}) => (
  <div style={{position: 'absolute', left: 64, top: 560, height: 20}}>
    {CAPS.map((c) => {
      const o =
        interpolate(frame, c.in, [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }) *
        interpolate(frame, c.out, [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
      if (o <= 0.001) return null;
      return (
        <div
          key={c.text}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            whiteSpace: 'nowrap',
            fontFamily: MONO,
            fontSize: 12.5,
            fontWeight: 500,
            letterSpacing: 2.7,
            color: C.cream,
            opacity: o,
          }}
        >
          {c.text}
        </div>
      );
    })}
  </div>
);
