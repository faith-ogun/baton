import React from 'react';
import {interpolate, Easing} from 'remotion';
import {C, B} from './theme';
import {SERIF, SANS, MONO} from './fonts';

// Fixed geometry, so the cursor can be aimed at the button by arithmetic
// rather than by guesswork.
export const CARD = {left: 796, top: 86, width: 424, height: 400, pad: 26};
export const BTN = {h: 46};
// Aimed at the right of the button rather than its middle, so the pointer
// never sits on top of the word APPROVE.
export const CLICK_POINT = {
  x: CARD.left + CARD.width - CARD.pad - 44,
  y: CARD.top + CARD.height - CARD.pad - BTN.h / 2 + 2,
};

export const Card: React.FC<{frame: number; press: number}> = ({frame, press}) => {
  const enter = interpolate(frame, [B.card, B.card + 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const fade = interpolate(frame, [B.card, B.card + 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exit = interpolate(frame, [B.lockup, B.lockup + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  });

  const x = interpolate(enter, [0, 1], [470, 0]) + exit * 70;
  const opacity = fade * (1 - exit);
  if (opacity <= 0.001) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: CARD.left,
        top: CARD.top,
        width: CARD.width,
        height: CARD.height,
        transform: `translateX(${x}px)`,
        opacity,
        background: C.cream,
        border: `1px solid rgba(15,34,56,0.16)`,
        borderRadius: 10,
        boxShadow: '0 18px 44px rgba(0,0,0,0.34)',
        padding: CARD.pad,
        boxSizing: 'border-box',
      }}
    >
      {/* detector + severity */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: 1.5,
            color: C.orange,
            background: 'rgba(201,106,61,0.13)',
            border: `1px solid rgba(201,106,61,0.32)`,
            borderRadius: 999,
            padding: '4px 10px 4px 11px',
          }}
        >
          OPEN LOOP
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 26,
            fontWeight: 500,
            color: C.orange,
            lineHeight: 1,
            letterSpacing: -0.5,
          }}
        >
          92
        </div>
      </div>

      {/* the risk, in plain English */}
      <div
        style={{
          marginTop: 17,
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: 21,
          lineHeight: 1.34,
          color: C.navy,
          letterSpacing: -0.2,
        }}
      >
        Frank asked Sally for Module 3 sign-off 6 days ago. No reply.
      </div>

      <div
        style={{
          marginTop: 18,
          height: 1,
          background: 'rgba(15,34,56,0.14)',
        }}
      />

      {/* what it costs if it stays dropped */}
      <div
        style={{
          marginTop: 15,
          display: 'flex',
          alignItems: 'baseline',
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 34,
            lineHeight: 1,
            color: C.navy,
            letterSpacing: -0.8,
          }}
        >
          £21.8k
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: 1.3,
            color: C.grey,
          }}
        >
          42 PERSON-DAYS
        </div>
      </div>

      {/* purple is only ever Baton itself */}
      <div
        style={{
          marginTop: 17,
          background: 'rgba(122,111,240,0.10)',
          borderLeft: `2.5px solid ${C.purple}`,
          borderRadius: 4,
          padding: '12px 14px 13px 13px',
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9.5,
            fontWeight: 500,
            letterSpacing: 1.6,
            color: C.purple,
          }}
        >
          BATON PROPOSES
        </div>
        <div
          style={{
            marginTop: 7,
            fontFamily: SANS,
            fontSize: 14,
            lineHeight: 1.42,
            color: C.navy,
          }}
        >
          Reply in the thread, to Sally only, with the deadline stated.
        </div>
      </div>

      {/* nothing auto-sends: this is the human in the loop */}
      <div
        style={{
          position: 'absolute',
          left: CARD.pad,
          right: CARD.pad,
          bottom: CARD.pad,
          height: BTN.h,
          transform: `translateY(${press * 2}px)`,
          background: press > 0.02 ? '#A8562F' : C.orange,
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 ${3 - press * 2.6}px ${press > 0.02 ? 3 : 8}px rgba(15,34,56,${0.26 - press * 0.16})`,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: 2.4,
            color: '#FFFFFF',
          }}
        >
          APPROVE
        </div>
      </div>
    </div>
  );
};
