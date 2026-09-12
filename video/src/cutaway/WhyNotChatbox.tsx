import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {C} from '../theme';
import {SERIF, MONO} from '../fonts';
import {ChatWindow, CHAT} from './ChatWindow';
import {CutawayGraph, nodeAt} from './CutawayGraph';

// Cutaway 1, silent B-roll for the claim the screen recording cannot show.
// 1920 x 1080, 30fps, 14s. A voice-over runs over the top, so every point is
// carried by the text on screen.

export const CHATBOX_DURATION = 420;

const K = {
  capIn: [8, 22] as [number, number],
  capOut: [120, 132] as [number, number],
  askFrom: 18,
  askTo: 54,
  answerFrom: 66,
  answerTo: 106,
  shrinkFrom: 124,
  shrinkTo: 154,
  graphFrom: 134,
  litAt: 188,
  labels: [198, 226, 256],
  sceneOut: [306, 320] as [number, number],
  lineIn: [320, 342] as [number, number],
};

// The graph sits where the chat window is not, once the chat window has shrunk.
const BOX = {left: 580, top: 300, scale: 1.12};
// Where the shrunken chat window ends up: hard left, out of the graph's way.
const SHRUNK = {x: -210, y: 113, scale: 0.56};
const LIT = ['M1', 'D1', 'SA'] as const;
// Frank asked in the thread, the thread is aimed at Sally, Sally owns the date:
// the open loop only exists as those three together.
const LIT_EDGES = ['FB-M1', 'M1-SA', 'SA-D1'] as const;

const ease = Easing.out(Easing.cubic);
const ramp = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

type Label = {
  lines: [string, string];
  /** the node the leader line points at */
  target: string;
  /** where the text block sits, and which way it is anchored */
  anchor: {x: number; y: number; align: 'left' | 'centre'};
};

const LABELS: Label[] = [
  {
    lines: ['MAIL KNOWS THE ASK', 'WENT UNANSWERED'],
    target: 'M1',
    anchor: {x: 1352, y: 454, align: 'left'},
  },
  {
    lines: ['THE CALENDAR KNOWS THE', 'DEADLINE IS IN TWO DAYS'],
    target: 'D1',
    anchor: {x: 1352, y: 654, align: 'left'},
  },
  {
    lines: ['NEITHER ALONE', 'MAKES IT URGENT'],
    target: 'SA',
    anchor: {x: 1086, y: 246, align: 'centre'},
  },
];

const Leader: React.FC<{label: Label; t: number}> = ({label, t}) => {
  const n = nodeAt(label.target, BOX);
  // Start the line just off the text block, then grow it to the node's ring.
  const start =
    label.anchor.align === 'left'
      ? {x: label.anchor.x - 16, y: label.anchor.y}
      : {x: label.anchor.x, y: label.anchor.y + 48};
  const dx = n.x - start.x;
  const dy = n.y - start.y;
  const len = Math.hypot(dx, dy) || 1;
  const stop = {
    x: start.x + (dx / len) * (len - n.r - 7),
    y: start.y + (dy / len) * (len - n.r - 7),
  };
  const x2 = interpolate(t, [0, 1], [start.x, stop.x]);
  const y2 = interpolate(t, [0, 1], [start.y, stop.y]);

  return (
    <svg
      style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}
      width={1920}
      height={1080}
    >
      <circle cx={start.x} cy={start.y} r={3.2} fill={C.cream} opacity={0.62 * t} />
      <line
        x1={start.x}
        y1={start.y}
        x2={x2}
        y2={y2}
        stroke={C.cream}
        strokeWidth={1.4}
        opacity={0.46 * t}
      />
    </svg>
  );
};

const LabelBlock: React.FC<{label: Label; t: number}> = ({label, t}) => {
  const slide = interpolate(t, [0, 1], [label.anchor.align === 'left' ? 20 : 0, 0]);
  const rise = interpolate(t, [0, 1], [label.anchor.align === 'centre' ? -12 : 0, 0]);
  return (
    <div
      style={{
        position: 'absolute',
        left: label.anchor.x,
        top: label.anchor.y,
        transform: `translate(${slide}px, calc(-50% + ${rise}px)) ${
          label.anchor.align === 'centre' ? 'translateX(-50%)' : ''
        }`,
        opacity: t,
        fontFamily: MONO,
        fontSize: 19,
        fontWeight: 500,
        letterSpacing: 1.8,
        lineHeight: 1.56,
        color: C.cream,
        whiteSpace: 'nowrap',
        textAlign: label.anchor.align === 'centre' ? 'center' : 'left',
      }}
    >
      <div>{label.lines[0]}</div>
      <div>{label.lines[1]}</div>
    </div>
  );
};

export const WhyNotChatbox: React.FC = () => {
  const frame = useCurrentFrame();

  const shrink = ramp(frame, K.shrinkFrom, K.shrinkTo);
  const chatScale = interpolate(shrink, [0, 1], [1, SHRUNK.scale]);
  const chatOpacity = interpolate(shrink, [0, 1], [1, 0.42]);

  const sceneOut = interpolate(frame, K.sceneOut, [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cap =
    interpolate(frame, K.capIn, [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }) *
    interpolate(frame, K.capOut, [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  const ask = ramp(frame, K.askFrom, K.askTo);
  const answer = ramp(frame, K.answerFrom, K.answerTo);
  const caret = frame >= K.askFrom && frame < K.answerFrom && Math.floor(frame / 8) % 2 === 0;

  const line =
    interpolate(frame, K.lineIn, [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: ease,
    }) * 1;
  const lineRise = interpolate(line, [0, 1], [16, 0]);

  return (
    <AbsoluteFill style={{backgroundColor: C.navy}}>
      {/* the same whisper of depth as the README hero */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 90% at 26% 26%, rgba(45,82,115,0.30) 0%, rgba(15,34,56,0) 62%)',
        }}
      />

      <AbsoluteFill style={{opacity: sceneOut}}>
        {/* beat 1: the chat window, which then shrinks and greys out of the way */}
        <div
          style={{
            position: 'absolute',
            left: CHAT.left,
            top: CHAT.top,
            transformOrigin: 'left top',
            transform: `translate(${SHRUNK.x * shrink}px, ${SHRUNK.y * shrink}px) scale(${chatScale})`,
            opacity: chatOpacity * ramp(frame, 4, 20),
            filter: `grayscale(${shrink}) saturate(${1 - shrink * 0.9})`,
          }}
        >
          <ChatWindow ask={ask} answer={answer} caret={caret} />
        </div>

        <div
          style={{
            position: 'absolute',
            left: CHAT.left,
            top: 214,
            opacity: cap,
            fontFamily: MONO,
            fontSize: 21,
            fontWeight: 500,
            letterSpacing: 3.2,
            color: C.cream,
            whiteSpace: 'nowrap',
          }}
        >
          A CHATBOT ANSWERS THE QUESTION YOU THOUGHT TO ASK
        </div>

        {/* beat 2: the workspace, and the two apps that only mean something together */}
        {frame >= K.graphFrom ? (
          <>
            <CutawayGraph
              frame={frame}
              startAt={K.graphFrom}
              litAt={K.litAt}
              lit={LIT}
              litEdges={LIT_EDGES}
              box={BOX}
            />
            {LABELS.map((l, i) => {
              const t = ramp(frame, K.labels[i], K.labels[i] + 14);
              if (t <= 0.001) return null;
              return (
                <React.Fragment key={l.target}>
                  <Leader label={l} t={t} />
                  <LabelBlock label={l} t={t} />
                </React.Fragment>
              );
            })}
          </>
        ) : null}
      </AbsoluteFill>

      {/* beat 3: the one line */}
      {line > 0.001 ? (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: line,
          }}
        >
          <div
            style={{
              maxWidth: 1520,
              textAlign: 'center',
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 62,
              lineHeight: 1.22,
              letterSpacing: -0.6,
              color: C.cream,
              transform: `translateY(${lineRise}px)`,
            }}
          >
            You cannot type your way to a risk you cannot see.
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
