import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {C} from '../theme';
import {SERIF, SANS, MONO} from '../fonts';

// Cutaway 2, silent B-roll for the determinism claim. 1920 x 1080, 30fps, 12s.
// The diagram assembles itself in the order the argument is made: the wide
// deterministic column first, the narrow model column second, and only then
// the line that bounds what the model is allowed to do.

export const SPLIT_DURATION = 360;

const L = {x: 110, width: 1000, headTop: 206, rowTop: 300, step: 78};
// Fewer things, each given more room, and the two columns bottom out together
// so the short list reads as deliberate rather than as a gap.
const R = {
  x: 1190,
  width: 620,
  top: 176,
  height: 627,
  pad: 40,
  headTop: 206,
  rowTop: 320,
  step: 120,
};
const RULE_Y = 252;
const STAMP = {ruleY: 890, textTop: 916};

const LEFT: string[] = [
  'every detection',
  'every severity score',
  'who is involved and how late',
  'which action is proposed',
  'the ranking',
  'the audit trail',
  'the cost model',
];

const RIGHT: string[] = [
  'is this an ask, and to whom',
  'which project a loosely named one is',
  'the phrasing of an answer',
  'the wording of the nudge',
];

const K = {
  headL: [8, 22] as [number, number],
  rule: [14, 36] as [number, number],
  rowsL: 30,
  stepL: 9,
  panel: [100, 118] as [number, number],
  headR: [110, 124] as [number, number],
  rowsR: 128,
  stepR: 12,
  stampRule: [206, 226] as [number, number],
  stamp: [214, 224] as [number, number],
};

const ease = Easing.out(Easing.cubic);
const ramp = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

const Head: React.FC<{text: string; left: number; top: number; colour: string; t: number}> = ({
  text,
  left,
  top,
  colour,
  t,
}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      opacity: t,
      transform: `translateY(${interpolate(t, [0, 1], [8, 0])}px)`,
      fontFamily: MONO,
      fontSize: 22,
      fontWeight: 500,
      letterSpacing: 2.8,
      color: colour,
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);

const Row: React.FC<{
  text: string;
  left: number;
  top: number;
  width: number;
  marker: string;
  t: number;
}> = ({text, left, top, width, marker, t}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width: width + 30,
      opacity: t,
      transform: `translateY(${interpolate(t, [0, 1], [11, 0])}px)`,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 18,
    }}
  >
    <div
      style={{
        flex: '0 0 auto',
        width: 8,
        height: 8,
        marginTop: 13,
        background: marker,
        transform: 'rotate(45deg)',
      }}
    />
    <div
      style={{
        fontFamily: SANS,
        fontSize: 27,
        fontWeight: 400,
        lineHeight: 1.32,
        letterSpacing: -0.1,
        color: C.cream,
      }}
    >
      {text}
    </div>
  </div>
);

export const TheSplit: React.FC = () => {
  const frame = useCurrentFrame();

  const rule = ramp(frame, K.rule[0], K.rule[1]);
  const panel = ramp(frame, K.panel[0], K.panel[1]);
  const stampRule = ramp(frame, K.stampRule[0], K.stampRule[1]);
  const stamp = interpolate(frame, K.stamp, [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.navy}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 90% at 26% 26%, rgba(45,82,115,0.30) 0%, rgba(15,34,56,0) 62%)',
        }}
      />

      {/* the right-hand column is Baton's model layer, so it carries the purple */}
      <div
        style={{
          position: 'absolute',
          left: R.x,
          top: R.top,
          width: R.width,
          height: R.height,
          opacity: panel,
          transform: `translateY(${interpolate(panel, [0, 1], [12, 0])}px)`,
          background: 'rgba(122,111,240,0.10)',
          borderLeft: `2.5px solid ${C.purple}`,
          borderRadius: 6,
          boxSizing: 'border-box',
        }}
      />

      <Head
        text="RULES AND THE GRAPH DECIDE"
        left={L.x}
        top={L.headTop}
        colour={C.cream}
        t={ramp(frame, K.headL[0], K.headL[1])}
      />
      <div
        style={{
          position: 'absolute',
          left: L.x,
          top: RULE_Y,
          width: L.width * rule,
          height: 1,
          background: 'rgba(243,238,228,0.26)',
        }}
      />

      <Head
        text="THE MODEL DECIDES"
        left={R.x + R.pad}
        top={R.headTop}
        colour={C.purple}
        t={ramp(frame, K.headR[0], K.headR[1])}
      />

      {LEFT.map((text, i) => {
        const t = ramp(frame, K.rowsL + i * K.stepL, K.rowsL + i * K.stepL + 13);
        if (t <= 0.001) return null;
        return (
          <Row
            key={text}
            text={text}
            left={L.x}
            top={L.rowTop + i * L.step}
            width={L.width}
            marker={C.grey}
            t={t}
          />
        );
      })}

      {RIGHT.map((text, i) => {
        const t = ramp(frame, K.rowsR + i * K.stepR, K.rowsR + i * K.stepR + 13);
        if (t <= 0.001) return null;
        return (
          <Row
            key={text}
            text={text}
            left={R.x + R.pad}
            top={R.rowTop + i * R.step}
            width={R.width - R.pad * 2 - 30}
            marker={C.purple}
            t={t}
          />
        );
      })}

      {/* the bound on all of it, stamped across the bottom */}
      <div
        style={{
          position: 'absolute',
          left: L.x,
          top: STAMP.ruleY,
          width: (1810 - L.x) * stampRule,
          height: 1,
          background: 'rgba(243,238,228,0.2)',
        }}
      />
      {stamp > 0.001 ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: STAMP.textTop,
            textAlign: 'center',
            opacity: stamp,
            transform: `scale(${interpolate(stamp, [0, 1], [1.14, 1])})`,
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: 54,
            letterSpacing: -0.5,
            color: C.cream,
          }}
        >
          It never decides whether to act.
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
