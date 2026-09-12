import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {C, B} from './theme';
import {Graph} from './Graph';
import {Card} from './Card';
import {Cursor, CURSOR} from './Cursor';
import {AuditRow} from './AuditRow';
import {Caption} from './Caption';
import {Lockup} from './Lockup';

export const Hero: React.FC = () => {
  const frame = useCurrentFrame();

  // The whole working scene clears out to make room for the lockup, then the
  // lockup clears too, so the last frame is the first frame again.
  const sceneOut = interpolate(frame, [B.lockup, B.lockup + 10], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const press = interpolate(
    frame,
    [CURSOR.pressIn - 2, CURSOR.pressIn, CURSOR.pressOut, CURSOR.pressOut + 5],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <AbsoluteFill style={{backgroundColor: C.navy}}>
      {/* a whisper of depth, nothing that reads as a second colour */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 90% at 26% 26%, rgba(45,82,115,0.30) 0%, rgba(15,34,56,0) 62%)',
        }}
      />

      <AbsoluteFill style={{opacity: sceneOut}}>
        <Graph frame={frame} />
        <Caption frame={frame} />
        <AuditRow frame={frame} />
        <Card frame={frame} press={press} />
        <Cursor frame={frame} />
      </AbsoluteFill>

      <Lockup frame={frame} />
    </AbsoluteFill>
  );
};
