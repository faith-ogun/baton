import React from 'react';
import {interpolate} from 'remotion';
import {C, B, B4} from './theme';
import {MONO} from './fonts';

const LINE = 'Baton sent the nudge';
const TYPE_IN = B4.typeFrom;
const TYPE_OUT = B4.typeTo;
const META_IN = B4.metaFrom;
const META_OUT = B4.metaTo;

export const AuditRow: React.FC<{frame: number}> = ({frame}) => {
  const rowIn = interpolate(frame, [TYPE_IN - 4, TYPE_IN + 2], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exit = interpolate(frame, [B.lockup, B.lockup + 9], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = rowIn * exit;
  if (opacity <= 0.001) return null;

  const chars = Math.round(
    interpolate(frame, [TYPE_IN, TYPE_OUT], [0, LINE.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const meta = interpolate(frame, [META_IN, META_OUT], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{position: 'absolute', left: 64, right: 64, top: 604, opacity}}>
      <div style={{height: 1, background: 'rgba(45,82,115,0.55)'}} />
      <div
        style={{
          marginTop: 21,
          display: 'flex',
          alignItems: 'center',
          gap: 13,
        }}
      >
        {/* purple: Baton did this */}
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            background: C.purple,
            boxShadow: `0 0 10px rgba(122,111,240,0.75)`,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            fontFamily: MONO,
            fontSize: 14,
            color: C.cream,
            letterSpacing: 0.2,
            whiteSpace: 'pre',
          }}
        >
          {LINE.slice(0, chars)}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            color: C.grey,
            letterSpacing: 1.5,
            opacity: meta,
            marginLeft: 6,
          }}
        >
          MAIL · LOGGED TO THE AUDIT SHEET
        </div>
      </div>
    </div>
  );
};
